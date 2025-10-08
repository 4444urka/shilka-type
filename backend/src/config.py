import os

settings = {
    "database": {
        "host": os.getenv("DB_HOST", "localhost"),
        "port": int(os.getenv("DB_PORT", "5432")),
        "user": os.getenv("DB_USER", "shilka-type"),
        "password": os.getenv("DB_PASSWORD", "postgres"),
        "db_name": os.getenv("DB_NAME", "shilka-db")
    },
    "auth": {
        "secret_key": os.getenv("SECRET_KEY", "dev-secret-key-change-in-production"),
        "algorithm": os.getenv("ALGORITHM", "HS256"),
        "access_token_expire_minutes": int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    },
    "redis": {
        "host": os.getenv("REDIS_HOST", "redis"),
        "port": int(os.getenv("REDIS_PORT", "6379")),
        "db": int(os.getenv("REDIS_DB", "0"))
    }
}