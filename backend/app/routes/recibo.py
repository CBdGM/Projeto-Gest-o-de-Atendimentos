from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.models.sessao import Sessao
from datetime import datetime

recibos_bp = Blueprint("recibos", __name__, url_prefix="/recibos")

@recibos_bp.route("/preview/<int:id>", methods=["GET"])
@jwt_required()
def preview_recibo(id):
    mes = request.args.get("mes", type=int)
    ano = request.args.get("ano", type=int)

    if not mes or not ano:
        return jsonify({"erro": "Parâmetros 'mes' e 'ano' são obrigatórios."}), 400

    try:
        inicio = datetime(ano, mes, 1)
        if mes == 12:
            fim = datetime(ano + 1, 1, 1)
        else:
            fim = datetime(ano, mes + 1, 1)

        sessoes = Sessao.query.filter(
            Sessao.cliente_id == id,
            Sessao.foi_realizada == True,
            Sessao.foi_paga == True,
            Sessao.data >= inicio.date(),
            Sessao.data < fim.date()
        ).all()

        quantidade = len(sessoes)
        valor_total = sum([float(s.valor or 0) for s in sessoes])
        datas = [s.data.strftime("%d/%m/%Y") for s in sessoes]

        return jsonify({
            "quantidade": quantidade,
            "valor_total": valor_total,
            "datas": datas
        })

    except Exception as e:
        return jsonify({"erro": "Erro ao buscar recibo", "detalhes": str(e)}), 500