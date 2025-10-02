import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  process.env.DB_NAME || "credenciales",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "Battery..1",
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    dialect: "mysql",
    logging: false,
  }
);

export default sequelize;
