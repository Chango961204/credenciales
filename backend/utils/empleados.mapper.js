const normalizeKeys = (obj) => {
  const normalizedObj = {};
  for (const [key, value] of Object.entries(obj)) {
    const normalizedKey = key
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_"); 
    normalizedObj[normalizedKey] = value;
  }
  return normalizedObj;
};

export const mapRowToEmpleado = (row) => {
  const normalizedRow = normalizeKeys(row);

  let numDepto = null;

  if (normalizedRow.num_depto !== undefined && normalizedRow.num_depto !== "") {
    numDepto = normalizedRow.num_depto;
  }
  else if (
    normalizedRow.nom_depto !== undefined &&
    normalizedRow.nom_depto !== "" &&
    (typeof normalizedRow.nom_depto === "number" ||
      /^[0-9]+$/.test(String(normalizedRow.nom_depto)))
  ) {
    numDepto = Number(normalizedRow.nom_depto);
  }

  let nomDepto = null;

  if (
    normalizedRow.nom_depto !== undefined &&
    normalizedRow.nom_depto !== "" &&
    !(
      typeof normalizedRow.nom_depto === "number" ||
      /^[0-9]+$/.test(String(normalizedRow.nom_depto))
    )
  ) {
    nomDepto = normalizedRow.nom_depto;
  }

  const emptyKeys = Object.keys(normalizedRow).filter((k) =>
    k.startsWith("__empty")
  );
  for (const k of emptyKeys) {
    const val = normalizedRow[k];
    if (val !== undefined && val !== null && val !== "") {
      nomDepto = val;
      break;
    }
  }

  return {
    num_trab: normalizedRow.num_trab ?? null,
    rfc: normalizedRow.rfc ?? null,
    nom_trab: normalizedRow.nom_trab ?? null,
    num_imss: normalizedRow.num_imss ?? null,
    sexo: normalizedRow.sexo ?? null,
    fecha_ing: normalizedRow.fecha_ing ?? null, // se parsea en el service

    num_depto: numDepto,
    nom_depto: nomDepto,

    categoria: normalizedRow.categoria ?? null,
    puesto: normalizedRow.puesto ?? null,

    sind:
      normalizedRow.sind === "" || normalizedRow.sind == null
        ? null
        : Number(normalizedRow.sind),
    conf:
      normalizedRow.conf === "" || normalizedRow.conf == null
        ? null
        : Number(normalizedRow.conf),

    nomina: normalizedRow.nomina ?? null,

    vencimiento_contrato:
      normalizedRow.vencimiento_de_contrato ?? null,
  };
};
