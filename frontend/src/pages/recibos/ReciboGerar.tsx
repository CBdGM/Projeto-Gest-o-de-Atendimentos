import extenso from "extenso";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Button,
  MenuItem,
  Paper,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import SessaoService from "../../services/sessaoService";
import ClienteService from "../../services/clienteService";

interface ReciboPreview {
  quantidade: number;
  valor_total: number;
  datas: string[];
}

export default function ReciboGerar() {
  const { id } = useParams();
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const [ano, setAno] = useState<number>(new Date().getFullYear());
  const [clienteNome, setClienteNome] = useState<string>("");
  const [cpfCnpj, setCpfCnpj] = useState<string>("");
  const [quantidade, setQuantidade] = useState<number>(0);
  const [valorTotal, setValorTotal] = useState<number>(0);
  const [valorPorExtenso, setValorPorExtenso] = useState<string>("");
  const [dataEmissao, setDataEmissao] = useState<string>("");
  const [datasFormatadas, setDatasFormatadas] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const meses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
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
      "janeiro",
      "fevereiro",
      "março",
      "abril",
      "maio",
      "junho",
      "julho",
      "agosto",
      "setembro",
      "outubro",
      "novembro",
      "dezembro",
    ];
    setDataEmissao(
      `${hoje.getDate().toString().padStart(2, "0")} de ${
        mesesPt[hoje.getMonth()]
      } de ${hoje.getFullYear()}`
    );
  }, [id]);

  const buscarRecibo = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = (await SessaoService.getRecibo(Number(id), mes, ano)) as {
        data: ReciboPreview;
      };

      setQuantidade(res.data.quantidade);
      console.log("[DEBUG] Dados recebidos do backend:", res.data);
      setValorTotal(res.data.valor_total);

      // ✅ valor por extenso
      const valorNumerico = Math.round(res.data.valor_total);
      const valorExtensoFormatado = extenso(valorNumerico, {
        mode: "currency",
      });
      console.log("[DEBUG] Valor total (arredondado):", valorNumerico);
      console.log("[DEBUG] Valor por extenso:", valorExtensoFormatado);
      setValorPorExtenso(valorExtensoFormatado);

      // ✅ datas formatadas
      const datas: string[] = res.data.datas || [];

      // Ordenar as datas antes de formatar
      const datasOrdenadas = [...datas].sort((a, b) => {
        const [diaA, mesA, anoA] = a.split("/").map(Number);
        const [diaB, mesB, anoB] = b.split("/").map(Number);
        const dateA = new Date(anoA, mesA - 1, diaA);
        const dateB = new Date(anoB, mesB - 1, diaB);
        return dateA.getTime() - dateB.getTime();
      });

      const formatadas = datasOrdenadas.map((d: string) => {
        const [dia, mesStr, ano] = d.split("/");
        const date = new Date(Number(ano), Number(mesStr) - 1, Number(dia));
        const diaStr = String(date.getDate()).padStart(2, "0");
        const mesNome = meses[date.getMonth()];
        return `${diaStr} de ${mesNome}`;
      });

      let listaFinal = "";
      if (formatadas.length === 1) {
        listaFinal = formatadas[0];
      } else if (formatadas.length === 2) {
        listaFinal = `${formatadas[0]} e ${formatadas[1]}`;
      } else {
        listaFinal =
          formatadas.slice(0, -1).join(", ") +
          " e " +
          formatadas[formatadas.length - 1];
      }
      console.log("[DEBUG] Datas recebidas:", datas);
      console.log("[DEBUG] Datas ordenadas:", datasOrdenadas);
      console.log("[DEBUG] Datas formatadas:", formatadas);
      console.log("[DEBUG] Lista final de datas:", listaFinal);
      setDatasFormatadas(listaFinal);
    } catch (err) {
      console.error("Erro ao buscar recibo:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" justifyContent="center" mt={4}>
      <Paper sx={{ p: 4, width: 500 }}>
        <Typography variant="h5" mb={2}>
          Gerar Recibo
        </Typography>
        <Typography variant="body1" mb={2}>
          <strong>Cliente:</strong> {clienteNome}
        </Typography>

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

        <Button
          variant="contained"
          fullWidth
          onClick={buscarRecibo}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Buscar Dados do Recibo"}
        </Button>

        {quantidade > 0 && (
          <Box mt={3}>
            <Typography>
              Sessões pagas e realizadas: <strong>{quantidade}</strong>
            </Typography>
            <Typography>
              Valor total:{" "}
              <strong>
                {valorTotal.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </strong>
            </Typography>

            <Box id="recibo-content" sx={{ display: "none" }}>
              <style>
                {`
                  body { font-family: Arial, sans-serif; text-align: center; padding: 8px; font-size: 12px; }
                  img { width: 200px; }
                  .linha { margin-bottom: 6px; }
                `}
              </style>
              <div
                style={{
                  textAlign: "center",
                  fontFamily: "Arial, sans-serif",
                  fontSize: "12px",
                }}
              >
                <div style={{ paddingTop: "10px" }}>
                  <img
                    src={`${window.location.origin}/src/pages/recibos/logo.png`}
                    alt="Logo"
                    style={{ width: 200 }}
                  />
                </div>
                <div
                  className="recibo-titulo"
                  style={{ paddingTop: "40px", paddingBottom: "10px" }}
                >
                  <Typography
                    variant="h2"
                    sx={{ fontSize: "25px", fontWeight: "bold" }}
                  >
                    RECIBO
                  </Typography>
                </div>
                <div className="recibo-dados">
                  <Typography
                    className="linha"
                    sx={{ fontSize: "18px", fontWeight: "bold", mb: 1 }}
                  >
                    Recebi de <strong>{clienteNome}</strong> (CPF -{" "}
                    <strong>{cpfCnpj}</strong>) a quantia de{" "}
                    <strong>
                      {valorTotal.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </strong>{" "}
                    (<strong>{valorPorExtenso}</strong>), correspondente à{" "}
                    <strong>{quantidade}</strong>{" "}
                    {quantidade === 1 ? "sessão" : "sessões"} de psicoterapia
                    {datasFormatadas && (
                      <>
                        {" "}
                        nos dias <strong>{datasFormatadas}</strong>.
                      </>
                    )}
                  </Typography>
                  <Typography
                    className="linha"
                    sx={{ mb: 2, fontSize: "14px" }}
                  >
                    <strong>
                      Emitente: Maria Eduarda Buarque de Gusmão
                      <br />
                      CPF: 708.949.654-68
                      <br />
                      CRP: 02/13774
                    </strong>
                  </Typography>
                  <Typography className="linha" sx={{ mb: 3 }}>
                    Recife, {dataEmissao}.
                  </Typography>
                </div>
                <div className="recibo-assinatura">
                  <Typography sx={{ marginTop: "20px", marginBottom: "30px" }}>
                    ___________________________________________________
                  </Typography>
                </div>
                <div className="recibo-rodape">
                  <Typography variant="body2">
                    Empresarial Albert Einstein, sala 314, Av. Frei Matias
                    Teves, 280, Ilha do Leite
                    <br />
                    (81) 9 99667.5050 | mariaeduardabuarque@gmail.com
                  </Typography>
                </div>
              </div>
            </Box>

            <Button
              variant="outlined"
              sx={{ mt: 2 }}
              fullWidth
              onClick={() => {
                const content =
                  document.getElementById("recibo-content")?.innerHTML;
                if (content) {
                  const printWindow = window.open(
                    "",
                    "",
                    "width=800,height=600"
                  );
                  if (printWindow) {
                    printWindow.document.write(`
  <html>
    <head>
      <title>Recibo</title>
      <style>
        @page {
          size: A5 portrait;
          margin: 1.5cm;
        }
        html, body {
          height: 100%;
          margin: 0;
          padding: 0;
          position: relative;
        }
        body {
          font-family: Arial, sans-serif;
          text-align: center;
          font-size: 12px;
          margin-top: 4px;
        }
        img {
          margin-top: 0px;
          margin-bottom: 20px;
          width: 300px;
        }
        .linha {
          margin-top: 30px;
          margin-bottom: 6px;
          font-size: 15px;
        }
        .recibo-titulo {
          padding-top: 40px;
        }
        .recibo-dados {
          margin-bottom: 40px;
        }
        .recibo-assinatura {
          margin-top: 80px;
          margin-bottom: 20px;
        }
        .recibo-rodape {
          position: absolute;
          bottom: 30px;
          left: 0;
          right: 0;
          font-size: 11px;
        }
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
