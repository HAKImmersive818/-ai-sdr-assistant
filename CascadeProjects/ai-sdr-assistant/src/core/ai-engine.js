import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

export class AIEngine {
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    this.userProfile = null;
    this.salesMethodologies = null;
  }

  async initialize() {
    const userProfilePath = path.join(process.cwd(), 'config', 'user-profile.json');
    const methodologiesPath = path.join(process.cwd(), 'config', 'sales-methodologies.json');
    
    this.userProfile = JSON.parse(await fs.readFile(userProfilePath, 'utf-8'));
    this.salesMethodologies = JSON.parse(await fs.readFile(methodologiesPath, 'utf-8'));
  }

  buildSystemPrompt(context = {}) {
    const { stage = 'initial_outreach', prospectData = {} } = context;
    
    return `You are an elite SDR (Sales Development Representative) AI assistant with deep expertise in B2B sales. Your role is to handle LinkedIn outreach with the precision and effectiveness of a top 1% sales professional.

# YOUR IDENTITY
Name: ${this.userProfile.user.name}
Role: ${this.userProfile.user.role}
Company: ${this.userProfile.user.company}
Industry: ${this.userProfile.user.industry}
Value Proposition: ${this.userProfile.user.value_proposition}
Background: ${this.userProfile.user.experience}

# IDEAL CUSTOMER PROFILE (ICP)
Target Job Titles: ${this.userProfile.icp.job_titles.join(', ')}
Target Industries: ${this.userProfile.icp.industries.join(', ')}
Company Size: ${this.userProfile.icp.company_size.min_employees}-${this.userProfile.icp.company_size.max_employees} employees
Geography: ${this.userProfile.icp.geography.join(', ')}

Key Pain Points to Address:
${this.userProfile.icp.pain_points.map(p => `- ${p}`).join('\n')}

Buying Signals to Look For:
${this.userProfile.icp.buying_signals.map(s => `- ${s}`).join('\n')}

# SALES METHODOLOGIES
You are trained in these proven sales frameworks:

## SPIN Selling
${JSON.stringify(this.salesMethodologies.SPIN.framework, null, 2)}

## BANT Qualification
${JSON.stringify(this.salesMethodologies.BANT.framework, null, 2)}

## MEDDIC Process
${JSON.stringify(this.salesMethodologies.MEDDIC.framework, null, 2)}

# CURRENT CONVERSATION STAGE: ${stage}
${this.salesMethodologies.conversation_stages[stage] ? `
Goal: ${this.salesMethodologies.conversation_stages[stage].goal}
Approach: ${this.salesMethodologies.conversation_stages[stage].approach}
Methodology: ${this.salesMethodologies.conversation_stages[stage].methodology}
` : ''}

# MESSAGING GUIDELINES
- Tone: ${this.userProfile.messaging.tone}
- Max Length: ${this.userProfile.messaging.max_message_length} characters
- Personalization: ${this.userProfile.messaging.personalization_depth}
- Use Emojis: ${this.userProfile.messaging.include_emojis}

# CORE PRINCIPLES
1. ALWAYS personalize based on prospect research
2. Lead with value, not features
3. Ask questions that uncover pain points
4. Keep messages concise and conversational
5. Focus on booking qualified meetings only
6. Never be pushy or salesy
7. Build genuine relationships
8. Qualify prospects using BANT before pushing for meetings
9. Use social proof when relevant
10. Always include a clear, low-friction call-to-action

# RESPONSE FORMAT
When generating outreach messages or responses:
- Be human and authentic
- Reference specific details about the prospect
- Connect their situation to your value proposition
- Use appropriate sales methodology for the stage
- End with a clear next step

Remember: Your goal is to book meetings with qualified prospects who genuinely need what you offer. Quality over quantity.`;
  }

  async generateOutreachMessage(prospectData) {
    await this.ensureInitialized();

    const systemPrompt = this.buildSystemPrompt({
      stage: 'initial_outreach',
      prospectData
    });

    const userPrompt = `Generate a personalized LinkedIn connection request or initial outreach message for this prospect:

PROSPECT INFORMATION:
Name: ${prospectData.name || 'Unknown'}
Title: ${prospectData.title || 'Unknown'}
Company: ${prospectData.company || 'Unknown'}
Industry: ${prospectData.industry || 'Unknown'}
Location: ${prospectData.location || 'Unknown'}

RESEARCH INSIGHTS:
${prospectData.recentActivity ? `Recent Activity: ${prospectData.recentActivity}` : ''}
${prospectData.commonalities ? `Commonalities: ${prospectData.commonalities}` : ''}
${prospectData.painPoints ? `Identified Pain Points: ${prospectData.painPoints}` : ''}
${prospectData.buyingSignals ? `Buying Signals: ${prospectData.buyingSignals}` : ''}

Generate a highly personalized initial outreach message that:
1. References specific details about them or their company
2. Demonstrates you've done your research
3. Hints at value without being salesy
4. Includes a soft call-to-action
5. Stays under ${this.userProfile.messaging.max_message_length} characters

Return ONLY the message text, no explanations or metadata.`;

    const response = await this.client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ],
      system: systemPrompt
    });

    return response.content[0].text.trim();
  }

  async handleConversation(conversationHistory, prospectData, latestMessage) {
    await this.ensureInitialized();

    const stage = this.determineConversationStage(conversationHistory);
    const systemPrompt = this.buildSystemPrompt({
      stage,
      prospectData
    });

    const conversationContext = conversationHistory.map(msg => 
      `${msg.sender === 'prospect' ? prospectData.name : 'You'}: ${msg.message}`
    ).join('\n\n');

    const userPrompt = `CONVERSATION HISTORY:
${conversationContext}

LATEST MESSAGE FROM PROSPECT:
${latestMessage}

PROSPECT CONTEXT:
Name: ${prospectData.name}
Title: ${prospectData.title}
Company: ${prospectData.company}
Qualification Status: ${prospectData.qualificationStatus || 'Not yet qualified'}

Based on the conversation history and latest message:
1. Determine if this prospect is qualified (use BANT framework)
2. Decide the best response strategy
3. If qualified and showing interest, work towards booking a meeting
4. If not qualified, politely disengage or nurture for future
5. Use appropriate sales methodology questions for the current stage

Generate your response. Keep it natural, conversational, and focused on moving the conversation forward appropriately.

Return ONLY the response message, no explanations.`;

    const response = await this.client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ],
      system: systemPrompt
    });

    return {
      message: response.content[0].text.trim(),
      stage,
      shouldBookMeeting: this.shouldAttemptBooking(response.content[0].text, conversationHistory)
    };
  }

  determineConversationStage(conversationHistory) {
    if (!conversationHistory || conversationHistory.length === 0) {
      return 'initial_outreach';
    }
    
    if (conversationHistory.length <= 2) {
      return 'qualification';
    }
    
    if (conversationHistory.length <= 5) {
      return 'discovery';
    }
    
    return 'meeting_booking';
  }

  shouldAttemptBooking(message, conversationHistory) {
    const bookingKeywords = ['meeting', 'call', 'chat', 'discuss', 'calendar', 'schedule', 'time'];
    const messageLower = message.toLowerCase();
    
    return bookingKeywords.some(keyword => messageLower.includes(keyword)) && 
           conversationHistory.length >= 2;
  }

  async qualifyProspect(prospectData, conversationHistory) {
    await this.ensureInitialized();

    const conversationContext = conversationHistory.map(msg => 
      `${msg.sender}: ${msg.message}`
    ).join('\n\n');

    const userPrompt = `Analyze this prospect and conversation using the BANT qualification framework:

PROSPECT:
Name: ${prospectData.name}
Title: ${prospectData.title}
Company: ${prospectData.company}
Industry: ${prospectData.industry}

CONVERSATION:
${conversationContext}

Evaluate this prospect on BANT criteria:
- Budget: Do they have budget or authority over budget?
- Authority: Are they a decision-maker or influencer?
- Need: Do they have a clear need for our solution?
- Timeline: Is there urgency or a clear timeline?

Return a JSON object with this structure:
{
  "qualified": true/false,
  "score": 0-100,
  "bant": {
    "budget": "high/medium/low/unknown",
    "authority": "high/medium/low/unknown",
    "need": "high/medium/low/unknown",
    "timeline": "high/medium/low/unknown"
  },
  "reasoning": "Brief explanation",
  "nextSteps": "Recommended next steps"
}`;

    const response = await this.client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ]
    });

    try {
      return JSON.parse(response.content[0].text.trim());
    } catch (e) {
      return {
        qualified: false,
        score: 0,
        reasoning: 'Unable to parse qualification response',
        nextSteps: 'Continue conversation to gather more information'
      };
    }
  }

  async ensureInitialized() {
    if (!this.userProfile || !this.salesMethodologies) {
      await this.initialize();
    }
  }
}
