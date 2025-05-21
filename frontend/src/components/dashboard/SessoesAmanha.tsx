import { Card, CardContent, Typography, List, ListItem, ListItemText, Button } from "@mui/material";
import type { SessaoAmanha } from "../../services/sessoesAmanhaService";

type Props = {
  sessoes: SessaoAmanha[];
};

export default function SessoesAmanha({ sessoes }: Props) {
  const enviarLembrete = (telefone: string, nome: string, horario: string) => {
    const mensagem = `Olá ${nome}, este é um lembrete da sua sessão marcada para amanhã às ${horario}.`;
    const url = `https://wa.me/55${telefone.replace(/\D/g, "")}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, "_blank");
  };

  return (
    <Card
      sx={{
        mt: 4,
        width: "100%",
        minWidth: 400,
        alignSelf: "flex-start",
        maxHeight: 400, 
        overflowY: "auto",
      }}
    >
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Sessões de Amanhã
        </Typography>
        <List dense>
          {sessoes.length === 0 ? (
            <Typography variant="body2" color="textSecondary">
              Nenhuma sessão agendada.
            </Typography>
          ) : (
            sessoes.map((s, index) => (
              <ListItem key={index} divider sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, gap: 1 }}>
                <ListItemText
                  primary={`${s.cliente} - ${s.tipo_atendimento}`}
                  secondary={`${s.data} às ${s.horario}`}
                />
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ mt: { xs: 1, sm: 0 }, alignSelf: { xs: "flex-start", sm: "auto" } }}
                  onClick={() => enviarLembrete(s.telefone, s.cliente, s.horario)}
                >
                  Enviar Lembrete
                </Button>
              </ListItem>
            ))
          )}
        </List>
      </CardContent>
    </Card>
  );
}