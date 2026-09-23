import React, { useEffect, useState } from 'react';
import { gemini } from '../services/gemini';
import { Category, MembershipItem } from '../types';
import { DUMMY_MEMBERSHIPS, CATEGORY_COLORS } from '../constants';
import { Profile } from '../services/storage';
import Modal from './Modal';

interface Props { route: string; profile: Profile; joined: string[]; setJoined: React.Dispatch<React.SetStateAction<string[]>>; notify: (text: string) => void }
export default function DiscoverView({ route, profile, joined, setJoined, notify }: Props) {
  const [location, setLocation] = useState(profile.location);
  useEffect(() => setLocation(profile.location), [profile.location]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [savedOnly, setSavedOnly] = useState(false);
  const [selected, setSelected] = useState<MembershipItem | null>(null);
  const [recommendations, setRecommendations] = useState<{ text: string; sources: { title: string; uri: string }[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { const filter = route.split('/')[1]; setCategory(filter === Category.SPA || filter === Category.GYM ? filter : 'all'); setSavedOnly(filter === 'saved'); }, [route]);
  const results = DUMMY_MEMBERSHIPS.filter(m => (category === 'all' || m.category === category) && (!savedOnly || joined.includes(m.id)) && `${m.name} ${m.location} ${m.description}`.toLowerCase().includes(query.trim().toLowerCase()));
  const search = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setRecommendations(null);
    if (!location.trim()) { setError('Enter a city or neighborhood to search.'); return; }
    if (!gemini.isConfigured) { setError('Live AI discovery is not configured. Browse the sample plans below or open your location in Maps.'); return; }
    setLoading(true);
    try { setRecommendations(await gemini.findMembershipsNear(location.trim(), category === 'all' ? 'spa and gym' : category)); }
    catch { setError('Live search is unavailable right now. Try again or use the Maps link.'); }
    finally { setLoading(false); }
  };
  return <div className="max-w-7xl mx-auto mt-28 px-2 sm:px-6 pb-10">
    <h1 className="serif text-4xl sm:text-5xl mb-4">cc directory</h1><p className="text-gray-400 mb-8">Explore wellness memberships and save the plans that interest you.</p>
    <form onSubmit={search} className="glass rounded-2xl p-5 flex flex-wrap items-end gap-4 mb-8">
      <label className="flex-1 min-w-[180px] text-sm">Your location<input className="field mt-2" placeholder="e.g. Lagos or London" value={location} onChange={e => setLocation(e.target.value)} maxLength={120} /></label>
      <label className="text-sm">Category<select aria-label="Category" className="field mt-2" value={category} onChange={e => { setCategory(e.target.value); setRecommendations(null); }}><option value="all">All memberships</option><option value={Category.SPA}>Spa / fy sage</option><option value={Category.GYM}>Gym / profile</option></select></label>
      <button disabled={loading} className="primary disabled:opacity-50">{loading ? 'Searching...' : 'Search nearby'}</button>
      <a className="px-4 py-3 rounded-xl border border-white/20 hover:bg-white/10" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${category === Category.SPA ? 'spas' : category === Category.GYM ? 'gyms' : 'wellness'} ${location.trim() || profile.location || 'near me'}`)}`} target="_blank" rel="noreferrer">Open Maps &#8599;</a>
    </form>
    {error && <p role="alert" className="p-4 mb-6 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200">{error}</p>}
    {recommendations && <section className="glass p-6 rounded-2xl mb-8"><h2 className="serif text-2xl mb-4">Nearby recommendations</h2><p className="whitespace-pre-wrap text-gray-300">{recommendations.text}</p><div className="flex flex-wrap gap-3 mt-4">{recommendations.sources.map((s, i) => <a key={i} href={s.uri} target="_blank" rel="noreferrer" className="text-teal-300 underline">{s.title}</a>)}</div></section>}
    <div className="grid md:grid-cols-3 gap-6">
      <section className="md:col-span-2">
        <div className="flex flex-wrap items-center gap-4 mb-4"><h2 className="serif text-2xl flex-1">Sample plans</h2><label className="flex gap-2 text-sm items-center"><input type="checkbox" className="accent-amber-500" checked={savedOnly} onChange={e => setSavedOnly(e.target.checked)} />Saved only ({joined.length})</label></div>
        <input aria-label="Filter sample plans" className="field mb-5" placeholder="Filter by name, neighborhood, or description" value={query} onChange={e => setQuery(e.target.value)} />
        <div className="grid sm:grid-cols-2 gap-6">{results.map(m => <article key={m.id} className="glass rounded-2xl p-6 border-l-4 border-purple-500">
          <div className="flex justify-between gap-2 mb-4"><span className={`px-2 py-1 rounded text-xs font-bold ${CATEGORY_COLORS[m.category]}`}>{m.category}</span><span className="text-purple-300">{m.price}</span></div>
          <h3 className="serif text-xl mb-2">{m.name}</h3><p className="text-xs text-gray-400 mb-3">{m.location}</p><p className="text-sm text-gray-400 mb-5">{m.description}</p>
          <div className="bg-black/30 p-4 rounded-xl mb-4"><p className="text-xs mb-2">Sample partner availability: {m.joinedCount}/{m.totalNeeded}</p><div className="h-1.5 rounded bg-white/10"><div className="bg-purple-500 h-full rounded" style={{ width: `${m.joinedCount / m.totalNeeded * 100}%` }} /></div></div>
          <button onClick={() => setSelected(m)} className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 font-semibold">{joined.includes(m.id) ? 'Manage saved plan' : 'View plan'}</button>
        </article>)}</div>
        {!results.length && <div className="glass rounded-2xl p-10 text-center"><p className="text-gray-400 mb-4">No plans match these filters.</p><button onClick={() => { setQuery(''); setCategory('all'); setSavedOnly(false); }} className="text-amber-300 underline">Show all plans</button></div>}
      </section>
      <aside className="glass p-6 rounded-2xl h-fit"><h2 className="serif text-xl mb-4">How it works</h2><p className="text-sm text-gray-400 leading-relaxed">These sample listings let you explore partner plans. Saving a plan records your interest in this browser. It does not book a membership or take payment.</p><p className="text-sm text-gray-400 mt-4">Use Maps to find actual providers near your location and confirm their current availability and prices.</p><p className="text-teal-300 text-sm mt-6">{joined.length} plan{joined.length === 1 ? '' : 's'} saved</p></aside>
    </div>
    {selected && <Modal title={selected.name} onClose={() => setSelected(null)}><p className="text-purple-300 mb-3">{selected.price} · {selected.location}</p><p className="text-gray-300 mb-4">{selected.description}</p><p className="text-sm text-gray-400 mb-6">Sample plan. Save your interest to revisit it later. No booking or payment will be made.</p><button className="primary w-full" onClick={() => { const exists = joined.includes(selected.id); setJoined(prev => exists ? prev.filter(id => id !== selected.id) : [...new Set([...prev, selected.id])]); notify(exists ? 'Plan removed from saved memberships.' : 'Membership plan saved.'); setSelected(null); }}>{joined.includes(selected.id) ? 'Remove saved plan' : 'Save my interest'}</button></Modal>}
  </div>;
}
