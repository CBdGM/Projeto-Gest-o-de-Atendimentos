import { Card, CardContent, Typography, Grid } from "@mui/material";

type ResumoFinanceiroProps = {
  sessoes: number;
  recebido: number;
  aReceber: number;
  futuras: number;
  naoRealizadas: number;
};

export default function ResumoFinanceiro({
  sessoes,
  recebido,
  aReceber,
  futuras,
  naoRealizadas,
}: ResumoFinanceiroProps) {
  const cardStyle = (theme: any) => ({
    minWidth: 200,
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
    borderRadius: "16px",
    backdropFilter: "blur(4px)",
    background: theme.palette.background.paper,
    transition: "transform 0.3s",
    ":hover": {
      transform: "translateY(-4px)",
    },
  });

  return (
    <Grid container spacing={4} justifyContent="center" wrap="nowrap">
        <Card sx={cardStyle}>
          <CardContent>
            <Typography variant="body2"  gutterBottom>
              Sessões realizadas no mês
            </Typography>
            <Typography variant="h6" color="success.main">
              {sessoes || 0}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={cardStyle}>
          <CardContent>
            <Typography variant="body2" gutterBottom title="Valor referente ao que já foi pago (mesmo que pago antecipado)">
              Valor recebido no mês
            </Typography>
            <Typography variant="h6" color="success.main">
              {(recebido || 0).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={cardStyle}>
          <CardContent>
            <Typography variant="body2" gutterBottom title="Valor referente ao que já foi realizado, mas não foi pago">
              Valor a receber no mês
            </Typography>
            <Typography variant="h6" color="error.main">
              {(aReceber || 0).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={cardStyle}>
          <CardContent>
            <Typography variant="body2" gutterBottom title="Quantidade de sessões restantes no mês (de acordo com o que ta cadastrado na aba 'Sessões')">
              Sessões futuras no mês
            </Typography>
            <Typography variant="h6" color="primary.main">
              {(futuras - sessoes) || 0}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={cardStyle}>
          <CardContent>
            <Typography variant="body2" gutterBottom title="Quantidade de sessões qua já passaram mas não foram marcadas como realiazadas na aba 'Sessões'">
              Sessões não realizadas no passado
            </Typography>
            <Typography variant="h6" color="warning.main">
              {naoRealizadas || 0}
            </Typography>
          </CardContent>
        </Card>
    </Grid>
  );
}