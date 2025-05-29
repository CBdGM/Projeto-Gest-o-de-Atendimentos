from app import db
from datetime import datetime

class Historico(db.Model):
    __tablename__ = "historicos"

    id = db.Column(db.Integer, primary_key=True)
    cliente_id = db.Column(db.Integer, db.ForeignKey("clientes.id"), nullable=False)
    data = db.Column(db.Date, default=datetime.utcnow)
    tipo = db.Column(db.String(20), nullable=False)  # 'sessao' ou 'supervisao'
    conteudo = db.Column(db.Text, nullable=False)

    cliente = db.relationship("Cliente", back_populates="historicos")

    def to_dict(self):
        return {
            "id": self.id,
            "cliente_id": self.cliente_id,
            "data": self.data.isoformat(),
            "tipo": self.tipo,
            "conteudo": self.conteudo,
        }