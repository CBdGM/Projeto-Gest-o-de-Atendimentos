from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_cors import cross_origin

import os

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

@auth_bp.route("/login", methods=["POST"])
@cross_origin(origins="http://localhost:5173", supports_credentials=True)
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"erro": "Usuário e senha obrigatórios"}), 400

    valid_user = os.getenv("APP_USERNAME")
    valid_pass = os.getenv("APP_PASSWORD")

    if username != valid_user or password != valid_pass:
        return jsonify({"erro": "Credenciais inválidas"}), 401

    access_token = create_access_token(identity=username)
    refresh_token = create_refresh_token(identity=username)

    return jsonify({
    "access_token": access_token,
    "refresh_token": refresh_token
})

@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    new_access_token = create_access_token(identity=identity)
    return jsonify(access_token=new_access_token)