import React, { useState } from 'react';
import { DataService } from '../data/dataService';
import { PetAnalysisRequest, PetAnalysisResponse } from '../types/types';
import '../styles/PetAnalysis.css';

interface PetAnalysisFormProps {
  onAnalysisComplete?: (analysis: PetAnalysisResponse) => void;
}

export const PetAnalysisForm: React.FC<PetAnalysisFormProps> = ({ onAnalysisComplete }) => {
  const [formData, setFormData] = useState<PetAnalysisRequest>({
    petName: '',
    petType: '',
    breed: '',
    age: 1,
    size: '',
    temperamentDescription: '',
    specialNeeds: [],
    activityLevel: ''
  });

  const [analysis, setAnalysis] = useState<PetAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' ? parseInt(value) || 1 : value
    }));
  };

  const handleSpecialNeedsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const needs = value.split(',').map(need => need.trim()).filter(need => need.length > 0);
    setFormData(prev => ({
      ...prev,
      specialNeeds: needs
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.petName || !formData.petType || !formData.size || !formData.activityLevel) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get pet analysis
      const analysisResult = await DataService.analyzePetForVenues(formData);
      setAnalysis(analysisResult);
      
      // Get venue recommendations
      const venueRecommendations = await DataService.getVenueRecommendations(
        formData.petType,
        formData.breed,
        []
      );
      setRecommendations(venueRecommendations);

      onAnalysisComplete?.(analysisResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during analysis');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      petName: '',
      petType: '',
      breed: '',
      age: 1,
      size: '',
      temperamentDescription: '',
      specialNeeds: [],
      activityLevel: ''
    });
    setAnalysis(null);
    setRecommendations([]);
    setError(null);
  };

  return (
    <div className="pet-analysis-container">
      <h2>AI-Powered Pet Venue Analysis</h2>
      <p className="description">
        Get personalized venue recommendations and compatibility analysis for your pet using advanced AI.
      </p>

      <form onSubmit={handleSubmit} className="pet-analysis-form">
        <div className="form-group">
          <label htmlFor="petName">Pet Name *</label>
          <input
            type="text"
            id="petName"
            name="petName"
            value={formData.petName}
            onChange={handleInputChange}
            placeholder="Enter your pet's name"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="petType">Pet Type *</label>
            <select
              id="petType"
              name="petType"
              value={formData.petType}
              onChange={handleInputChange}
              required
            >
              <option value="">Select pet type</option>
              <option value="Dog">Dog</option>
              <option value="Cat">Cat</option>
              <option value="Bird">Bird</option>
              <option value="Rabbit">Rabbit</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="breed">Breed</label>
            <input
              type="text"
              id="breed"
              name="breed"
              value={formData.breed}
              onChange={handleInputChange}
              placeholder="e.g., Golden Retriever, Persian, etc."
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="age">Age (years)</label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              min="0"
              max="30"
            />
          </div>

          <div className="form-group">
            <label htmlFor="size">Size *</label>
            <select
              id="size"
              name="size"
              value={formData.size}
              onChange={handleInputChange}
              required
            >
              <option value="">Select size</option>
              <option value="Small">Small</option>
              <option value="Medium">Medium</option>
              <option value="Large">Large</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="activityLevel">Activity Level *</label>
            <select
              id="activityLevel"
              name="activityLevel"
              value={formData.activityLevel}
              onChange={handleInputChange}
              required
            >
              <option value="">Select activity level</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="temperamentDescription">Temperament Description</label>
          <textarea
            id="temperamentDescription"
            name="temperamentDescription"
            value={formData.temperamentDescription}
            onChange={handleInputChange}
            placeholder="Describe your pet's personality, behavior, and social tendencies..."
            rows={3}
          />
        </div>

        <div className="form-group">
          <label htmlFor="specialNeeds">Special Needs (comma-separated)</label>
          <input
            type="text"
            id="specialNeeds"
            value={formData.specialNeeds.join(', ')}
            onChange={handleSpecialNeedsChange}
            placeholder="e.g., medication, wheelchair accessible, quiet environment"
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
          <button type="submit" disabled={loading} className="analyze-button">
            {loading ? 'Analyzing...' : 'Analyze My Pet'}
          </button>
          {(analysis || recommendations.length > 0) && (
            <button type="button" onClick={resetForm} className="reset-button">
              Start Over
            </button>
          )}
        </div>
      </form>

      {analysis && (
        <div className="analysis-results">
          <h3>Analysis Results for {analysis.petName}</h3>
          
          <div className="result-card">
            <h4>Venue Compatibility Score</h4>
            <p className="score">{analysis.suitabilityScore}</p>
          </div>

          <div className="result-card">
            <h4>Recommended Venue Types</h4>
            <ul>
              {analysis.recommendedVenueTypes.map((type, index) => (
                <li key={index}>{type}</li>
              ))}
            </ul>
          </div>

          <div className="result-card">
            <h4>Venue Requirements</h4>
            <ul>
              {analysis.venueRequirements.map((requirement, index) => (
                <li key={index}>{requirement}</li>
              ))}
            </ul>
          </div>

          <div className="result-card">
            <h4>Behavior Prediction</h4>
            <p>{analysis.behaviorPrediction}</p>
          </div>

          <div className="result-card">
            <h4>Safety Considerations</h4>
            <ul>
              {analysis.safetyConsiderations.map((consideration, index) => (
                <li key={index}>{consideration}</li>
              ))}
            </ul>
          </div>

          <div className="result-card">
            <h4>Recommended Amenities</h4>
            <ul>
              {analysis.recommendedAmenities.map((amenity, index) => (
                <li key={index}>{amenity}</li>
              ))}
            </ul>
          </div>

          <div className="result-card">
            <h4>General Advice</h4>
            <p>{analysis.generalAdvice}</p>
          </div>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="recommendations-section">
          <h3>Personalized Venue Recommendations</h3>
          <div className="recommendations-grid">
            {recommendations.map((recommendation, index) => (
              <div key={index} className="recommendation-card">
                {recommendation}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};