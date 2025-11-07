import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Auditoria = sequelize.define("Auditoria", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: true },
  username: { type: DataTypes.STRING(255), allowNull: true },
  userEmail: { type: DataTypes.STRING(255), allowNull: true },
  event: { type: DataTypes.STRING(255), allowNull: false }, // created|updated|deleted|login|logout|...
  model: { type: DataTypes.STRING(255), allowNull: false }, // 'User', 'Empleado', etc.
  modelId: { type: DataTypes.STRING(255), allowNull: true },
  oldValues: { type: DataTypes.JSON, allowNull: true },
  newValues: { type: DataTypes.JSON, allowNull: true },
  url: { type: DataTypes.STRING(255), allowNull: true },
  ip: { type: DataTypes.STRING(255), allowNull: true },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: "auditorias",
  timestamps: false, // usamos tu columna createdAt solamente
});

export default Auditoria;
