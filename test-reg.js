const testReg = async () => {
  try {
    const r = await fetch('https://arogyamind-backend.onrender.com/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'test',
        email: 'test' + Date.now() + '@example.com',
        password: 'password123',
        roleName: 'Patient'
      })
    });
    const text = await r.text();
    console.log('Status:', r.status);
    console.log('Response:', text);
  } catch (e) {
    console.error(e);
  }
};
testReg();
