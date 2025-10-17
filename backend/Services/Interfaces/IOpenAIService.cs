using Octopets.Backend.Models;

namespace Octopets.Backend.Services.Interfaces;

public interface IOpenAIService
{
    Task<PetAnalysisResponse> AnalyzePetForVenueCompatibilityAsync(PetAnalysisRequest request);
    Task<List<string>> GenerateVenueRecommendationsAsync(string petType, string breed, List<string> preferences);
    Task<string> GeneratePetFriendlyDescriptionAsync(string venueName, string venueType, List<string> allowedPets);
}