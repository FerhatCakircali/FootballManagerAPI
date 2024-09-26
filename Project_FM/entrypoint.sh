# PostgreSQL servisinin çalıştığını kontrol eder
postgres_host=${DB_HOST:-localhost} # Değişebilir host "-localhost"
postgres_port=${DB_PORT:-5432}      # Değişebilir port "-5432"

echo "Checking PostgreSQL status on $postgres_host:$postgres_port"

while ! pg_isready -h $postgres_host -p $postgres_port -q
do
    echo "PostgreSQL is not operational yet, waiting.. ($postgres_host:$postgres_port)"
    sleep 5
done

echo "PostgreSQL is up and running."

# Gerekli Python paketlerini yükle
pip install -r requirements.txt

# Flask uygulamasını başlat
cd backend
python app.py &

# Frontend için yeni bir terminal açıp işlemleri başlat
cd ../frontend
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npm install
npm install axios react-router-dom # Axios ve React Router'ı yükle
npm start
