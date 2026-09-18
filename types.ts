
export enum Category {
  SPA = 'SPA',
  GYM = 'GYM',
  LIBRARY = 'LIBRARY',
  SCENTS = 'SCENTS'
}

export interface MembershipItem {
  id: string;
  name: string;
  location: string;
  category: Category;
  description: string;
  coupleDiscountStatus: 'Open' | 'Pending' | 'Locked';
  joinedCount: number;
  totalNeeded: number;
  price: string;
  coordinates?: { lat: number; lng: number };
  url?: string;
}

export interface CollectionItem {
  id: string;
  name: string;
  brandOrAuthor: string;
  category: Category;
  status: 'read' | 'unread' | 'used' | 'stock';
  rating: number;
  isToLet: boolean;
  imageUrl?: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}
