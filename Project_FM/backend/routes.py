from flask import Blueprint, request, jsonify, url_for
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import *
from config import db, mail
from flask_mail import Message
import random
from flask_cors import CORS
from flask_jwt_extended import decode_token
import logging

routes = Blueprint('routes', __name__)

# Kullanıcı kaydı ve e-posta doğrulama
@routes.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        email = data.get('email').strip().lower() 
        password = data.get('password').strip()

        # E-posta kontrolü
        if User.query.filter_by(email=email).first():
            return jsonify({"message": "Email already in use"}), 400

        # Şifreyi hashleme
        hashed_password = generate_password_hash(password)
        user = User(email=email, password=hashed_password, role_id=2, is_verified=False, failed_login_attempts=0)
        db.session.add(user)
        db.session.commit()

        # Takım ve oyuncuları oluşturma
        create_team_and_players(user)

        # E-posta gönderimi
        token = create_access_token(identity=user.id)
        verification_link = url_for('routes.verify_email', token=token, _external=True)
        msg = Message("Email Verification", sender='projemailgonderferhat@gmail.com', recipients=[email])
        msg.body = f"Please verify your email by clicking on the link: {verification_link}"
        
        try:
            mail.send(msg)
        except Exception as e:
            logging.error("Email sending error: %s", str(e))
            return jsonify({"message": "An error occurred while sending the email."}), 500

        return jsonify({"message": "User registered successfully, please check your email to verify your account"}), 201

    except Exception as e:
        logging.error("Hata oluştu: %s", str(e))
        return jsonify({"message": "An error occurred. Please try again later."}), 500


# E-posta doğrulama
@routes.route('/verify_email/<token>', methods=['GET'])
def verify_email(token):
    try:
        decoded_token = decode_token(token)
        user_id = decoded_token['sub']
        user = User.query.get(user_id)

        if user:
            user.is_verified = True
            db.session.commit()
            return jsonify({"message": "Email verified successfully"}), 200
        return jsonify({"message": "Invalid token"}), 400
    except Exception as e:
        logging.error("Hata oluştu: %s", str(e))
        return jsonify({"message": str(e)}), 500


# Giriş işlemi
@routes.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email').strip().lower() 
    password = data.get('password').strip()

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"message": "Invalid email or password"}), 401

    if not user.is_verified:
        return jsonify({"message": "Account not verified, please check your email"}), 403

    if user.is_blocked:
        return jsonify({"message": "Account is blocked"}), 403

    if not check_password_hash(user.password, password):
        user.failed_login_attempts += 1
        if user.failed_login_attempts >= 3:
            user.is_blocked = True
        db.session.commit()
        return jsonify({"message": "Invalid email or password"}), 401

    user.failed_login_attempts = 0
    db.session.commit()

    access_token = create_access_token(identity=user.id)
    return jsonify({"token": access_token, "role_id": user.role_id}), 200


# Kullanıcı engelleme ve yönetim işlemleri
@routes.route('/admin/unblock_user', methods=['POST'])
@jwt_required()
def unblock_user():
    user_id = get_jwt_identity()
    admin = User.query.get(user_id)

    if admin.role.role != 'admin':
        return jsonify({"message": "Unauthorized"}), 403

    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()

    if not user:
        return jsonify({"message": "User not found"}), 404

    user.is_blocked = False
    user.failed_login_attempts = 0
    db.session.commit()

    return jsonify({"message": "User account unblocked"}), 200


