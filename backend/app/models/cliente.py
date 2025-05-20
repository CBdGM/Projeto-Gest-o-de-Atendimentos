from app import db
from datetime import datetime

class Cliente(db.Model):
    __tablename__ = "clientes"

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    cpf_cnpj = db.Column(db.String(18), nullable=False)
    endereco = db.Column(db.Text)
    telefone = db.Column(db.String(20))
    telefone_emergencia = db.Column(db.String(20), nullable=True)
    email = db.Column(db.String(100))
    ativo = db.Column(db.Boolean, default=True)
    criado_em = db.Column(db.DateTime, default=datetime.utcnow)
    sessoes = db.relationship("Sessao", backref="cliente", cascade="all, delete", passive_deletes=True)

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "cpf_cnpj": self.cpf_cnpj,
            "endereco": self.endereco,
            "telefone": self.telefone,
            "telefone_emergencia": self.telefone_emergencia,
            "email": self.email,
            "ativo": self.ativo,
            "criado_em": self.criado_em.isoformat(),
        }