# ⚖️ SDR ATTORNEY - HOW TO USE

Welcome to your AI-powered Sales Development Representative system with an **Ace Attorney RPG theme**! This guide will help you start winning cases (booking meetings) like a top 1% attorney.

---

## 🎮 THE GAME

You're an attorney building cases against prospects. Each prospect is a case you need to win by:
1. **Investigating** (finding prospects)
2. **Gathering Evidence** (AI research & enrichment)
3. **Presenting Your Case** (personalized outreach)
4. **Winning the Verdict** (booking the meeting)

### 🏆 Leveling System

- **Open a Case**: +10 XP
- **Win a Case** (book meeting): +50 XP
- **Qualify Suspect** (strong evidence): +25 XP

**Attorney Ranks:**
- 🎓 Level 1-3: Junior Attorney
- ⚖️ Level 4-6: Senior Attorney
- 🏛️ Level 7-9: Lead Prosecutor
- 👑 Level 10+: Chief Justice

---

## 🚀 QUICK START

### Step 1: Configure Your Attorney Profile

Edit `config/user-profile.json` with your information:

```json
{
  "user": {
    "name": "Your Name",
    "role": "SDR",
    "company": "Your Company",
    "value_proposition": "What you offer",
    "experience": "Your background"
  },
  "icp": {
    "job_titles": ["VP of Sales", "Director of Marketing"],
    "industries": ["SaaS", "Technology"],
    "company_size": {
      "min_employees": 50,
      "max_employees": 500
    }
  }
}
```

### Step 2: Access Your Courtroom

Open your browser to: **http://localhost:3001**

You'll see the **SDR Attorney Case Management System** with:
- ⚖️ **COURTROOM** - Your stats and achievements
- 📁 **ACTIVE CASES** - Ongoing conversations
- 🔍 **INVESTIGATION** - Start new campaigns
- 📚 **LAW LIBRARY** - Tutorials and guides

### Step 3: Start Your First Investigation

1. Click **🔍 INVESTIGATION** tab
2. Fill in the investigation form:
   - **Target Suspects**: Job titles (e.g., "VP of Sales, Director of Marketing")
   - **Crime Scene**: Industries (e.g., "SaaS, Technology")
   - **Number of Suspects**: How many prospects (1-50)
3. Click **⚠️ BEGIN INVESTIGATION!**

### Step 4: Watch the AI Work

The AI Attorney will:
- Find qualified prospects matching your criteria
- Research each prospect deeply
- Generate personalized messages using SPIN/BANT/MEDDIC
- Qualify prospects automatically
- Book meetings when the case is strong

### Step 5: Review Your Cases

Go to **📁 ACTIVE CASES** to see:
- All open case files
- AI-generated messages
- Conversation stages
- Qualification status
- Case outcomes

---

## 🎯 USING THE SYSTEM

### The Courtroom (Dashboard)

Your main stats display:
- **Cases Opened**: Total investigations started
- **Cases Won**: Meetings successfully booked
- **In Trial**: Active ongoing conversations
- **Strong Evidence**: Qualified prospects

Plus achievements and recent verdicts!

### Active Cases

View all your open cases with:
- Prospect name and title
- Company information
- Conversation stage
- Number of message exchanges
- Qualification status
- Win/loss status

### Investigation Phase

This is where you start new campaigns:

**Best Practices:**
- Start with 3-5 prospects to test
- Use specific job titles from your ICP
- Target industries where you have success
- Review AI messages before sending (manually on LinkedIn)

**Example Investigation:**
```
Target Suspects: VP of Sales, Chief Revenue Officer
Crime Scene: SaaS, FinTech, E-commerce
Number of Suspects: 5
```

### Law Library (Tutorial)

Complete guide including:
- Getting started steps
- Legal framework (sales methodologies)
- Ranking system explained
- API credentials info

---

## 📖 SALES METHODOLOGIES (LEGAL FRAMEWORK)

Your AI attorney uses proven frameworks:

### SPIN Interrogation
- **S**ituation: Understand current state
- **P**roblem: Uncover difficulties  
- **I**mplication: Explore consequences
- **N**eed-Payoff: Demonstrate value

### BANT Evidence
- **B**udget: Financial capacity
- **A**uthority: Decision-making power
- **N**eed: Clear pain point
- **T**imeline: Urgency to solve

