import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Empleado = sequelize.define(
  "Empleado",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    num_trab: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    rfc: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    nom_trab: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    num_imss: {
      type: DataTypes.STRING(150),
    },
    sexo: {
      type: DataTypes.ENUM("M", "F"),
    },
    fecha_ing: {
      type: DataTypes.DATE,
    },
    num_depto: {
      type: DataTypes.INTEGER,
    },
    nom_depto: {
      type: DataTypes.STRING(100),
    },
    categoria: {
      type: DataTypes.STRING(100),
    },
    puesto: {
      type: DataTypes.STRING(100),
    },
    sind: {
      type: DataTypes.BOOLEAN,
    },
    conf: {
      type: DataTypes.BOOLEAN,
    },
    nomina: {
      type: DataTypes.STRING(50),
    },
    vencimiento_contrato: {
      type: DataTypes.DATE,
    },
    qr_code: {
      type: DataTypes.STRING(255),
    },
    estado_qr: {
      type: DataTypes.ENUM("activo", "inactivo"),
      defaultValue: "activo",
    },
    qr_generated_at: {
      type: DataTypes.DATE,
    },
    foto_path: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "empleados",
    timestamps: false,
  }
);

export default Empleado;
