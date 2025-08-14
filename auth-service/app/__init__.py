from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    #CORS(app, resources={r"/api/*": {"origins": "http://localhost:8081"}})
    CORS(app)
    app.config.from_object("config.Config")
    db.init_app(app)

    from .routes import bp
    app.register_blueprint(bp, url_prefix="/api")

    with app.app_context():
        db.create_all()

    return app

