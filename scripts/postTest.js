(async () => {
  try {
    const res = await fetch('http://127.0.0.1:3000/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test', email: 'a@b.com', message: 'hello' })
    });

    const text = await res.text();
    console.log('STATUS:', res.status);
    console.log('BODY:\n', text);
  } catch (err) {
    console.error('POST ERROR:', err);
  }
})();
