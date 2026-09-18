
import React from 'react';
import { Category, MembershipItem } from './types';

export const CATEGORY_COLORS = {
  [Category.SPA]: 'text-[#E0B0FF] bg-[#E0B0FF]/10 border-[#E0B0FF]/30', // Mauve
  [Category.GYM]: 'text-teal-400 bg-teal-900/20 border-teal-500/30',      // Teal
  [Category.LIBRARY]: 'text-[#A0522D] bg-[#A0522D]/10 border-[#A0522D]/30', // Brown
  [Category.SCENTS]: 'text-[#BAAFAD] bg-[#BAAFAD]/10 border-[#BAAFAD]/30', // Custom Warm Grey/Taupe
};

export const DUMMY_MEMBERSHIPS: MembershipItem[] = [
  {
    id: '1',
    name: 'Serene Sanctuary Spa',
    location: 'Downtown Core',
    category: Category.SPA,
    description: 'Ultra-luxurious thermal circuits and aromatherapy.',
    coupleDiscountStatus: 'Pending',
    joinedCount: 1,
    totalNeeded: 2,
    price: '$1200/yr',
  },
  {
    id: '2',
    name: 'Iron Forge Gym',
    location: 'West End',
    category: Category.GYM,
    description: 'High-performance equipment and expert coaching.',
    coupleDiscountStatus: 'Open',
    joinedCount: 0,
    totalNeeded: 2,
    price: '$800/yr',
  }
];

export const ICONS = {
  [Category.SPA]: <i className="fa-solid fa-spa"></i>,
  [Category.GYM]: <i className="fa-solid fa-circle-user"></i>,
  [Category.LIBRARY]: <i className="fa-solid fa-book-open"></i>,
  [Category.SCENTS]: <i className="fa-solid fa-flask-vial"></i>,
};
