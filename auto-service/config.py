import os

def _read_secret(name):
    path = f"/run/secrets/{name}"
    if os.path.exists(path):
        return open(path).read().strip()
    return os.environ.get(name)

class Config:
    SECRET_KEY = _read_secret("SECRET_KEY") or os.environ.get("SECRET_KEY", "dev-secret")
    DB_USER = _read_secret("DB_USER") or os.environ.get("DB_USER", "postgres")
    DB_PASSWORD = _read_secret("DB_PASSWORD") or os.environ.get("DB_PASSWORD", "postgres")
    DB_HOST = os.environ.get("DB_HOST", "postgres")
    DB_NAME = _read_secret("DB_NAME") or os.environ.get("DB_NAME", "webappdb")

    SQLALCHEMY_DATABASE_URI = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

