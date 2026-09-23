import React, { useState } from 'react';
import { Category } from '../types';
import { CATEGORY_COLORS, ICONS } from '../constants';

const bubbles = [
  { name: 'inhabit', category: Category.SPA, x: 20, y: 20 },
  { name: 'profile', category: Category.GYM, x: 68, y: 16 },
  { name: 'ccavings', category: Category.LIBRARY, x: 43, y: 45 },
  { name: 'concierge', category: Category.SCENTS, x: 70, y: 70 },
  { name: 'Nearby Offers', category: Category.GYM, x: 15, y: 70 },
];
const links: Record<string, { label: string; sub: string; route: string; icon: string }[]> = {
  inhabit: [
    { label: 'Thermal Circuits', sub: 'Explore spa plans', route: 'discover/SPA', icon: 'fa-hot-tub-person' },
    { label: 'Aromatherapy Vault', sub: 'Your fragrance collection', route: 'collection/SCENTS', icon: 'fa-wind' },
    { label: 'Partner Plans', sub: 'Browse sample memberships', route: 'discover/SPA', icon: 'fa-user-group' },
    { label: 'Luxury Retreats', sub: 'Search locations', route: 'discover/SPA', icon: 'fa-map-pin' },
  ],
  profile: [
    { label: 'Your Profile', sub: 'Update your name and location', route: 'profile', icon: 'fa-user' },
    { label: 'Gym Directory', sub: 'Explore fitness plans', route: 'discover/GYM', icon: 'fa-dumbbell' },
    { label: 'Saved Plans', sub: 'Manage your interests', route: 'discover/saved', icon: 'fa-bookmark' },
  ],
  ccavings: [
    { label: 'Your Library', sub: 'Books and reading progress', route: 'collection/LIBRARY', icon: 'fa-book' },
    { label: 'Reading Ratings', sub: 'Rate your collection', route: 'collection/LIBRARY', icon: 'fa-star' },
    { label: 'To Let List', sub: 'Items available to lend', route: 'collection/LIBRARY/to-let', icon: 'fa-hand-holding' },
    { label: 'Collection Preview', sub: 'Browse your vault', route: 'collection/LIBRARY/preview', icon: 'fa-eye' },
  ],
  concierge: [
    { label: 'Fragrance Vault', sub: 'Track your scents', route: 'collection/SCENTS', icon: 'fa-flask' },
    { label: 'The Countertop', sub: 'Collection slideshow', route: 'collection/SCENTS/preview', icon: 'fa-video' },
    { label: 'To Let List', sub: 'Scents available to lend', route: 'collection/SCENTS/to-let', icon: 'fa-rotate' },
  ],
};
export default function ExploreMap({ onNavigate, onProfile }: { onNavigate: (route: string) => void; onProfile: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const current = bubbles.find(b => b.name === selected);
  return <div className="relative w-full max-w-7xl min-h-[600px] h-[80vh] rounded-3xl mt-24 border border-white/10 bg-[#050505] overflow-hidden">
    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#6ee7b7 1px, transparent 1px), linear-gradient(90deg, #6ee7b7 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
    <div className={`relative h-full transition-all ${selected ? 'hidden md:block md:w-1/2' : 'w-full'}`}>
      {bubbles.map(bubble => <button key={bubble.name} aria-label={bubble.name} aria-expanded={selected === bubble.name}
        onClick={() => bubble.name === 'Nearby Offers' ? onNavigate('discover') : setSelected(selected === bubble.name ? null : bubble.name)}
        className={`absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full glass border flex flex-col items-center justify-center gap-2 bubble-hover transition-transform ${CATEGORY_COLORS[bubble.category]} ${selected === bubble.name ? 'ring-2 ring-white/40' : ''}`}
        style={{ left: `${bubble.x}%`, top: `${bubble.y}%`, transform: 'translate(-50%, -50%)' }}>
        <span className="text-2xl">{ICONS[bubble.category]}</span><span className="text-[10px] font-bold">{bubble.name}</span>
      </button>)}
      {!selected && <div className="absolute bottom-7 w-full text-center px-4 pointer-events-none"><p className="text-gray-500 uppercase tracking-widest text-xs">Choose a bubble to explore</p><h1 className="serif text-3xl mt-2">on cloud wellness</h1></div>}
    </div>
    {current && <section aria-label={`${current.name} directory`} className="absolute right-0 top-0 h-full w-full md:w-1/2 overflow-y-auto bg-black/80 backdrop-blur-xl border-l border-white/10 p-6 sm:p-10">
      <button onClick={() => setSelected(null)} className="text-sm text-gray-400 hover:text-white mb-6">&larr; Back to map</button>
      <div className="text-center mb-8"><div className={`w-16 h-16 rounded-full mx-auto mb-4 border flex items-center justify-center text-2xl ${CATEGORY_COLORS[current.category]}`}>{ICONS[current.category]}</div><h2 className="serif text-3xl">{current.name}</h2><p className="text-xs uppercase tracking-widest text-gray-500 mt-2">Vault directory</p></div>
      <div className="space-y-4">{links[current.name].map(link => <button key={link.label} onClick={() => link.route === 'profile' ? onProfile() : onNavigate(link.route)} className="w-full glass hover:bg-white/10 p-4 rounded-2xl flex items-center gap-4 text-left"><i className={`fa-solid ${link.icon} text-teal-400 w-8 text-center`} /><span className="flex-1"><span className="block font-semibold text-sm">{link.label}</span><span className="text-xs text-gray-400">{link.sub}</span></span><span aria-hidden="true">&rarr;</span></button>)}</div>
    </section>}
  </div>;
}
