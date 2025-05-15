from app import db
from datetime import datetime

class Pagamento(db.Model):
    __tablename__ = "pagamentos"

    id = db.Column(db.Integer, primary_key=True)
    sessao_id = db.Column(db.Integer, db.ForeignKey("sessoes.id", ondelete="CASCADE"), nullable=False)
    valor_pago = db.Column(db.Numeric(10, 2), nullable=False)
    forma_pagamento = db.Column(db.String(30))  # ex: dinheiro, pix, cartão
    data_pagamento = db.Column(db.DateTime, default=datetime.utcnow)
    observacoes = db.Column(db.Text)

    def to_dict(self):
        return {
            "id": self.id,
            "sessao_id": self.sessao_id,
            "valor_pago": float(self.valor_pago),
            "forma_pagamento": self.forma_pagamento,
            "data_pagamento": self.data_pagamento.isoformat(),
            "observacoes": self.observacoes,
        }