// src/App.js - Copy this EXACT file to your GitHub repo

import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  Lightbulb, 
  Calendar, 
  BookOpen, 
  MessageCircle, 
  Camera, 
  Mic, 
  FileText,
  Sparkles,
  Archive,
  Clock,
  Target,
  ChevronRight,
  Save,
  X,
  ArrowRight,
  RefreshCw,
  Download,
  Zap
} from 'lucide-react';

const InkridgeApp = () => {
  // localStorage wrapper for persistence
  const storage = {
    save: (key, data) => localStorage.setItem(`inkridge_${key}`, JSON.stringify(data)),
    load: (key, defaultValue = []) => {
      try {
        const saved = localStorage.getItem(`inkridge_${key}`);
        return saved ? JSON.parse(saved) : defaultValue;
      } catch {
        return defaultValue;
      }
    }
  };

  // Main app state
  const [currentView, setCurrentView] = useState('dashboard');
  
  // Data state with localStorage persistence
  const [storySeeds, setStorySeeds] = useState(() => storage.load('seeds', [
    {
      id: 1,
      title: "The AI feature nobody used",
      content: "Spent 2 weeks building something I thought users wanted...",
      pillar: "Build Log",
      date: "2025-01-15",
      status: "seed"
    },
    {
      id: 2,
      title: "Board meeting AI questions", 
      content: "When the board asked about ROI and I realized...",
      pillar: "Leadership Lens",
      date: "2025-01-12",
      status: "seed"
    }
  ]));
  
  const [posts] = useState([
    {
      id: 1,
      title: "The Day My AI Build Stopped Making Sense",
      status: "published",
      pillar: "Build Log",
      engagement: { replies: 12, mentions: 3 },
      publishDate: "2025-01-08"
    }
  ]);
  
  const [evergreens] = useState([
    {
      id: 1,
      title: "The Question Every Non-Tech Leader Should Ask",
      status: "ready"
    },
    {
      id: 2,
      title: "Why I Stopped Trying to Understand Every Line",
      status: "draft"
    }
  ]);

  // Form state
  const [newSeed, setNewSeed] = useState({ 
    title: '', 
    content: '', 
    pillar: 'Build Log' 
  });
  const [showNewSeed, setShowNewSeed] = useState(false);
  
  // Capture state
  const [captureMode, setCaptureMode] = useState('text');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Co-writer state
  const [coWriterSession, setCoWriterSession] = useState({
    step: 'idle',
    seed: null,
    titles: [],
    angles: [],
    selectedTitle: '',
    selectedAngle: '',
    qaAnswers: [],
    currentQIndex: 0,
    draft: '',
    toneVariants: [],
    imageIdeas: [],
    engagementScore: null,
    isLoading: false
  });

  // Constants
  const pillars = ['Build Log', 'Leadership Lens', 'Meta-Skill', 'Field Note'];
  
  const qaQuestionsByPillar = {
    "Build Log": [
      "Where were you when this technical challenge first appeared?",
      "What assumptions were you making that turned out wrong?",
      "Walk me through your first attempt - what did you try?",
      "What was the moment you realized you needed to pivot?",
      "What would you tell another leader facing this same choice?"
    ],
    "Leadership Lens": [
      "Set the scene - what was happening with your team?",
      "What leadership instinct kicked in first?",
      "How did you balance speed vs. getting everyone aligned?",
      "What surprised you about how people reacted?",
      "What principle will you carry forward from this?"
    ],
    "Meta-Skill": [
      "What were you terrible at before this experience?",
      "When did you first notice you were thinking differently?",
      "What's the internal shift that happened?",
      "How does this change how you approach everything else?",
      "How would you teach this skill to someone else?"
    ],
    "Field Note": [
      "What did you observe that others might have missed?",
      "What context makes this moment significant?",
      "Why does this pattern matter for AI adoption?",
      "What does this reveal about leadership in general?",
      "What question should every leader be asking?"
    ]
  };

  // Persist seeds to localStorage whenever they change
  useEffect(() => {
    storage.save('seeds', storySeeds);
  }, [storySeeds]);

  // Voice capture functionality
  const startVoiceCapture = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => setIsRecording(true);
      
      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setNewSeed(prev => ({ ...prev, content: transcript }));
      };
      
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);
      
      recognition.start();
    } else {
      alert('Speech recognition not supported. Try Chrome or Edge.');
    }
  };

  // Image upload handler
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
        setNewSeed(prev => ({ 
          ...prev, 
          title: prev.title || `Visual insight from ${new Date().toLocaleDateString()}`,
          content: prev.content || 'Captured a moment that sparked this reflection...'
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Screenshot capture
  const captureScreenshot = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      alert('Screenshot feature implemented - would capture screen here');
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      alert('Screenshot capture not available. Try the photo upload instead.');
    }
  };

  // Add seed
  const handleAddSeed = () => {
    if (newSeed.title && newSeed.content) {
      const seed = {
        id: Date.now(),
        ...newSeed,
        date: new Date().toISOString().split('T')[0],
        status: 'seed'
      };
      setStorySeeds([seed, ...storySeeds]);
      setNewSeed({ title: '', content: '', pillar: 'Build Log' });
      setSelectedImage(null);
      setShowNewSeed(false);
      setCaptureMode('text');
    }
  };

  // Clear form
  const clearSeedForm = () => {
    setNewSeed({ title: '', content: '', pillar: 'Build Log' });
    setSelectedImage(null);
    setCaptureMode('text');
  };

  // Mock AI API call (replace with real Gemini API later)
  const mockAICall = async (prompt) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      titles: [
        `The Day ${coWriterSession.seed?.title} Changed Everything`,
        `Why ${coWriterSession.seed?.title} Taught Me About Leadership`,
        `What ${coWriterSession.seed?.title} Revealed About AI`
      ],
      angles: [
        "Focus on the unexpected moment that shifted your perspective",
        "Emphasize the leadership lesson that applies beyond AI"
      ]
    };
  };

  // Start co-writer flow
  const startCoWriter = async (seed) => {
    setCoWriterSession(prev => ({ 
      ...prev, 
      isLoading: true, 
      step: 'hooks', 
      seed 
    }));
    
    try {
      const response = await mockAICall();
      setCoWriterSession(prev => ({
        ...prev,
        titles: response.titles,
        angles: response.angles,
        isLoading: false
      }));
    } catch (error) {
      setCoWriterSession(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Submit Q&A answer
  const submitQAAnswer = async (answer) => {
    const newAnswers = [...coWriterSession.qaAnswers, answer];
    const questions = qaQuestionsByPillar[coWriterSession.seed.pillar];
    const nextIndex = coWriterSession.currentQIndex + 1;
    
    if (nextIndex >= questions.length) {
      // Generate draft
      setCoWriterSession(prev => ({
        ...prev,
        qaAnswers: newAnswers,
        isLoading: true,
        step: 'draft'
      }));
      
      // Mock draft generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockDraft = `# ${coWriterSession.selectedTitle}

${newAnswers[0]}

The challenge hit me when ${newAnswers[1]?.toLowerCase()}

I decided to ${newAnswers[2]?.toLowerCase()}

**${newAnswers[3]}**

Here's what I learned: ${newAnswers[4]}

*What's one messy decision you're facing in your AI journey right now?*`;
      
      setCoWriterSession(prev => ({
        ...prev,
        draft: mockDraft,
        toneVariants: ['Tighter version...', 'More reflective version...'],
        imageIdeas: ['scattered notes', 'crossroads'],
        engagementScore: { 
          overallScore: 7.8,
          hookStrength: 8,
          relatability: 7,
          actionability: 8,
          vulnerability: 8,
          improvements: ['Consider adding more specific details']
        },
        isLoading: false,
        step: 'complete'
      }));
    } else {
      setCoWriterSession(prev => ({
        ...prev,
        qaAnswers: newAnswers,
        currentQIndex: nextIndex
      }));
    }
  };

  // Reset co-writer
  const resetCoWriter = () => {
    setCoWriterSession({
      step: 'idle',
      seed: null,
      titles: [],
      angles: [],
      selectedTitle: '',
      selectedAngle: '',
      qaAnswers: [],
      currentQIndex: 0,
      draft: '',
      toneVariants: [],
      imageIdeas: [],
      engagementScore: null,
      isLoading: false
    });
  };

  // Export draft
  const exportDraft = () => {
    const content = coWriterSession.draft;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${coWriterSession.selectedTitle?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'draft'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Q&A Form Component
  const QAForm = ({ onSubmit, isLoading }) => {
    const [answer, setAnswer] = useState('');
    
    const handleSubmit = () => {
      if (answer.trim()) {
        onSubmit(answer);
        setAnswer('');
      }
    };

    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        handleSubmit();
      }
    };

    return (
      <div className="space-y-4">
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Share your experience in your own words... (Ctrl+Enter to submit)"
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          disabled={isLoading}
        />
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!answer.trim() || isLoading}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Next Question <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  // Dashboard Component
  const Dashboard = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-purple-600" />
            This Week's Flow
          </h2>
          <span className="text-sm text-purple-600 bg-white px-3 py-1 rounded-full">
            Week of Jan 13
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Day 1: Capture</span>
              <Target className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-sm text-gray-700 mb-4">Pick a seed & create hook</p>
            <button 
              onClick={() => setCurrentView('capture')}
              className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-200 transition-colors"
            >
              Start Capture →
            </button>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm opacity-60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Day 2: Shape & Ship</span>
              <Clock className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-sm text-gray-700 mb-4">Expand to full draft</p>
            <span className="text-xs text-gray-500">Available tomorrow</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Story Seeds</p>
              <p className="text-2xl font-semibold text-gray-800">{storySeeds.length}</p>
            </div>
            <Lightbulb className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Evergreen Ready</p>
              <p className="text-2xl font-semibold text-gray-800">
                {evergreens.filter(e => e.status === 'ready').length}
              </p>
            </div>
            <Archive className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Reader Replies</p>
              <p className="text-2xl font-semibold text-gray-800">
                {posts.reduce((sum, post) => sum + (post.engagement?.replies || 0), 0)}
              </p>
            </div>
            <MessageCircle className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Recent Story Seeds</h3>
            <button 
              onClick={() => setShowNewSeed(true)}
              className="flex items-center text-sm text-purple-600 hover:text-purple-700"
            >
              <PlusCircle className="w-4 h-4 mr-1" />
              Add Seed
            </button>
          </div>
        </div>
        
        <div className="divide-y divide-gray-100">
          {storySeeds.slice(0, 3).map(seed => (
            <div key={seed.id} className="p-4 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{seed.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{seed.content}</p>
                  <div className="flex items-center mt-2 space-x-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {seed.pillar}
                    </span>
                    <span className="text-xs text-gray-500">{seed.date}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Capture View Component
  const CaptureView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Story Seed Capture</h2>
        <button 
          onClick={() => setCurrentView('dashboard')}
          className="text-gray-600 hover:text-gray-800"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <button 
          onClick={() => setCaptureMode('text')}
          className={`p-4 bg-white rounded-lg shadow-sm border transition-colors text-center ${
            captureMode === 'text' 
              ? 'border-purple-300 bg-purple-50' 
              : 'border-gray-200 hover:border-purple-300'
          }`}
        >
          <FileText className="w-6 h-6 mx-auto mb-2 text-gray-600" />
          <span className="text-sm text-gray-700">Text Note</span>
        </button>
        
        <button 
          onClick={() => {
            setCaptureMode('voice');
            startVoiceCapture();
          }}
          className={`p-4 bg-white rounded-lg shadow-sm border transition-colors text-center ${
            captureMode === 'voice' || isRecording
              ? 'border-red-300 bg-red-50' 
              : 'border-gray-200 hover:border-purple-300'
          }`}
        >
          <Mic className={`w-6 h-6 mx-auto mb-2 ${isRecording ? 'text-red-600 animate-pulse' : 'text-gray-600'}`} />
          <span className="text-sm text-gray-700">
            {isRecording ? 'Recording...' : 'Voice Memo'}
          </span>
        </button>
        
        <label className={`p-4 bg-white rounded-lg shadow-sm border transition-colors text-center cursor-pointer ${
          captureMode === 'photo' 
            ? 'border-purple-300 bg-purple-50' 
            : 'border-gray-200 hover:border-purple-300'
        }`}>
          <Camera className="w-6 h-6 mx-auto mb-2 text-gray-600" />
          <span className="text-sm text-gray-700">Photo</span>
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => {
              setCaptureMode('photo');
              handleImageUpload(e);
            }}
            className="hidden" 
          />
        </label>
        
        <button 
          onClick={() => {
            setCaptureMode('screenshot');
            captureScreenshot();
          }}
          className={`p-4 bg-white rounded-lg shadow-sm border transition-colors text-center ${
            captureMode === 'screenshot' 
              ? 'border-purple-300 bg-purple-50' 
              : 'border-gray-200 hover:border-purple-300'
          }`}
        >
          <FileText className="w-6 h-6 mx-auto mb-2 text-gray-600" />
          <span className="text-sm text-gray-700">Screenshot</span>
        </button>
      </div>

      {captureMode === 'voice' && isRecording && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <Mic className="w-5 h-5 mr-2 text-red-500 animate-pulse" />
            <span className="text-red-800 font-medium">Listening... speak your story seed</span>
          </div>
        </div>
      )}

      {selectedImage && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Captured Image</h3>
          <div className="flex items-start space-x-4">
            <img 
              src={selectedImage} 
              alt="Captured content" 
              className="w-24 h-24 object-cover rounded-lg border border-gray-200"
            />
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-2">
                This image will help you remember the context of your story seed.
              </p>
              <button 
                onClick={() => setSelectedImage(null)}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Remove image
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Capture Your Moment</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What happened? (Hook/Title)
            </label>
            <input
              type="text"
              value={newSeed.title}
              onChange={(e) => setNewSeed({...newSeed, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., The AI feature nobody used"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tell the story
            </label>
            <textarea
              value={newSeed.content}
              onChange={(e) => setNewSeed({...newSeed, content: e.target.value})}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Describe what happened, how you felt, what you learned..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Pillar
            </label>
            <select
              value={newSeed.pillar}
              onChange={(e) => setNewSeed({...newSeed, pillar: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {pillars.map(pillar => (
                <option key={pillar} value={pillar}>{pillar}</option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button 
              onClick={clearSeedForm}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Clear
            </button>
            <button 
              onClick={handleAddSeed}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Seed
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Co-Writer View Component
  const CoWriterView = () => {
    if (coWriterSession.step === 'idle') {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">AI Co-Writer</h2>
            <button 
              onClick={() => setCurrentView('dashboard')}
              className="text-gray-600 hover:text-gray-800"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-8 rounded-lg border border-purple-200 text-center">
            <Zap className="w-12 h-12 mx-auto mb-4 text-purple-600" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Ready to Co-Write?</h3>
            <p className="text-gray-600 mb-6">Select a story seed to start the guided writing process</p>
            
            <div className="grid gap-4 max-w-md mx-auto">
              {storySeeds.slice(0, 3).map(seed => (
                <button 
                  key={seed.id}
                  onClick={() => startCoWriter(seed)}
                  className="p-4 bg-white rounded-lg border border-purple-200 hover:border-purple-400 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{seed.title}</p>
                      <p className="text-sm text-purple-600">{seed.pillar}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-purple-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (coWriterSession.step === 'hooks') {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Step 1: Choose Your Hook</h2>
              <p className="text-gray-600">Working with: "{coWriterSession.seed?.title}"</p>
            </div>
            <button onClick={resetCoWriter} className="text-gray-600 hover:text-gray-800">
              <X className="w-6 h-6" />
            </button>
          </div>

          {coWriterSession.isLoading ? (
            <div className="bg-white rounded-lg p-8 text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
              <p className="text-gray-600">AI is crafting title options...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Title Options</h3>
                <div className="space-y-3">
                  {coWriterSession.titles.map((title, index) => (
                    <button
                      key={index}
                      onClick={() => setCoWriterSession(prev => ({ ...prev, selectedTitle: title }))}
                      className={`w-full p-3 rounded-lg border text-left transition-colors ${
                        coWriterSession.selectedTitle === title
                          ? 'border-purple-400 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      {title}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Angle Options</h3>
                <div className="space-y-3">
                  {coWriterSession.angles.map((angle, index) => (
                    <button
                      key={index}
                      onClick={() => setCoWriterSession(prev => ({ ...prev, selectedAngle: angle }))}
                      className={`w-full p-3 rounded-lg border text-left transition-colors ${
                        coWriterSession.selectedAngle === angle
                          ? 'border-purple-400 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      {angle}
                    </button>
                  ))}
                </div>
              
