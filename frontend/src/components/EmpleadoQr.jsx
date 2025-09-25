import { QRCodeCanvas } from "qrcode.react";
import EstadoToggle from "./EstadoToggle";

function formatDate(date) {
  if (!date) return "N/A";
  try {
    const d = new Date(date);
    if (isNaN(d)) return date;
    return d.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return date;
  }
}

function EmpleadoQr({ empleado, onClose, onQrUpdate }) {
  if (!empleado) return null;

  const estatus = empleado.estado_qr === "activo" ? "Activo" : "Inactivo";

  const qrValue = `
    Número: ${empleado.num_trab}
    Nombre: ${empleado.nom_trab}
    IMSS: ${empleado.num_imss}
    RFC: ${empleado.rfc}
    Departamento: ${empleado.nom_depto}
    Puesto: ${empleado.puesto}
    Vencimiento: ${formatDate(empleado.vencimiento_contrato)}
    Estatus: ${estatus}
  `;

  return (
    <div className="mt-4 p-4 border border-green-400 rounded bg-gray-50">
      <h3 className="text-green-600 font-bold mb-2">
        QR generado para {empleado.nom_trab}
      </h3>
      <div className="flex gap-6 flex-wrap items-center">
        <QRCodeCanvas value={qrValue} size={160} includeMargin={true} />
        <div>
          <p><strong>Número:</strong> {empleado.num_trab}</p>
          <p><strong>Nombre:</strong> {empleado.nom_trab}</p>
          <p><strong>IMSS:</strong> {empleado.num_imss || "N/A"}</p>
          <p><strong>RFC:</strong> {empleado.rfc || "N/A"}</p>
          <p><strong>Departamento:</strong> {empleado.nom_depto || "N/A"}</p>
          <p><strong>Puesto:</strong> {empleado.puesto || "N/A"}</p>
          <p><strong>Vencimiento:</strong> {formatDate(empleado.vencimiento_contrato)}</p>
          <p>
            <strong>Estatus:</strong>{" "}
            <span
              className={
                estatus === "Activo"
                  ? "text-green-600 font-semibold"
                  : "text-red-600 font-semibold"
              }
            >
              {estatus}
            </span>
          </p>

          <EstadoToggle empleado={empleado} onQrUpdate={onQrUpdate} />
        </div>
      </div>

      <button
        className="mt-2 px-3 py-1 rounded bg-gray-600 text-white hover:bg-gray-700"
        onClick={onClose}
      >
        Cerrar
      </button>
    </div>
  );
}

export default EmpleadoQr;
