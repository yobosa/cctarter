import React, { useEffect, useRef, useState } from 'react';
import { gemini } from '../services/gemini';
import { Category, CollectionItem } from '../types';
import { exportCollection, isCollection } from '../services/storage';
import Modal from './Modal';

interface Props { route: string; onNavigate: (route: string) => void; items: CollectionItem[]; setItems: React.Dispatch<React.SetStateAction<CollectionItem[]>>; notify: (text: string) => void }
const newItem = (category: Category): CollectionItem => ({ id: crypto.randomUUID(), name: '', brandOrAuthor: '', category, status: category === Category.LIBRARY ? 'unread' : 'stock', rating: 0, isToLet: false });
const safeImage = (url?: string) => url && /^data:image\/(jpeg|png|webp);base64,/.test(url) ? url : undefined;
async function readPhoto(file: File): Promise<string> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Choose a JPG, PNG, or WebP image.');
  if (file.size > 10 * 1024 * 1024) throw new Error('Choose an image smaller than 10 MB.');
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject(new Error('This image could not be opened. Try another file.')); img.src = url; });
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, 1000 / Math.max(img.width, img.height));
    canvas.width = Math.max(1, Math.round(img.width * scale)); canvas.height = Math.max(1, Math.round(img.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Your browser cannot process this image. Add the item manually.');
    context.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', .75);
  } finally { URL.revokeObjectURL(url); }
}
export default function CollectionView({ route, onNavigate, items, setItems, notify }: Props) {
  const activeTab = route.split('/')[1] === Category.SCENTS ? Category.SCENTS : Category.LIBRARY;
  const [query, setQuery] = useState('');
  const [toLetOnly, setToLetOnly] = useState(false);
  const [draft, setDraft] = useState<CollectionItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<CollectionItem | null>(null);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [preview, setPreview] = useState(false);
  const [slide, setSlide] = useState(0);
  const [playing, setPlaying] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const importInput = useRef<HTMLInputElement>(null);
  const visible = items.filter(item => item.category === activeTab && (!toLetOnly || item.isToLet) && `${item.name} ${item.brandOrAuthor}`.toLowerCase().includes(query.trim().toLowerCase()));
  const currentSlide = visible[slide % Math.max(visible.length, 1)];
  useEffect(() => { setToLetOnly(route.endsWith('/to-let')); setPreview(route.endsWith('/preview')); setSlide(0); setPlaying(false); setQuery(''); }, [route]);
  useEffect(() => {
    if (!preview || !playing || visible.length < 2) return;
    const timer = setInterval(() => setSlide(s => (s + 1) % visible.length), 3000);
    return () => clearInterval(timer);
  }, [preview, playing, visible.length]);
  const update = (id: string, changes: Partial<CollectionItem>) => setItems(prev => prev.map(item => item.id === id ? { ...item, ...changes } : item));
  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; e.target.value = ''; if (!file) return;
    const category = activeTab;
    setError(''); setScanning(true);
    try {
      const imageUrl = await readPhoto(file);
      if (!gemini.isConfigured) {
        setDraft({ ...newItem(category), imageUrl });
        notify('Photo added. Enter the item details; AI scanning is not configured.');
        return;
      }
      try {
        const recognized = await gemini.identifyCollectionItems(imageUrl.split(',')[1], category);
        if (!recognized.length) throw new Error('No items recognized.');
        setItems(prev => [...prev, ...recognized.map(r => ({ ...newItem(category), ...r, imageUrl }))]);
        notify(`${recognized.length} items added. Review the names and details.`);
      } catch {
        setDraft({ ...newItem(category), imageUrl });
        notify('AI could not identify this photo. You can enter its details manually.');
      }
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to upload this image.'); }
    finally { setScanning(false); }
  };
  const importVault = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; e.target.value = ''; if (!file) return;
    setError('');
    try {
      if (file.size > 5 * 1024 * 1024) throw new Error('Choose a vault backup smaller than 5 MB.');
      const data: unknown = JSON.parse(await file.text());
      if (!isCollection(data)) throw new Error('This file is not a valid vault backup.');
      const imported = data.map(item => ({ id: item.id, name: item.name.slice(0, 160), brandOrAuthor: item.brandOrAuthor.slice(0, 160), category: item.category, status: item.status, rating: item.rating, isToLet: item.isToLet, imageUrl: safeImage(item.imageUrl) }));
      setItems(prev => { const ids = new Set(prev.map(item => item.id)); return [...prev, ...imported.filter(item => { if (ids.has(item.id)) return false; ids.add(item.id); return true; })]; });
      notify('Backup imported. Existing items were kept.');
    } catch (err) { setError(err instanceof SyntaxError ? 'This file is not valid JSON.' : err instanceof Error ? err.message : 'Import failed.'); }
  };
  return <div className="max-w-7xl mx-auto mt-28 px-2 sm:px-6 pb-10">
    <div className="flex flex-wrap justify-between items-end gap-6 mb-8"><div><h1 className="serif text-4xl sm:text-5xl mb-4">The Personal Vault</h1><p className="text-gray-400">Your books, fragrances, and favorites. Saved in this browser.</p></div>
      <div className="flex gap-2 p-1 glass rounded-xl" aria-label="Collection categories">{[Category.LIBRARY, Category.SCENTS].map(tab => <button key={tab} aria-pressed={activeTab === tab} onClick={() => onNavigate(`collection/${tab}`)} className={`px-5 py-2 rounded-lg text-sm font-bold ${activeTab === tab ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'}`}>{tab === Category.LIBRARY ? 'ccmuseo · Books' : 'cconsort · Scents'}</button>)}</div>
    </div>
    <div className="flex flex-wrap gap-3 mb-6">
      <button className="primary" onClick={() => { setError(''); setDraft(newItem(activeTab)); }}>+ Add item</button>
      <button disabled={scanning} onClick={() => fileInput.current?.click()} className="glass px-5 py-3 rounded-xl hover:bg-white/10 disabled:opacity-50"><i className="fa-solid fa-camera mr-2" />{scanning ? 'Processing photo...' : gemini.isConfigured ? 'Scan shelf / countertop' : 'Add from photo'}</button>
      <button onClick={() => { setSlide(0); setPreview(true); }} className="glass px-5 py-3 rounded-xl hover:bg-white/10">Preview collection</button>
      <button disabled={!items.length} onClick={() => { exportCollection(items); notify('Vault backup downloaded.'); }} className="glass px-5 py-3 rounded-xl hover:bg-white/10 disabled:opacity-50">Export vault</button>
      <button onClick={() => importInput.current?.click()} className="glass px-5 py-3 rounded-xl hover:bg-white/10">Import backup</button>
      <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={upload} aria-label="Upload collection photo" />
      <input ref={importInput} type="file" accept="application/json,.json" className="hidden" onChange={importVault} aria-label="Import vault backup" />
    </div>
    {error && <p role="alert" className="p-4 mb-5 bg-rose-950 rounded-xl text-rose-200">{error}</p>}
    <div className="flex flex-wrap gap-4 items-center mb-8"><input aria-label="Search vault" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by title, author, or brand" className="field sm:!w-80" /><label className="flex gap-2 items-center text-sm text-gray-300"><input type="checkbox" className="accent-amber-500" checked={toLetOnly} onChange={e => setToLetOnly(e.target.checked)} />Available to let only</label><p className="text-xs text-gray-500 sm:ml-auto">{visible.length} items shown</p></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{visible.map(item => <article key={item.id} className="glass rounded-2xl overflow-hidden">
      <button className="h-48 w-full bg-white/5 relative flex items-center justify-center hover:bg-white/10" aria-label={`Edit ${item.name}`} onClick={() => setDraft({ ...item })}>
        {safeImage(item.imageUrl) ? <img src={safeImage(item.imageUrl)} alt={item.name} className="w-full h-full object-cover" /> : <i className={`fa-solid ${activeTab === Category.LIBRARY ? 'fa-book' : 'fa-flask'} text-6xl text-white/20`} />}
        {item.isToLet && <span className="absolute top-3 right-3 bg-rose-600 text-white text-xs px-2 py-1 rounded">Available to let</span>}
      </button>
      <div className="p-5"><h2 className="serif text-lg font-bold break-words">{item.name}</h2><p className="text-xs text-gray-400 mt-1 mb-4 break-words">{item.brandOrAuthor || 'No author or brand added'}</p>
        <select aria-label={`Status of ${item.name}`} value={item.status} onChange={e => update(item.id, { status: e.target.value as CollectionItem['status'] })} className="field text-sm mb-3">{activeTab === Category.LIBRARY ? <><option value="unread">To read</option><option value="read">Read</option></> : <><option value="stock">In stock</option><option value="used">Empty</option></>}</select>
        <div className="flex gap-1 mb-3" aria-label={`Rating for ${item.name}`}>{[1, 2, 3, 4, 5].map(star => <button key={star} aria-label={`Rate ${item.name} ${star} stars`} aria-pressed={item.rating === star} onClick={() => update(item.id, { rating: item.rating === star ? 0 : star })} className={`p-1 text-xl ${item.rating >= star ? 'text-amber-400' : 'text-gray-600'}`}>★</button>)}</div>
        <label className="flex items-center gap-2 text-xs text-gray-300"><input type="checkbox" className="accent-amber-500" checked={item.isToLet} onChange={e => update(item.id, { isToLet: e.target.checked })} />Mark available to let</label>
        <div className="flex justify-between mt-5 border-t border-white/10 pt-4"><button className="text-sm text-teal-300" onClick={() => setDraft({ ...item })}>Edit</button><button className="text-sm text-rose-300" onClick={() => setDeleteItem(item)}>Delete</button></div>
      </div>
    </article>)}</div>
    {!visible.length && <div className="py-16 text-center glass rounded-2xl border-dashed border-2"><i className="fa-solid fa-box-open text-4xl text-gray-600 mb-4" /><h2 className="serif text-2xl mb-3">{query || toLetOnly ? 'No matching items' : 'Make this vault yours'}</h2><p className="text-gray-400 mb-6">{query || toLetOnly ? 'Try another search or clear your filters.' : 'Add your first book or fragrance to begin.'}</p>{query || toLetOnly ? <button className="primary" onClick={() => { setQuery(''); setToLetOnly(false); }}>Clear filters</button> : <button className="primary" onClick={() => setDraft(newItem(activeTab))}>Add your first item</button>}</div>}
    {draft && <Modal title={items.some(item => item.id === draft.id) ? 'Edit item' : 'Add to your vault'} onClose={() => setDraft(null)}><form className="space-y-4" onSubmit={e => {
      e.preventDefault(); if (!draft.name.trim()) return;
      const saved = { ...draft, name: draft.name.trim(), brandOrAuthor: draft.brandOrAuthor.trim() };
      setItems(prev => prev.some(item => item.id === saved.id) ? prev.map(item => item.id === saved.id ? saved : item) : [...prev, saved]);
      setDraft(null); notify('Item saved to your vault.');
    }}>
      {safeImage(draft.imageUrl) && <img src={safeImage(draft.imageUrl)} alt="Uploaded collection" className="w-full max-h-48 object-contain rounded-lg" />}
      <label className="block">{draft.category === Category.LIBRARY ? 'Book title' : 'Fragrance name'}<input autoFocus required maxLength={160} className="field mt-2" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} /></label>
      <label className="block">{draft.category === Category.LIBRARY ? 'Author' : 'Brand'}<input maxLength={160} className="field mt-2" value={draft.brandOrAuthor} onChange={e => setDraft({ ...draft, brandOrAuthor: e.target.value })} /></label>
      <button disabled={!draft.name.trim()} className="primary w-full disabled:opacity-50">Save item</button>
    </form></Modal>}
    {deleteItem && <Modal title="Delete item?" onClose={() => setDeleteItem(null)}><p className="mb-6">Remove &ldquo;{deleteItem.name}&rdquo; from your vault?</p><div className="flex gap-3"><button className="glass px-5 py-3 rounded-xl flex-1" onClick={() => setDeleteItem(null)}>Keep item</button><button className="bg-rose-600 px-5 py-3 rounded-xl flex-1" onClick={() => { setItems(prev => prev.filter(item => item.id !== deleteItem.id)); setDeleteItem(null); notify('Item deleted.'); }}>Delete item</button></div></Modal>}
    {preview && <Modal title="Collection preview" onClose={() => { setPreview(false); setPlaying(false); }}>
      {currentSlide ? <div className="text-center"><div className="h-64 bg-white/5 rounded-xl flex items-center justify-center mb-5">{safeImage(currentSlide.imageUrl) ? <img className="w-full h-full object-contain" src={safeImage(currentSlide.imageUrl)} alt={currentSlide.name} /> : <i className={`fa-solid ${activeTab === Category.LIBRARY ? 'fa-book-open' : 'fa-flask'} text-7xl text-amber-400/60`} />}</div><h3 className="serif text-2xl">{currentSlide.name}</h3><p className="text-gray-400 mt-2">{currentSlide.brandOrAuthor}</p><p className="text-amber-400 mt-3">{currentSlide.rating ? '★'.repeat(currentSlide.rating) : 'Not rated'}</p><p className="text-gray-500 text-xs mt-3">{slide % visible.length + 1} of {visible.length}</p><div className="flex justify-center gap-4 mt-5"><button aria-label="Previous item" disabled={visible.length < 2} onClick={() => setSlide(s => (s - 1 + visible.length) % visible.length)} className="glass px-4 py-2 rounded-lg disabled:opacity-40">&larr;</button><button disabled={visible.length < 2} className="primary disabled:opacity-40" onClick={() => setPlaying(p => !p)}>{playing ? 'Pause' : 'Play slideshow'}</button><button aria-label="Next item" disabled={visible.length < 2} onClick={() => setSlide(s => (s + 1) % visible.length)} className="glass px-4 py-2 rounded-lg disabled:opacity-40">&rarr;</button></div></div> : <p className="text-gray-400">Add items to this collection, or clear your filters, to start a slideshow.</p>}
    </Modal>}
  </div>;
}
