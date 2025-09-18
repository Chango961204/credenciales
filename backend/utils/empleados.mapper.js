const normalizeKeys = (obj) => {
  const normalizedObj = {};
  for (const [key, value] of Object.entries(obj)) {
    const normalizedKey = key.toLowerCase().replace(/\s+/g, '_');
    normalizedObj[normalizedKey] = value;
  }
  return normalizedObj;
};

export const mapRowToEmpleado = (row) => {
  const normalizedRow = normalizeKeys(row);
  
  console.log("=== DEBUG MAPPER ===");
  console.log("Claves normalizadas:", Object.keys(normalizedRow));
  console.log("Raw values:", Object.values(normalizedRow));
  
  // Debug específico para vencimiento
  console.log("Vencimiento debug:");
  console.log("vencimiento_de_contrato:", normalizedRow.vencimiento_de_contrato);
  console.log("Tipo:", typeof normalizedRow.vencimiento_de_contrato);
  console.log("Es null:", normalizedRow.vencimiento_de_contrato === null);
  console.log("Es undefined:", normalizedRow.vencimiento_de_contrato === undefined);
  console.log("Es string vacío:", normalizedRow.vencimiento_de_contrato === "");
  
  console.log("=== FIN DEBUG ===");

  // ANÁLISIS: Basado en tu debug, los datos están así:
  // nom_depto: 3700 <- Este debería ser num_depto
  // __empty representa la columna NUM_DEPTO que está vacía en el Excel
  
  return {
    num_trab: normalizedRow.num_trab || null,
    rfc: normalizedRow.rfc || null,
    nom_trab: normalizedRow.nom_trab || null,
    num_imss: normalizedRow.num_imss || null,
    sexo: normalizedRow.sexo || null,
    fecha_ing: normalizedRow.fecha_ing || null,
    
    // El valor que está en nom_depto (3700) es realmente el num_depto
    num_depto: normalizedRow.nom_depto || null,
    
    // __empty es donde debería estar nom_depto pero está vacío
    nom_depto: normalizedRow.__empty || null,
    
    categoria: normalizedRow.categoria || null,
    puesto: normalizedRow.puesto || null,
    sind: normalizedRow.sind || null,
    conf: normalizedRow.conf || null,
    nomina: normalizedRow.nomina || null,
    vencimiento_contrato: normalizedRow.vencimiento_de_contrato || null,
  };
};