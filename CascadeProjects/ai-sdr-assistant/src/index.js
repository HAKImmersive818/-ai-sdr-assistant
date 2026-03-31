import { AIEngine } from './core/ai-engine.js';
import { ProspectEnrichment } from './core/prospect-enrichment.js';
import { ConversationManager } from './core/conversation-manager.js';
import { HubSpotIntegration } from './integrations/hubspot.js';
import fs from 'fs/promises';
import path from 'path';

class AISDRAssistant {
  constructor() {
    this.aiEngine = new AIEngine();
    this.enrichment = new ProspectEnrichment();
    this.conversationManager = new ConversationManager();
    this.hubspot = new HubSpotIntegration();
  }

  async initialize() {
    console.log('🚀 Initializing AI SDR Assistant...\n');
    
    await this.aiEngine.initialize();
    await this.conversationManager.initialize();
    
    console.log('✅ AI Engine initialized');
    console.log('✅ Conversation Manager initialized');
    console.log(`✅ HubSpot integration ${this.hubspot.isConfigured() ? 'configured' : 'not configured'}\n`);
  }

  async findAndEnrichProspects(searchCriteria) {
    console.log('🔍 Searching for prospects...\n');
    
    const prospects = await this.enrichment.searchLinkedInProspects(searchCriteria);
    console.log(`Found ${prospects.length} prospects matching criteria\n`);

    const enrichedProspects = [];
    for (const prospect of prospects) {
      console.log(`📊 Enriching: ${prospect.name} - ${prospect.title} at ${prospect.company}`);
      const enriched = await this.enrichment.enrichProspect(prospect);
      enrichedProspects.push(enriched);
    }

    return enrichedProspects;
  }

  async initiateOutreach(prospect) {
    console.log(`\n📨 Initiating outreach to ${prospect.name}...\n`);

    const message = await this.aiEngine.generateOutreachMessage(prospect);
    
    const conversation = this.conversationManager.createConversation(prospect);
    await this.conversationManager.addMessage(
      conversation.prospectId,
      'sdr',
      message,
      { type: 'initial_outreach' }
    );

    if (this.hubspot.isConfigured()) {
      await this.hubspot.createContact(prospect);
    }

    console.log(`✉️  Message generated:\n${'-'.repeat(60)}\n${message}\n${'-'.repeat(60)}\n`);

    return {
      prospectId: conversation.prospectId,
      message,
      conversation
    };
  }

  async handleProspectReply(prospectId, replyMessage) {
    console.log(`\n💬 Handling reply from prospect...\n`);

    const conversation = this.conversationManager.getConversation(prospectId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    await this.conversationManager.addMessage(
      prospectId,
      'prospect',
      replyMessage
    );

    const prospectData = {
      name: conversation.prospectName,
      title: conversation.prospectTitle,
      company: conversation.prospectCompany
    };

    const response = await this.aiEngine.handleConversation(
      conversation.messages,
      prospectData,
      replyMessage
    );

    await this.conversationManager.addMessage(
      prospectId,
      'sdr',
      response.message,
      { stage: response.stage }
    );

    await this.conversationManager.updateConversationStage(prospectId, response.stage);

    if (conversation.messages.length >= 2 && !conversation.qualificationData) {
      const qualification = await this.aiEngine.qualifyProspect(
        prospectData,
        conversation.messages
      );
      await this.conversationManager.updateQualificationData(prospectId, qualification);
      
      console.log(`\n📋 Qualification Score: ${qualification.score}/100`);
      console.log(`   Qualified: ${qualification.qualified ? '✅' : '❌'}`);
      console.log(`   Reasoning: ${qualification.reasoning}\n`);
    }

    if (response.shouldBookMeeting && conversation.qualificationData?.qualified) {
      console.log('🎯 Attempting to book meeting with qualified prospect...\n');
    }

    console.log(`🤖 AI Response:\n${'-'.repeat(60)}\n${response.message}\n${'-'.repeat(60)}\n`);

    return response;
  }

  async runAutomatedCampaign(config = {}) {
    console.log('\n🎯 Starting Automated Outreach Campaign\n');
    console.log('='.repeat(60));

    const userProfile = JSON.parse(
      await fs.readFile(path.join(process.cwd(), 'config', 'user-profile.json'), 'utf-8')
    );

    const searchCriteria = {
      jobTitles: config.jobTitles || userProfile.icp.job_titles,
      industries: config.industries || userProfile.icp.industries,
      limit: config.limit || 5
    };

    const prospects = await this.findAndEnrichProspects(searchCriteria);

    const results = [];
    for (const prospect of prospects) {
      const result = await this.initiateOutreach(prospect);
      results.push(result);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\n📊 Campaign Summary');
    console.log('='.repeat(60));
    console.log(`Total prospects contacted: ${results.length}`);
    console.log(`Messages sent: ${results.length}`);
    
    const stats = this.conversationManager.getConversationStats();
    console.log(`\n📈 Overall Stats:`);
    console.log(`   Active conversations: ${stats.active}`);
    console.log(`   Meetings booked: ${stats.meetingsBooked}`);
    console.log(`   Qualified prospects: ${stats.qualified}`);
    console.log('='.repeat(60) + '\n');

    return results;
  }

  async getStats() {
    return this.conversationManager.getConversationStats();
  }

  async getActiveConversations() {
    return this.conversationManager.getActiveConversations();
  }

  async getMeetingsBooked() {
    return this.conversationManager.getMeetingsBooked();
  }
}

async function demo() {
  const assistant = new AISDRAssistant();
  await assistant.initialize();

  console.log('🎬 Running Demo Campaign...\n');
  
  await assistant.runAutomatedCampaign({
    limit: 3
  });

  console.log('\n✨ Demo complete! The AI SDR Assistant is ready to use.\n');
  console.log('Next steps:');
  console.log('1. Update config/user-profile.json with your information');
  console.log('2. Add your ANTHROPIC_API_KEY to .env file');
  console.log('3. Run the web interface: npm run web');
  console.log('4. Or use the API programmatically\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  demo().catch(console.error);
}

export { AISDRAssistant };
