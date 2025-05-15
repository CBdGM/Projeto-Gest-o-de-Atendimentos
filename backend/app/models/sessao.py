from app import db
from datetime import datetime

class Sessao(db.Model):
    __tablename__ = "sessoes"

    id = db.Column(db.Integer, primary_key=True)
    cliente_id = db.Column(db.Integer, db.ForeignKey("clientes.id", ondelete="CASCADE"), nullable=False)    
    data = db.Column(db.Date, nullable=False)
    tipo_atendimento = db.Column(db.String(30), nullable=False)  # psicologia ou rolfing
    frequencia = db.Column(db.String(20), nullable=False)  # semanal, quinzenal, avulso
    horario = db.Column(db.Time, nullable=False)
    foi_realizada = db.Column(db.Boolean, default=False)
    foi_paga = db.Column(db.Boolean, default=False)
    valor = db.Column(db.Numeric(10, 2))
    observacoes = db.Column(db.Text)
    criado_em = db.Column(db.DateTime, default=datetime.utcnow)
    pagamentos = db.relationship("Pagamento", backref="sessao", cascade="all, delete", passive_deletes=True)

    def to_dict(self):
        return {
            "id": self.id,
            "cliente_id": self.cliente_id,
            "data": self.data.isoformat(),
            "tipo_atendimento": self.tipo_atendimento,
            "frequencia": self.frequencia,
            "horario": self.horario.isoformat(),
            "foi_realizada": self.foi_realizada,
            "foi_paga": self.foi_paga,
            "valor": float(self.valor) if self.valor else None,
            "observacoes": self.observacoes,
            "criado_em": self.criado_em.isoformat(),
        }