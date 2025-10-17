import React from 'react';
import { PetAnalysisForm } from '../components/PetAnalysisForm';
import { PetAnalysisResponse } from '../types/types';

export const PetAnalysis: React.FC = () => {
  const handleAnalysisComplete = (analysis: PetAnalysisResponse) => {
    console.log('Pet analysis completed:', analysis);
    // Could navigate to results page or show success message
  };

  return (
    <div className="page-container">
      <PetAnalysisForm onAnalysisComplete={handleAnalysisComplete} />
    </div>
  );
};