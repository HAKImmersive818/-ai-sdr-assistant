import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

console.log('Testing available Claude models...\n');

const modelsToTest = [
  'claude-3-5-sonnet-20241022',
  'claude-3-5-sonnet-20240620',
  'claude-3-sonnet-20240229',
  'claude-3-opus-20240229',
  'claude-3-haiku-20240307'
];

for (const model of modelsToTest) {
  try {
    console.log(`Testing: ${model}...`);
    const response = await client.messages.create({
      model: model,
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Hi' }]
    });
    console.log(`✅ ${model} - WORKS!\n`);
    break;
  } catch (error) {
    console.log(`❌ ${model} - ${error.status} ${error.error?.error?.message || error.message}\n`);
  }
}
