import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Button,
  MenuItem,
  Paper,
  TextField,
  Typography,
  CircularProgress
} from "@mui/material";
import SessaoService from "../../services/sessaoService";
import ClienteService from "../../services/clienteService";

export default function ReciboGerar() {
  const { id } = useParams();
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const [ano, setAno] = useState<number>(new Date().getFullYear());
  const [clienteNome, setClienteNome] = useState<string>("");
  const [cpfCnpj, setCpfCnpj] = useState<string>("");
  const [quantidade, setQuantidade] = useState<number>(0);
  const [valorTotal, setValorTotal] = useState<number>(0);
  const [valorPorExtenso, setValorPorExtenso] = useState<string>("quinhentos e vinte");
  const [dataEmissao, setDataEmissao] = useState<string>("");
  const [datasFormatadas, setDatasFormatadas] = useState<string>("05, 19 e 26 de junho");
  const [loading, setLoading] = useState(false);

  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  useEffect(() => {
    if (id) {
      ClienteService.get(Number(id)).then((res) => {
        setClienteNome(res.data.nome);
        setCpfCnpj(res.data.cpf_cnpj || "");
      });
    }
    // Data de emissão formatada como "20 de maio de 2025"
    const hoje = new Date();
    const mesesPt = [
      "janeiro", "fevereiro", "março", "abril", "maio", "junho",
      "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
    ];
    setDataEmissao(
      `${hoje.getDate().toString().padStart(2, "0")} de ${mesesPt[hoje.getMonth()]} de ${hoje.getFullYear()}`
    );
    // datasFormatadas: mock por ora
    setDatasFormatadas("05, 19 e 26 de junho");
    setValorPorExtenso("quinhentos e vinte");
  }, [id]);

  const buscarRecibo = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await SessaoService.getRecibo(Number(id), mes, ano); // precisa criar esse endpoint
      setQuantidade(res.data.quantidade);
      setValorTotal(res.data.valor_total);
    } catch (err) {
      console.error("Erro ao buscar recibo:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" justifyContent="center" mt={4}>
      <Paper sx={{ p: 4, width: 500 }}>
        <Typography variant="h5" mb={2}>Gerar Recibo</Typography>
        <Typography variant="body1" mb={2}><strong>Cliente:</strong> {clienteNome}</Typography>

        <Box display="flex" gap={2} mb={2}>
          <TextField
            select
            label="Mês"
            fullWidth
            value={mes}
            onChange={(e) => setMes(Number(e.target.value))}
          >
            {meses.map((nome, index) => (
              <MenuItem key={index + 1} value={index + 1}>
                {nome}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Ano"
            type="number"
            value={ano}
            onChange={(e) => setAno(Number(e.target.value))}
          />
        </Box>

        <Button variant="contained" fullWidth onClick={buscarRecibo} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Buscar Dados do Recibo"}
        </Button>

        {quantidade > 0 && (
          <Box mt={3}>
            <Typography>
              Sessões pagas e realizadas: <strong>{quantidade}</strong>
            </Typography>
            <Typography>
              Valor total: <strong>
                {valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </strong>
            </Typography>

            <Box id="recibo-content" sx={{ display: "none" }}>
              <style>
                {`
                  body { font-family: Arial, sans-serif; text-align: center; padding: 8px; font-size: 12px; margin-top: 4px; }
                  img { margin-top: 4px; margin-bottom: 48px; width: 200px; }
                  .linha { margin-bottom: 6px; }
                `}
              </style>
              <div style={{ textAlign: "center", padding: "16px", fontFamily: "Arial, sans-serif", fontSize: "12px" }}>
                <img src={`${window.location.origin}/src/pages/recibos/logo.png`} alt="Logo" style={{ width: 200, marginTop: 10, marginBottom: 24 }} />
                <Typography variant="h4" gutterBottom sx={{ fontSize: "20px", fontWeight: "bold" }}>
                  RECIBO
                </Typography>
                <Typography className="linha" sx={{ mb: 3, fontSize: "14px" }}>
                  Recebi de <strong>{clienteNome}</strong> (CPF - <strong>{cpfCnpj}</strong>) a quantia de <strong>{valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong> (<strong>{valorPorExtenso} reais</strong>), correspondente à <strong>{quantidade}</strong> sessões de psicoterapia nos dias <strong>{datasFormatadas}</strong>.
                </Typography>
                <Typography className="linha" sx={{ mb: 1, fontSize: "14px" }}>
                  <strong>
                    Emitente: Maria Eduarda Buarque de Gusmão<br />
                    CPF: 708.949.654-68<br />
                    CRP: 02/13774
                  </strong>
                </Typography>
                <Typography className="linha" sx={{ mb: 1 }}>
                  Recife, {dataEmissao}.
                </Typography>
                <Typography sx={{ mb: 1 }}>
                  ____________________________________
                </Typography>
                <Typography variant="body2">
                  Empresarial Albert Einstein, sala 314, Av. Frei Matias Teves, 280, Ilha do Leite<br />
                  (81) 9 99667.5050 | mariaeduardabuarque@gmail.com
                </Typography>
              </div>
            </Box>

            <Button
              variant="outlined"
              sx={{ mt: 2 }}
              fullWidth
              onClick={() => {
                const content = document.getElementById("recibo-content")?.innerHTML;
                if (content) {
                  const printWindow = window.open("", "", "width=800,height=600");
                  if (printWindow) {
                    printWindow.document.write(`
                      <html>
                        <head>
                          <title>Recibo</title>
                          <style>
                            @page {
                              size: A5 portrait;
                              margin: 1cm;
                            }
                            body { font-family: Arial, sans-serif; text-align: center; padding: 8px; font-size: 12px; margin-top: 4px; }
                            img { margin-top: 8px; margin-bottom: 48px; width: 300px; }
                            .linha { margin-bottom: 6px; }
                          </style>
                        </head>
                        <body>${content}</body>
                      </html>
                    `);
                    printWindow.document.close();
                    printWindow.focus();
                    printWindow.print();
                  }
                }
              }}
            >
              Gerar PDF
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
}