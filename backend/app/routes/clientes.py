from flask import Blueprint, request, jsonify
from app import db
from app.models.cliente import Cliente
from flask_jwt_extended import jwt_required

clientes_bp = Blueprint("clientes", __name__, url_prefix="/clientes")


# GET /clientes/ → listar todos
@clientes_bp.route("/", methods=["GET"])
@jwt_required()
def get_all_clientes():
    clientes = Cliente.query.all()
    return jsonify([c.to_dict() for c in clientes])


# GET /clientes/<id> → buscar por ID
@clientes_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
def get_cliente_by_id(id):
    cliente = Cliente.query.get_or_404(id)
    return jsonify(cliente.to_dict())


# GET /clientes/nome/<nome> → buscar por nome
@clientes_bp.route("/nome/<nome>", methods=["GET"])
@jwt_required()
def get_cliente_by_nome(nome):
    clientes = Cliente.query.filter(Cliente.nome.ilike(f"%{nome}%")).all()
    return jsonify([c.to_dict() for c in clientes])


# POST /clientes/ → criar novo cliente
@clientes_bp.route("/", methods=["POST"])
@jwt_required()
def create_cliente():
    data = request.get_json()
    cpf_cnpj = data.get("cpf_cnpj", "").strip()

    # Se o cpf_cnpj não for vazio e não for apenas zeros, checar duplicado
    if cpf_cnpj and not all(c == "0" for c in cpf_cnpj):
        existente = Cliente.query.filter_by(cpf_cnpj=cpf_cnpj).first()
        if existente:
            return jsonify({"erro": "Já existe um cliente com este CPF/CNPJ."}), 409

    cliente = Cliente(
        nome=data["nome"],
        cpf_cnpj=cpf_cnpj,
        endereco=data.get("endereco"),
        telefone=data.get("telefone"),
        email=data.get("email"),
        valor_padrao=data.get("valor_padrao"),
        ativo=True,
    )
    db.session.add(cliente)
    db.session.commit()
    return jsonify(cliente.to_dict()), 201

# PUT /clientes/<id> → atualizar
@clientes_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
def update_cliente(id):
    cliente = Cliente.query.get_or_404(id)
    data = request.get_json()
    novo_cpf_cnpj = data.get("cpf_cnpj", "").strip()

    # Verifica se o cpf_cnpj foi alterado e não é só de zeros
    if novo_cpf_cnpj and not all(c == "0" for c in novo_cpf_cnpj):
        if novo_cpf_cnpj != cliente.cpf_cnpj:
            existente = Cliente.query.filter_by(cpf_cnpj=novo_cpf_cnpj).first()
            if existente and existente.id != id:
                return jsonify({"erro": "Já existe outro cliente com este CPF/CNPJ."}), 409

    cliente.nome = data.get("nome", cliente.nome)
    cliente.cpf_cnpj = novo_cpf_cnpj or cliente.cpf_cnpj
    cliente.endereco = data.get("endereco", cliente.endereco)
    cliente.telefone = data.get("telefone", cliente.telefone)
    cliente.email = data.get("email", cliente.email)
    cliente.valor_padrao = data.get("valor_padrao", cliente.valor_padrao)
    cliente.ativo = data.get("ativo", cliente.ativo)

    db.session.commit()
    return jsonify(cliente.to_dict())

# DELETE /clientes/<id> → excluir definitivamente
@clientes_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_cliente(id):
    cliente = Cliente.query.get_or_404(id)
    db.session.delete(cliente)
    db.session.commit()
    return jsonify({"mensagem": "Cliente excluído com sucesso."})