from app import db
from datetime import datetime

class Recibo(db.Model):
    __tablename__ = "recibos"

    id = db.Column(db.Integer, primary_key=True)
    cliente_id = db.Column(db.Integer, db.ForeignKey("clientes.id", ondelete="CASCADE"), nullable=False)    
    mes = db.Column(db.Integer, nullable=False)  # de 1 a 12
    ano = db.Column(db.Integer, nullable=False)
    total_sessoes = db.Column(db.Integer, nullable=False)
    total_pago = db.Column(db.Numeric(10, 2), nullable=False)
    numero_recibo = db.Column(db.String(20), unique=True)
    descricao = db.Column(db.Text)
    gerado_em = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "cliente_id": self.cliente_id,
            "mes": self.mes,
            "ano": self.ano,
            "total_sessoes": self.total_sessoes,
            "total_pago": float(self.total_pago),
            "numero_recibo": self.numero_recibo,
            "descricao": self.descricao,
            "gerado_em": self.gerado_em.isoformat(),
        }