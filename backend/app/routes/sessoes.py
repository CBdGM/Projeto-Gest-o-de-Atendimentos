from flask import Blueprint, request, jsonify
from app import db
from app.models.sessao import Sessao
from flask_jwt_extended import jwt_required
from datetime import datetime, timedelta
import uuid

sessoes_bp = Blueprint("sessoes", __name__, url_prefix="/sessoes")

# Função auxiliar para calcular o próximo dia
FREQ_MAP = {
    "semanal": 7,
    "quinzenal": 14,
    "mensal": 30,
    "avulsa": 0,
}

def gerar_repeticoes(sessao, quantidade=8):
    sessoes_geradas = []
    dias = FREQ_MAP.get(sessao.frequencia, 0)
    if dias <= 0:
        return []

    for i in range(1, quantidade):
        nova_data = datetime.fromisoformat(sessao.data) + timedelta(days=dias * i)
        nova_sessao = Sessao(
            cliente_id=sessao.cliente_id,
            data=nova_data.date().isoformat(),
            tipo_atendimento=sessao.tipo_atendimento,
            frequencia=sessao.frequencia,
            horario=sessao.horario,
            foi_realizada=False,
            foi_paga=False,
            valor=sessao.valor,
            observacoes=sessao.observacoes,
            repeticao_id=sessao.repeticao_id
        )
        db.session.add(nova_sessao)
        sessoes_geradas.append(nova_sessao)
    return sessoes_geradas

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

# GET /sessoes/cliente/<cliente_id>
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

    # Verifica se já existe sessão com mesmo cliente_id e tipo_atendimento
    sessao_existente = Sessao.query.filter_by(
        cliente_id=data["cliente_id"],
        tipo_atendimento=data["tipo_atendimento"]
    ).first()

    # Se não houver sessão anterior desse tipo, cria com repetição
    if not sessao_existente:
        repeticao_id = str(uuid.uuid4())
    else:
        repeticao_id = None  # Não vai repetir

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
        repeticao_id=repeticao_id
    )
    db.session.add(sessao)

    if repeticao_id:
        sessoes_repetidas = gerar_repeticoes(sessao)
        for s in sessoes_repetidas:
            db.session.add(s)

    db.session.commit()
    return jsonify(sessao.to_dict()), 201

# PUT /sessoes/<id>
@sessoes_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
def update_sessao(id):
    sessao = Sessao.query.get_or_404(id)
    data = request.get_json()
    aplicar_em_lote = data.get("aplicar_em_lote", False)

    campos = [
        "data", "tipo_atendimento", "frequencia", "horario",
        "foi_realizada", "foi_paga", "valor", "observacoes"
    ]

    for campo in campos:
        if campo in data:
            setattr(sessao, campo, data[campo])

    if aplicar_em_lote and sessao.repeticao_id:
        sessoes_futuras = Sessao.query.filter(
            Sessao.repeticao_id == sessao.repeticao_id,
            Sessao.id != sessao.id,
            Sessao.data > sessao.data
        ).all()
        for futura in sessoes_futuras:
            for campo in ["frequencia", "horario"]:
                if campo in data:
                    setattr(futura, campo, data[campo])

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