const fetch = require('node-fetch');

async function testRegister() {
  try {
    const response = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'gabo@gabo.com',
        password: '123456',
        firstName: 'Gabo',
        lastName: 'Test'
      })
    });

    const data = await response.json();
    console.log('Response:', data);
    console.log('Status:', response.status);
  } catch (error) {
    console.error('Error:', error);
  }
}

testRegister();
