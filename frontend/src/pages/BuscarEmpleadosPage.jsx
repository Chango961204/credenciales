import { useState } from "react";
import { buscarEmpleados, generarQr } from "../services/empleadosApi";

function BuscarEmpleadosPage() {
  const [num, setNum] = useState("");
  const [nombre, setNombre] = useState("");
  const [resultados, setResultados] = useState([]);
  const [qrData, setQrData] = useState(null);

  const handleSearch = async () => {
    try {
      const res = await buscarEmpleados({
        num_trab: num || undefined,
        nom_trab: nombre || undefined
      });
      setResultados(res);
    } catch (err) {
      console.error("Error buscando empleado:", err);
      setResultados([]);
    }
  };

  const handleGenerate = async (id) => {
    try {
      const qr = await generarQr(id);
      setQrData(qr);
    } catch (err) {
      console.error("Error generando QR:", err);
    }
  };

  return (
    <div>
      <h2>Buscar empleado</h2>

      <input
        placeholder="Num. trab"
        value={num}
        onChange={e => setNum(e.target.value)}
      />
      <input
        placeholder="Nombre"
        value={nombre}
        onChange={e => setNombre(e.target.value)}
      />

      <button onClick={handleSearch}>Buscar</button>

      <ul>
        {Array.isArray(resultados) && resultados.map(emp => (
          <li key={emp.id} style={{ marginBottom: "15px" }}>
            <p><strong>Número de empleado:</strong> {emp.num_trab}</p>
            <p><strong>Nombre del trabajador:</strong> {emp.nom_trab}</p>
            <p><strong>Número de IMSS:</strong> {emp.num_imss}</p>
            <p><strong>Vencimiento del contrato:</strong> {emp.vencimiento_contrato}</p>
            <button onClick={() => handleGenerate(emp.id)}>Generar QR</button>
          </li>
        ))}
      </ul>

      {qrData && (
        <div>
          <h3>QR generado para {qrData.empleado.nom_trab}</h3>
          <img src={qrData.qrCode} alt="QR" style={{ width: 200 }} />
          <p><strong>Número de empleado:</strong> {qrData.empleado.num_trab}</p>
          <p><strong>Nombre:</strong> {qrData.empleado.nom_trab}</p>
          <p><strong>Número de IMSS:</strong> {qrData.empleado.num_imss}</p>
          <p><strong>Vencimiento:</strong> {qrData.empleado.vencimiento_contrato}</p>
        </div>
      )}
    </div>
  );
}

export default BuscarEmpleadosPage;
