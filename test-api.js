// Test script to check the API route
async function testApiRoute() {
  try {
    // This would be run in a browser environment to test the API
    const response = await fetch('/api/services?category=heavy_equipment&limit=12&offset=0');
    console.log('Status:', response.status);
    console.log('Headers:', [...response.headers.entries()]);
    
    const data = await response.json();
    console.log('Data:', data);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Call the test function
testApiRoute();