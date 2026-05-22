fetch('https://arogyamind-backend.onrender.com/api/appointments/69e8a12d7dfa838c56cb6b0d')
  .then(res => res.json())
  .then(data => console.log('API Result:', JSON.stringify(data, null, 2)))
  .catch(err => console.error('API Error:', err.message));