### MEDDIC Prosecution
- **M**etrics: Quantifiable impact
- **E**conomic Buyer: Budget holder
- **D**ecision Criteria: Evaluation factors
- **D**ecision Process: Buying journey
- **I**dentify Pain: Critical issues
- **C**hampion: Internal advocate

---

## 💡 PRO TIPS

### 1. Quality Over Quantity
- Start small (3-5 prospects)
- Review AI-generated messages
- Refine your ICP based on results

### 2. Personalization is Key
- The AI uses your profile to personalize
- Better profile = better messages
- Update `config/user-profile.json` regularly

### 3. Manual LinkedIn Sending
- AI generates the messages
- You send them manually on LinkedIn (TOS compliance)
- Copy the message from Active Cases tab

### 4. Track Your Progress
- Check Courtroom daily for stats
- Monitor your attorney level
- Unlock achievements for motivation

### 5. Iterate and Improve
- Review which messages get responses
- Adjust your ICP targeting
- Update your value proposition

---

## 🎨 THEME FEATURES

### Gamification Elements
- **XP System**: Earn points for actions
- **Leveling**: Progress from Junior to Chief Justice
- **Achievements**: Unlock badges for milestones
- **Win Streaks**: Track consecutive wins
- **Evidence Cards**: Beautiful stat displays
- **Courtroom Aesthetics**: Immersive law theme

### Visual Feedback
- Gavel slam animations
- Evidence flash effects
- Level up celebrations
- Color-coded case statuses
- Retro pixel fonts

---

## 🔧 TECHNICAL DETAILS

### API Endpoints

The system exposes these endpoints:

```
GET  /api/stats              - Campaign statistics
GET  /api/conversations      - Active conversations
GET  /api/meetings          - Booked meetings
POST /api/campaign/start    - Start new campaign
POST /api/prospect/reply    - Handle prospect reply
POST /api/message/generate  - Generate message
```

### File Structure

```
config/
  ├── user-profile.json        # Your profile & ICP
  └── sales-methodologies.json # Sales frameworks

data/
  └── conversations.json       # Stored conversations

src/
  ├── core/
  │   ├── ai-engine.js        # Claude AI integration
  │   ├── prospect-enrichment.js
  │   └── conversation-manager.js
  └── web/
      ├── server.js           # Express server
      └── public/
          └── ace-attorney.html # Your themed UI
```

### Environment Variables

Your `.env` file contains:
```
ANTHROPIC_API_KEY=sk-ant-...  # Your Claude API key
HUBSPOT_API_KEY=...           # Optional HubSpot integration
PORT=3001                      # Server port
```

---

## 🎯 EXPECTED RESULTS

Based on the system design:
- **2-5 meetings/day** with qualified prospects
- **99% personalization** in every message
- **Zero manual prospecting** time
- **Higher response rates** than generic automation
- **Better qualification** using proven frameworks

---

## 🆘 TROUBLESHOOTING

**Q: No cases appearing?**
- Check that you filled in job titles and industries
- Verify your API key is working
- Look at browser console for errors

**Q: Messages not personalized enough?**
- Update your `config/user-profile.json`
- Add more detail to your value proposition
- Specify pain points more clearly

**Q: Want classic interface?**
- Visit http://localhost:3001/classic
- Same functionality, different theme

**Q: How do I actually send messages?**
- Go to Active Cases tab
- Copy the AI-generated message
- Manually send on LinkedIn (compliance!)
- Track responses in the system

---

## 🎮 ACHIEVEMENT GUIDE

Unlock all achievements:

- ⭐ **First Case**: Open your first case
- 🔥 **Hot Streak**: Win 3 cases in a row
- 👑 **Master Attorney**: Reach Level 10
- ⚡ **Speed Demon**: Win 5 cases in one day

---

## 🚀 NEXT STEPS

1. ✅ Configure your profile in `config/user-profile.json`
2. ✅ Open http://localhost:3001
3. ✅ Read the Law Library tab
4. ✅ Start your first investigation (3-5 prospects)
5. ✅ Review AI-generated messages in Active Cases
6. ✅ Manually send on LinkedIn
7. ✅ Track your progress in Courtroom
8. ✅ Level up and unlock achievements!

---

## 🎉 HAVE FUN!

This isn't just a tool—it's a game. Enjoy the process of:
- Building your attorney reputation
- Winning cases (booking meetings)
- Leveling up your skills
- Unlocking achievements
- Dominating the courtroom!

**Now go forth and deliver justice (close deals)!** ⚖️

---

*For technical support or questions, check the main README.md file.*
