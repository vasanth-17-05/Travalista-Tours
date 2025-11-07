const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'bve10i1d1emv4kdevx5i-mysql.services.clever-cloud.com',
  user: 'u3ygzqnjqt9kttzx',
  password: 'bsAZ0E9nMFwYLmbZ9Owb',
  database: 'u3ygzqnjqt9kttzx'
});

db.connect(err => {
  if (err) throw err;
  console.log('✅ MySQL Connected');
});

module.exports = db;














