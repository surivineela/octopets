namespace Octopets.Backend.Models;

public class PetAnalysisRequest
{
    public string PetName { get; set; } = string.Empty;
    public string PetType { get; set; } = string.Empty;
    public string Breed { get; set; } = string.Empty;
    public int Age { get; set; }
    public string Size { get; set; } = string.Empty; // Small, Medium, Large
    public string TemperamentDescription { get; set; } = string.Empty;
    public List<string> SpecialNeeds { get; set; } = new();
    public string ActivityLevel { get; set; } = string.Empty; // Low, Medium, High
}

public class PetAnalysisResponse
{
    public string PetName { get; set; } = string.Empty;
    public string SuitabilityScore { get; set; } = string.Empty; // 1-10 scale with explanation
    public List<string> RecommendedVenueTypes { get; set; } = new();
    public List<string> VenueRequirements { get; set; } = new();
    public string BehaviorPrediction { get; set; } = string.Empty;
    public List<string> SafetyConsiderations { get; set; } = new();
    public List<string> RecommendedAmenities { get; set; } = new();
    public string GeneralAdvice { get; set; } = string.Empty;
    public DateTime AnalysisDate { get; set; } = DateTime.UtcNow;
}