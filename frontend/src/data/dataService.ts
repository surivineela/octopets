import { appConfig } from '../config/appConfig';
import { Listing, Review, PetAnalysisRequest, PetAnalysisResponse, VenueRecommendationsResponse, VenueDescriptionResponse } from '../types/types';
import listingsData from './listingsData';

// Debug environment setup
console.log('Environment Setup:', {
    REACT_APP_USE_MOCK_DATA: process.env.REACT_APP_USE_MOCK_DATA,
    REACT_APP_USE_MOCK_DATA_PARSED: process.env.REACT_APP_USE_MOCK_DATA?.toLowerCase() === 'true',
    appConfigMockData: appConfig.useMockData,
    apiUrl: appConfig.apiUrl
});

// Mock data
const mockListings: Listing[] = listingsData;

// API service
export class DataService {
    static async getListings(): Promise<Listing[]> {
        console.log('DataService: Fetching listings, using mock data:', appConfig.useMockData);
        
        if (appConfig.useMockData) {
            console.log('DataService: Returning mock listings:', mockListings.length, 'items');
            return mockListings;
        }
        
        try {
            const response = await fetch(`${appConfig.apiUrl}/listings`);
            if (!response.ok) {
                console.error('DataService: Failed to fetch listings, status:', response.status);
                throw new Error('Failed to fetch listings');
            }
            const data = await response.json();
            console.log('DataService: Fetched listings from API:', data.length, 'items');
            return data;
        } catch (error) {
            console.error('DataService: Error fetching listings:', error);
            throw error;
        }
    }

    static async getListing(id: string): Promise<Listing> {
        console.log('DataService: Fetching listing', id, 'using mock data:', appConfig.useMockData);
        
        if (appConfig.useMockData) {
            const listing = mockListings.find(l => l.id === id);
            if (!listing) {
                console.error('DataService: Mock listing not found:', id);
                throw new Error('Listing not found');
            }
            console.log('DataService: Returning mock listing:', listing.name);
            return listing;
        }

        try {
            const response = await fetch(`${appConfig.apiUrl}/listings/${id}`);
            if (!response.ok) {
                console.error('DataService: Failed to fetch listing, status:', response.status);
                throw new Error('Failed to fetch listing');
            }
            const data = await response.json();
            console.log('DataService: Fetched listing from API:', data.name);
            return data;
        } catch (error) {
            console.error('DataService: Error fetching listing:', error);
            throw error;
        }
    }

    static async getReviews(listingId: string): Promise<Review[]> {
        console.log('DataService: Fetching reviews for listing', listingId, 'using mock data:', appConfig.useMockData);
        
        if (appConfig.useMockData) {
            const listing = mockListings.find(l => l.id === listingId);
            const reviews = listing?.reviews || [];
            console.log('DataService: Returning mock reviews:', reviews.length, 'items');
            return reviews;
        }

        try {
            const response = await fetch(`${appConfig.apiUrl}/listings/${listingId}/reviews`);
            if (!response.ok) {
                console.error('DataService: Failed to fetch reviews, status:', response.status);
                throw new Error('Failed to fetch reviews');
            }
            const data = await response.json();
            console.log('DataService: Fetched reviews from API:', data.length, 'items');
            return data;
        } catch (error) {
            console.error('DataService: Error fetching reviews:', error);
            throw error;
        }
    }

    static async createListing(listing: Omit<Listing, 'id' | 'reviews' | 'rating'>): Promise<Listing> {
        console.log('DataService: Creating listing using mock data:', appConfig.useMockData);
        
        if (appConfig.useMockData) {
            const newListing: Listing = {
                ...listing,
                id: Math.random().toString(36).substr(2, 9),
                reviews: [],
                rating: 0
            };
            mockListings.push(newListing);
            console.log('DataService: Created mock listing:', newListing.name);
            return newListing;
        }

        try {
            const response = await fetch(`${appConfig.apiUrl}/listings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(listing)
            });

            if (!response.ok) {
                console.error('DataService: Failed to create listing, status:', response.status);
                throw new Error('Failed to create listing');
            }
            const data = await response.json();
            console.log('DataService: Created listing via API:', data.name);
            return data;
        } catch (error) {
            console.error('DataService: Error creating listing:', error);
            throw error;
        }
    }

    static async createReview(listingId: string, review: Omit<Review, 'id' | 'date'>): Promise<Review> {
        console.log('DataService: Creating review for listing', listingId, 'using mock data:', appConfig.useMockData);
        
        if (appConfig.useMockData) {
            const listing = mockListings.find(l => l.id === listingId);
            if (!listing) {
                console.error('DataService: Mock listing not found for review:', listingId);
                throw new Error('Listing not found');
            }

            const newReview: Review = {
                ...review,
                id: Math.random().toString(36).substr(2, 9),
                date: new Date().toISOString().split('T')[0]
            };
            
            listing.reviews.push(newReview);
            
            // Update listing rating
            listing.rating = listing.reviews.reduce((sum: number, r: Review) => sum + r.rating, 0) / listing.reviews.length;
            
            console.log('DataService: Created mock review for listing:', listing.name);
            return newReview;
        }

        try {
            const response = await fetch(`${appConfig.apiUrl}/reviews/by-listing/${listingId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(review)
            });

            if (!response.ok) {
                console.error('DataService: Failed to create review, status:', response.status);
                throw new Error('Failed to create review');
            }
            const data = await response.json();
            console.log('DataService: Created review via API');
            return data;
        } catch (error) {
            console.error('DataService: Error fetching reviews:', error);
            throw error;
        }
    }

