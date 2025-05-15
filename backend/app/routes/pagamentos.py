from flask import Blueprint, request, jsonify
from app import db
from app.models.pagamento import Pagamento
from flask_jwt_extended import jwt_required

pagamentos_bp = Blueprint("pagamentos", __name__, url_prefix="/pagamentos")

# GET /pagamentos/
@pagamentos_bp.route("/", methods=["GET"])
@jwt_required()
def get_all_pagamentos():
    pagamentos = Pagamento.query.all()
    return jsonify([p.to_dict() for p in pagamentos])

# GET /pagamentos/<id>
@pagamentos_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
def get_pagamento_by_id(id):
    pagamento = Pagamento.query.get_or_404(id)
    return jsonify(pagamento.to_dict())

# GET /pagamentos/sessao/<sessao_id>
@pagamentos_bp.route("/sessao/<int:sessao_id>", methods=["GET"])
@jwt_required()
def get_pagamentos_by_sessao(sessao_id):
    pagamentos = Pagamento.query.filter_by(sessao_id=sessao_id).all()
    return jsonify([p.to_dict() for p in pagamentos])

# POST /pagamentos/
@pagamentos_bp.route("/", methods=["POST"])
@jwt_required()
def create_pagamento():
    data = request.get_json()
    pagamento = Pagamento(
        sessao_id=data["sessao_id"],
        valor_pago=data["valor_pago"],
        forma_pagamento=data.get("forma_pagamento"),
        observacoes=data.get("observacoes")
    )
    db.session.add(pagamento)
    db.session.commit()
    return jsonify(pagamento.to_dict()), 201

# PUT /pagamentos/<id>
@pagamentos_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
def update_pagamento(id):
    pagamento = Pagamento.query.get_or_404(id)
    data = request.get_json()
    pagamento.valor_pago = data.get("valor_pago", pagamento.valor_pago)
    pagamento.forma_pagamento = data.get("forma_pagamento", pagamento.forma_pagamento)
    pagamento.observacoes = data.get("observacoes", pagamento.observacoes)
    db.session.commit()
    return jsonify(pagamento.to_dict())

# DELETE /pagamentos/<id>
@pagamentos_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_pagamento(id):
    pagamento = Pagamento.query.get_or_404(id)
    db.session.delete(pagamento)
    db.session.commit()
    return jsonify({"mensagem": "Pagamento excluído com sucesso."})