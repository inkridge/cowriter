
import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, PenTool, BarChart3, Sprout, Wand2, Send } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [seeds, setSeeds] = useState([]);
  const [selectedSeed, setSelectedSeed] = useState(null);
  const [generatedTitles, setGeneratedTitles] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState('');
  const [pillarQuestions, setPillarQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiKey, setApiKey] = useState(process.env.REACT_APP_GEMINI_API_KEY || '');

  // Initialize Gemini AI
  const initializeAI = () => {
    if (!apiKey) return null;
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      return genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    } catch (error) {
      console.error('Error initializing Gemini:', error);
      return null;
    }
  };

  // Generate titles using Gemini
  const generateTitles = async (seed) => {
    const model = initializeAI();
    if (!model) return [];

    setIsGenerating(true);
    try {
      const prompt = `Based on this story seed: "${seed.content}"
      
Content Pillar: ${seed.pillar}

Generate 3 compelling, click-worthy titles for a Substack post. Make them:
- Authentic and vulnerable 
- Specific to the AI/leadership context
- Between 6-12 words
- Engaging without being clickbait

Return only the 3 titles, one per line, no numbers or bullets.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const titles = response.text().split('\n').filter(title => title.trim());
      
      setGeneratedTitles(titles);
      return titles;
    } catch (error) {
      console.error('Error generating titles:', error);
      return [];
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate pillar-specific questions
  const generateQuestions = async (pillar, title, seed) => {
    const model = initializeAI();
    if (!model) return [];

    setIsGenerating(true);
    try {
      const pillarPrompts = {
        'Build Log': 'Focus on technical challenges, solutions found, and practical lessons learned.',
        'Leadership Lens': 'Focus on team dynamics, decision-making, and organizational impact.',
        'Meta-Skill': 'Focus on universal skills, mindset shifts, and transferable insights.',
        'Field Note': 'Focus on observations, patterns, and emerging trends.'
      };

      const prompt = `For a ${pillar} post titled "${title}" based on this seed: "${seed.content}"

${pillarPrompts[pillar]}

Generate 5 specific questions that will help the author develop this into a compelling 600-800 word Substack post. Questions should:
- Draw out concrete details and examples
- Encourage vulnerability and authenticity  
- Help connect to broader leadership/AI themes
- Build a narrative arc

Return only the 5 questions, one per line, no numbers.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const questions = response.text().split('\n').filter(q => q.trim());
      
      setPillarQuestions(questions);
      return questions;
    } catch (error) {
      console.error('Error generating questions:', error);
      return [];
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate complete article
  const generateArticle = async () => {
    const model = initializeAI();
    if (!model) return '';

    setIsGenerating(true);
    try {
      const answersText = Object.entries(answers)
        .map(([question, answer]) => `Q: ${question}\nA: ${answer}`)
        .join('\n\n');

      const prompt = `Write a compelling 600-800 word Substack post with this information:

Title: ${selectedTitle}
Content Pillar: ${selectedSeed.pillar}
Original Seed: ${selectedSeed.content}

Author's responses to key questions:
${answersText}

Write in a conversational, authentic tone that:
- Starts with a hook that draws readers in
- Shares vulnerable, real moments
- Provides actionable insights
- Connects AI/tech topics to broader leadership themes
- Ends with a thought-provoking question for engagement

Format as clean markdown ready for Substack.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();
      
      setGeneratedContent(content);
      return content;
    } catch (error) {
      console.error('Error generating article:', error);
      return '';
    } finally {
      setIsGenerating(false);
    }
  };

  // Sample data for demonstration
  useEffect(() => {
    setSeeds([
      {
        id: 1,
        title: "AI replaced my workflow",
        content: "Discovered how ChatGPT automated my daily standup prep",
        pillar: "Build Log",
        date: new Date().toISOString(),
        status: "captured"
      },
      {
        id: 2,
        title: "Leadership through AI adoption",
        content: "Team was resistant to AI tools until I showed real results",
        pillar: "Leadership Lens",
        date: new Date().toISOString(),
        status: "captured"
      }
    ]);
  }, []);

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Seeds</p>
              <p className="text-2xl font-bold text-gray-900">{seeds.length}</p>
            </div>
            <Sprout className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
            <BarChart3 className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ready to Write</p>
              <p className="text-2xl font-bold text-gray-900">2</p>
            </div>
            <PenTool className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Recent Seeds</h2>
        </div>
        <div className="p-6">
          {seeds.length === 0 ? (
            <div className="text-center py-8">
              <Sprout className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No seeds yet</h3>
              <p className="text-gray-600 mb-4">Start capturing your AI journey moments</p>
              <button
                onClick={() => setCurrentView('capture')}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Capture Your First Seed
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {seeds.map((seed) => (
                <div 
                  key={seed.id} 
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedSeed(seed);
                    setCurrentView('cowriter');
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{seed.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">{seed.content}</p>
                      <div className="flex items-center mt-2 space-x-2">
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          {seed.pillar}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(seed.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                        Develop →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderCapture = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Capture New Seed</h2>
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Title
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="What happened with AI today?"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Story Seed
            </label>
            <textarea
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Capture the moment, insight, or experience..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Pillar
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option>Build Log</option>
              <option>Leadership Lens</option>
              <option>Meta-Skill</option>
              <option>Field Note</option>
            </select>
          </div>
          
          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Save Seed
            </button>
            <button
              type="button"
              onClick={() => setCurrentView('dashboard')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderCoWriter = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* API Key Setup */}
      {!apiKey && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center mb-3">
            <Wand2 className="w-5 h-5 text-yellow-600 mr-2" />
            <h3 className="text-lg font-medium text-yellow-800">Setup Gemini AI</h3>
          </div>
          <p className="text-yellow-700 mb-4">Add your Gemini API key in Secrets to enable AI co-writing.</p>
          <div className="flex space-x-3">
            <span className="text-sm text-yellow-600">Secret Key: REACT_APP_GEMINI_API_KEY</span>
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Get API Key
            </a>
          </div>
        </div>
      )}

      {/* Seed Selection */}
      {apiKey && !selectedSeed && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Choose a Seed to Develop</h2>
          {seeds.length === 0 ? (
            <div className="text-center py-8">
              <Sprout className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No seeds available. Create some first!</p>
              <button
                onClick={() => setCurrentView('capture')}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Capture Seeds
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {seeds.map((seed) => (
                <div 
                  key={seed.id}
                  className="border rounded-lg p-4 hover:bg-purple-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedSeed(seed)}
                >
                  <h3 className="font-medium text-gray-900">{seed.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{seed.content}</p>
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded mt-2 inline-block">
                    {seed.pillar}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Title Generation */}
      {selectedSeed && generatedTitles.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Generate Titles</h2>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900">{selectedSeed.title}</h3>
            <p className="text-gray-600 text-sm mt-1">{selectedSeed.content}</p>
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded mt-2 inline-block">
              {selectedSeed.pillar}
            </span>
          </div>
          <button
            onClick={() => generateTitles(selectedSeed)}
            disabled={isGenerating}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Titles
              </>
            )}
          </button>
        </div>
      )}

      {/* Title Selection */}
      {generatedTitles.length > 0 && !selectedTitle && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Choose Your Title</h2>
          <div className="space-y-3 mb-6">
            {generatedTitles.map((title, index) => (
              <button
                key={index}
                onClick={() => setSelectedTitle(title)}
                className="w-full text-left p-4 border rounded-lg hover:bg-purple-50 hover:border-purple-200 transition-colors"
              >
                {title}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              setGeneratedTitles([]);
              generateTitles(selectedSeed);
            }}
            className="text-purple-600 hover:text-purple-800 text-sm"
          >
            Generate Different Titles
          </button>
        </div>
      )}

      {/* Question Generation */}
      {selectedTitle && pillarQuestions.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Develop Your Story</h2>
          <div className="bg-purple-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-purple-900">{selectedTitle}</h3>
          </div>
          <button
            onClick={() => generateQuestions(selectedSeed.pillar, selectedTitle, selectedSeed)}
            disabled={isGenerating}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Generate Development Questions
              </>
            )}
          </button>
        </div>
      )}

      {/* Q&A Development */}
      {pillarQuestions.length > 0 && !generatedContent && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Answer These Questions</h2>
          <div className="space-y-6">
            {pillarQuestions.map((question, index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {question}
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={answers[question] || ''}
                  onChange={(e) => setAnswers(prev => ({
                    ...prev,
                    [question]: e.target.value
                  }))}
                  placeholder="Share your thoughts, experiences, and insights..."
                />
              </div>
            ))}
          </div>
          <div className="mt-6 flex space-x-3">
            <button
              onClick={generateArticle}
              disabled={isGenerating || Object.keys(answers).length === 0}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating Article...
                </>
              ) : (
                <>
                  <PenTool className="w-4 h-4 mr-2" />
                  Generate Article
                </>
              )}
            </button>
            <button
              onClick={() => {
                setPillarQuestions([]);
                setAnswers({});
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Try Different Questions
            </button>
          </div>
        </div>
      )}

      {/* Generated Content */}
      {generatedContent && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Your Substack Article</h2>
            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedContent);
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              Copy to Clipboard
            </button>
          </div>
          <div className="prose max-w-none bg-gray-50 rounded-lg p-6 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
              {generatedContent}
            </pre>
          </div>
          <div className="mt-6 flex space-x-3">
            <button
              onClick={() => {
                setSelectedSeed(null);
                setGeneratedTitles([]);
                setSelectedTitle('');
                setPillarQuestions([]);
                setAnswers({});
                setGeneratedContent('');
              }}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Start New Article
            </button>
            <button
              onClick={generateArticle}
              disabled={isGenerating}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Regenerate Article
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-purple-600">Inkridge</h1>
              <span className="ml-2 text-sm text-gray-500">Creative Workflow Companion</span>
            </div>
            
            <nav className="flex space-x-8">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentView === 'dashboard'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </button>
              
              <button
                onClick={() => setCurrentView('capture')}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentView === 'capture'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Plus className="w-4 h-4 mr-2" />
                Capture Seeds
              </button>
              
              <button
                onClick={() => setCurrentView('cowriter')}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentView === 'cowriter'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <PenTool className="w-4 h-4 mr-2" />
                Co-Writer
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' && renderDashboard()}
        {currentView === 'capture' && renderCapture()}
        {currentView === 'cowriter' && renderCoWriter()}
      </main>
    </div>
  );
}

export default App;
