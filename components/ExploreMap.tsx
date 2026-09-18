
import React, { useState, useRef, useMemo } from 'react';
import { Category } from '../types';
import { CATEGORY_COLORS, ICONS, DUMMY_MEMBERSHIPS } from '../constants';
import InfographicLines from './InfographicLines';

const BUBBLES = [
  { id: '1', name: 'fy sage', category: Category.SPA, x: 25, y: 25, size: 80 },
  { id: '2', name: 'profile', category: Category.GYM, x: 70, y: 20, size: 80 },
  { id: '3', name: 'ccmuseo', category: Category.LIBRARY, x: 45, y: 55, size: 80 },
  { id: '4', name: 'cconsort', category: Category.SCENTS, x: 75, y: 70, size: 80 },
  { id: '5', name: 'Nearby Offers', category: Category.GYM, x: 15, y: 75, size: 80 }, // This is the "trigger" bubble
];

const LINKTREE_DATA: Record<string, { label: string; sub: string; icon: string }[]> = {
  '1': [
    { label: 'Thermal Circuits', sub: 'Unlock 40% discount', icon: 'fa-hot-tub-person' },
    { label: 'Aromatherapy Vault', sub: 'Member exclusive', icon: 'fa-wind' },
    { label: 'Partner Match', sub: '1/2 Joined', icon: 'fa-user-group' },
    { label: 'Luxury Retreats', sub: 'View Locations', icon: 'fa-map-pin' },
  ],
  '2': [
    { label: 'Performance Lab', sub: 'AI Coaching', icon: 'fa-microchip' },
    { label: 'Global Access', sub: '500+ Gyms', icon: 'fa-globe' },
    { label: 'Duo Membership', sub: 'Waiting for partner', icon: 'fa-lock' },
    { label: 'Protein Lounge', sub: 'Member menu', icon: 'fa-bottle-water' },
  ],
  '3': [
    { label: 'First Editions', sub: 'Rare collection', icon: 'fa-book' },
    { label: 'Reading Sentiment', sub: 'AI analytics', icon: 'fa-brain' },
    { label: 'To Let List', sub: '3 available', icon: 'fa-hand-holding' },
    { label: 'Public View', sub: 'Share vault', icon: 'fa-eye' },
  ],
  '4': [
    { label: 'Vintage Spritz', sub: 'Rare finds', icon: 'fa-flask' },
    { label: 'Fragrance Map', sub: 'Scent profile', icon: 'fa-dna' },
    { label: 'The Countertop', sub: 'Video Catalog', icon: 'fa-video' },
    { label: 'Trade Lounge', sub: 'Swap items', icon: 'fa-rotate' },
  ],
};

