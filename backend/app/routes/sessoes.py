from flask import Blueprint, request, jsonify
from app import db
from app.models.sessao import Sessao
from flask_jwt_extended import jwt_required
from datetime import datetime, timedelta, date
import uuid
import unicodedata
from sqlalchemy import and_

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

    # Converte para datetime
    data_str = data["data"]
    horario_str = data["horario"]
    data_horario = datetime.fromisoformat(f"{data_str}T{horario_str}")
    uma_hora_antes = data_horario - timedelta(hours=1)
    uma_hora_depois = data_horario + timedelta(hours=1)

    conflito = Sessao.query.filter(
        Sessao.data == data_str,
        Sessao.horario >= uma_hora_antes.time().isoformat(),
        Sessao.horario <= uma_hora_depois.time().isoformat()
    ).first()

    if conflito:
        return jsonify({"erro": "Já existe uma sessão cadastrada para esse horário"}), 400

    # Verifica se já existe sessão com mesmo cliente_id e tipo_atendimento
    sessao_existente = Sessao.query.filter_by(
        cliente_id=data["cliente_id"],
        tipo_atendimento=data["tipo_atendimento"]
    ).first()

    if not sessao_existente:
        repeticao_id = str(uuid.uuid4())
    else:
        repeticao_id = None

    # Cria a sessão principal
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

    # Geração das futuras e verificação de conflito real
    if repeticao_id:
        sessoes_repetidas = gerar_repeticoes(sessao)
        datas_horarios_atuais = {(s.data, s.horario) for s in sessoes_repetidas}
        datas_horarios_atuais.add((sessao.data, sessao.horario))

        for s in sessoes_repetidas:
            data_horario = datetime.fromisoformat(f"{s.data}T{s.horario}")
            uma_hora_antes = data_horario - timedelta(hours=1)
            uma_hora_depois = data_horario + timedelta(hours=1)

            conflitos = Sessao.query.filter(
                Sessao.data == s.data,
                Sessao.horario >= uma_hora_antes.time().isoformat(),
                Sessao.horario <= uma_hora_depois.time().isoformat()
            ).all()

            for c in conflitos:
                if (c.data, c.horario) not in datas_horarios_atuais:
                    return jsonify({
                        "erro": "Com a frequência selecionada vai haver conflitos de horário no futuro, selecione outra frequência e/ou horário"
                    }), 400

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
    atualizar_valores_futuros = data.get("atualizar_valores_futuros", False)

    data_original = sessao.data  # salva a data antes de atualizar

    # NOVO BLOCO: verificar conflito do novo horário
    nova_data = data.get("data", sessao.data)
    novo_horario = data.get("horario", sessao.horario)
    nova_datahora = datetime.fromisoformat(f"{nova_data}T{novo_horario}")
    uma_hora_antes = nova_datahora - timedelta(hours=1)
    uma_hora_depois = nova_datahora + timedelta(hours=1)

    conflito = Sessao.query.filter(
        Sessao.id != sessao.id,
        Sessao.data == nova_data,
        Sessao.horario >= uma_hora_antes.time().isoformat(),
        Sessao.horario <= uma_hora_depois.time().isoformat()
    ).first()


    if conflito:
        return jsonify({"erro": "Já existe uma sessão cadastrada para esse horário"}), 400

    # Atualiza os campos da sessão principal
    campos = [
        "data", "tipo_atendimento", "frequencia", "horario",
        "foi_realizada", "foi_paga", "valor", "observacoes"
    ]
    for campo in campos:
        if campo in data:
            setattr(sessao, campo, data[campo])

    # Se tiver futuras e for atualizar...
    if sessao.repeticao_id:
        sessoes_futuras = Sessao.query.filter(
            Sessao.repeticao_id == sessao.repeticao_id,
            Sessao.id != sessao.id,
            Sessao.data > data_original
        ).order_by(Sessao.data.asc()).all()

        # Se frequência vai mudar
        if atualizar_futuras_frequencias and "frequencia" in data:
            dias_frequencia = FREQ_MAP.get(normalizar_dia_semana(data["frequencia"]), 0)
            if dias_frequencia > 0:
                sessoes_futuras.sort(key=lambda s: s.data)
                data_base = datetime.fromisoformat(sessao.data)
                dia_semana_alvo = data_base.weekday()

                for i, futura in enumerate(sessoes_futuras):
                    futura.frequencia = data["frequencia"]
                    nova_data_base = data_base + timedelta(days=dias_frequencia * (i + 1))
                    while nova_data_base.weekday() != dia_semana_alvo:
                        nova_data_base -= timedelta(days=1)
                    nova_data = nova_data_base.date().isoformat()

                    # NOVO: checar conflitos antes de aplicar
                    nova_datahora = datetime.fromisoformat(f"{nova_data}T{sessao.horario}")
                    uma_hora_antes = nova_datahora - timedelta(hours=1)
                    uma_hora_depois = nova_datahora + timedelta(hours=1)

                    conflito = Sessao.query.filter(
                        Sessao.data == nova_data,
                        Sessao.horario >= uma_hora_antes.time().isoformat(),
                        Sessao.horario <= uma_hora_depois.time().isoformat(),
                        Sessao.id != futura.id,
                        Sessao.repeticao_id != sessao.repeticao_id  # IGNORA sessões da mesma repetição
                    ).first()

                    if conflito:
                        return jsonify({
                            "erro": "Com a frequência selecionada vai haver conflitos de horário no futuro, selecione outra frequência e/ou horário"
                        }), 400

                    futura.data = nova_data

        # Se horário e/ou data vão mudar
        if atualizar_futuras_data_horario:
            if "horario" in data:
                for futura in sessoes_futuras:
                    nova_datahora = datetime.fromisoformat(f"{futura.data}T{data['horario']}")
                    uma_hora_antes = nova_datahora - timedelta(hours=1)
                    uma_hora_depois = nova_datahora + timedelta(hours=1)

                    conflito = Sessao.query.filter(
                        Sessao.data == futura.data,
                        Sessao.horario >= uma_hora_antes.time().isoformat(),
                        Sessao.horario <= uma_hora_depois.time().isoformat(),
                        Sessao.id != futura.id
                    ).first()

                    if conflito:
                        return jsonify({
                            "erro": "Com o novo horário haverá conflitos de sessões futuras. Altere o horário ou desmarque a atualização em cadeia."
                        }), 400

                    futura.horario = data["horario"]

            if "data" in data:
                from dateutil.parser import parse
                dias_frequencia = FREQ_MAP.get(normalizar_dia_semana(sessao.frequencia), 0)
                data_base = datetime.fromisoformat(sessao.data)
                dia_semana_alvo = data_base.weekday()

                for i, futura in enumerate(sessoes_futuras):
                    try:
                        if isinstance(futura.data, datetime):
                            futura_data_date = futura.data.date()
                        elif isinstance(futura.data, str):
                            futura_data_date = parse(futura.data).date()
                        elif isinstance(futura.data, date):
                            futura_data_date = futura.data
                        else:
                            raise ValueError(f"Tipo inesperado para futura.data: {type(futura.data)}")
                    except Exception as e:
                        raise

                    nova_data_base = data_base + timedelta(days=dias_frequencia * (i + 1))
                    while nova_data_base.weekday() != dia_semana_alvo:
                        nova_data_base -= timedelta(days=1)
                    nova_data = nova_data_base

                    nova_data_str = nova_data.date().isoformat()

                    nova_datahora = datetime.fromisoformat(f"{nova_data_str}T{futura.horario}")
                    uma_hora_antes = nova_datahora - timedelta(hours=1)
                    uma_hora_depois = nova_datahora + timedelta(hours=1)

                    conflito = Sessao.query.filter(
                        Sessao.data == nova_data,
                        Sessao.horario >= uma_hora_antes.time().isoformat(),
                        Sessao.horario <= uma_hora_depois.time().isoformat(),
                        Sessao.id != futura.id,
                        Sessao.repeticao_id != sessao.repeticao_id
                    ).first()

                    if conflito:
                        return jsonify({
                            "erro": "Com a nova data haverá conflitos de sessões futuras. Altere a data ou desmarque a atualização em cadeia."
                        }), 400

                    futura.data = nova_data.date().isoformat()

    if atualizar_valores_futuros and sessao.repeticao_id and "valor" in data:
        for futura in sessoes_futuras:
            futura.valor = data["valor"]

    db.session.commit()
    return jsonify(sessao.to_dict())

# DELETE /sessoes/<id>?delete_all=true
@sessoes_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_sessao(id):
    delete_all = request.args.get("delete_all", "false").lower() == "true"
    sessao = Sessao.query.get_or_404(id)

    if delete_all and sessao.repeticao_id:
        sessoes_a_excluir = Sessao.query.filter(
            Sessao.repeticao_id == sessao.repeticao_id,
            Sessao.id >= sessao.id
        ).all()
        for s in sessoes_a_excluir:
            db.session.delete(s)
    else:
        db.session.delete(sessao)

    db.session.commit()
    return jsonify({"mensagem": "Sessão(s) excluída(s) com sucesso."})