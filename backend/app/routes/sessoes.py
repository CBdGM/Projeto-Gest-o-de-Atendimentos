from flask import Blueprint, request, jsonify
from app import db
from app.models.sessao import Sessao
from flask_jwt_extended import jwt_required

sessoes_bp = Blueprint("sessoes", __name__, url_prefix="/sessoes")

# GET /sessoes/
@sessoes_bp.route("/", methods=["GET"])
@jwt_required()
def get_all_sessoes():
    sessoes = Sessao.query.all()
    return jsonify([s.to_dict() for s in sessoes])

# GET /sessoes/<id>
@sessoes_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
def get_sessao_by_id(id):
    sessao = Sessao.query.get_or_404(id)
    return jsonify(sessao.to_dict())

# GET /sessoes/cliente/<cliente_id> → listar sessões por cliente
@sessoes_bp.route("/cliente/<int:cliente_id>", methods=["GET"])
@jwt_required()
def get_sessoes_by_cliente(cliente_id):
    sessoes = Sessao.query.filter_by(cliente_id=cliente_id).all()
    return jsonify([s.to_dict() for s in sessoes])

# POST /sessoes/
@sessoes_bp.route("/", methods=["POST"])
@jwt_required()
def create_sessao():
    data = request.get_json()
    sessao = Sessao(
        cliente_id=data["cliente_id"],
        data=data["data"],
        tipo_atendimento=data["tipo_atendimento"],
        frequencia=data["frequencia"],
        horario=data["horario"],
        foi_realizada=data.get("foi_realizada", False),
        foi_paga=data.get("foi_paga", False),
        valor=data.get("valor"),
        observacoes=data.get("observacoes"),
    )
    db.session.add(sessao)
    db.session.commit()
    return jsonify(sessao.to_dict()), 201

# PUT /sessoes/<id>
@sessoes_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
def update_sessao(id):
    sessao = Sessao.query.get_or_404(id)
    data = request.get_json()
    sessao.data = data.get("data", sessao.data)
    sessao.tipo_atendimento = data.get("tipo_atendimento", sessao.tipo_atendimento)
    sessao.frequencia = data.get("frequencia", sessao.frequencia)
    sessao.horario = data.get("horario", sessao.horario)
    sessao.foi_realizada = data.get("foi_realizada", sessao.foi_realizada)
    sessao.foi_paga = data.get("foi_paga", sessao.foi_paga)
    sessao.valor = data.get("valor", sessao.valor)
    sessao.observacoes = data.get("observacoes", sessao.observacoes)
    db.session.commit()
    return jsonify(sessao.to_dict())

# DELETE /sessoes/<id>
@sessoes_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_sessao(id):
    sessao = Sessao.query.get_or_404(id)
    db.session.delete(sessao)
    db.session.commit()
    return jsonify({"mensagem": "Sessão excluída com sucesso."})