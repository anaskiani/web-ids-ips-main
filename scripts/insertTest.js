const db = require('./database/initDb');

setTimeout(() => {
  db.query("INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)", ['TestInsert','insert@example.com','hello insert'], (err, res) => {
    console.log('--- insertTest.js output ---');
    if (err) {
      console.error('INSERT ERROR:', err);
    } else {
      console.log('INSERT SUCCESS:', res);
    }
    process.exit(0);
  });
}, 1000);
