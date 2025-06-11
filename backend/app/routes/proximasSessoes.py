from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from app.models.sessao import Sessao
from app.models.cliente import Cliente
from datetime import datetime, timedelta
from sqlalchemy import and_

proximas_sessoes_bp = Blueprint("proximas_sessoes", __name__, url_prefix="/dashboard")

@proximas_sessoes_bp.route("/proximas-sessoes", methods=["GET"])
@jwt_required()
def listar_proximas_sessoes():
    hoje = datetime.today().date()
    fim = hoje + timedelta(days=7)

    sessoes = Sessao.query.join(Cliente).filter(
        Sessao.data >= hoje,
        Sessao.data <= fim,
        Sessao.foi_realizada == False
    ).order_by(Sessao.data.asc(), Sessao.horario.asc()).all()

    resultado = [{
        "cliente": s.cliente.nome,
        "telefone": s.cliente.telefone,
        "data": s.data.strftime("%d/%m/%Y"),
        "horario": s.horario.strftime("%H:%M"),
        "tipo_atendimento": s.tipo_atendimento
    } for s in sessoes]

    return jsonify(resultado)