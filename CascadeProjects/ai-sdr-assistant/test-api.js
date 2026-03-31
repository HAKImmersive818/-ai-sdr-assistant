import fetch from 'node-fetch';

async function testAPI() {
  console.log('🧪 Testing Web API Integration...\n');
  
  const testProspect = {
    name: 'Michael Chen',
    title: 'Director of Marketing',
    company: 'GrowthLabs Inc',
    industry: 'Technology',
    location: 'New York, NY',
    recentActivity: 'Posted about improving lead quality',
    painPoints: 'Low conversion rates on marketing campaigns',
    buyingSignals: 'Expanding marketing team'
  };
  
  try {
    console.log('📡 Calling /api/message/generate endpoint...\n');
    
    const response = await fetch('http://localhost:3001/api/message/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testProspect)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const data = await response.json();
    
    console.log('✅ API Response Successful!\n');
    console.log('=' .repeat(70));
    console.log('GENERATED MESSAGE FROM API:');
    console.log('=' .repeat(70));
    console.log(data.message);
    console.log('=' .repeat(70));
    console.log(`\nMessage length: ${data.message.length} characters`);
    console.log('\n🎉 Web Dashboard is fully connected to AI!\n');
    console.log('✅ The system is ready to use at http://localhost:3001\n');
    
  } catch (error) {
    console.error('❌ API Test Failed:', error.message);
  }
}

testAPI();
