from flask import Blueprint, request, jsonify
from app.models.cliente import Cliente
from app.models.sessao import Sessao
from app.models.pagamento import Pagamento
from sqlalchemy import extract
from datetime import date
from flask_jwt_extended import jwt_required
recibos_bp = Blueprint("recibos", __name__, url_prefix="/recibos")

# GET /recibos/recibo?cliente_id=1&mes=5&ano=2025
@recibos_bp.route("/recibo", methods=["GET"])
@jwt_required()
def gerar_recibo_dinamico():
    cliente_id = request.args.get("cliente_id", type=int)
    mes = request.args.get("mes", type=int)
    ano = request.args.get("ano", type=int)

    if not cliente_id or not mes or not ano:
        return jsonify({"erro": "Informe cliente_id, mes e ano"}), 400

    cliente = Cliente.query.get_or_404(cliente_id)

    sessoes = Sessao.query.filter(
        Sessao.cliente_id == cliente_id,
        Sessao.foi_realizada == True,
        extract("month", Sessao.data) == mes,
        extract("year", Sessao.data) == ano
    ).all()

    if not sessoes:
        return jsonify({"erro": "Nenhuma sessão realizada neste período."}), 400

    recibos_por_tipo = {}
    for s in sessoes:
        recibos_por_tipo.setdefault(s.tipo_atendimento, []).append(s)

    resultado = []
    for tipo, sessoes_lista in recibos_por_tipo.items():
        pagamentos = Pagamento.query.join(Sessao).filter(
            Sessao.cliente_id == cliente_id,
            Sessao.id.in_([s.id for s in sessoes_lista])
        ).all()
        total_pago = sum([p.valor_pago or 0 for p in pagamentos])
        datas = sorted(s.data.strftime("%d/%m") for s in sessoes_lista)
        descricao = f"{len(sessoes_lista)} sessões de {tipo} realizadas nos dias {', '.join(datas)}."

        resultado.append({
            "cliente": {
                "id": cliente.id,
                "nome": cliente.nome,
                "cpf_cnpj": cliente.cpf_cnpj,
                "email": cliente.email
            },
            "tipo_atendimento": tipo,
            "mes": mes,
            "ano": ano,
            "total_sessoes": len(sessoes_lista),
            "valor_total": total_pago,
            "descricao": descricao,
            "data_emissao": date.today().strftime("%Y-%m-%d")
        })

    return jsonify(resultado)