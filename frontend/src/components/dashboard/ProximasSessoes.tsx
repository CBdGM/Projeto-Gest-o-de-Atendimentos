import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
} from "@mui/material";
import type { SessaoProxima } from "../../services/proximasSessoesService";

type Props = {
  sessoes: SessaoProxima[];
};

export default function ProximasSessoes({ sessoes }: Props) {
  const enviarLembrete = (telefone: string, nome: string, data: string, horario: string) => {
    const mensagem = `Olá ${nome}, este é um lembrete da sua sessão marcada para o dia ${data} às ${horario}.`;
    
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
          Próximas Sessões (7 dias)
        </Typography>
        <List dense>
          {sessoes.length === 0 ? (
            <Typography variant="body2" color="textSecondary">
              Nenhuma sessão nos próximos dias.
            </Typography>
          ) : (
            sessoes.map((s, index) => {

              return (
                <ListItem
                  key={index}
                  divider
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", sm: "center" },
                    gap: 1,
                  }}
                >
                  <ListItemText
                    primary={`${s.cliente} - ${s.tipo_atendimento}`}
                    secondary={`${s.data} às ${s.horario}`}
                  />
                  {!s.telefone ? (
                    <Typography variant="caption" color="error">
                      Telefone não disponível
                    </Typography>
                  ) : (
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ mt: { xs: 1, sm: 0 }, alignSelf: { xs: "flex-start", sm: "auto" } }}
                      onClick={() =>
                        enviarLembrete(s.telefone, s.cliente, s.data, s.horario)
                      }
                    >
                      Enviar Lembrete
                    </Button>
                  )}
                </ListItem>
              );
            })
          )}
        </List>
      </CardContent>
    </Card>
  );
}
