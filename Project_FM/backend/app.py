from flask_cors import CORS
from config import create_app, db
from routes import routes as routes_blueprint
from AdminCountryPositionRoles import add_countries, add_positions, add_roles, add_admin_user

app = create_app()

# CORS ayarları
CORS(app, resources={r"/*": {"origins": "http://localhost:3000", "supports_credentials": True}})

# Veritabanı tablolarını oluşturma
with app.app_context():
    db.create_all()  # Tabloları oluştur
    add_countries()   # Ülkeleri ekle
    add_positions()   # Pozisyonları ekle
    add_roles()       # Rolleri ekle
    add_admin_user()  # Admin hesabı ekle

# Blueprint'leri kaydet
app.register_blueprint(routes_blueprint)

# Uygulama başlatma
if __name__ == '__main__':
    app.run(debug=True)
