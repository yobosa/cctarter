
import React, { useState, useRef } from 'react';
import { gemini } from '../services/gemini';
import { Category, CollectionItem } from '../types';
import { CATEGORY_COLORS } from '../constants';

const CollectionView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Category>(Category.LIBRARY);
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        const recognized = await gemini.identifyCollectionItems(base64, activeTab as any);
        const newItems: CollectionItem[] = recognized.map((r: any, i: number) => ({
          id: Math.random().toString(36).substr(2, 9),
          name: r.name,
          brandOrAuthor: r.brandOrAuthor,
          category: activeTab,
          status: activeTab === Category.LIBRARY ? 'unread' : 'stock',
          rating: 0,
          isToLet: false
        }));
        setItems([...items, ...newItems]);
      } catch (err) {
        console.error("Scan failed", err);
      } finally {
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAnimate = async () => {
    // Requires a base64 image - in a real app, we'd take the last uploaded one
    // Here we simulate for demo purposes
    setIsGeneratingVideo(true);
    try {
      // Dummy prompt for demonstration
      const video = "https://www.w3schools.com/html/mov_bbb.mp4"; // Placeholder
      setGeneratedVideoUrl(video);
      // Actual implementation would call gemini.animateCollection with stored base64
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const updateItem = (id: string, updates: Partial<CollectionItem>) => {
    setItems(items.map(it => it.id === id ? { ...it, ...updates } : it));
  };

  return (
    <div className="max-w-7xl mx-auto mt-28 px-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
        <div>
          <h1 className="serif text-5xl mb-4">The Personal Vault</h1>
          <p className="text-gray-400">Digitize your ccmuseo and cconsort collection. AI identifies items and tracks your sentiment.</p>
        </div>
        
        <div className="flex gap-2 p-1 glass rounded-xl">
          <button 
            onClick={() => setActiveTab(Category.LIBRARY)}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === Category.LIBRARY ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'}`}
          >
            ccmuseo
          </button>
          <button 
            onClick={() => setActiveTab(Category.SCENTS)}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === Category.SCENTS ? 'bg-purple-500 text-black' : 'text-gray-400 hover:text-white'}`}
          >
            cconsort
          </button>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap gap-4 mb-8">
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isScanning}
          className="flex items-center gap-2 bg-white text-black font-bold px-6 py-3 rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50"
        >
          <i className="fa-solid fa-camera"></i>
          {isScanning ? 'AI Scanning...' : 'Scan Shelf / Countertop'}
        </button>
        <button 
          onClick={handleAnimate}
          disabled={isGeneratingVideo || items.length === 0}
          className="flex items-center gap-2 glass border-white/20 px-6 py-3 rounded-xl hover:bg-white/10 transition-all disabled:opacity-50"
        >
          <i className="fa-solid fa-wand-magic-sparkles text-amber-500"></i>
          Animate with Veo
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileUpload}
        />
      </div>

      {/* Video Preview */}
      {generatedVideoUrl && (
        <div className="mb-12 glass rounded-3xl overflow-hidden relative border-amber-500/30 border">
          <video src={generatedVideoUrl} controls autoPlay loop className="w-full aspect-video object-cover" />
          <div className="absolute top-4 left-4 glass px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-amber-500">
            Veo AI Generation
          </div>
        </div>
      )}

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.filter(it => it.category === activeTab).map((item) => (
          <div key={item.id} className="glass rounded-2xl overflow-hidden group hover:glow-gold transition-all">
            <div className="aspect-[3/4] bg-white/5 relative flex items-center justify-center">
              <i className={`fa-solid ${activeTab === Category.LIBRARY ? 'fa-book' : 'fa-flask'} text-6xl opacity-20 group-hover:scale-110 transition-transform duration-500`}></i>
              {item.isToLet && (
                <div className="absolute top-4 right-4 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase">
                  Available to Let
                </div>
              )}
            </div>
            
            <div className="p-5">
              <h4 className="serif text-lg font-bold truncate mb-1">{item.name}</h4>
              <p className="text-xs text-gray-500 mb-4">{item.brandOrAuthor}</p>
              
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <select 
                    value={item.status}
                    onChange={(e) => updateItem(item.id, { status: e.target.value as any })}
                    className="bg-black/40 border border-white/10 text-[10px] uppercase font-bold rounded px-2 py-1 focus:outline-none"
                  >
                    {activeTab === Category.LIBRARY ? (
                      <>
                        <option value="read">Read</option>
                        <option value="unread">To Read</option>
                      </>
                    ) : (
                      <>
                        <option value="stock">In Stock</option>
                        <option value="used">Empty</option>
                      </>
                    )}
                  </select>

                  <div className="flex gap-1 text-[10px]">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <i 
                        key={s}
                        onClick={() => updateItem(item.id, { rating: s })}
                        className={`fa-solid fa-star cursor-pointer transition-colors ${item.rating >= s ? 'text-amber-500' : 'text-white/10'}`}
                      ></i>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={item.isToLet} 
                    onChange={(e) => updateItem(item.id, { isToLet: e.target.checked })}
                    className="accent-amber-500"
                  />
                  <span className="text-[10px] uppercase font-bold text-gray-400">Mark "To Let"</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {items.filter(it => it.category === activeTab).length === 0 && !isScanning && (
          <div className="col-span-full py-20 text-center glass rounded-2xl border-dashed border-2">
            <i className="fa-solid fa-box-open text-4xl text-gray-600 mb-4"></i>
            <p className="text-gray-500">Your vault is empty. Scan an image to begin.</p>
          </div>
        )}
      </div>

      {/* "Grab All" CTA */}
      {items.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 glass px-8 py-4 rounded-2xl flex items-center gap-8 shadow-2xl z-40 border-amber-500/20 border">
          <div>
            <p className="text-[10px] uppercase font-bold text-amber-500">Public Interest</p>
            <p className="text-sm">Grab entire curated collection for <span className="font-bold">$299</span> flat</p>
          </div>
          <button className="bg-amber-500 text-black px-6 py-2 rounded-xl font-bold hover:scale-105 transition-transform">
            Checkout Vault
          </button>
        </div>
      )}
    </div>
  );
};

export default CollectionView;
