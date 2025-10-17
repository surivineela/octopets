// Define types for our application data
import { ReactNode } from 'react';

export type PetType = {
  id: string;
  name: string;
  icon: ReactNode;
  description: string;
};

export type ListingType = {
  id: string;
  name: string;
  icon: ReactNode;
  description: string;
};

export type Amenity = {
  id: string;
  name: string;
  icon: string;
};

export type Review = {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
};

export type Listing = {
  id: string;
  name: string;
  description: string;
  type: string;
  location: string;
  allowedPets: string[];
  amenities: string[];
  photos: string[];
  rating: number;
  reviews: Review[];
  contactInfo: {
    phone: string;
    email: string;
    website: string;
  };
};

export type AppRoute = {
  path: string;
  label: string;
};

export type FormState = {
  name: string;
  description: string;
  type: string;
  location: string;
  allowedPets: string[];
  amenities: string[];
  contactInfo: {
    phone: string;
    email: string;
    website: string;
  };
};

// Pet Analysis Types for OpenAI Integration
export type PetAnalysisRequest = {
  petName: string;
  petType: string;
  breed: string;
  age: number;
  size: string; // Small, Medium, Large
  temperamentDescription: string;
  specialNeeds: string[];
  activityLevel: string; // Low, Medium, High
};

export type PetAnalysisResponse = {
  petName: string;
  suitabilityScore: string;
  recommendedVenueTypes: string[];
  venueRequirements: string[];
  behaviorPrediction: string;
  safetyConsiderations: string[];
  recommendedAmenities: string[];
  generalAdvice: string;
  analysisDate: string;
};

export type VenueRecommendationsResponse = {
  recommendations: string[];
};

export type VenueDescriptionResponse = {
  description: string;
};
