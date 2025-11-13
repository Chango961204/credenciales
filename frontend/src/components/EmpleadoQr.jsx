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
    <div className="mt-6 p-6 bg-white shadow-lg rounded-xl border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        QR generado para <span className="text-blue-600">{empleado.nom_trab}</span>
      </h3>

      <div className="flex flex-wrap gap-8 items-center">
        {/* QR Code */}
        <div className="flex justify-center">
          <QRCodeCanvas value={qrValue} size={180} includeMargin={true} />
        </div>

        {/* Datos */}
        <div className="text-sm space-y-2 text-gray-700">
          <p><span className="font-semibold text-gray-900">Número:</span> {empleado.num_trab}</p>
          <p><span className="font-semibold text-gray-900">Nombre:</span> {empleado.nom_trab}</p>
          <p><span className="font-semibold text-gray-900">IMSS:</span> {empleado.num_imss || "N/A"}</p>
          <p><span className="font-semibold text-gray-900">RFC:</span> {empleado.rfc || "N/A"}</p>
          <p><span className="font-semibold text-gray-900">Departamento:</span> {empleado.nom_depto || "N/A"}</p>
          <p><span className="font-semibold text-gray-900">Puesto:</span> {empleado.puesto || "N/A"}</p>
          <p><span className="font-semibold text-gray-900">Vencimiento:</span> {formatDate(empleado.vencimiento_contrato)}</p>
          <p>
            <span className="font-semibold text-gray-900">Estatus:</span>{" "}
            <span
              className={
                estatus === "Activo"
                  ? "text-green-600 font-bold"
                  : "text-red-600 font-bold"
              }
            >
              {estatus}
            </span>
          </p>

          <EstadoToggle empleado={empleado} onQrUpdate={onQrUpdate} />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          className="px-5 py-2 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-700 transition"
          onClick={onClose}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

export default EmpleadoQr;
