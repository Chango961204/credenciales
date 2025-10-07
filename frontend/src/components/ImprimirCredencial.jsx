import { useState, useEffect } from 'react';

export default function ImprimirCredencial({ empleado }) {
  const [impresoras, setImpresoras] = useState([]);
  const [impresoraSeleccionada, setImpresoraSeleccionada] = useState('');
  const [estado, setEstado] = useState('');
  const [cargando, setCargando] = useState(false);
  const [preview, setPreview] = useState({ frente: null, reverso: null });

  const API_URL = 'http://localhost:4000/api/credenciales';

  useEffect(() => {
    cargarImpresoras();
  }, []);

  const cargarImpresoras = async () => {
    try {
      const response = await fetch(`${API_URL}/impresoras`);
      const data = await response.json();
      
      if (data.success && data.impresoras.length > 0) {
        setImpresoras(data.impresoras);
        setImpresoraSeleccionada(data.impresoras[0].nombre);
        setEstado(`${data.impresoras.length} impresora(s) encontrada(s)`);
      } else {
        setEstado('No se encontraron impresoras Zebra');
      }
    } catch (error) {
      setEstado('Error al cargar impresoras: ' + error.message);
    }
  };

  const generarPreview = async () => {
    setCargando(true);
    setEstado('Generando preview...');
    
    try {
      const response = await fetch(`${API_URL}/generar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(empleado)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPreview({
          frente: data.frente,
          reverso: data.reverso
        });
        setEstado('Preview generado correctamente');
      } else {
        setEstado('Error al generar preview');
      }
    } catch (error) {
      setEstado('Error: ' + error.message);
    } finally {
      setCargando(false);
    }
  };

  const imprimirCredencial = async () => {
    if (!impresoraSeleccionada) {
      setEstado('Por favor selecciona una impresora');
      return;
    }

    setCargando(true);
    setEstado('Imprimiendo...');

    try {
      const response = await fetch(`${API_URL}/generar-imprimir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...empleado,
          impresora: impresoraSeleccionada
        })
      });

      const data = await response.json();

      if (data.success) {
        setEstado(`✓ Credencial enviada a impresión (Job ID: ${data.jobID})`);
        setPreview({
          frente: data.frente,
          reverso: data.reverso
        });
      } else {
        setEstado('Error al imprimir: ' + (data.error || data.detalle));
      }
    } catch (error) {
      setEstado('Error de conexión: ' + error.message);
    } finally {
      setCargando(false);
    }
  };

  const imprimirPreviewExistente = async () => {
    if (!preview.frente || !preview.reverso) {
      setEstado('Primero genera un preview');
      return;
    }

    setCargando(true);
    setEstado('Imprimiendo preview...');

    try {
      const response = await fetch(`${API_URL}/imprimir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frenteDataUrl: preview.frente,
          reversoDataUrl: preview.reverso,
          impresora: impresoraSeleccionada
        })
      });

      const data = await response.json();

      if (data.success) {
        setEstado(`✓ Impresión enviada (Job ID: ${data.jobID})`);
      } else {
        setEstado('Error: ' + (data.error || data.detalle));
      }
    } catch (error) {
      setEstado('Error: ' + error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Imprimir Credencial - {empleado.nom_trab}
      </h2>

      {/* Selección de impresora */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Impresora Zebra ZXP Series 3
        </label>
        <div className="flex gap-2">
          <select
            value={impresoraSeleccionada}
            onChange={(e) => setImpresoraSeleccionada(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={cargando}
          >
            {impresoras.length === 0 && (
              <option value="">No hay impresoras disponibles</option>
            )}
            {impresoras.map((imp, idx) => (
              <option key={idx} value={imp.nombre}>
                {imp.nombre} {imp.esPredeterminada ? '(Predeterminada)' : ''}
              </option>
            ))}
          </select>
          <button
            onClick={cargarImpresoras}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            disabled={cargando}
          >
            🔄 Recargar
          </button>
        </div>
      </div>

      {/* Información del empleado */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold mb-2 text-gray-700">Datos del empleado:</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <p><span className="font-medium">ID:</span> {empleado.id}</p>
          <p><span className="font-medium">Número:</span> {empleado.num_trab}</p>
          <p><span className="font-medium">Nombre:</span> {empleado.nom_trab}</p>
          <p><span className="font-medium">Puesto:</span> {empleado.puesto}</p>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={generarPreview}
          disabled={cargando}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {cargando ? '⏳ Generando...' : '👁️ Ver Preview'}
        </button>
        
        <button
          onClick={imprimirCredencial}
          disabled={cargando || !impresoraSeleccionada}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {cargando ? '⏳ Imprimiendo...' : '🖨️ Generar e Imprimir'}
        </button>

        {preview.frente && (
          <button
            onClick={imprimirPreviewExistente}
            disabled={cargando}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {cargando ? '⏳ Imprimiendo...' : '🔄 Reimprimir'}
          </button>
        )}
      </div>

      {/* Estado */}
      {estado && (
        <div className={`p-4 rounded-lg mb-6 ${
          estado.includes('Error') || estado.includes('No se') 
            ? 'bg-red-100 text-red-700 border border-red-300' 
            : estado.includes('✓')
            ? 'bg-green-100 text-green-700 border border-green-300'
            : 'bg-blue-100 text-blue-700 border border-blue-300'
        }`}>
          <p className="font-medium">{estado}</p>
        </div>
      )}

      {/* Preview de las credenciales */}
      {preview.frente && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Preview de la Credencial</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Frente</p>
              <img 
                src={preview.frente} 
                alt="Frente de credencial" 
                className="w-full border-2 border-gray-300 rounded-lg shadow-md"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Reverso</p>
              <img 
                src={preview.reverso} 
                alt="Reverso de credencial" 
                className="w-full border-2 border-gray-300 rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}