@routes.route('/admin/countries', methods=['GET'])
@jwt_required()
def get_countries():
    try:
        # Ülkeleri veritabanından al
        countries = Country.query.all()
        # Ülke bilgilerini döndür
        return jsonify([{"id": country.id, "country": country.country} for country in countries]), 200
    except Exception as e:
        # Hata durumunda loglama yap ve hata mesajını döndür
        logging.error(f"Ülkeler alınırken hata: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Admin yetkileriyle kullanıcıları doğrulama
@routes.route('/admin/users/<int:user_id>/verify', methods=['POST'])
@jwt_required()
def verify_user(user_id):
    current_user_id = get_jwt_identity()
    admin = User.query.get(current_user_id)

    if admin.role.role != 'admin':
        return jsonify({"message": "Unauthorized"}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    user.is_verified = True
    db.session.commit()

    return jsonify({"message": "User verified successfully"}), 200


# Kullanıcıların yönetimi için endpoint. Admin yetkisi gerektirir.
@routes.route('/admin/users', methods=['GET', 'POST', 'PUT', 'DELETE'])
@jwt_required()
def manage_users():
    user_id = get_jwt_identity()
    admin = User.query.get(user_id)

    # Kullanıcının admin olup olmadığını kontrol et
    if admin.role.role != 'admin':
        return jsonify({"message": "Unauthorized"}), 403

    # GET isteği: Tüm kullanıcıları listele
    if request.method == 'GET':
        users = User.query.all()
        return jsonify([{"id": user.id, "email": user.email, "is_blocked": user.is_blocked,
                         "is_verified": user.is_verified, "role_id": user.role_id} for user in users]), 200

    # POST isteği: Yeni kullanıcı oluştur
    elif request.method == 'POST':
        data = request.get_json()
        email = data.get('email').strip().lower() 
        password = data.get('password').strip()
        role_id = data.get('role_id', 2)

        if User.query.filter_by(email=email).first():
            return jsonify({"message": "Email already exists"}), 400

        hashed_password = generate_password_hash(password)
        new_user = User(email=email, password=hashed_password, role_id=role_id)
        db.session.add(new_user)
        db.session.commit()

        if role_id == 2:
            create_team_and_players(new_user)

        return jsonify({"message": "User created successfully"}), 201

    # PUT isteği: Var olan kullanıcıyı güncelle
    elif request.method == 'PUT':
        data = request.get_json()
        user_id = data.get('user_id')
        email = data.get('email').strip().lower()
        role_id = data.get('role_id')
        is_blocked = data.get('is_blocked')
        is_verified = data.get('is_verified')
        password = data.get('password').strip()

        user = User.query.get(user_id)
        if not user:
            return jsonify({"message": "User not found"}), 404

        if email:
            user.email = email
        if role_id is not None:
            user.role_id = role_id
        if is_blocked is not None:
            user.is_blocked = is_blocked
        if is_verified is not None:
            user.is_verified = is_verified
        if password:
            user.password = generate_password_hash(password)

        db.session.commit()
        return jsonify({"message": "User updated successfully"}), 200

    # DELETE isteği: Var olan kullanıcıyı sil
    elif request.method == 'DELETE':
        data = request.get_json()
        user_id = data.get('user_id')

        user = User.query.get(user_id)
        if not user:
            return jsonify({"message": "User not found"}), 404

        delete_user_and_related_data(user)
        return jsonify({"message": "User and related team and players deleted successfully"}), 200


# Takımların yönetimi için endpoint. Admin yetkisi gerektirir.
@routes.route('/admin/teams', methods=['GET', 'POST', 'PUT', 'DELETE'])
@jwt_required()
def manage_teams():
    user_id = get_jwt_identity()
    admin = User.query.get(user_id)

    # Kullanıcının admin olup olmadığını kontrol et
    if admin.role.role != 'admin':
        return jsonify({"message": "Unauthorized"}), 403

    # GET isteği: Tüm takımları listele
    if request.method == 'GET':
        teams = Team.query.all()
        teams_data = [{"id": team.id, "name": team.name, "country": team.country, "user_id": team.user_id, "budget": team.budget} for team in teams]
        return jsonify(teams_data), 200

    # POST isteği: Yeni takım oluştur
    elif request.method == 'POST':
        data = request.get_json()
        team_name = data.get('name')
        country = data.get('country')
        user_id = data.get('user_id')

        new_team = Team(name=team_name, country=country, user_id=user_id, budget=5000000)
        db.session.add(new_team)
        db.session.commit()

        # Oyuncu oluşturma işlemleri
        position_counts = {1: 3, 2: 6, 3: 6, 4: 5}

        for position_id, count in position_counts.items():
            for _ in range(count):
                player = Player(
                    first_name=f"FN{random.randint(1, 9999)}",
                    last_name=f"LN{random.randint(1, 9999)}",
                    age=random.randint(18, 40),
                    market_value=1000000.0,
                    position_id=position_id,
                    team_id=new_team.id,
                    country_id=random.choice(Country.query.all()).id
                )
                db.session.add(player)

        db.session.commit()
        
        return jsonify({"message": "Team created successfully and players added"}), 201

    # PUT isteği: Var olan takımı güncelle
    elif request.method == 'PUT':
        data = request.get_json()
        team_id = data.get('team_id')
        team = Team.query.get(team_id)

        if not team:
            return jsonify({"message": "Team not found"}), 404

        team.name = data.get('name', team.name)
        team.country = data.get('country', team.country)
        db.session.commit()

        return jsonify({"message": "Team updated successfully"}), 200

    # DELETE isteği: Var olan takımı sil
    elif request.method == 'DELETE':
        data = request.get_json()
        team_id = data.get('team_id')

        team = Team.query.get(team_id)
        if not team:
            return jsonify({"message": "Team not found"}), 404

        delete_team_and_players(team)
        return jsonify({"message": "Team and related players deleted successfully"}), 200


# Oyuncuların yönetimi için endpoint. Admin yetkisi gerektirir.
@routes.route('/admin/players', methods=['GET', 'POST', 'PUT', 'DELETE'])
@jwt_required()
def manage_players():
    user_id = get_jwt_identity()
    admin = User.query.get(user_id)

    # Kullanıcının admin olup olmadığını kontrol et
    if admin.role.role != 'admin':
        return jsonify({"message": "Unauthorized"}), 403

    # GET isteği: Tüm oyuncuları listele
    if request.method == 'GET':
        players = Player.query.all()
        players_data = [{
            "id": player.id,
            "first_name": player.first_name,
            "last_name": player.last_name,
            "age": player.age,
            "market_value": player.market_value,
            "position": player.position.position,
            "team_id": player.team_id,
            "country_id": player.country_id,
            "is_on_transfer_list": player.is_on_transfer_list,
            "asking_price": player.asking_price
        } for player in players]
        return jsonify(players_data), 200

    # POST isteği: Yeni oyuncu oluştur
    elif request.method == 'POST':
        data = request.get_json()
        new_player = create_player_from_data(data)
        db.session.add(new_player)
        db.session.commit()

        return jsonify({"message": "Player created successfully"}), 201

    # PUT isteği: Var olan oyuncuyu güncelle
    elif request.method == 'PUT':
        data = request.get_json()
        player_id = data.get('player_id')
        player = Player.query.get(player_id)

        if not player:
            return jsonify({"message": "Player not found"}), 404

        update_player_from_data(player, data)
        db.session.commit()
        return jsonify({"message": "Player updated successfully"}), 200

    # DELETE isteği: Var olan oyuncuyu sil
    elif request.method == 'DELETE':
        data = request.get_json()
        player_id = data.get('player_id')

        player = Player.query.get(player_id)
        if not player:
            return jsonify({"message": "Player not found"}), 404

        db.session.delete(player)
        db.session.commit()

        return jsonify({"message": "Player deleted successfully"}), 200
    

# Yardımcı fonksiyonlar

# Yeni bir takım ve oyuncular oluşturur.
def create_team_and_players(user):
    team_name = f"{user.email.split('@')[0]}'s Team"
    country = random.choice(Country.query.all())

    new_team = Team(name=team_name, country=country.country, user_id=user.id, budget=5000000)
    db.session.add(new_team)
    db.session.commit()

    position_counts = {1: 3, 2: 6, 3: 6, 4: 5}

    for position_id, count in position_counts.items():
        for _ in range(count):
            player = Player(
                first_name=f"FN{random.randint(1, 9999)}",
                last_name=f"LN{random.randint(1, 9999)}",
                age=random.randint(18, 40),
                market_value=1000000.0,
                position_id=position_id,
                team_id=new_team.id,
                country_id=random.choice(Country.query.all()).id
            )
            db.session.add(player)

    db.session.commit()

# Kullanıcıya ait takımları ve oyuncuları siler.
def delete_user_and_related_data(user):
    teams = Team.query.filter_by(user_id=user.id).all()
    for team in teams:
        delete_team_and_players(team)

    db.session.delete(user)
    db.session.commit()

# Belirli bir takıma ait oyuncuları siler ve takımı siler.
def delete_team_and_players(team):
    players = Player.query.filter_by(team_id=team.id).all()
    for player in players:
        db.session.delete(player)

    db.session.delete(team)
    db.session.commit()

# Verilen verilerden yeni bir oyuncu nesnesi oluşturur.
def create_player_from_data(data):
    return Player(
        first_name=data.get('first_name'),
        last_name=data.get('last_name'),
        age=data.get('age'),
        market_value=data.get('market_value'),
        position_id=data.get('position_id'),
        team_id=data.get('team_id'),
        country_id=data.get('country_id')
    )

# Var olan oyuncu nesnesini günceller.
def update_player_from_data(player, data):
    player.first_name = data.get('first_name', player.first_name)
    player.last_name = data.get('last_name', player.last_name)
    player.age = data.get('age', player.age)
    player.market_value = data.get('market_value', player.market_value)
    player.position_id = data.get('position_id', player.position_id)
    player.team_id = data.get('team_id', player.team_id)
    player.country_id = data.get('country_id', player.country_id)



# Kullanıcı bilgilerini almak için endpoint
@routes.route('/user-info', methods=['GET'])
@jwt_required()
def get_user_info():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    team = Team.query.filter_by(user_id=user_id).first()

    if not user or not team:
        return jsonify({"message": "User or team information not found."}), 404

    user_info = {
        'email': user.email,
        'team_budget': team.budget,
        'team_value': team.value,
    }

    return jsonify(user_info), 200


# Takım bilgilerini almak için endpoint
@routes.route('/team', methods=['GET'])
@jwt_required()
def get_team_info():
    user_id = get_jwt_identity()
    team = Team.query.filter_by(user_id=user_id).first()

    if not team:
        return jsonify({"message": "Team not found."}), 404

    players = Player.query.filter_by(team_id=team.id).all()
    if not players:
        return jsonify({"message": "No players found."}), 404

    players_data = [{
        "id": player.id,
        "first_name": player.first_name,
        "last_name": player.last_name,
        "age": player.age,
        "market_value": player.market_value,
        "position": player.position.position if player.position else "-",
        "country": player.country.country if player.country else "-",
        "is_on_transfer_list": player.is_on_transfer_list,
        "asking_price": player.asking_price if player.asking_price is not None else "-"
    } for player in players]

    total_value = sum(player.market_value for player in players)
    
    return jsonify({
        "team_name": team.name,
        "country": team.country,
        "budget": team.budget,
        "players": players_data,
        "value": total_value
    }), 200


# Transfer listesindeki oyuncuları almak için endpoint
@routes.route('/transfer-list', methods=['GET'])
@jwt_required()
def get_transfer_list():
    user_id = get_jwt_identity()
    user_team = Team.query.filter_by(user_id=user_id).first()

    players = Player.query.filter_by(is_on_transfer_list=True).all()
    if not players:
        return jsonify({"message": "No players found in the transfer list."}), 404

    return jsonify([{
        "id": player.id,
        "first_name": player.first_name,
        "last_name": player.last_name,
        "age": player.age,
        "market_value": player.market_value,
        "position": player.position.position if player.position else "N/A",
        "country": player.country.country if player.country else "N/A",
        "asking_price": player.asking_price if player.asking_price is not None else "N/A",
        "team": player.team.name if player.team else "N/A",  # Takım adı ekleniyor
        "can_remove": player.team_id == user_team.id  # Kullanıcının takımının oyuncuyu kaldırma izni var mı?
    } for player in players]), 200


# Oyuncuyu transfer listesine eklemek için endpoint
@routes.route('/transfer-list', methods=['POST'])
@jwt_required()
def transfer_list():
    data = request.json
    asking_price = data.get('asking_price')
    player_id = data.get('player_id')

    if player_id is None:
        return jsonify({"msg": "Player ID is required."}), 400

    # Asking price kontrolü
    try:
        asking_price = float(asking_price)
        if asking_price <= 0:
            return jsonify({"msg": "Asking price must be greater than zero."}), 400
    except (ValueError, TypeError):
        return jsonify({"msg": "Asking price must be a valid number."}), 400

    player = Player.query.filter_by(id=player_id).first()
    if not player:
        return jsonify({"msg": "Player not found."}), 404

    # Oyuncu bilgilerini güncelleme
    player.asking_price = asking_price
    player.is_on_transfer_list = True

    # Veritabanında güncelleme yapma
    try:
        db.session.commit()
        return jsonify({"msg": "Player added to transfer list.", "asking_price": asking_price}), 200
    except Exception as e:
        db.session.rollback()
        logging.error("Failed to add player to transfer list: %s", str(e))
        return jsonify({"msg": "Failed to add player to transfer list.", "error": str(e)}), 500


# Oyuncuyu transfer listesinden kaldırmak için endpoint
@routes.route('/remove-from-transfer-list/<int:player_id>', methods=['POST'])
@jwt_required()
def remove_from_transfer_list(player_id):
    user_id = get_jwt_identity()
    user_team = Team.query.filter_by(user_id=user_id).first()

    player = Player.query.get(player_id)
    if not player or not player.is_on_transfer_list:
        return jsonify({"message": "Player not found or not on transfer list."}), 404

    # Oyuncuyu transfer listesinden kaldır ve eski takıma ekle
    if player.team_id != user_team.id:
        return jsonify({"message": "You do not have permission to remove this player."}), 403

    player.is_on_transfer_list = False
    player.asking_price = None  # İstek fiyatını sıfırlama
    db.session.commit()

    return jsonify({"message": "Player removed from transfer list and added back to their old team."}), 200


# Oyuncu transferi için endpoint
@routes.route('/transfer/<int:player_id>', methods=['POST'])
@jwt_required()
def transfer_player(player_id):
    user_id = get_jwt_identity()
    new_team = Team.query.filter_by(user_id=user_id).first()

    player = Player.query.get(player_id)
    if not player or not player.is_on_transfer_list:
        logging.error("Player not found or not on transfer list: %s", player_id)
        return jsonify({"message": "Player not found or not on transfer list."}), 404

    if player.asking_price is None or player.asking_price <= 0:
        logging.warning("Invalid asking price for the player: %s", player.asking_price)
        return jsonify({"message": "Invalid asking price for the player."}), 400

    # Yeni takımın bütçesinin yeterli olup olmadığını kontrol et
    if new_team.budget < player.asking_price:
        return jsonify({"message": "New team's budget is insufficient."}), 400

    # Eski takımın bütçesine asking price'ı ekle
    old_team = player.team
    old_team.budget += player.asking_price
    new_team.budget -= player.asking_price

    # Oyuncunun transferini gerçekleştir
    player.team_id = new_team.id
    player.is_on_transfer_list = False
    
    transfer_fee = player.asking_price  # transfer_fee için asking_price'ı saklıyoruz
    player.asking_price = None  # Transfer sonrasında asking_price'ı sıfırlıyoruz

    # Transfers tablosuna ekle
    transfer = Transfer(
        player_id=player.id,
        from_team_id=old_team.id,
        to_team_id=new_team.id,
        transfer_fee=transfer_fee, 
    )

    # Piyasa değerini rastgele %10 ile %100 arasında artır
    market_value_increase_percentage = random.randint(10, 100) 
    player.market_value = int(player.market_value * (1 + market_value_increase_percentage / 100))  

    # Güncellemeleri yap
    try:
        db.session.add(transfer)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        logging.error("Transfer işlemi hatası: %s", str(e))
        return jsonify({"message": "An error occurred, please try again."}), 500

    logging.info("Transfer successful: Player ID: %s", player_id)
    return jsonify({"message": "Transfer successful."}), 200


# Tüm transferleri listelemek için endpoint
@routes.route('/transfers', methods=['GET'])
@jwt_required()
def get_transfers():
    """Tüm transferleri listeler."""
    transfers = Transfer.query.all()
    transfer_list = []

    for transfer in transfers:
        player = transfer.player
        from_team = transfer.from_team
        to_team = transfer.to_team
        
        transfer_info = {
            "first_name": player.first_name,
            "last_name": player.last_name,
            "age": player.age,
            "market_value": player.market_value,
            "from_team_name": from_team.name,
            "to_team_name": to_team.name,
            "transfer_date": transfer.transfer_date,
            "transfer_fee": transfer.transfer_fee,
            "position": player.position.position,
            "country": player.country.country
        }
        transfer_list.append(transfer_info)

    return jsonify(transfer_list), 200
