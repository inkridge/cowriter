
import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, PenTool, BarChart3, Sprout } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [seeds, setSeeds] = useState([]);

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
                <div key={seed.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
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
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">AI Co-Writer</h2>
        <div className="text-center py-12">
          <PenTool className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Write</h3>
          <p className="text-gray-600 mb-6">Select a seed to start the co-writing process</p>
          <button
            onClick={() => setCurrentView('dashboard')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Choose a Seed
          </button>
        </div>
      </div>
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
