import os

settings = {
    "database": {
        "host": os.getenv("DB_HOST", "localhost"),
        "port": int(os.getenv("DB_PORT", "5432")),
        "user": os.getenv("DB_USER", "shilka-type"),
        "password": os.getenv("DB_PASSWORD", "Churka98765"),
        "db_name": os.getenv("DB_NAME", "shilka-db")
    },
    "auth": {
        "secret_key": os.getenv("SECRET_KEY", "MamaVadimaShalava"),
        "algorithm": os.getenv("ALGORITHM", "HS256"),
        "access_token_expire_minutes": int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    }
}