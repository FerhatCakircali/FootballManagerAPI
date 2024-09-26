from models import db, Country, Position, Role, User
from werkzeug.security import generate_password_hash


# Ülkeleri tanımlama
countries = [
    'Turkey', 'Germany', 'France', 'England', 'Spain', 'Italy', 'Netherlands', 'Portugal', 'Belgium', 
    'Croatia', 'Switzerland', 'Sweden', 'Denmark', 'Poland', 'Austria', 'Norway', 'Czech', 
    'Russia', 'Slovakia', 'Romania', 'Ukraine', 'Hungary', 'Greece', 'Serbia', 'Iceland', 
    'Slovenia', 'Ireland', 'Bosnia', 'Wales', 'Finland', 'Bulgaria', 'Georgia', 'Nigeria', 'Ghana', 
    'Ivory Coast', 'Senegal', 'Cameroon', 'Egypt', 'Morocco', 'Algeria', 'Tunisia', 
    'South Africa', 'Congo', 'Mali', 'Zambia', 'Angola', 'Burkina Faso',
    'Japan', 'South Korea', 'China', 'Iran', 'Saudi Arabia', 'Qatar', 'Uzbekistan', 'Australia', 'Thailand',
    'Brazil', 'Argentina', 'Uruguay', 'Colombia', 'Chile', 'Paraguay', 'Mexico', 'USA', 'Canada', 'Peru', 
    'Ecuador', 'Venezuela', 'Costa Rica'
]

# Pozisyonları tanımlama
positions = [
    'Goalkeeper', 'Defender', 'Midfielder', 'Attacker'
]

# Rolleri tanımlama
roles = [
    'admin', 'user'
]


def add_countries():
    with db.session.begin():
        existing_countries = set(country.country.lower() for country in Country.query.all())
        new_countries = [Country(country=country) for country in countries if country.lower() not in existing_countries]
        
        if new_countries:
            db.session.add_all(new_countries)
            print("Successfully added countries to the Countries table.")

# Pozisyonları veritabanına ekleme fonksiyonu
def add_positions():
    with db.session.begin():
        existing_positions = set(position.position.lower() for position in Position.query.all())
        new_positions = [Position(position=position) for position in positions if position.lower() not in existing_positions]

        if new_positions:
            db.session.add_all(new_positions)
            print("Successfully added positions to the Positions table.")

# Rolleri veritabanına ekleme fonksiyonu
def add_roles():
    with db.session.begin():
        existing_roles = set(role.role.lower() for role in Role.query.all())
        new_roles = [Role(role=role) for role in roles if role.lower() not in existing_roles]

        if new_roles:
            db.session.add_all(new_roles)
            print("Successfully added roles to the Roles table.")


def add_admin_user():
    with db.session.begin():
        # E-posta adresinin zaten var olup olmadığını kontrol et
        existing_user = User.query.filter_by(email="admin@a.com").first()
        if existing_user is None:
            admin_user = User(
                email="admin@a.com",
                password=generate_password_hash("21"),  # Şifre hashleniyor
                role_id=1,
                is_verified=True,
                is_blocked=False,
                failed_login_attempts=0
            )
            db.session.add(admin_user)
            print("Admin user added to the Users table.")
        else:
            print("Admin user already exists.")


