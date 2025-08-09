from flask import Blueprint, request, jsonify, current_app
from . import db
from .models import User
from functools import wraps
import jwt

api_bp = Blueprint("api", __name__)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth.split(" ")[1]
        if not token:
            return jsonify({"message": "Token missing"}), 401
        try:
            data = jwt.decode(token, current_app.config["SECRET_KEY"], algorithms=["HS256"])
            user = User.query.get(data["user_id"])
            if user is None:
                raise Exception("User not found")
        except Exception as e:
            return jsonify({"message": "Token invalid", "error": str(e)}), 401
        return f(user, *args, **kwargs)
    return decorated

@api_bp.route("/users", methods=["GET"])
@token_required
def get_users(current_user):
    users = User.query.all()
    return jsonify([u.to_dict() for u in users])

@api_bp.route("/users", methods=["POST"])
@token_required
def create_user(current_user):
    payload = request.json or {}
    username = payload.get("username")
    email = payload.get("email")
    password = payload.get("password")
    if not (username and email and password):
        return jsonify({"message": "username, email, password required"}), 400
    if User.query.filter_by(username=username).first():
        return jsonify({"message": "username exists"}), 409
    u = User(username=username, email=email)
    u.set_password(password)
    db.session.add(u)
    db.session.commit()
    return jsonify(u.to_dict()), 201

@api_bp.route("/users/<int:user_id>", methods=["PUT"])
@token_required
def update_user(current_user, user_id):
    user = User.query.get_or_404(user_id)
    payload = request.json or {}
    user.username = payload.get("username", user.username)
    user.email = payload.get("email", user.email)
    if payload.get("password"):
        user.set_password(payload["password"])
    db.session.commit()
    return jsonify(user.to_dict())

@api_bp.route("/users/<int:user_id>", methods=["DELETE"])
@token_required
def delete_user(current_user, user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "deleted"})

