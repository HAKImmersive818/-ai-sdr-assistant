import { AIEngine } from './src/core/ai-engine.js';

async function testAI() {
  console.log('🧪 Testing AI Integration...\n');
  
  const aiEngine = new AIEngine();
  await aiEngine.initialize();
  
  console.log('✅ AI Engine initialized successfully\n');
  
  const testProspect = {
    name: 'Sarah Johnson',
    title: 'VP of Sales',
    company: 'TechCorp Solutions',
    industry: 'SaaS',
    location: 'San Francisco, CA',
    recentActivity: 'Posted about scaling sales team challenges',
    painPoints: 'Struggling with manual prospecting and low conversion rates',
    buyingSignals: 'Recently raised Series B funding, hiring 5 new SDRs'
  };
  
  console.log('📝 Generating personalized outreach message for:');
  console.log(`   ${testProspect.name} - ${testProspect.title} at ${testProspect.company}\n`);
  
  try {
    const message = await aiEngine.generateOutreachMessage(testProspect);
    
    console.log('✅ AI Message Generation Successful!\n');
    console.log('=' .repeat(70));
    console.log('GENERATED MESSAGE:');
    console.log('=' .repeat(70));
    console.log(message);
    console.log('=' .repeat(70));
    console.log(`\nMessage length: ${message.length} characters`);
    console.log('\n🎉 AI is working perfectly! Claude 3.5 Sonnet is connected.\n');
    
  } catch (error) {
    console.error('❌ AI Test Failed:', error.message);
    console.error('\nFull error:', error);
  }
}

testAI();
