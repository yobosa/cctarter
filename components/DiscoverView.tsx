
import React, { useState } from 'react';
import { gemini } from '../services/gemini';
import { Category, MembershipItem } from '../types';
import { DUMMY_MEMBERSHIPS, CATEGORY_COLORS } from '../constants';

const DiscoverView: React.FC = () => {
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<Category>(Category.SPA);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await gemini.findMembershipsNear(location || 'San Francisco', category);
      setResults(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-28 px-6 pb-20">
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <div className="flex-1">
          <h1 className="serif text-5xl mb-4">Elite Directory</h1>
          <p className="text-gray-400 max-w-xl">Find premium fy sage and profile memberships. Unlock exclusive couples discounts by matching with a partner.</p>
        </div>
        
        <div className="glass p-6 rounded-2xl flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full">
            <label className="text-xs uppercase tracking-widest text-purple-400 font-bold mb-2 block">Your Location</label>
            <input 
              type="text" 
              placeholder="e.g. Mayfair, London"
              className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-purple-500/50"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="w-full">
            <label className="text-xs uppercase tracking-widest text-purple-400 font-bold mb-2 block">Category</label>
            <select 
              className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 w-full focus:outline-none"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
            >
              <option value={Category.SPA}>fy sage</option>
              <option value={Category.GYM}>profile</option>
            </select>
          </div>
          <button 
            onClick={handleSearch}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-8 rounded-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Curated Listings */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {(results ? [] : DUMMY_MEMBERSHIPS).map((m) => (
            <div key={m.id} className="glass rounded-2xl p-6 border-l-4 border-purple-500 hover:glow-gold transition-all">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${CATEGORY_COLORS[m.category]}`}>
                  {m.category}
                </span>
                <span className="text-purple-400 font-bold">{m.price}</span>
              </div>
              <h3 className="serif text-xl mb-1">{m.name}</h3>
              <p className="text-xs text-gray-400 mb-4"><i className="fa-solid fa-location-dot mr-1"></i> {m.location}</p>
              
              <div className="bg-black/30 rounded-xl p-4 mb-4">
                <div className="flex justify-between text-xs mb-2">
                  <span>Couples Unlock</span>
                  <span className="text-purple-400 font-bold">{m.joinedCount}/{m.totalNeeded} Filled</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-purple-500 h-full transition-all duration-1000" 
                    style={{ width: `${(m.joinedCount/m.totalNeeded)*100}%` }}
                  ></div>
                </div>
              </div>

              <button className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-semibold transition-all">
                {m.joinedCount === 1 ? 'Complete Plan to Unlock' : 'Join and Wait for Partner'}
              </button>
            </div>
          ))}

          {results && (
            <div className="col-span-full glass p-8 rounded-2xl">
              <h2 className="serif text-2xl mb-4">Gemini Intelligence: Nearby Recommendations</h2>
              <div className="prose prose-invert max-w-none text-gray-300">
                {results.text}
              </div>
              {results.sources && results.sources.length > 0 && (
                <div className="mt-8 pt-8 border-t border-white/10">
                  <h4 className="text-xs uppercase tracking-widest text-purple-400 mb-4">Verified Sources</h4>
                  <div className="flex flex-wrap gap-4">
                    {results.sources.map((src: any, i: number) => (
                      <a 
                        key={i} 
                        href={src.googleSearch?.uri || src.googleMaps?.uri} 
                        target="_blank" 
                        rel="noreferrer"
                        className="glass px-4 py-2 rounded-full text-xs hover:bg-purple-500/20 transition-all flex items-center gap-2"
                      >
                        <i className="fa-solid fa-link"></i>
                        {src.googleSearch?.title || src.googleMaps?.title || 'External Source'}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar for Map / Legend */}
        <div className="glass rounded-2xl p-6 h-fit sticky top-28">
          <h3 className="serif text-lg mb-4">Plan Benefits</h3>
          <ul className="space-y-4 text-sm text-gray-400">
            <li className="flex gap-3">
              <i className="fa-solid fa-check text-purple-400 mt-1"></i>
              <span>Save up to 40% on annual fees with a partner.</span>
            </li>
            <li className="flex gap-3">
              <i className="fa-solid fa-check text-purple-400 mt-1"></i>
              <span>One person joins, plan unlocks when the second pays.</span>
            </li>
            <li className="flex gap-3">
              <i className="fa-solid fa-check text-purple-400 mt-1"></i>
              <span>Instant AI-driven discovery of nearby retreats.</span>
            </li>
          </ul>
          
          <div className="mt-8 pt-8 border-t border-white/10">
            <div className="aspect-square bg-white/5 rounded-xl flex items-center justify-center text-center p-6 italic text-gray-500 border border-dashed border-white/20">
              Interactive Map Module Loading...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscoverView;