    // Pet Analysis Methods using OpenAI
    static async analyzePetForVenues(petData: PetAnalysisRequest): Promise<PetAnalysisResponse> {
        console.log('DataService: Analyzing pet for venue compatibility:', petData.petName);
        
        if (appConfig.useMockData) {
            // Return mock analysis for development
            return {
                petName: petData.petName,
                suitabilityScore: "8/10 - Great venue companion with proper preparation",
                recommendedVenueTypes: ["dog parks", "pet-friendly cafes", "outdoor restaurants"],
                venueRequirements: ["secure fencing", "water stations", "pet waste facilities"],
                behaviorPrediction: "Likely to be well-behaved with proper socialization",
                safetyConsiderations: ["Monitor interactions with other pets", "Bring water and treats"],
                recommendedAmenities: ["water bowls", "pet waste stations", "shaded areas"],
                generalAdvice: "Start with shorter visits to help your pet adjust to new environments",
                analysisDate: new Date().toISOString()
            };
        }

        try {
            const response = await fetch(`${appConfig.apiUrl}/pet-analysis/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(petData)
            });

            if (!response.ok) {
                console.error('DataService: Failed to analyze pet, status:', response.status);
                throw new Error('Failed to analyze pet for venue compatibility');
            }
            
            const data = await response.json();
            console.log('DataService: Pet analysis completed:', data.petName);
            return data;
        } catch (error) {
            console.error('DataService: Error analyzing pet:', error);
            throw error;
        }
    }

    static async getVenueRecommendations(petType: string, breed: string, preferences: string[]): Promise<string[]> {
        console.log('DataService: Getting venue recommendations for:', petType, breed);
        
        if (appConfig.useMockData) {
            // Return mock recommendations for development
            return [
                "Dog-friendly breweries",
                "Outdoor cafes with patio seating",
                "Pet supply stores with play areas",
                "Walking trails and parks",
                "Pet-friendly hotels for travel"
            ];
        }

        try {
            const queryParams = new URLSearchParams({
                petType,
                breed,
                ...preferences.reduce((acc, pref, index) => {
                    acc[`preferences[${index}]`] = pref;
                    return acc;
                }, {} as Record<string, string>)
            });

            const response = await fetch(`${appConfig.apiUrl}/pet-analysis/recommendations?${queryParams}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(preferences)
            });

            if (!response.ok) {
                console.error('DataService: Failed to get recommendations, status:', response.status);
                throw new Error('Failed to get venue recommendations');
            }
            
            const data: VenueRecommendationsResponse = await response.json();
            console.log('DataService: Venue recommendations received:', data.recommendations.length);
            return data.recommendations;
        } catch (error) {
            console.error('DataService: Error getting venue recommendations:', error);
            throw error;
        }
    }

    static async generateVenueDescription(venueName: string, venueType: string, allowedPets: string[]): Promise<string> {
        console.log('DataService: Generating description for venue:', venueName);
        
        if (appConfig.useMockData) {
            return `${venueName} is a welcoming ${venueType} that happily accommodates ${allowedPets.join(' and ')}. Our pet-friendly environment ensures both you and your furry companions feel right at home.`;
        }

        try {
            const queryParams = new URLSearchParams({
                venueName,
                venueType,
                ...allowedPets.reduce((acc, pet, index) => {
                    acc[`allowedPets[${index}]`] = pet;
                    return acc;
                }, {} as Record<string, string>)
            });

            const response = await fetch(`${appConfig.apiUrl}/pet-analysis/venue-description?${queryParams}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(allowedPets)
            });

            if (!response.ok) {
                console.error('DataService: Failed to generate description, status:', response.status);
                throw new Error('Failed to generate venue description');
            }
            
            const data: VenueDescriptionResponse = await response.json();
            console.log('DataService: Venue description generated');
            return data.description;
        } catch (error) {
            console.error('DataService: Error generating venue description:', error);
            throw error;
        }
    }

    static async checkPetAnalysisHealth(): Promise<{ status: string; timestamp: string }> {
        console.log('DataService: Checking pet analysis service health');
        
        if (appConfig.useMockData) {
            return {
                status: 'Healthy (Mock Mode)',
                timestamp: new Date().toISOString()
            };
        }

        try {
            const response = await fetch(`${appConfig.apiUrl}/pet-analysis/health`);
            
            if (!response.ok) {
                throw new Error(`Health check failed with status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('DataService: Pet analysis service is healthy');
            return data;
        } catch (error) {
            console.error('DataService: Pet analysis service health check failed:', error);
            throw error;
        }
    }
}