const ExploreMap: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleBubbleClick = (id: string) => {
    setSelectedId(selectedId === id ? null : id);
  };

  const targets = useMemo(() => BUBBLES.map(b => ({
    x: (b.x / 100) * (containerRef.current?.clientWidth || window.innerWidth),
    y: (b.y / 100) * (containerRef.current?.clientHeight || window.innerHeight)
  })), []);

  const showLines = selectedId === '5';
  const isSplitView = selectedId && selectedId !== '5';
  const currentBubble = BUBBLES.find(b => b.id === selectedId);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-[85vh] overflow-hidden rounded-3xl mt-24 border transition-all duration-1000 mx-auto max-w-7xl cursor-crosshair ${
        showLines ? 'bg-[#0a0a1a]' : 'bg-[#050505]'
      } border-white/5`}
      onMouseMove={handleMouseMove}
    >
      {/* Auto Maps Enhanced Background - only visible when selectedId === '5' */}
      <div className={`absolute inset-0 opacity-40 transition-opacity duration-1000 pointer-events-none ${showLines ? 'opacity-30' : 'opacity-0'}`}>
        <img 
          src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=2000" 
          className="w-full h-full object-cover grayscale invert contrast-125 mix-blend-overlay"
          alt="Map Background"
        />
      </div>

      <div className={`absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]`}></div>
      
      {/* Background Gantt Grid */}
      <div className="absolute inset-0 grid grid-cols-12 pointer-events-none opacity-5">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="border-r border-white/20 h-full flex items-end p-4">
            <span className="text-[10px] uppercase">Q{Math.floor(i/3)+1}</span>
          </div>
        ))}
      </div>

      <InfographicLines origin={mousePos} targets={targets} active={showLines} />

      <div className={`relative w-full h-full flex transition-all duration-700 ${isSplitView ? 'translate-x-0' : ''}`}>
        
        {/* Left Side (Map/Bubble Area) */}
        <div className={`relative transition-all duration-1000 h-full ${isSplitView ? 'w-1/2' : 'w-full'}`}>
          {BUBBLES.map((bubble) => {
            const isSelected = selectedId === bubble.id;
            const isVisible = !selectedId || isSelected || selectedId === '5';

            return (
              <div
                key={bubble.id}
                onClick={() => handleBubbleClick(bubble.id)}
                className={`absolute transition-all duration-1000 bubble-hover cursor-pointer ${!isVisible ? 'opacity-20 scale-75' : 'opacity-100'} ${isSelected && !showLines ? 'z-50' : 'z-10'} ${!isSelected ? 'float-anim' : ''}`}
                style={{
                  left: isSelected && isSplitView ? '50%' : `${bubble.x}%`,
                  top: isSelected && isSplitView ? '50%' : `${bubble.y}%`,
                  transform: isSelected && isSplitView ? 'translate(-50%, -50%) scale(1.5)' : '',
                  width: `${bubble.size}px`,
                  height: `${bubble.size}px`,
                }}
              >
                <div className={`w-full h-full rounded-full glass border p-2 flex flex-col items-center justify-center text-center group ${CATEGORY_COLORS[bubble.category]} ${isSelected ? 'ring-2 ring-white/20' : ''}`}>
                  <div className="text-2xl group-hover:scale-125 transition-transform duration-300">
                    {ICONS[bubble.category]}
                  </div>
                  <h3 className="serif text-[8px] font-bold tracking-widest leading-none mt-1 opacity-90 uppercase whitespace-nowrap px-1">
                    {bubble.name}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side (Linktree Interface) */}
        <div className={`relative h-full transition-all duration-1000 overflow-y-auto px-12 py-20 bg-black/40 backdrop-blur-xl border-l border-white/10 ${isSplitView ? 'w-1/2 translate-x-0 opacity-100' : 'w-0 translate-x-full opacity-0 pointer-events-none'}`}>
          {selectedId && LINKTREE_DATA[selectedId] && (
            <div className="max-w-md mx-auto space-y-6">
              <div className="mb-12 text-center">
                <div className={`w-16 h-16 rounded-full mx-auto mb-4 glass border flex items-center justify-center text-2xl ${CATEGORY_COLORS[currentBubble?.category || Category.SPA]}`}>
                  {ICONS[currentBubble?.category || Category.SPA]}
                </div>
                <h2 className="serif text-3xl mb-2">{currentBubble?.name}</h2>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Vault Directory</p>
              </div>

              {LINKTREE_DATA[selectedId].map((link, idx) => (
                <button 
                  key={idx}
                  className="w-full glass border-white/10 hover:border-white/30 p-5 rounded-2xl flex items-center gap-6 group transition-all hover:translate-x-2"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                    <i className={`fa-solid ${link.icon} text-lg text-gray-300 group-hover:text-white`}></i>
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-sm tracking-wide text-gray-200">{link.label}</h4>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">{link.sub}</p>
                  </div>
                  <i className="fa-solid fa-chevron-right ml-auto text-xs text-gray-600 group-hover:text-white"></i>
                </button>
              ))}

              <button 
                onClick={() => setSelectedId(null)}
                className="w-full mt-12 text-[10px] uppercase tracking-[0.4em] text-gray-600 hover:text-white transition-colors"
              >
                Close Directory
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Center Prompt / Status */}
      <div className={`absolute bottom-12 left-1/2 -translate-x-1/2 text-center pointer-events-none transition-opacity duration-500 ${selectedId ? 'opacity-0' : 'opacity-100'}`}>
        <p className="text-gray-500 uppercase tracking-[0.4em] text-xs">Interact with bubbles to dive deeper</p>
        <h2 className="serif text-3xl mt-2">on cloud wellness</h2>
      </div>

      {showLines && (
        <div className="absolute top-32 left-12 glass p-4 rounded-xl border-amber-500/30 animate-pulse">
           <p className="text-[10px] uppercase font-bold text-amber-400">Auto Maps Enhanced</p>
           <p className="text-[9px] text-gray-400">Discovering nearby membership pairings...</p>
        </div>
      )}
    </div>
  );
};

export default ExploreMap;
