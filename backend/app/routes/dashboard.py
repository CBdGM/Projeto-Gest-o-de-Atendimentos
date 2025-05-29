from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from app.models.sessao import Sessao
from datetime import datetime

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/dashboard")

@dashboard_bp.route("/resumo-financeiro", methods=["GET"])
@jwt_required()
def resumo_financeiro():
    hoje = datetime.today()
    mes_inicio = datetime(hoje.year, hoje.month, 1)

    sessoes_mes = Sessao.query.filter(
        Sessao.data >= mes_inicio,
        Sessao.data <= hoje
    ).all()

    sessoes_realizadas = [s for s in sessoes_mes if s.foi_realizada]
    sessoes_pagas = [s for s in sessoes_realizadas if s.foi_paga]
    sessoes_nao_pagas = [s for s in sessoes_realizadas if not s.foi_paga]

    valor_recebido = sum([float(s.valor or 0) for s in sessoes_pagas])
    valor_a_receber = sum([float(s.valor or 0) for s in sessoes_nao_pagas])

    sessoes_futuras = Sessao.query.filter(
        Sessao.data > hoje
    ).count()

    sessoes_passadas_nao_realizadas = Sessao.query.filter(
        Sessao.data < hoje,
        Sessao.foi_realizada == False
    ).count()

    return jsonify({
        "sessoes": len(sessoes_realizadas),
        "recebido": valor_recebido,
        "a_receber": valor_a_receber,
        "futuras": sessoes_futuras,
        "nao_realizadas": sessoes_passadas_nao_realizadas
    })