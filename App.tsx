
import React, { useState } from 'react';
import { GameView } from './types';
import PlayView from './views/Play';
import TutorView from './views/Tutor';
import OpeningsView from './views/Openings';
import { Layout, ShieldCheck, GraduationCap, Map } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<GameView>(GameView.PLAY);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-zinc-950">
      {/* Sidebar Navigation */}
      <nav className="w-full md:w-64 bg-zinc-900 border-r border-zinc-800 p-6 flex md:flex-col gap-4 md:gap-2 shrink-0">
        <div className="hidden md:flex items-center gap-2 mb-8">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
             <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">ChessPro</h1>
        </div>

        <button
          onClick={() => setActiveTab(GameView.PLAY)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
            activeTab === GameView.PLAY ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
          }`}
        >
          <Layout className="w-5 h-5" />
          <span className="font-medium">Jogar</span>
        </button>

        <button
          onClick={() => setActiveTab(GameView.TUTOR)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
            activeTab === GameView.TUTOR ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
          }`}
        >
          <GraduationCap className="w-5 h-5" />
          <span className="font-medium">Tutor</span>
        </button>

        <button
          onClick={() => setActiveTab(GameView.OPENINGS)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
            activeTab === GameView.OPENINGS ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
          }`}
        >
          <Map className="w-5 h-5" />
          <span className="font-medium">Aberturas</span>
        </button>

        <div className="mt-auto hidden md:block pt-6 border-t border-zinc-800">
          <p className="text-xs text-zinc-500 font-medium px-4">XADREZ ENGINE v1.0</p>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 flex flex-col items-center">
        <div className="w-full max-w-6xl flex flex-col gap-8">
          {activeTab === GameView.PLAY && <PlayView />}
          {activeTab === GameView.TUTOR && <TutorView />}
          {activeTab === GameView.OPENINGS && <OpeningsView />}
        </div>
      </main>
    </div>
  );
};

export default App;
