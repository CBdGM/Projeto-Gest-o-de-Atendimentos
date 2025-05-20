// import React from "react"; // removido por não estar sendo utilizado
import AgendaCalendar from "../components/AgendaCalendar";

export default function AgendaPage() {
  return (
    <div style={{ padding: "0.5rem" }}>
      <h2>Agenda de Sessões</h2>
      <AgendaCalendar />
    </div>
  );
}