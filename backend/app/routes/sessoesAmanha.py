from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from app.models.sessao import Sessao
from app.models.cliente import Cliente
from datetime import datetime, timedelta

sessoes_amanha_bp = Blueprint("sessoes_amanha", __name__, url_prefix="/dashboard")

@sessoes_amanha_bp.route("/sessoes-amanha", methods=["GET"])
@jwt_required()
def listar_sessoes_amanha():
    hoje = datetime.today().date()
    if hoje.weekday() == 4:  # sexta-feira
        alvo = hoje + timedelta(days=3)
    else:
        alvo = hoje + timedelta(days=1)

    sessoes = Sessao.query.join(Cliente).filter(
        Sessao.data == alvo,
        Sessao.foi_realizada == False
    ).order_by(Sessao.horario.asc()).all()

    resultado = [{
        "cliente": s.cliente.nome,
        "telefone": s.cliente.telefone,  
        "data": s.data.strftime("%d/%m/%Y"),
        "horario": s.horario.strftime("%H:%M"),
        "tipo_atendimento": s.tipo_atendimento
    } for s in sessoes]

    return jsonify(resultado)