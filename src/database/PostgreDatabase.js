const { Pool } = require("pg");
require("dotenv").config();

const connectionString = process.env.POSTGRES_URL;

const poolConfig = {
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DATABASE,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  ssl: false,
};

const pool = new Pool(poolConfig);

pool.on("error", (err) => {
  console.error("Unexpected error on idle client:", err);
});

module.exports = { pool };
