import fs from 'fs/promises';
import path from 'path';

export class ConversationManager {
  constructor() {
    this.conversationsPath = path.join(process.cwd(), 'data', 'conversations.json');
    this.conversations = new Map();
  }

  async initialize() {
    try {
      const data = await fs.readFile(this.conversationsPath, 'utf-8');
      const conversationsArray = JSON.parse(data);
      conversationsArray.forEach(conv => {
        this.conversations.set(conv.prospectId, conv);
      });
    } catch (error) {
      this.conversations = new Map();
    }
  }

  async saveConversations() {
    const conversationsArray = Array.from(this.conversations.values());
    await fs.mkdir(path.dirname(this.conversationsPath), { recursive: true });
    await fs.writeFile(
      this.conversationsPath,
      JSON.stringify(conversationsArray, null, 2)
    );
  }

  createConversation(prospectData) {
    const conversation = {
      prospectId: this.generateProspectId(prospectData),
      prospectName: prospectData.name,
      prospectTitle: prospectData.title,
      prospectCompany: prospectData.company,
      status: 'active',
      stage: 'initial_outreach',
      messages: [],
      qualificationData: null,
      meetingBooked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.conversations.set(conversation.prospectId, conversation);
    return conversation;
  }

  getConversation(prospectId) {
    return this.conversations.get(prospectId);
  }

  async addMessage(prospectId, sender, message, metadata = {}) {
    const conversation = this.conversations.get(prospectId);
    if (!conversation) {
      throw new Error(`Conversation not found for prospect: ${prospectId}`);
    }

    const messageObj = {
      id: this.generateMessageId(),
      sender,
      message,
      timestamp: new Date().toISOString(),
      metadata
    };

    conversation.messages.push(messageObj);
    conversation.updatedAt = new Date().toISOString();

    await this.saveConversations();
    return messageObj;
  }

  async updateConversationStage(prospectId, stage) {
    const conversation = this.conversations.get(prospectId);
    if (conversation) {
      conversation.stage = stage;
      conversation.updatedAt = new Date().toISOString();
      await this.saveConversations();
    }
  }

  async updateQualificationData(prospectId, qualificationData) {
    const conversation = this.conversations.get(prospectId);
    if (conversation) {
      conversation.qualificationData = qualificationData;
      conversation.updatedAt = new Date().toISOString();
      await this.saveConversations();
    }
  }

  async markMeetingBooked(prospectId, meetingDetails) {
    const conversation = this.conversations.get(prospectId);
    if (conversation) {
      conversation.meetingBooked = true;
      conversation.meetingDetails = meetingDetails;
      conversation.status = 'meeting_booked';
      conversation.updatedAt = new Date().toISOString();
      await this.saveConversations();
    }
  }

  async closeConversation(prospectId, reason) {
    const conversation = this.conversations.get(prospectId);
    if (conversation) {
      conversation.status = 'closed';
      conversation.closedReason = reason;
      conversation.closedAt = new Date().toISOString();
      await this.saveConversations();
    }
  }

  getActiveConversations() {
    return Array.from(this.conversations.values())
      .filter(conv => conv.status === 'active')
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  getMeetingsBooked() {
    return Array.from(this.conversations.values())
      .filter(conv => conv.meetingBooked)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  getConversationStats() {
    const all = Array.from(this.conversations.values());
    return {
      total: all.length,
      active: all.filter(c => c.status === 'active').length,
      meetingsBooked: all.filter(c => c.meetingBooked).length,
      closed: all.filter(c => c.status === 'closed').length,
      qualified: all.filter(c => c.qualificationData?.qualified).length
    };
  }

  generateProspectId(prospectData) {
    const name = prospectData.name.toLowerCase().replace(/\s+/g, '-');
    const company = prospectData.company.toLowerCase().replace(/\s+/g, '-');
    return `${name}-${company}-${Date.now()}`;
  }

  generateMessageId() {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
