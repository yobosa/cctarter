import React, { useEffect, useRef } from 'react';

export default function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { dialog.close(); document.body.style.overflow = previous; };
  }, []);
  return <dialog ref={ref} aria-labelledby="dialog-title" onCancel={onClose}
    onClick={e => { if (e.target === e.currentTarget) { const r = e.currentTarget.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) onClose(); } }}
    className="bg-[#141414] text-gray-200 border border-white/20 rounded-2xl p-6 w-[calc(100%-2rem)] max-w-lg max-h-[90dvh] overflow-y-auto shadow-2xl">
    <div className="flex justify-between items-center gap-4 mb-6">
      <h2 id="dialog-title" className="serif text-2xl">{title}</h2>
      <button onClick={onClose} aria-label="Close dialog" className="p-2 rounded-lg hover:bg-white/10">✕</button>
    </div>
    {children}
  </dialog>;
}
