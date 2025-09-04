import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Battery..1",
  database: "credenciales",
  port: 3306
});

export default pool;
