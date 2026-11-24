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
    const pool = new sql.ConnectionPool(config);
    const pending = pool.connect();
    poolPromise = pending;
    const invalidate = () => {
      if (poolPromise === pending) poolPromise = undefined;
    };
    pool.on("error", (err) => { console.error("SQL pool:", err.code); invalidate(); });
    pending.catch(invalidate);
  }
  return poolPromise;
}

async function runOnce(cauLenh, thamSo = []) {
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

async function run(cauLenh, thamSo = []) {
  // Never replay a write: its first attempt may already have committed.
  const readOnly = /^\s*SELECT\b/i.test(cauLenh) && !/;\s*\S/.test(cauLenh) && !/\b(INTO|INSERT|UPDATE|DELETE|EXEC|MERGE)\b/i.test(cauLenh);
  try { return await runOnce(cauLenh, thamSo); }
  catch (err) {
    const transient = ["ETIMEOUT","ESOCKET","ECONNCLOSED","ENOTOPEN","ECONNRESET"].includes(err.code) || [40613,40197,40501,10928,10929].includes(err.number) || [40613,40197,40501].includes(err.originalError?.info?.number);
    if (!transient || !readOnly) throw err;
    await new Promise(resolve => setTimeout(resolve, 3000));
    return runOnce(cauLenh, thamSo);
  }
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
