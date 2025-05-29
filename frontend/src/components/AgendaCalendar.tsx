import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ptLocale from "@fullcalendar/core/locales/pt-br";
import sessaoService from "../services/sessaoService";
import clienteService from "../services/clienteService";
import type { Sessao } from "../services/sessaoService";
import Slider from "@mui/material/Slider";

export default function AgendaCalendar() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [range, setRange] = useState<[number, number]>([8, 20]);

  const navigate = useNavigate();

  const formatCurrency = (valor: number) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });
  };

  useEffect(() => {
    async function carregarSessoes() {
      const { data } = await sessaoService.getAll();
      const nomesClientes = await Promise.all(
        data.map(async (sessao: Sessao) => {
          const cliente = await clienteService.get(sessao.cliente_id);
          return {
            ...sessao,
            nome_cliente: cliente.data.nome,
          };
        })
      );

      const eventosFormatados = nomesClientes.map((sessao: Sessao & { nome_cliente: string }) => ({
        id: sessao.id,
        title: `${sessao.tipo_atendimento} - ${sessao.nome_cliente}`,
        start: `${sessao.data}T${sessao.horario}`,
        color: sessao.foi_paga ? "#5cb85c" : "#d9534f",
        extendedProps: {
          observacoes: sessao.observacoes,
          valor: sessao.valor,
          foi_realizada: sessao.foi_realizada,
        },
      }));
      setEventos(eventosFormatados);
    }

    carregarSessoes();
  }, []);

  return (
    <div style={{ marginTop: "-40px" }}>
      <div style={{ marginBottom: "16px", display: "flex", justifyContent: "flex-end" }}>
        <Slider
          value={range}
          onChange={(_, newValue) => setRange(newValue as [number, number])}
          valueLabelDisplay="auto"
          min={0}
          max={23}
          step={1}
          marks
          sx={{ width: 300 }}
        />
      </div>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        locale={ptLocale}
        height="80vh"
        events={eventos}
        nowIndicator
        slotMinTime={`${range[0].toString().padStart(2, "0")}:00:00`}
        slotMaxTime={`${(range[1] + 1).toString().padStart(2, "0")}:00:00`}
        dateClick={(arg) => {
          const data = arg.dateStr.split("T")[0];
          const hora = arg.dateStr.split("T")[1]?.slice(0, 5); // "HH:MM"
          navigate(`/sessoes/novo?data=${data}&horario=${hora}`);
        }}
        eventClick={(arg) => {
          // Remove tooltip se existir
          const tooltip = document.querySelector(".fc-tooltip");
          if (tooltip) tooltip.remove();
          document.removeEventListener("mousemove", () => {});

          const id = arg.event.id;
          navigate(`/sessoes/editar/${id}`);
        }}
        eventMouseEnter={(info) => {
          const tooltip = document.createElement("div");
          tooltip.innerHTML = `
            <strong>${info.event.title}</strong><br/>
            Valor: ${formatCurrency(info.event.extendedProps.valor)}<br/>
            Realizada: ${info.event.extendedProps.foi_realizada ? "Sim" : "Não"}<br/>
            Observações: ${info.event.extendedProps.observacoes || "Nenhuma"}
          `;
          tooltip.style.position = "absolute";
          tooltip.style.zIndex = "1000";
          tooltip.style.background = info.event.backgroundColor || "#fff";
          tooltip.style.color = "#000";
          tooltip.style.minWidth = "200px";
          tooltip.style.maxWidth = "300px";
          tooltip.style.whiteSpace = "normal";
          tooltip.style.wordWrap = "break-word";
          tooltip.style.pointerEvents = "none";
          tooltip.style.padding = "8px";
          tooltip.style.border = "1px solid #ccc";
          tooltip.style.borderRadius = "4px";
          tooltip.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
          tooltip.classList.add("fc-tooltip");
          document.body.appendChild(tooltip);
          info.el.setAttribute("data-tooltip-id", "tooltip");
          const move = (e: MouseEvent) => {
            tooltip.style.left = `${e.pageX + 10}px`;
            tooltip.style.top = `${e.pageY + 10}px`;
          };
          document.addEventListener("mousemove", move);
          info.el.addEventListener("mouseleave", () => {
            tooltip.remove();
            document.removeEventListener("mousemove", move);
          }, { once: true });
        }}
      />
    </div>
  );
}