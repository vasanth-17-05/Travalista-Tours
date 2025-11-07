const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'becc5ldbehpehggrrbna-mysql.services.clever-cloud.com',
  user: 'uvvmbgtg5bfvwuus',
  password: 'xgzpymvK7YwYU0wbSbRx',
  database: 'becc5ldbehpehggrrbna'
});

db.connect(err => {
  if (err) throw err;
  console.log('✅ MySQL Connected');
});

module.exports = db;
