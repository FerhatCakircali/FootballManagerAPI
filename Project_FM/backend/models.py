from datetime import datetime
from config import db

# Kullanıcı modelini tanımlama
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(256), nullable=False)
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'), nullable=False, default=2)  # Varsayılan rol "user"
    is_verified = db.Column(db.Boolean, default=False)
    is_blocked = db.Column(db.Boolean, default=False)
    failed_login_attempts = db.Column(db.Integer, default=0)
    
    role = db.relationship('Role', back_populates='users')
    team = db.relationship('Team', back_populates='user', uselist=False)

# Takım modelini tanımlama
class Team(db.Model):
    __tablename__ = 'teams'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    country = db.Column(db.String(100), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    budget = db.Column(db.Float, default=5000000.0)
    
    user = db.relationship('User', back_populates='team')
    players = db.relationship('Player', back_populates='team')

    @property # Takımın toplam değerini hesaplama
    def value(self):
        return sum(player.market_value for player in self.players)

# Oyuncu modelini tanımlama
class Player(db.Model):
    __tablename__ = 'players'
    
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer, nullable=False) 
    market_value = db.Column(db.Float, default=1000000.0)
    position_id = db.Column(db.Integer, db.ForeignKey('positions.id'), nullable=False)
    team_id = db.Column(db.Integer, db.ForeignKey('teams.id'), nullable=False)
    is_on_transfer_list = db.Column(db.Boolean, default=False)
    asking_price = db.Column(db.Float, nullable=True)
    country_id = db.Column(db.Integer, db.ForeignKey('countries.id'), nullable=False)

    team = db.relationship('Team', back_populates='players')
    position = db.relationship('Position', back_populates='players')
    country = db.relationship('Country', back_populates='players')

# Pozisyon modelini tanımlama
class Position(db.Model):
    __tablename__ = 'positions'
    
    id = db.Column(db.Integer, primary_key=True)
    position = db.Column(db.String(50), nullable=False)
    
    players = db.relationship('Player', back_populates='position')

# Rol modelini tanımlama
class Role(db.Model):
    __tablename__ = 'roles'
    
    id = db.Column(db.Integer, primary_key=True)
    role = db.Column(db.String(50), nullable=False)
    
    users = db.relationship('User', back_populates='role')

# Transfer modelini tanımlama
class Transfer(db.Model):
    __tablename__ = 'transfers'
    
    id = db.Column(db.Integer, primary_key=True)
    player_id = db.Column(db.Integer, db.ForeignKey('players.id'), nullable=False)
    from_team_id = db.Column(db.Integer, db.ForeignKey('teams.id'), nullable=False)
    to_team_id = db.Column(db.Integer, db.ForeignKey('teams.id'), nullable=False)
    transfer_date = db.Column(db.DateTime, default=datetime.utcnow)
    transfer_fee = db.Column(db.Float, nullable=False)
    
    player = db.relationship('Player')
    from_team = db.relationship('Team', foreign_keys=[from_team_id])
    to_team = db.relationship('Team', foreign_keys=[to_team_id])

# Ülke modelini tanımlama
class Country(db.Model):
    __tablename__ = 'countries'
    
    id = db.Column(db.Integer, primary_key=True)
    country = db.Column(db.String(100), nullable=False)
    
    players = db.relationship('Player', back_populates='country')
