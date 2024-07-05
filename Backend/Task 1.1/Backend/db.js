var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "foo",
  password: "bar"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

