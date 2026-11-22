const sql = require("mssql");
require("dotenv").config();

const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: true,
    trustServerCertificate: false,
  },
  connectionTimeout: 30000,
  requestTimeout: 30000,
};

let poolPromise;

function getPool() {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(config).connect().catch((err) => {
      poolPromise = undefined;
      throw err;
    });
  }

  return poolPromise;
}

async function run(cauLenh, thamSo = []) {
  const pool = await getPool();
  const request = pool.request();

  let i = 0;

  const query = cauLenh.replace(/\?/g, () => {
    const name = `p${i}`;

    request.input(name, thamSo[i] === undefined ? null : thamSo[i]);

    i++;
    return `@${name}`;
  });

  if (i !== thamSo.length) {
    throw new Error("So luong tham so SQL khong khop");
  }

  const result = await request.query(query);

  return result.recordset || [];
}

function truyVan(cauLenh, callback) {
  run(cauLenh)
    .then((rows) => callback(null, rows))
    .catch((err) => callback(err));
}

function truyVanThamSo(cauLenh, thamSo, callback) {
  run(cauLenh, thamSo)
    .then((rows) => callback(null, rows))
    .catch((err) => callback(err));
}

function ketNoiSQL() {
  truyVan("SELECT DB_NAME() AS TenCSDL", (err, rows) => {
    if (err) {
      console.error("Ket noi Azure SQL that bai:", err.message);
    } else {
      console.log("Ket noi Azure SQL thanh cong!");
      console.log("Co so du lieu:", rows[0].TenCSDL);
    }
  });
}

module.exports = {
  truyVan,
  truyVanThamSo,
  ketNoiSQL,
};
