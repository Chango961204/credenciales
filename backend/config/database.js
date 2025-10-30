import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();
/* const sequelize = new Sequelize(
  process.env.DB_NAME ,
  process.env.DB_USER ,
  process.env.DB_PASSWORD ,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ,
    dialect: "mysql",
    logging: false,
  }
); */

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: false,
    
    // Configuración importante para producción
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    
    // Para Railway (no necesita SSL)
    dialectOptions: {},
    
    // Opcional: reconexión automática
    retry: {
      max: 3
    }
  }
);

// Verificar conexión al iniciar
sequelize.authenticate()
  .then(() => {
    console.log(' Conexión a la base de datos establecida correctamente');
  })
  .catch(err => {
    console.error(' No se pudo conectar a la base de datos:', err);
  });

export default sequelize;
