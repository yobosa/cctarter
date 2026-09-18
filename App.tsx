
import React, { useState } from 'react';
import Header from './components/Header';
import ExploreMap from './components/ExploreMap';
import DiscoverView from './components/DiscoverView';
import CollectionView from './components/CollectionView';

type View = 'explore' | 'discover' | 'collection';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('explore');

  return (
    <div className="min-h-screen relative pb-20">
      <Header onNavigate={setActiveView} activeView={activeView} />
      
      <main className="px-4">
        {activeView === 'explore' && (
          <div className="flex flex-col items-center">
             <ExploreMap />
             <div className="mt-12 max-w-4xl text-center px-6">
                <h2 className="serif text-4xl mb-6">wellness bud here</h2>
                <p className="text-gray-400 leading-relaxed text-lg">
                  when they go low cc us. life is about healthy management so today you can pace your wellness via alternatives. experience the synergy of cc discovery.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
                   <div className="p-6 glass rounded-2xl border-t-2 border-purple-500/50">
                      <i className="fa-solid fa-users-viewfinder text-purple-400 text-2xl mb-4"></i>
                      <h4 className="font-bold mb-2">Couples Unlock</h4>
                      <p className="text-xs text-gray-500">Join fy sage and profile at a fraction of the cost by pairing with peers.</p>
                   </div>
                   <div className="p-6 glass rounded-2xl border-t-2 border-slate-500/50">
                      <i className="fa-solid fa-microchip text-slate-400 text-2xl mb-4"></i>
                      <h4 className="font-bold mb-2">AI library</h4>
                      <p className="text-xs text-gray-500">Snap a photo of your shelves; our AI catalogs every title and bottle instantly with recommendations and reviews scraped from online.</p>
                   </div>
                   <div className="p-6 glass rounded-2xl border-t-2 border-teal-500/50">
                      <i className="fa-solid fa-video text-teal-400 text-2xl mb-4"></i>
                      <h4 className="font-bold mb-2">Cinematic Vault</h4>
                      <p className="text-xs text-gray-500">For previewing other rooms you're yet to access.</p>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeView === 'discover' && <DiscoverView />}
        
        {activeView === 'collection' && <CollectionView />}
      </main>

      {/* Footer Branding */}
      <footer className="mt-20 py-12 border-t border-white/5 text-center text-[10px] uppercase tracking-[0.5em] text-gray-600">
        &copy; {new Date().getFullYear()} CCLO TECHNOLOGIES • POWERED BY GEMINI INTELLIGENCE
      </footer>
    </div>
  );
};

export default App;
