import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { NativeDashboard } from './components/NativeDashboard';
import { ExactNativeDashboard } from './components/ExactNativeDashboard';
import './App.css';

const App = () => {
  const [view, setView] = useState<'flexlayout' | 'native' | 'exact-native'>('exact-native');

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      {/* Global Application Header with Toggle */}
      <div className="h-14 bg-[#1e293b] text-white flex items-center px-6 justify-between shrink-0 shadow-md relative z-50">
        <div className="font-bold text-lg flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white">
            W
          </div>
          <span>WidgetPOC</span>
        </div>
        
        {/* Toggle Switch */}
        <div className="flex bg-slate-800 p-1 rounded-md border border-slate-700">
          <button
            onClick={() => setView('flexlayout')}
            className={`px-4 py-1.5 text-sm font-medium rounded-sm transition-colors ${
              view === 'flexlayout' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            FlexLayout React
          </button>
          <button
            onClick={() => setView('native')}
            className={`px-4 py-1.5 text-sm font-medium rounded-sm transition-colors ${
              view === 'native' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            Native Grid
          </button>
          <button
            onClick={() => setView('exact-native')}
            className={`px-4 py-1.5 text-sm font-medium rounded-sm transition-colors ${
              view === 'exact-native' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            FlexLayout Simulator (Native)
          </button>
        </div>
      </div>

      {/* Renders the injected component */}
      <div className="flex-1 relative overflow-hidden bg-zinc-100">
         {view === 'flexlayout' && <Dashboard />}
         {view === 'native' && <NativeDashboard />}
         {view === 'exact-native' && <ExactNativeDashboard />}
      </div>
    </div>
  );
};

export default App;
