const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'bvlq1iclre53b4deo5gk-mysql.services.clever-cloud.com',
  user: 'uye9n3g4zzjwlghy',
  password: 's9l6ETeWb9v2PMMKt8w4',
  database: 'bvlq1iclre53b4deo5gk'
});

db.connect(err => {
  if (err) throw err;
  console.log('✅ MySQL Connected');
});

module.exports = db;












