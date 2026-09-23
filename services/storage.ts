import { useEffect, useState } from 'react';
import { Category, CollectionItem } from '../types';

export function useStoredState<T>(key: string, fallback: T, valid: (value: unknown) => value is T) {
  const [error, setError] = useState('');
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      const parsed: unknown = raw ? JSON.parse(raw) : fallback;
      return valid(parsed) ? parsed : fallback;
    } catch { return fallback; }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      setError('');
    } catch { setError('Browser storage is unavailable or full. Changes will only last for this session. Export your vault to keep a copy.'); }
  }, [key, value]);
  return [value, setValue, error] as const;
}

export interface Profile { name: string; location: string }
export const isProfile = (v: unknown): v is Profile => !!v && typeof v === 'object' &&
  typeof (v as Profile).name === 'string' && typeof (v as Profile).location === 'string';
export const isIds = (v: unknown): v is string[] => Array.isArray(v) && v.every(id => typeof id === 'string');
export const isCollection = (v: unknown): v is CollectionItem[] => Array.isArray(v) && v.every(item =>
  item && typeof item.id === 'string' && typeof item.name === 'string' && typeof item.brandOrAuthor === 'string' &&
  [Category.LIBRARY, Category.SCENTS].includes(item.category) &&
  (item.category === Category.LIBRARY ? ['read', 'unread'] : ['stock', 'used']).includes(item.status) &&
  Number.isInteger(item.rating) && item.rating >= 0 && item.rating <= 5 && typeof item.isToLet === 'boolean');

export function exportCollection(items: CollectionItem[]) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'cclo-vault.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
