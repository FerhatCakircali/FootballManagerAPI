# Football Manager API

Bu proje, bir futbol yönetim oyunu için geliştirilmiş bir API'dir. Kullanıcıların hesap oluşturmasına, takımlar oluşturmasına ve oyuncuları alıp satmasına olanak tanır.

## İçindekiler

- [Özellikler](#özellikler)
- [Kurulum](#kurulum)
- [Kullanım](#kullanım)
- [Teknolojiler](#teknolojiler)

## Özellikler

- Kullanıcı kaydı ve giriş sistemi
- Takım oluşturma ve yönetme
- Oyuncu bilgileri ve piyasa değerleri
- Transfer listesi yönetimi
- Yönetici yetkileri ve kullanıcı yönetimi
- E-posta doğrulama

## Kurulum

### Gereksinimler

- Python 3.x
- PostgreSQL
- Node.js ve npm

### Adımlar

1. **Depoyu klonlayın**:
   ```bash
   git clone https://github.com/FerhatCakircali/FootballManagerAPI
   cd Project_FM


2. **Backend için gerekli Python paketlerini yükleyin**:
cd backend
pip install -r requirements.txt

3. **Frontend için gerekli npm paketlerini yükleyin**:
cd ../frontend
npm install
npm install axios react-router-dom

4. **Veritabanını ayarlayın**: 
PostgreSQL kurulduktan sonra, backend/config.py dosyasına girin ve PostreSQL ayarlarına göre düzenleyin.

5. **Uygulamayı başlatın**:

# Backend
cd ../backend
python app.py &

# Frontend
cd ../frontend
npm start


# Veya GitBash ile "entrypoint.sh" çalıştırın o gerekli işlemleri yapacaktır.

# Otomatik olarak Admin hesabı oluşturur ilk giriş için:
# Email : admin@a.com - Password: 21

*******************************************************************************

# Kullanım
Kullanıcı kaydı ve giriş işlemleri için ilgili API uç noktalarını kullanın.
Takım ve oyuncu bilgilerini yönetmek için yönetici panelini kullanın.
Oyuncu transfer işlemleri için transfer listesine erişin.

# Teknolojiler
Flask (Backend)
PostgreSQL (Veritabanı)
React (Frontend)
Axios (HTTP istemcisi)
