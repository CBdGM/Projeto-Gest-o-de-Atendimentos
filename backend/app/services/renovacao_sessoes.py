from app import db
from app.models.sessao import Sessao
from datetime import datetime, timedelta
from collections import defaultdict

FREQ_MAP = {
    "semanal": 7,
    "quinzenal": 14,
    "mensal": 30,
}

def renovar_sessoes_repetidas():
    hoje = datetime.utcnow().date()

    sessoes = Sessao.query.filter(Sessao.repeticao_id.isnot(None)).all()
    sessoes_por_repeticao = defaultdict(list)

    for s in sessoes:
        sessoes_por_repeticao[s.repeticao_id].append(s)

    for repeticao_id, lista in sessoes_por_repeticao.items():
        lista.sort(key=lambda s: s.data)
        ultima = lista[-1]

        dias = FREQ_MAP.get(ultima.frequencia)
        if not dias:
            continue

        for i in range(1, 5):
            nova_data = ultima.data + timedelta(days=dias * i)
            if nova_data <= hoje:
                continue

            existe = Sessao.query.filter_by(
                cliente_id=ultima.cliente_id,
                data=nova_data,
                horario=ultima.horario,
                tipo_atendimento=ultima.tipo_atendimento
            ).first()

            if existe:
                continue

            nova = Sessao(
                cliente_id=ultima.cliente_id,
                data=nova_data,
                tipo_atendimento=ultima.tipo_atendimento,
                frequencia=ultima.frequencia,
                horario=ultima.horario,
                foi_realizada=False,
                foi_paga=False,
                valor=ultima.valor,
                observacoes="",
                repeticao_id=repeticao_id
            )
            db.session.add(nova)

    db.session.commit()