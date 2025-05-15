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
    cliente = Cliente(
        nome=data["nome"],
        cpf_cnpj=data["cpf_cnpj"],
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
    cliente.nome = data.get("nome", cliente.nome)
    cliente.cpf_cnpj = data.get("cpf_cnpj", cliente.cpf_cnpj)
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