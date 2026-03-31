import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export class HubSpotIntegration {
  constructor() {
    this.apiKey = process.env.HUBSPOT_API_KEY;
    this.baseUrl = 'https://api.hubapi.com';
  }

  isConfigured() {
    return !!this.apiKey && this.apiKey !== 'your_hubspot_api_key_here';
  }

  async createContact(prospectData) {
    if (!this.isConfigured()) {
      console.log('HubSpot not configured, skipping contact creation');
      return null;
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/crm/v3/objects/contacts`,
        {
          properties: {
            firstname: prospectData.name.split(' ')[0],
            lastname: prospectData.name.split(' ').slice(1).join(' '),
            jobtitle: prospectData.title,
            company: prospectData.company,
            linkedin_url: prospectData.linkedinUrl,
            hs_lead_status: 'NEW'
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('HubSpot contact creation error:', error.response?.data || error.message);
      return null;
    }
  }

  async updateContactStage(contactId, stage) {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      const stageMap = {
        'initial_outreach': 'CONTACTED',
        'qualification': 'QUALIFIED',
        'discovery': 'PRESENTATION_SCHEDULED',
        'meeting_booking': 'DECISION_MAKER_BOUGHT_IN'
      };

      const response = await axios.patch(
        `${this.baseUrl}/crm/v3/objects/contacts/${contactId}`,
        {
          properties: {
            hs_lead_status: stageMap[stage] || 'IN_PROGRESS'
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('HubSpot update error:', error.response?.data || error.message);
      return null;
    }
  }

  async createDeal(prospectData, dealValue = 0) {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/crm/v3/objects/deals`,
        {
          properties: {
            dealname: `${prospectData.company} - ${prospectData.name}`,
            amount: dealValue,
            dealstage: 'appointmentscheduled',
            pipeline: 'default'
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('HubSpot deal creation error:', error.response?.data || error.message);
      return null;
    }
  }

  async logActivity(contactId, activityType, notes) {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/crm/v3/objects/notes`,
        {
          properties: {
            hs_note_body: notes,
            hs_timestamp: new Date().toISOString()
          },
          associations: [
            {
              to: { id: contactId },
              types: [
                {
                  associationCategory: 'HUBSPOT_DEFINED',
                  associationTypeId: 202
                }
              ]
            }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('HubSpot activity logging error:', error.response?.data || error.message);
      return null;
    }
  }
}
