import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, PenTool, BarChart3, Sprout, Wand2, Send, User, LogOut, FileText, Tag, Search, Menu, X } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

// Global variable to hold the Supabase client instance
let supabaseClientInstance = null;

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [seeds, setSeeds] = useState([]);
  const [selectedSeed, setSelectedSeed] = useState(null);
  const [generatedTitles, setGeneratedTitles] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState('');
  const [pillarQuestions, setPillarQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState({}); // Added state for selected questions
  const [answers, setAnswers] = useState({});
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState(process.env.REACT_APP_GEMINI_API_KEY || '');
  const [user, setUser] = useState(null);
  const [articles, setArticles] = useState([]);
  const [expandedArticle, setExpandedArticle] = useState(null);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    type: 'template',
    tags: ''
  });
  const [expandedNote, setExpandedNote] = useState(null);
  const [noteModal, setNoteModal] = useState(null);
  const [noteFilter, setNoteFilter] = useState('all');
  const [editingNote, setEditingNote] = useState(null);
  const [editNote, setEditNote] = useState({
    title: '',
    content: '',
    type: 'template',
    tags: ''
  });
  const [newSeed, setNewSeed] = useState({
    title: '',
    content: '',
    pillar: 'Build Log'
  });
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Initialize Supabase client function
  const getSupabaseClient = () => {
    if (supabaseClientInstance) {
      return supabaseClientInstance;
    }

    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

    // Only create Supabase client if both URL and key are valid
    if (supabaseUrl && supabaseKey && supabaseUrl.trim() !== '' && supabaseKey.trim() !== '') {
      try {
        supabaseClientInstance = createClient(supabaseUrl, supabaseKey, {
          auth: {
            persistSession: false, // Prevent multiple auth instances
            autoRefreshToken: false
          }
        });
        console.log('Supabase client created successfully');
        return supabaseClientInstance;
      } catch (error) {
        console.error('Error creating Supabase client:', error);
        return null;
      }
    }
    console.log('Supabase environment variables not set properly');
    return null;
  };

  // Initialize Gemini AI
  const initializeAI = () => {
    if (!apiKey) return null;
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    } catch (error) {
      console.error('Error initializing Gemini:', error);
      return null;
    }
  };

  // Auth functions
  const checkAuth = async () => {
    try {
      const response = await fetch('/__replauthuser');
      if (response.ok) {
        const userData = await response.json();
        if (userData.id) {
          const user = { id: userData.id, name: userData.name };
          setUser(user);
          return user;
        }
      }
    } catch (error) {
      console.log('Not authenticated yet');
    }
    return null;
  };

  const loginWithReplit = () => {
    window.addEventListener("message", authComplete);
    var h = 500;
    var w = 350;
    var left = screen.width / 2 - w / 2;
    var top = screen.height / 2 - h / 2;

    var authWindow = window.open(
      "https://replit.com/auth_with_repl_site?domain=" + location.host,
      "_blank",
      "modal=yes, toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=" +
        w +
        ", height=" +
        h +
        ", top=" +
        top +
        ", left=" +
        left
    );

    function authComplete(e) {
      if (e.data !== "auth_complete") {
        return;
      }

      window.removeEventListener("message", authComplete);
      authWindow.close();
      checkAuth(); // Refresh user data after login
    }
  };

  const logout = () => {
    setUser(null);
    setSeeds([]);
  };

  // Supabase functions
  const loadArticles = async () => {
    try {
      const currentUser = user || await checkAuth();
      if (!currentUser) {
        setArticles([]);
        return;
      }

      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setArticles(data || []);
      } else {
        throw new Error('Supabase not configured');
      }
    } catch (error) {
      console.error('Error loading articles:', error);
      setArticles([]);
    }
  };

  const loadNotes = async () => {
    setIsLoading(true);
    try {
      const currentUser = user || await checkAuth();
      if (!currentUser) {
        setNotes([]);
        return;
      }

      // For now, use localStorage for notes since we don't have a notes table in Supabase
      const savedNotes = localStorage.getItem(`notes_${currentUser.id}`);
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      } else {
        // Default templates
        const defaultNotes = [
          {
            id: 1,
            title: "Article Title Generator Prompt",
            content: `Generate 3 compelling titles for an article about: [TOPIC]

Make them:
- Conversational (like telling a friend)
- Specific to the actual experience
- Intriguing but not clickbait-y
- Something a real person would say

Examples of good style:
- "I accidentally became our company's AI person"
- "Three hours and one broken app later..."
- "Turns out I'm not as tech-savvy as I thought"`,
            type: "prompt",
            tags: "title, generation, ai",
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            title: "Build Log Article Template",
            content: `# [Title]

## The Setup
What was happening that led to this moment?

## The Challenge
What went wrong or felt uncertain?

## What I Tried
The messy middle - what did you actually do?

## The Outcome
How did it turn out? What worked/didn't work?

## The Takeaway
What would you tell someone else facing this?

---
**Key Insight:** [Bold the main lesson here]`,
            type: "template",
            tags: "build log, structure, template",
            created_at: new Date().toISOString()
          }
        ];
        setNotes(defaultNotes);
        localStorage.setItem(`notes_${currentUser.id}`, JSON.stringify(defaultNotes));
      }
    } catch (error) {
      console.error('Error loading notes:', error);
      setNotes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveNote = async (e) => {
    e.preventDefault();
    if (!newNote.title.trim() || !newNote.content.trim()) return;

    setIsLoading(true);
    try {
      const currentUser = user || await checkAuth();
      if (!currentUser) throw new Error('User not authenticated');

      const noteToSave = {
        id: Date.now(),
        title: newNote.title.trim(),
        content: newNote.content.trim(),
        type: newNote.type,
        tags: newNote.tags.trim(),
        created_at: new Date().toISOString()
      };

      const updatedNotes = [noteToSave, ...notes];
      setNotes(updatedNotes);
      localStorage.setItem(`notes_${currentUser.id}`, JSON.stringify(updatedNotes));

      setNewNote({ title: '', content: '', type: 'template', tags: '' });
      setCurrentView('notes');
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteNote = async (noteId) => {
    try {
      const currentUser = user || await checkAuth();
      if (!currentUser) return;

      const updatedNotes = notes.filter(note => note.id !== noteId);
      setNotes(updatedNotes);
      localStorage.setItem(`notes_${currentUser.id}`, JSON.stringify(updatedNotes));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const updateNote = async (e) => {
    e.preventDefault();
    if (!editNote.title.trim() || !editNote.content.trim()) return;

    setIsLoading(true);
    try {
      const currentUser = user || await checkAuth();
      if (!currentUser) throw new Error('User not authenticated');

      const updatedNotes = notes.map(note => 
        note.id === editingNote.id 
          ? {
              ...note,
              title: editNote.title.trim(),
              content: editNote.content.trim(),
              type: editNote.type,
              tags: editNote.tags.trim(),
              updated_at: new Date().toISOString()
            }
          : note
      );

      setNotes(updatedNotes);
      localStorage.setItem(`notes_${currentUser.id}`, JSON.stringify(updatedNotes));

      setEditingNote(null);
      setEditNote({ title: '', content: '', type: 'template', tags: '' });
    } catch (error) {
      console.error('Error updating note:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startEditingNote = (note) => {
    setEditingNote(note);
    setEditNote({
      title: note.title,
      content: note.content,
      type: note.type,
      tags: note.tags || ''
    });
  };

  const loadSeeds = async () => {
    setIsLoading(true);
    try {
      const currentUser = user || checkAuth();
      if (!currentUser) {
        setSeeds([]);
        return;
      }

      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('seeds')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setSeeds(data || []);
      } else {
        throw new Error('Supabase not configured');
      }
    } catch (error) {
      console.error('Error loading seeds:', error);
      // Fallback to sample data if Supabase fails
      setSeeds([
        {
          id: 1,
          title: "AI replaced my workflow",
          content: "Discovered how ChatGPT automated my daily standup prep",
          pillar: "Build Log",
          created_at: new Date().toISOString(),
          status: "captured"
        },
        {
          id: 2,
          title: "Leadership through AI adoption",
          content: "Team was resistant to AI tools until I showed real results",
          pillar: "Leadership Lens",
          created_at: new Date().toISOString(),
          status: "captured"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSeedToSupabase = async (seedData) => {
    try {
      const currentUser = user || checkAuth();
      if (!currentUser) throw new Error('User not authenticated');

      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('seeds')
          .insert([{
            title: seedData.title,
            content: seedData.content,
            pillar: seedData.pillar,
            status: 'captured',
            user_id: currentUser.id,
            user_name: currentUser.name
          }])
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        throw new Error('Supabase not configured');
      }
    } catch (error) {
      console.error('Error saving seed:', error);
      // Fallback to local storage
      const seed = {
        id: Date.now(),
        title: seedData.title,
        content: seedData.content,
        pillar: seedData.pillar,
        created_at: new Date().toISOString(),
        status: 'captured'
      };
      return seed;
    }
  };

  const saveArticleToSupabase = async (articleData) => {
    try {
      const currentUser = user || await checkAuth();
      if (!currentUser) throw new Error('User not authenticated');

      console.log('Attempting to save article for user:', currentUser.id);
      console.log('Environment variables:', {
        supabaseUrl: process.env.REACT_APP_SUPABASE_URL ? 'SET' : 'NOT SET',
        supabaseKey: process.env.REACT_APP_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET'
      });

      const supabase = getSupabaseClient();
      if (supabase) {
        const articleData = {
          seed_id: selectedSeed.id,
          title: selectedTitle,
          content: generatedContent,
          pillar: selectedSeed.pillar,
          questions: pillarQuestions,
          answers: answers,
          user_id: currentUser.id
        };

        console.log('Saving article data:', articleData);

        const { data, error } = await supabase
          .from('articles')
          .insert([articleData])
          .select()
          .single();

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        console.log('Article saved successfully:', data);
        alert('Article saved successfully!');
        loadArticles(); // Refresh articles list
        return data;
      } else {
        throw new Error('Supabase not configured - environment variables missing');
      }
    } catch (error) {
      console.error('Error saving article:', error);
      alert(`Failed to save article: ${error.message}`);
      return null;
    }
  };

  // Generate titles using Gemini
  const generateTitles = async (seed) => {
    if (!apiKey) return;

    setIsGenerating(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `I need help creating article titles for a story about: "${seed.content}"

Write 3 compelling titles that sound natural and human. Avoid corporate speak, buzzwords, or overly dramatic language. 

Make them:
- Conversational (like you'd tell a friend)
- Specific to the actual experience
- Intriguing but not clickbait-y
- Something a real person would actually say

Don't use phrases like "curiosity-driven" or "grab attention" or marketing speak. Just write titles that feel authentic and interesting.

Examples of good style:
- "I accidentally became our company's AI person"
- "Three hours and one broken app later..."
- "Turns out I'm not as tech-savvy as I thought"

Create 3 titles now, just the titles, no explanations:`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      const titles = text.split('\n').filter(line =>
        line.trim() && !line.includes('Title') && line.match(/^\d+\.|\-|\*/)
      ).map(title =>
        title.replace(/^\d+\.\s*|\-\s*|\*\s*/, '').trim()
      );

      setGeneratedTitles(titles);
    } catch (error) {
      console.error('Error generating titles:', error);
    }
    setIsGenerating(false);
  };

  // Generate pillar-specific questions
  const generateQuestions = async (pillar, title, seed) => {
    if (!apiKey) return;

    setIsGenerating(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `I'm writing about: "${title}"
Based on this experience: ${seed.content}

Help me flesh out this story by asking me questions that will help me remember the details and think through what happened.

Ask me 8-10 questions like you're a curious friend who wants to understand what really went down. Make them:
- Natural and conversational
- Specific to my actual situation
- Focused on the real human experience (emotions, mistakes, surprises)
- Not too formal or interview-like

Include questions about:
- What was actually happening when this started?
- What went wrong or felt uncertain?
- What did I try to do about it?
- How did it turn out?
- What would I tell someone else who faces this?
- The messy, human details that made it real

Just list the questions, no explanations or categories:`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      const questions = text.split('\n').filter(line =>
        line.trim() && line.includes('?')
      ).map(q => q.replace(/^\d+\.\s*|\-\s*|\*\s*/, '').trim());

      setPillarQuestions(questions);
    } catch (error) {
      console.error('Error generating questions:', error);
    }
    setIsGenerating(false);
  };

  // Generate complete article
  const generateArticle = async () => {
    if (!apiKey) return;

    const selectedAnswers = Object.entries(selectedQuestions)
      .filter(([_, selected]) => selected)
      .map(([question, _]) => `Q: ${question}\nA: ${answers[question] || 'Not answered'}`)
      .join('\n\n');

    if (!selectedAnswers) return;

    setIsGenerating(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `Write a 500-800 word article titled "${selectedTitle}" using these answers I gave:

${selectedAnswers}

Write it like a real person telling their story - conversational, honest, not overly polished. Use my actual words and experiences from the answers above.

Structure it naturally:
1. Start with a moment that drops people into the story
2. Set up what was happening and why it mattered  
3. Explain the challenge or uncertainty I faced
4. Share what I actually did about it
5. Tell what happened as a result
6. End with what I learned that might help others

Keep it:
- Conversational (like I'm talking to a colleague over coffee)
- Short paragraphs (2-3 sentences each)
- Honest about mistakes and uncertainty
- Focused on the human experience, not just the tech
- Bold one key insight that readers should remember

Don't make it sound like marketing copy or a business case study. Just tell the story like a real person would.`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      setGeneratedContent(text);

      // Save article to Supabase
      const { error } = await supabase
        .from('articles')
        .insert({
          seed_id: selectedSeed.id,
          title: selectedTitle,
          content: text,
          pillar: selectedSeed.pillar,
          questions: pillarQuestions,
          answers: answers,
          user_id: user.id
        });

      if (error) {
        console.error('Error saving article:', error);
      } else {
        // Refresh articles list
        loadArticles(); // Corrected function call
      }

    } catch (error) {
      console.error('Error generating article:', error);
    }
    setIsGenerating(false);
  };

  // Save new seed
  const saveSeed = async (e) => {
    e.preventDefault();
    if (!newSeed.title.trim() || !newSeed.content.trim()) return;

    setIsLoading(true);
    try {
      const savedSeed = await saveSeedToSupabase({
        title: newSeed.title.trim(),
        content: newSeed.content.trim(),
        pillar: newSeed.pillar
      });

      setSeeds(prev => [savedSeed, ...prev]);
      setNewSeed({ title: '', content: '', pillar: 'Build Log' });
      setCurrentView('dashboard');
    } catch (error) {
      console.error('Error saving seed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load seeds from Supabase on app start
  useEffect(() => {
    checkAuth();
  }, []);

  // Reload seeds, articles, and notes when user changes
  useEffect(() => {
    if (user) {
      loadSeeds();
      loadArticles();
      loadNotes();
    }
  }, [user]);

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
              <p className="text-sm text-gray-600">Articles Written</p>
              <p className="text-2xl font-bold text-gray-900">{articles.length}</p>
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
                          {new Date(seed.created_at).toLocaleDateString()}
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
        <form onSubmit={saveSeed} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Title
            </label>
            <input
              type="text"
              value={newSeed.title}
              onChange={(e) => setNewSeed(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="What happened with AI today?"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Story Seed
            </label>
            <textarea
              rows={4}
              value={newSeed.content}
              onChange={(e) => setNewSeed(prev => ({ ...prev, content: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Capture the moment, insight, or experience..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Pillar
            </label>
            <select
              value={newSeed.pillar}
              onChange={(e) => setNewSeed(prev => ({ ...prev, pillar: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="Build Log">Build Log</option>
              <option value="Leadership Lens">Leadership Lens</option>
              <option value="Meta-Skill">Meta-Skill</option>
              <option value="Field Note">Field Note</option>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Choose & Answer Questions</h2>
          <p className="text-sm text-gray-600 mb-6">Select the questions you want to answer for your article. You can skip any that don't feel relevant.</p>

          <div className="space-y-6">
            {pillarQuestions.map((question, index) => (
              <div key={index} className={`border rounded-lg p-4 transition-colors ${selectedQuestions[question] ? 'border-purple-200 bg-purple-50' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-start space-x-3 mb-3">
                  <input
                    type="checkbox"
                    id={`question-${index}`}
                    checked={selectedQuestions[question] || false}
                    onChange={(e) => {
                      setSelectedQuestions(prev => ({
                        ...prev,
                        [question]: e.target.checked
                      }));
                      // Clear answer if question is deselected
                      if (!e.target.checked) {
                        setAnswers(prev => {
                          const newAnswers = { ...prev };
                          delete newAnswers[question];
                          return newAnswers;
                        });
                      }
                    }}
                    className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor={`question-${index}`} className="block text-sm font-medium text-gray-700 cursor-pointer flex-1">
                    {question}
                  </label>
                </div>

                {selectedQuestions[question] && (
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ml-7"
                    value={answers[question] || ''}
                    onChange={(e) => setAnswers(prev => ({
                      ...prev,
                      [question]: e.target.value
                    }))}
                    placeholder="Share your thoughts, experiences, and insights..."
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {Object.values(selectedQuestions).filter(Boolean).length} of {pillarQuestions.length} questions selected
            </div>

            <div className="flex space-x-3">
              <button
                onClick={generateArticle}
                disabled={isGenerating || Object.values(selectedQuestions).filter(Boolean).length === 0}
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
                  setSelectedQuestions({});
                  setAnswers({});
                  generateQuestions(selectedSeed.pillar, selectedTitle, selectedSeed);
                }}
                disabled={isGenerating}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {isGenerating ? 'Generating...' : 'Try Different Questions'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generated Content */}
      {generatedContent && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900">Your Substack Article</h2>
          <div className="prose max-w-none bg-gray-50 rounded-lg p-4 mt-4 mb-6 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
              {generatedContent}
            </pre>
          </div>
          <div className="mt-6 flex space-x-3">
            <button
              onClick={async () => {
                await saveArticleToSupabase();
                setSelectedSeed(null);
                setGeneratedTitles([]);
                setSelectedTitle('');
                setPillarQuestions([]);
                setAnswers({});
                setSelectedQuestions({}); // Reset selected questions
                setGeneratedContent('');
              }}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Save & Start New Article
            </button>
            <button
              onClick={() => {
                setSelectedSeed(null);
                setGeneratedTitles([]);
                setSelectedTitle('');
                setPillarQuestions([]);
                setAnswers({});
                setSelectedQuestions({}); // Reset selected questions
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

  const renderArticles = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Your Published Articles</h2>
        </div>
        <div className="p-6">
          {articles.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No articles yet</h3>
              <p className="text-gray-600 mb-4">Start by developing your seeds into full articles</p>
              <button
                onClick={() => setCurrentView('cowriter')}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Use AI Co-Writer
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {articles.map((article) => (
                <div
                  key={article.id}
                  className="border rounded-lg p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{article.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                          {article.pillar}
                        </span>
                        <span>
                          {new Date(article.created_at).toLocaleDateString()}
                        </span>
                        <span>
                          {article.content.length} characters
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="prose max-w-none">
                    <div className={`bg-gray-50 rounded-lg p-4 ${expandedArticle === article.id ? '' : 'max-h-64'} overflow-y-auto`}>
                      <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-700">
                        {expandedArticle === article.id ? (
                          article.content
                        ) : (
                          <>
                            {article.content.substring(0, 500)}
                            {article.content.length > 500 && (
                              <span className="text-gray-500">...</span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    {article.content.length > 500 && (
                      <button
                        onClick={() => setExpandedArticle(expandedArticle === article.id ? null : article.id)}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                      >
                        {expandedArticle === article.id ? 'Show Less' : 'Read Full Article'}
                      </button>
                    )}
                    <button
                      onClick={() => navigator.clipboard.writeText(article.content)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Copy Article
                    </button>
                    <button
                      onClick={() => {
                        const fullArticle = `# ${article.title}\n\n${article.content}`;
                        navigator.clipboard.writeText(fullArticle);
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Copy with Title
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderNotes = () => {
    const filteredNotes = notes.filter(note => {
      if (noteFilter === 'all') return true;
      return note.type === noteFilter;
    });

    return (
      <div className="space-y-6">
        {/* Header with filter and add button */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Notes & Templates</h2>
              <p className="text-sm text-gray-600">Store your prompts, templates, and reference materials</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Filter */}
              <select
                value={noteFilter}
                onChange={(e) => setNoteFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Types</option>
                <option value="template">Templates</option>
                <option value="prompt">Prompts</option>
                <option value="reference">Reference</option>
              </select>
              
              <button
                onClick={() => setCurrentView('add-note')}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Note
              </button>
            </div>
          </div>
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {noteFilter === 'all' ? 'No notes yet' : `No ${noteFilter}s yet`}
              </h3>
              <p className="text-gray-600 mb-4">Start building your knowledge base</p>
              <button
                onClick={() => setCurrentView('add-note')}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Create Your First Note
              </button>
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{note.title}</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => startEditingNote(note)}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit note"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete note"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-3">
                    <span className={`text-xs px-2 py-1 rounded ${
                      note.type === 'template' ? 'bg-blue-100 text-blue-800' :
                      note.type === 'prompt' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {note.type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(note.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="prose max-w-none max-h-32 overflow-hidden">
                    <div className="text-sm text-gray-600 whitespace-pre-wrap">
                      {note.content.substring(0, 200)}
                      {note.content.length > 200 && (
                        <span className="text-gray-400">...</span>
                      )}
                    </div>
                  </div>

                  {note.tags && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {note.tags.split(',').map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded flex items-center"
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {note.content.length > 200 && (
                      <button
                        onClick={() => setNoteModal(note)}
                        className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                      >
                        Read More
                      </button>
                    )}
                    <button
                      onClick={() => navigator.clipboard.writeText(note.content)}
                      className="text-green-600 hover:text-green-800 text-sm font-medium"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderAddNote = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Add New Note</h2>
        <form onSubmit={saveNote} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={newNote.title}
              onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Give your note a descriptive title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={newNote.type}
              onChange={(e) => setNewNote(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="template">Template</option>
              <option value="prompt">Prompt</option>
              <option value="reference">Reference</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              rows={12}
              value={newNote.content}
              onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter your template, prompt, or reference content..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={newNote.tags}
              onChange={(e) => setNewNote(prev => ({ ...prev, tags: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="ai, writing, template, prompt"
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Note'}
            </button>
            <button
              type="button"
              onClick={() => setCurrentView('notes')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Show login page if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <PenTool className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Inkridge</h1>
            <p className="text-gray-600 mb-6">
              Your Creative Workflow Companion for documenting your AI journey.
              Sign in with your Replit account to save your story seeds and generated content.
            </p>
            <button
              onClick={loginWithReplit}
              className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
            >
              <User className="w-5 h-5 mr-2" />
              Log in with Replit
            </button>
            <p className="text-xs text-gray-500 mt-4">
              We use Replit Auth to securely authenticate your account. Your data is stored safely and only accessible to you.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-50 flex"
      onClick={(e) => {
        if (!e.target.closest('.relative') && !e.target.closest('.sidebar')) {
          setShowProfileMenu(false);
          setShowActionMenu(false);
          setSidebarOpen(false);
        }
      }}
    >
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar fixed inset-y-0 left-0 z-50 bg-white shadow-lg transform transition-all duration-300 ease-in-out lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${
        sidebarCollapsed ? 'lg:w-16 w-16' : 'lg:w-64 w-64'
      } lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b">
            <div className="flex items-center">
              <h1 className={`text-xl font-bold text-purple-600 cursor-pointer transition-opacity duration-300 ${
                sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
              }`} onClick={() => setCurrentView('dashboard')}>
                Inkridge
              </h1>
              {sidebarCollapsed && (
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center cursor-pointer" onClick={() => setCurrentView('dashboard')}>
                  <span className="text-white text-sm font-bold">I</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:block p-2 rounded-md hover:bg-gray-100"
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <Menu className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <button
              onClick={() => {
                setCurrentView('dashboard');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                currentView === 'dashboard'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title={sidebarCollapsed ? 'Dashboard' : ''}
            >
              <BarChart3 className="w-5 h-5 mr-3 flex-shrink-0" />
              <span className={`transition-opacity duration-300 ${sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                Dashboard
              </span>
            </button>

            <button
              onClick={() => {
                setCurrentView('capture');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                currentView === 'capture'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title={sidebarCollapsed ? 'Capture Seeds' : ''}
            >
              <Plus className="w-5 h-5 mr-3 flex-shrink-0" />
              <span className={`transition-opacity duration-300 ${sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                Capture Seeds
              </span>
            </button>

            <button
              onClick={() => {
                setCurrentView('cowriter');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                currentView === 'cowriter'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title={sidebarCollapsed ? 'Co-Writer' : ''}
            >
              <PenTool className="w-5 h-5 mr-3 flex-shrink-0" />
              <span className={`transition-opacity duration-300 ${sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                Co-Writer
              </span>
            </button>

            <button
              onClick={() => {
                setCurrentView('notes');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                currentView === 'notes' || currentView === 'add-note'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title={sidebarCollapsed ? 'Notes' : ''}
            >
              <FileText className="w-5 h-5 mr-3 flex-shrink-0" />
              <span className={`transition-opacity duration-300 ${sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                Notes
              </span>
            </button>

            <button
              onClick={() => {
                setCurrentView('articles');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                currentView === 'articles'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title={sidebarCollapsed ? 'Articles' : ''}
            >
              <BookOpen className="w-5 h-5 mr-3 flex-shrink-0" />
              <span className={`transition-opacity duration-300 ${sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                Articles
              </span>
            </button>
          </nav>

          {/* Sidebar Footer */}
          <div className="px-4 py-4 border-t">
            <p className={`text-xs text-gray-500 text-center transition-opacity duration-300 ${
              sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
            }`}>
              Creative Workflow Companion
            </p>
          </div>
        </div>
      </div>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b">
            <div className="flex items-center">
              <h1 className={`text-xl font-bold text-purple-600 cursor-pointer transition-opacity duration-300 ${
                sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
              }`} onClick={() => setCurrentView('dashboard')}>
                Inkridge
              </h1>
              {sidebarCollapsed && (
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center cursor-pointer" onClick={() => setCurrentView('dashboard')}>
                  <span className="text-white text-sm font-bold">I</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:block p-2 rounded-md hover:bg-gray-100"
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <Menu className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <button
              onClick={() => {
                setCurrentView('dashboard');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                currentView === 'dashboard'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title={sidebarCollapsed ? 'Dashboard' : ''}
            >
              <BarChart3 className="w-5 h-5 mr-3 flex-shrink-0" />
              <span className={`transition-opacity duration-300 ${sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                Dashboard
              </span>
            </button>

            <button
              onClick={() => {
                setCurrentView('capture');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                currentView === 'capture'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title={sidebarCollapsed ? 'Capture Seeds' : ''}
            >
              <Plus className="w-5 h-5 mr-3 flex-shrink-0" />
              <span className={`transition-opacity duration-300 ${sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                Capture Seeds
              </span>
            </button>

            <button
              onClick={() => {
                setCurrentView('cowriter');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                currentView === 'cowriter'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title={sidebarCollapsed ? 'Co-Writer' : ''}
            >
              <PenTool className="w-5 h-5 mr-3 flex-shrink-0" />
              <span className={`transition-opacity duration-300 ${sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                Co-Writer
              </span>
            </button>

            <button
              onClick={() => {
                setCurrentView('notes');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                currentView === 'notes' || currentView === 'add-note'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title={sidebarCollapsed ? 'Notes' : ''}
            >
              <FileText className="w-5 h-5 mr-3 flex-shrink-0" />
              <span className={`transition-opacity duration-300 ${sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                Notes
              </span>
            </button>

            <button
              onClick={() => {
                setCurrentView('articles');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                currentView === 'articles'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title={sidebarCollapsed ? 'Articles' : ''}
            >
              <BookOpen className="w-5 h-5 mr-3 flex-shrink-0" />
              <span className={`transition-opacity duration-300 ${sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                Articles
              </span>
            </button>
          </nav>

          {/* Sidebar Footer */}
          <div className="px-4 py-4 border-t">
            <p className={`text-xs text-gray-500 text-center transition-opacity duration-300 ${
              sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
            }`}>
              Creative Workflow Companion
            </p>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Desktop Logo (hidden on mobile since it's in sidebar) */}
              <div className="hidden lg:flex items-center">
                <h1 className="text-xl font-bold text-purple-600 cursor-pointer" onClick={() => setCurrentView('dashboard')}>
                  Inkridge
                </h1>
                <span className="ml-2 text-sm text-gray-500">Creative Workflow Companion</span>
              </div>

              {/* User Profile */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm text-gray-700 font-medium">{user.name}</span>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg border py-2 z-50">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">Signed in with Replit</p>
                    </div>

                    <button
                      onClick={() => {
                        logout();
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 overflow-auto">
        {currentView === 'dashboard' && renderDashboard()}
          {currentView === 'capture' && renderCapture()}
          {currentView === 'cowriter' && renderCoWriter()}
          {currentView === 'notes' && renderNotes()}
          {currentView === 'add-note' && renderAddNote()}
          {currentView === 'articles' && renderArticles()}
        </main>
      </div>

      {/* Edit Note Modal */}
      {editingNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Edit Note</h2>
              <form onSubmit={updateNote} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editNote.title}
                    onChange={(e) => setEditNote(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Give your note a descriptive title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={editNote.type}
                    onChange={(e) => setEditNote(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="template">Template</option>
                    <option value="prompt">Prompt</option>
                    <option value="reference">Reference</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                  </label>
                  <textarea
                    rows={12}
                    value={editNote.content}
                    onChange={(e) => setEditNote(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter your template, prompt, or reference content..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editNote.tags}
                    onChange={(e) => setEditNote(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="ai, writing, template, prompt"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Updating...' : 'Update Note'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingNote(null);
                      setEditNote({ title: '', content: '', type: 'template', tags: '' });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {noteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{noteModal.title}</h2>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      noteModal.type === 'template' ? 'bg-blue-100 text-blue-800' :
                      noteModal.type === 'prompt' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {noteModal.type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(noteModal.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setNoteModal(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl ml-4"
                >
                  ×
                </button>
              </div>

              <div className="prose max-w-none mb-6">
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {noteModal.content}
                </div>
              </div>

              {noteModal.tags && (
                <div className="mb-6 flex flex-wrap gap-2">
                  {noteModal.tags.split(',').map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded flex items-center"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center">
                <button
                  onClick={() => navigator.clipboard.writeText(noteModal.content)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Copy Content
                </button>
                <button
                  onClick={() => setNoteModal(null)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      {currentView === 'dashboard' && (
        <div className="fixed bottom-8 right-8 z-50">
          <button
            onClick={() => setShowActionMenu(!showActionMenu)}
            className="w-16 h-16 rounded-full bg-purple-600 text-white shadow-lg flex items-center justify-center hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-8 h-8" />
          </button>

          {showActionMenu && (
            <div className="absolute bottom-20 right-0 space-y-4">
              <button
                onClick={() => {
                  setCurrentView('capture');
                  setShowActionMenu(false);
                }}
                className="flex items-center p-3 rounded-lg bg-white shadow-md hover:bg-gray-100 transition-colors"
              >
                <Plus className="w-5 h-5 text-purple-600 mr-2" />
                <span className="text-gray-800 font-medium">Capture Seeds</span>
              </button>
              <button
                onClick={() => {
                  setCurrentView('add-note');
                  setShowActionMenu(false);
                }}
                className="flex items-center p-3 rounded-lg bg-white shadow-md hover:bg-gray-100 transition-colors"
              >
                <FileText className="w-5 h-5 text-purple-600 mr-2" />
                <span className="text-gray-800 font-medium">Add Note</span>
              </button>
              <button
                onClick={() => {
                  setSelectedSeed(null);
                  setGeneratedTitles([]);
                  setSelectedTitle('');
                  setPillarQuestions([]);
                  setAnswers({});
                  setSelectedQuestions({}); // Reset selected questions
                  setGeneratedContent('');
                  setCurrentView('cowriter');
                  setShowActionMenu(false);
                }}
                className="flex items-center p-3 rounded-lg bg-white shadow-md hover:bg-gray-100 transition-colors"
              >
                <PenTool className="w-5 h-5 text-purple-600 mr-2" />
                <span className="text-gray-800 font-medium">Co-Writer</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;