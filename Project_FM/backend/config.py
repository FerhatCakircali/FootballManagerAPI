import psycopg2
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail
from flask_jwt_extended import JWTManager


db = SQLAlchemy()
mail = Mail()
jwt = JWTManager()

# Veritabanı oluşturma fonksiyonu
def create_database():
    conn = psycopg2.connect(dbname="postgres", user="postgres", password="12345", host="localhost", port="5432")
    conn.autocommit = True
    cursor = conn.cursor()
    cursor.execute("SELECT 1 FROM pg_database WHERE datname = 'dbFM';")
    exists = cursor.fetchone()
    
    if not exists:
        cursor.execute('CREATE DATABASE "dbFM";')
        print("Database: dbFM created.")
    else:
        print("dbFM already exists.")
    
    cursor.close()
    conn.close()


create_database()

def create_app():
    app = Flask(__name__)

    # Flask uygulaması için ayarları yapma
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:12345@localhost:5432/dbFM'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # E-posta yapılandırması
    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 465
    app.config['MAIL_USE_SSL'] = True
    app.config['MAIL_USERNAME'] = 'projemailgonderferhat@gmail.com'
    app.config['MAIL_PASSWORD'] = 'uoou mwdj erdv draa'  # Uygulama şifresi
    app.config['MAIL_DEFAULT_SENDER'] = 'projemailgonderferhat@gmail.com'

    # JWT yapılandırması
    app.config['JWT_SECRET_KEY'] = 'g3hH#2jK@1uTq4!y'
    app.config['VERIFY_EMAIL_URL'] = 'http://localhost:5000/verify_email'

    # Veritabanı ve mail nesneleri
    db.init_app(app)
    mail.init_app(app)
    jwt.init_app(app)

    return app
