from flask import Blueprint, request, jsonify
from app import db
from app.models.sessao import Sessao
from flask_jwt_extended import jwt_required
from datetime import datetime, timedelta
import uuid
import unicodedata

sessoes_bp = Blueprint("sessoes", __name__, url_prefix="/sessoes")

# Função auxiliar para calcular o próximo dia
FREQ_MAP = {
    "semanal": 7,
    "quinzenal": 14,
    "mensal": 30,
    "avulsa": 0,
}

def normalizar_dia_semana(nome_dia):
    return unicodedata.normalize("NFKD", nome_dia).encode("ASCII", "ignore").decode("ASCII").lower()

def gerar_repeticoes(sessao, quantidade=8):
    sessoes_geradas = []
    dias = FREQ_MAP.get(normalizar_dia_semana(sessao.frequencia), 0)
    if dias <= 0:
        return []

    data_base = datetime.fromisoformat(sessao.data)
    dia_semana_alvo = data_base.weekday()  # 0 = segunda, 6 = domingo
    for i in range(1, quantidade):
        nova_data_base = data_base + timedelta(days=dias * i)
        while nova_data_base.weekday() != dia_semana_alvo:
            nova_data_base -= timedelta(days=1)
        nova_data = nova_data_base
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
    atualizar_futuras_frequencias = data.get("atualizar_futuras_frequencias", False)
    atualizar_futuras_data_horario = data.get("atualizar_futuras_data_horario", False)

    data_original = sessao.data  # salva a data antes de atualizar

    campos = [
        "data", "tipo_atendimento", "frequencia", "horario",
        "foi_realizada", "foi_paga", "valor", "observacoes"
    ]

    for campo in campos:
        if campo in data:
            setattr(sessao, campo, data[campo])

    if sessao.repeticao_id:
        sessoes_futuras = Sessao.query.filter(
            Sessao.repeticao_id == sessao.repeticao_id,
            Sessao.id != sessao.id,
            Sessao.data > data_original  # usa a data anterior como referência
        ).order_by(Sessao.data.asc()).all()


        if atualizar_futuras_frequencias and "frequencia" in data:
            for futura in sessoes_futuras:
                futura.frequencia = data["frequencia"]

            # Atualiza datas com base na nova frequência
            dias_frequencia = FREQ_MAP.get(normalizar_dia_semana(data["frequencia"]), 0)
            if dias_frequencia > 0:
                sessoes_futuras.sort(key=lambda s: s.data)
                data_base = datetime.fromisoformat(sessao.data)
                dia_semana_alvo = data_base.weekday()  # 0 = segunda, 6 = domingo
                for i, futura in enumerate(sessoes_futuras):
                    nova_data_base = data_base + timedelta(days=dias_frequencia * (i + 1))
                    while nova_data_base.weekday() != dia_semana_alvo:
                        nova_data_base -= timedelta(days=1)
                    futura.data = nova_data_base.date().isoformat()

        if atualizar_futuras_data_horario:
            if "horario" in data:
                for futura in sessoes_futuras:
                    futura.horario = data["horario"]

            if "data" in data:
                nova_data_atual = datetime.fromisoformat(data["data"])
                data_atual_antiga = datetime.fromisoformat(str(data_original))
                diferenca_dias = (nova_data_atual - data_atual_antiga).days

                for futura in sessoes_futuras:
                    data_antiga = futura.data
                    futura_data = datetime.combine(futura.data, datetime.min.time())
                    nova_data = futura_data + timedelta(days=diferenca_dias)
                    futura.data = nova_data.date().isoformat()

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