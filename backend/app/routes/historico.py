from flask import Blueprint, request, jsonify
from app import db
from app.models.historico import Historico
from flask_jwt_extended import jwt_required

historico_bp = Blueprint("historicos", __name__, url_prefix="/historicos")

@historico_bp.route("/", methods=["POST"])
@jwt_required()
def criar_historico():
    data = request.json
    novo = Historico(
        cliente_id=data["cliente_id"],
        data=data.get("data"), 
        tipo=data["tipo"],
        conteudo=data["conteudo"]
    )
    db.session.add(novo)
    db.session.commit()
    return jsonify(novo.to_dict()), 201

@historico_bp.route("/cliente/<int:cliente_id>", methods=["GET"])
@jwt_required()
def listar_por_cliente(cliente_id):
    historicos = Historico.query.filter_by(cliente_id=cliente_id).order_by(Historico.data.desc()).all()
    return jsonify([h.to_dict() for h in historicos])

@historico_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
def atualizar_historico(id):
    historico = Historico.query.get_or_404(id)
    data = request.json

    historico.data = data.get("data", historico.data)
    historico.tipo = data.get("tipo", historico.tipo)
    historico.conteudo = data.get("conteudo", historico.conteudo)

    db.session.commit()
    return jsonify(historico.to_dict())


@historico_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def deletar_historico(id):
    historico = Historico.query.get_or_404(id)
    db.session.delete(historico)
    db.session.commit()
    return jsonify({"mensagem": "Histórico deletado com sucesso."}), 200