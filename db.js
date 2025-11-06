const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'b3dgny3zcis2o17qqrbt-mysql.services.clever-cloud.com',
  user: 'root',
  password: 'Vasanth@05!!',
  database: 'tb'
});

db.connect(err => {
  if (err) throw err;
  console.log('✅ MySQL Connected');
});

module.exports = db;

