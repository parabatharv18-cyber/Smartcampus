export interface Campus {
  id: string;
  name: string;
  code: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  campusId: string;
  campusName: string;
  createdAt: string;
  sellerRating: number;
  reviewCount: number;
}

export type ResourceCategory = 'Books' | 'Notes / Study Material' | 'Stationery';
export type ResourceCondition = 'New' | 'Like New' | 'Good' | 'Fair';

export interface Resource {
  _id?: string;
  id?: string;
  title: string;
  category: ResourceCategory;
  description: string;
  price: number;
  condition: ResourceCondition;
  image: string;
  status: 'Available' | 'Sold';
  createdAt: string;
  seller: {
    _id?: string;
    id?: string;
    name: string;
    avatar?: string;
    email?: string;
    createdAt?: string;
    memberSince?: string;
    averageRating?: number;
    reviewCount?: number;
  };
}

export type RequestStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Completed';

export interface TransactionRequest {
  _id: string;
  buyer: {
    _id: string;
    name: string;
    avatar?: string;
  };
  seller: {
    _id: string;
    name: string;
    avatar?: string;
    email?: string;
  };
  resource: {
    _id: string;
    title: string;
    image?: string;
    category: ResourceCategory;
    price: number;
    status: 'Available' | 'Sold';
  };
  price: number;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  isReviewed?: boolean;
}

export interface Review {
  _id: string;
  seller: string;
  buyer: {
    _id: string;
    name: string;
    avatar?: string;
  };
  resource?: {
    _id: string;
    title: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}
