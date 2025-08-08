# Inkridge - Creative Workflow Companion

A powerful AI-assisted content creation app designed for non-technical leaders documenting their AI journey. Transform story seeds into compelling Substack posts through guided co-writing.

![Inkridge Dashboard](https://via.placeholder.com/800x400/6366f1/ffffff?text=Inkridge+Dashboard)

## 🚀 Features

### 📝 Multi-Modal Seed Capture
- **Text Notes** - Quick idea capture
- **Voice Memos** - Speech-to-text transcription
- **Photo Upload** - Visual inspiration capture
- **Screenshot Tool** - Capture data insights

### 🤖 AI Co-Writer
- **Smart Title Generation** - 3 compelling options per seed
- **Pillar-Specific Q&A** - Tailored questions for each content type
- **Engagement Prediction** - AI scoring for post potential
- **Draft Generation** - Complete 500-800 word posts
- **Export Ready** - Markdown download for Substack

### 📊 Content Strategy
- **Weekly Flow Management** - Structured publishing rhythm
- **Evergreen Backup System** - Always-ready content reserve
- **Voice Consistency** - Maintains your authentic style
- **Performance Tracking** - Focus on meaningful engagement

## 🛠 Tech Stack

- **React 18** - Modern UI framework
- **Tailwind CSS** - Responsive styling
- **Lucide React** - Beautiful icons
- **localStorage** - Client-side persistence
- **Speech Recognition API** - Voice capture
- **File API** - Image handling

## 📦 Quick Start

### Option 1: Replit (Recommended)
1. **Import from GitHub** in Replit
2. Replit auto-detects React and installs dependencies
3. Click **Run** - app starts immediately!

### Option 2: Local Development
```bash
# Clone the repository
git clone https://github.com/yourusername/inkridge-app.git

# Navigate to project
cd inkridge-app

# Install dependencies
npm install

# Start development server
npm start

# Open http://localhost:3000
```

## 🎯 Usage Guide

### 1. Capture Story Seeds
- Use **Dashboard** to see your weekly flow
- Click **Capture Seeds** to add new ideas
- Try **Voice Memo** for hands-free capture
- Upload **photos** that sparked insights

### 2. AI Co-Writing Process
- Select a seed in **Co-Writer**
- Choose from 3 AI-generated titles
- Answer 5 pillar-specific questions
- Get a complete draft with engagement scoring
- Export as Markdown for Substack

### 3. Content Pillars
- **Build Log** - Technical project experiences  
- **Leadership Lens** - Management insights from AI work
- **Meta-Skill** - Universal skills developed through AI
- **Field Note** - Observations and patterns

## 🔧 Customization

### Adding Your Voice Profile
Edit the `voiceProfile` object in `App.js` to match your writing style:

```javascript
const voiceProfile = {
  avgSentenceLength: 18,
  preferredWords: ["honestly", "realized", "turned out"],
  avoidWords: ["synergy", "leverage", "deep dive"],
  vulnerabilityLevel: "high"
};
```

### Integrating Real AI APIs
Replace mock functions with actual API calls:

```javascript
// Replace mockAICall with your preferred AI service
const callGeminiAPI = async (prompt) => {
  // Your Gemini 1.5 Flash integration here
};
```

## 📁 Project Structure

```
inkridge-app/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── App.js           # Main React component
│   ├── index.js         # React entry point
│   ├── index.css        # Global styles
│   └── components/      # Future component organization
├── package.json         # Dependencies
├── tailwind.config.js   # Tailwind configuration
└── README.md           # This file
```

## 🎨 Design Philosophy

**"Build logs for the soul"** - Inkridge helps you share the messy middle of your AI journey with:

- ✅ **Authentic vulnerability** over polished perfection
- ✅ **Applicable insights** over technical tutorials  
- ✅ **Leadership lessons** over implementation details
- ✅ **Weekly rhythm** over sporadic posting
- ✅ **Engagement depth** over vanity metrics

## 🔮 Roadmap

### Phase 1: Core Experience ✅
- [x] Multi-modal seed capture
- [x] AI co-writer flow
- [x] Local persistence
- [x] Responsive design

### Phase 2: AI Integration 🔄
- [ ] Real Gemini API integration
- [ ] Voice learning from published posts
- [ ] Advanced engagement prediction
- [ ] Content strategy recommendations

### Phase 3: Publishing Pipeline 📋
- [ ] Direct Substack publishing
- [ ] Social media snippet generation
- [ ] Email formatting
- [ ] Performance analytics

### Phase 4: Community Features 🌐
- [ ] Reader feedback import
- [ ] Collaboration tools
- [ ] Content calendars
- [ ] A/B testing

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for non-technical leaders navigating AI transformation
- Inspired by the authentic sharing culture of build-in-public
- Designed to support weekly content creation rhythms
- Optimized for Substack newsletter workflows

---

**Ready to transform your AI journey into compelling content?** 🚀

[Try Inkridge Now](https://replit.com/@yourusername/inkridge-app) | [Report Issues](https://github.com/yourusername/inkridge-app/issues) | [Request Features](https://github.com/yourusername/inkridge-app/discussions)