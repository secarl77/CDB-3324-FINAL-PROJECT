from flask import Blueprint, request, jsonify, current_app
from . import db
from .models import User
import jwt
import datetime

bp = Blueprint("auth", __name__)

@bp.route("/login", methods=["POST"])
def login():
    data = request.json or {}
    username = data.get("username")
    password = data.get("password")
    if not username or not password:
        return jsonify({"message": "username and password required"}), 400

    user = User.query.filter_by(username=username).first()
    if user and user.check_password(password):
        token = jwt.encode(
            {"user_id": user.id, "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)},
            current_app.config["SECRET_KEY"], algorithm="HS256"
        )
        return jsonify({"token": token})
    return jsonify({"message": "Invalid credentials"}), 401

