import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import ExploreMap from './components/ExploreMap';
import DiscoverView from './components/DiscoverView';
import CollectionView from './components/CollectionView';
import Modal from './components/Modal';
import { CollectionItem } from './types';
import { isCollection, isIds, isProfile, Profile, useStoredState } from './services/storage';

const getRoute = () => window.location.hash.slice(1) || 'explore';
const App: React.FC = () => {
  const [route, setRoute] = useState(getRoute);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile, profileError] = useStoredState<Profile>('cclo-profile', { name: '', location: '' }, isProfile);
  const [items, setItems, itemsError] = useStoredState<CollectionItem[]>('cclo-vault', [], isCollection);
  const [joined, setJoined, joinedError] = useStoredState<string[]>('cclo-memberships', [], isIds);
  const [notice, setNotice] = useState('');
  const activeView = route.split('/')[0];
  const navigate = (next: string) => { window.location.hash = next; };
  useEffect(() => {
    const onHash = () => { setRoute(getRoute()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  useEffect(() => {
    if (!['explore', 'discover', 'collection'].includes(activeView)) navigate('explore');
  }, [activeView]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  return <div className="min-h-screen relative pb-12">
    <Header onNavigate={navigate} activeView={activeView} onProfile={() => setProfileOpen(true)} />
    {(profileError || itemsError || joinedError) && <p role="alert" className="mt-24 mx-6 p-4 bg-rose-950 text-rose-200 rounded-xl">{profileError || itemsError || joinedError}</p>}
    <main className="px-4">
      {activeView === 'explore' && <div className="flex flex-col items-center">
        <ExploreMap onNavigate={navigate} onProfile={() => setProfileOpen(true)} />
        <div className="mt-12 max-w-4xl text-center px-2 sm:px-6">
          <h2 className="serif text-4xl mb-6">easy breezy tracking</h2>
          <p className="text-gray-400 leading-relaxed text-lg">Make room for what you love. Discover wellness memberships and keep your books and fragrances together in a personal vault.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {[
              { title: 'Couples Unlock', icon: 'fa-users-viewfinder', text: 'Explore sample membership plans and save your interest.', route: 'discover' },
              { title: 'Your library', icon: 'fa-book', text: 'Add books, track your reading, and rate your favorites.', route: 'collection/LIBRARY' },
              { title: 'Cinematic Vault', icon: 'fa-video', text: 'Browse a slideshow of the collection you have curated.', route: 'collection/LIBRARY/preview' },
            ].map(card => <button key={card.title} onClick={() => navigate(card.route)} className="p-6 glass rounded-2xl border-t-2 border-teal-500/50 hover:bg-white/10 text-left transition-colors">
              <i className={`fa-solid ${card.icon} text-teal-400 text-2xl mb-4`} />
              <h3 className="font-bold mb-2">{card.title} <span aria-hidden="true">↗</span></h3>
              <p className="text-sm text-gray-400">{card.text}</p>
            </button>)}
          </div>
        </div>
      </div>}
      {activeView === 'discover' && <DiscoverView route={route} profile={profile} joined={joined} setJoined={setJoined} notify={setNotice} />}
      {activeView === 'collection' && <CollectionView route={route} onNavigate={navigate} items={items} setItems={setItems} notify={setNotice} />}
    </main>
    <footer className="mt-16 py-10 px-4 border-t border-white/5 text-center text-[10px] uppercase tracking-[0.3em] text-gray-500">© {new Date().getFullYear()} CCLO Technologies · Your collection, in one place</footer>
    {notice && <div role="status" className="fixed bottom-6 left-4 right-4 mx-auto max-w-md z-[60] bg-teal-950 border border-teal-600 rounded-xl p-4 shadow-xl flex gap-4 items-center"><span className="flex-1">{notice}</span><button aria-label="Dismiss notification" onClick={() => setNotice('')}>✕</button></div>}
    {profileOpen && <Modal title="Your profile" onClose={() => setProfileOpen(false)}>
      <p className="text-sm text-gray-400 mb-5">Your profile and vault are saved in this browser. No account or payment is required.</p>
      <form className="space-y-4" onSubmit={e => {
        e.preventDefault(); const data = new FormData(e.currentTarget);
        setProfile({ name: String(data.get('name')).trim(), location: String(data.get('location')).trim() });
        setProfileOpen(false); setNotice('Profile saved.');
      }}>
        <label className="block">Display name<input name="name" className="field mt-2" defaultValue={profile.name} maxLength={80} autoComplete="nickname" /></label>
        <label className="block">City or neighborhood<input name="location" className="field mt-2" defaultValue={profile.location} maxLength={120} autoComplete="address-level2" /></label>
        <p className="text-sm text-gray-400">{items.length} vault items · {joined.length} saved membership plans</p>
        <button className="primary w-full">Save profile</button>
      </form>
    </Modal>}
  </div>;
};
export default App;
