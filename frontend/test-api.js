const { API_URL } = require('./app/_config');

console.log('🔍 Testing API connectivity...\n');
console.log('API URL:', API_URL);
console.log('Platform:', process.platform);
console.log('------------------------------------\n');

async function testEndpoints() {
  const endpoints = [
    '/api/heart-rate',
    '/api/oxygene-rate',
    '/api/heart-rate/weekly',
    '/api/oxygene-rate/weekly'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing: ${API_URL}${endpoint}`);
      const response = await fetch(`${API_URL}${endpoint}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ SUCCESS - Status: ${response.status}`);
        console.log(`   Data keys:`, Object.keys(data));
      } else {
        console.log(`❌ FAILED - Status: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ERROR:`, error.message);
    }
    console.log('');
  }
}

testEndpoints();
