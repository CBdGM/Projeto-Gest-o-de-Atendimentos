import { useEffect, useState } from "react";
import {
  Box, Card, CardContent, Typography, TextField,
  Button, List, ListItem, ListItemText, IconButton,
  Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import type { Nota } from "../../services/notasService";
import NotasService from "../../services/notasService";

export default function Notas() {
  const [notas, setNotas] = useState<Nota[]>([]);
  const [notaAtiva, setNotaAtiva] = useState<number | null>(null);
  const [form, setForm] = useState<{ titulo: string; conteudo: string }>({ titulo: "", conteudo: "" });
  const [erros, setErros] = useState<{ titulo?: string; conteudo?: string }>({});
  const [notaExpandida, setNotaExpandida] = useState<number | null>(null);
  const [notaParaDeletar, setNotaParaDeletar] = useState<Nota | null>(null);

  const carregarNotas = async () => {
    const res = await NotasService.listar();
    setNotas(res.data);
  };

  useEffect(() => {
    carregarNotas();
  }, []);

  const handleSalvar = async () => {
    const tituloTrim = form.titulo.trim();
    const conteudoTrim = form.conteudo.trim();

    const novosErros: { titulo?: string; conteudo?: string } = {};
    if (!tituloTrim) novosErros.titulo = "Título é obrigatório.";
    if (!conteudoTrim) novosErros.conteudo = "Conteúdo é obrigatório.";

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    setErros({});

    if (notaAtiva) {
      await NotasService.atualizar(notaAtiva, {
        titulo: tituloTrim,
        conteudo: conteudoTrim,
      });
    } else {
      await NotasService.criar({
        titulo: tituloTrim,
        conteudo: conteudoTrim,
      });
    }

    setForm({ titulo: "", conteudo: "" });
    setNotaAtiva(null);
    carregarNotas();
  };

  const handleEditar = (nota: Nota) => {
    setNotaAtiva(nota.id);
    setForm({ titulo: nota.titulo, conteudo: nota.conteudo });
  };

  const confirmarDeletar = async () => {
    if (notaParaDeletar) {
      await NotasService.deletar(notaParaDeletar.id);
      setNotaParaDeletar(null);
      carregarNotas();
    }
  };

  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom>Bloco de Notas</Typography>
      <TextField
        label="Título"
        fullWidth
        value={form.titulo}
        onChange={(e) => setForm({ ...form, titulo: e.target.value })}
        error={!!erros.titulo}
        helperText={erros.titulo}
        sx={{ mb: 1 }}
      />
      <TextField
        label="Conteúdo"
        multiline
        rows={4}
        fullWidth
        value={form.conteudo}
        onChange={(e) => setForm({ ...form, conteudo: e.target.value })}
        error={!!erros.conteudo}
        helperText={erros.conteudo}
        sx={{ mb: 2 }}
      />
      <Button variant="contained" onClick={handleSalvar}>
        {notaAtiva ? "Atualizar" : "Criar"}
      </Button>

      <List sx={{ mt: 3 }}>
        {notas.map((nota) => (
          <Card key={nota.id} sx={{ mb: 2 }}>
            <CardContent>
              <ListItem
                secondaryAction={
                  <>
                    <IconButton color="primary" onClick={() => handleEditar(nota)}><Edit /></IconButton>
                    <IconButton color="error" onClick={() => setNotaParaDeletar(nota)}><Delete /></IconButton>
                  </>
                }
              >
                <ListItemText
                  primary={nota.titulo}
                  secondary={
                    <>
                      {notaExpandida === nota.id || nota.conteudo.length <= 100
                        ? nota.conteudo
                        : nota.conteudo.slice(0, 100) + "... "}
                      {nota.conteudo.length > 100 && (
                        <Button
                          size="small"
                          onClick={() =>
                            setNotaExpandida(notaExpandida === nota.id ? null : nota.id)
                          }
                          sx={{ textTransform: "none", ml: 1 }}
                        >
                          {notaExpandida === nota.id ? "Mostrar menos" : "Mostrar mais"}
                        </Button>
                      )}
                    </>
                  }
                />
              </ListItem>
            </CardContent>
          </Card>
        ))}
      </List>

      <Dialog open={!!notaParaDeletar} onClose={() => setNotaParaDeletar(null)}>
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Deseja realmente excluir a nota "{notaParaDeletar?.titulo}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotaParaDeletar(null)}>Cancelar</Button>
          <Button onClick={confirmarDeletar} color="error">Excluir</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}