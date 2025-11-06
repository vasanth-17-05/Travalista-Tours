const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'b3dgny3zcis2o17qqrbt-mysql.services.clever-cloud.com',
  user: 'ufihfaaq1rgiagxr',
  password: 'xxCmYdWEmsDsH2L809ec',
  database: 'tb'
});

db.connect(err => {
  if (err) throw err;
  console.log('✅ MySQL Connected');
});

module.exports = db;



