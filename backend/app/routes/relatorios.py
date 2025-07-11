from flask import Blueprint, request, jsonify
from app import db
from app.models.cliente import Cliente
from app.models.sessao import Sessao

relatorios_bp = Blueprint("relatorios", __name__, url_prefix="/relatorios")

@relatorios_bp.route("/dados-mensal-cliente")
def dados_mensal_cliente():
    mes = int(request.args.get("mes"))
    ano = int(request.args.get("ano"))

    resultado = []

    clientes = Cliente.query.all()
    for cliente in clientes:
        sessoes = Sessao.query.filter(
            Sessao.cliente_id == cliente.id,
            db.extract('month', Sessao.data) == mes,
            db.extract('year', Sessao.data) == ano,
            Sessao.foi_realizada == True
        ).all()

        if not sessoes:
            continue

        sessoes_data = []
        total_pago = 0.0

        for s in sessoes:
            pago = bool(s.foi_paga)
            if pago:
                total_pago += float(s.valor or 0)

            sessoes_data.append({
                "data": s.data.isoformat(),
                "tipo_atendimento": s.tipo_atendimento,
                "horario": s.horario.strftime("%H:%M"),
                "valor": float(s.valor) if s.valor else 0.0,
                "foi_paga": pago
            })

        resultado.append({
            "cliente": {
                "id": cliente.id,
                "nome": cliente.nome
            },
            "sessoes": sessoes_data,
            "total_pago": total_pago
        })

    return jsonify(resultado)

@relatorios_bp.route("/dados-mensal-geral")
def dados_mensal_geral():
    mes = int(request.args.get("mes"))
    ano = int(request.args.get("ano"))

    sessoes_realizadas = Sessao.query.filter(
        db.extract('month', Sessao.data) == mes,
        db.extract('year', Sessao.data) == ano,
        Sessao.foi_realizada == True
    ).all()

    total_geral = sum(float(s.valor or 0) for s in sessoes_realizadas if s.foi_paga)

    pagamentos_por_cliente = {}
    for s in sessoes_realizadas:
        if s.foi_paga:
            if s.cliente_id not in pagamentos_por_cliente:
                pagamentos_por_cliente[s.cliente_id] = {
                    "cliente_id": s.cliente_id,
                    "cliente_nome": s.cliente.nome,
                    "total_pago": 0.0
                }
            pagamentos_por_cliente[s.cliente_id]["total_pago"] += float(s.valor or 0)

    detalhamento = list(pagamentos_por_cliente.values())

    sessoes_detalhadas = []
    for s in sessoes_realizadas:
        sessoes_detalhadas.append({
            "cliente_id": s.cliente_id,
            "cliente_nome": s.cliente.nome,
            "data": s.data.isoformat(),
            "tipo_atendimento": s.tipo_atendimento,
            "horario": s.horario.strftime("%H:%M"),
            "valor": float(s.valor) if s.valor else 0.0,
            "foi_paga": bool(s.foi_paga)
        })

    return jsonify({
        "total_pago_no_mes": total_geral,
        "detalhamento": detalhamento,
        "sessoes": sessoes_detalhadas
    })
