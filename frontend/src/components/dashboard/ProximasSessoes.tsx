import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import type { SessaoProxima } from "../../services/proximasSessoesService";

type Props = {
  sessoes: SessaoProxima[];
};

export default function ProximasSessoes({ sessoes }: Props) {
  console.log("[DEBUG] Próximas sessões recebidas:", sessoes);
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
            sessoes.map((s, index) => (
              <ListItem key={index} divider>
                <ListItemText
                  primary={`${s.cliente} - ${s.tipo_atendimento}`}
                  secondary={`${s.data} às ${s.horario}`}
                />
              </ListItem>
            ))
          )}
        </List>
      </CardContent>
    </Card>
  );
}
