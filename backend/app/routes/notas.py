from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models.nota import Nota

notas_bp = Blueprint("notas", __name__, url_prefix="/notas")

@notas_bp.route("/", methods=["GET"])
@jwt_required()
def listar_notas():
    notas = Nota.query.order_by(Nota.criado_em.desc()).all()
    return jsonify([n.to_dict() for n in notas])

@notas_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
def obter_nota(id):
    nota = Nota.query.get_or_404(id)
    return jsonify(nota.to_dict())

@notas_bp.route("/", methods=["POST"])
@jwt_required()
def criar_nota():
    data = request.get_json()
    nova_nota = Nota(
        titulo=data.get("titulo", "").strip(),
        conteudo=data.get("conteudo", "").strip()
    )
    db.session.add(nova_nota)
    db.session.commit()
    return jsonify(nova_nota.to_dict()), 201

@notas_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
def atualizar_nota(id):
    nota = Nota.query.get_or_404(id)
    data = request.get_json()
    nota.titulo = data.get("titulo", nota.titulo).strip()
    nota.conteudo = data.get("conteudo", nota.conteudo).strip()
    db.session.commit()
    return jsonify(nota.to_dict())

@notas_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def deletar_nota(id):
    nota = Nota.query.get_or_404(id)
    db.session.delete(nota)
    db.session.commit()
    return jsonify({"mensagem": "Nota deletada com sucesso."}), 200