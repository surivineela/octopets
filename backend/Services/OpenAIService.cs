using OpenAI;
using OpenAI.Chat;
using Octopets.Backend.Models;
using Octopets.Backend.Services.Interfaces;
using System.Text.Json;

namespace Octopets.Backend.Services;

public class OpenAIService : IOpenAIService
{
    private readonly OpenAIClient _openAIClient;
    private readonly ILogger<OpenAIService> _logger;
    private readonly string _model = "gpt-4o-mini"; // Using cost-effective model

    public OpenAIService(IConfiguration configuration, ILogger<OpenAIService> logger)
    {
        var apiKey = configuration["OpenAI:ApiKey"] 
            ?? throw new InvalidOperationException("OpenAI API key not configured");
        
        _openAIClient = new OpenAIClient(apiKey);
        _logger = logger;
    }

    public async Task<PetAnalysisResponse> AnalyzePetForVenueCompatibilityAsync(PetAnalysisRequest request)
    {
        try
        {
            var systemPrompt = @"You are a professional pet behavior analyst specializing in venue compatibility assessment. 
            Analyze the provided pet details and provide structured recommendations for pet-friendly venues.
            Focus on safety, compatibility, and the pet's specific needs.
            
            Respond with a JSON object containing:
            - suitabilityScore: A score from 1-10 with brief explanation
            - recommendedVenueTypes: Array of suitable venue types (e.g., 'dog park', 'pet cafe', 'outdoor restaurant')
            - venueRequirements: Array of specific requirements the venue should have
            - behaviorPrediction: Brief prediction of how the pet might behave in social venues
            - safetyConsiderations: Array of safety concerns to consider
            - recommendedAmenities: Array of amenities that would benefit this pet
            - generalAdvice: General advice for the pet owner when visiting venues";

            var userPrompt = $@"Pet Details:
            Name: {request.PetName}
            Type: {request.PetType}
            Breed: {request.Breed}
            Age: {request.Age} years old
            Size: {request.Size}
            Temperament: {request.TemperamentDescription}
            Special Needs: {string.Join(", ", request.SpecialNeeds)}
            Activity Level: {request.ActivityLevel}";

            var chatCompletion = await _openAIClient.GetChatClient(_model).CompleteChatAsync(
                new ChatMessage[]
                {
                    new SystemChatMessage(systemPrompt),
                    new UserChatMessage(userPrompt)
                },
                new ChatCompletionOptions
                {
                    Temperature = 0.7f,
                    MaxOutputTokenCount = 1000
                });

            var responseContent = chatCompletion.Value.Content[0].Text;
            
            // Parse the JSON response
            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };

            JsonDocument analysis;
            try
            {
                analysis = JsonDocument.Parse(responseContent);
            }
            catch
            {
                // If JSON parsing fails, return fallback response
                throw new InvalidOperationException("Failed to parse AI response");
            }
            
            var response = new PetAnalysisResponse
            {
                PetName = request.PetName,
                SuitabilityScore = GetStringProperty(analysis.RootElement, "suitabilityScore") ?? "5/10 - Unable to analyze",
                RecommendedVenueTypes = GetStringArray(analysis.RootElement, "recommendedVenueTypes"),
                VenueRequirements = GetStringArray(analysis.RootElement, "venueRequirements"),
                BehaviorPrediction = GetStringProperty(analysis.RootElement, "behaviorPrediction") ?? "Behavior prediction unavailable",
                SafetyConsiderations = GetStringArray(analysis.RootElement, "safetyConsiderations"),
                RecommendedAmenities = GetStringArray(analysis.RootElement, "recommendedAmenities"),
                GeneralAdvice = GetStringProperty(analysis.RootElement, "generalAdvice") ?? "Consult with venue staff about pet policies",
                AnalysisDate = DateTime.UtcNow
            };

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error analyzing pet for venue compatibility");
            
            // Return a fallback response
            return new PetAnalysisResponse
            {
                PetName = request.PetName,
                SuitabilityScore = "Unable to analyze - please try again later",
                RecommendedVenueTypes = new List<string> { "Contact venue directly for pet policy information" },
                VenueRequirements = new List<string> { "Verify pet-friendly status before visiting" },
                BehaviorPrediction = "Analysis unavailable",
                SafetyConsiderations = new List<string> { "Always supervise your pet", "Bring necessary supplies" },
                RecommendedAmenities = new List<string> { "Water bowls", "Pet waste stations" },
                GeneralAdvice = "Service temporarily unavailable. Please consult with venue staff about their pet policies.",
                AnalysisDate = DateTime.UtcNow
            };
        }
    }

    public async Task<List<string>> GenerateVenueRecommendationsAsync(string petType, string breed, List<string> preferences)
    {
        try
        {
            var systemPrompt = @"You are a pet venue recommendation expert. Based on the pet type, breed, and owner preferences, 
            recommend specific types of venues that would be ideal. Return a JSON array of venue type recommendations.";

            var userPrompt = $@"Pet Type: {petType}
            Breed: {breed}
            Owner Preferences: {string.Join(", ", preferences)}
            
            Provide an array of specific venue recommendations.";

            var chatCompletion = await _openAIClient.GetChatClient(_model).CompleteChatAsync(
                new ChatMessage[]
                {
                    new SystemChatMessage(systemPrompt),
                    new UserChatMessage(userPrompt)
                },
                new ChatCompletionOptions
                {
                    Temperature = 0.8f,
                    MaxOutputTokenCount = 300
                });

            var responseContent = chatCompletion.Value.Content[0].Text;
            var recommendations = JsonSerializer.Deserialize<List<string>>(responseContent) ?? new List<string>();
            
            return recommendations;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating venue recommendations");
            return new List<string> { "Dog parks", "Pet-friendly cafes", "Outdoor restaurants" };
        }
    }

    public async Task<string> GeneratePetFriendlyDescriptionAsync(string venueName, string venueType, List<string> allowedPets)
    {
        try
        {
            var systemPrompt = @"You are a marketing copywriter specializing in pet-friendly venues. 
            Create engaging, welcoming descriptions that highlight pet-friendly features.";

            var userPrompt = $@"Venue Name: {venueName}
            Venue Type: {venueType}
            Allowed Pets: {string.Join(", ", allowedPets)}
            
            Write a brief, engaging description (2-3 sentences) that highlights why this venue is great for pet owners.";

            var chatCompletion = await _openAIClient.GetChatClient(_model).CompleteChatAsync(
                new ChatMessage[]
                {
                    new SystemChatMessage(systemPrompt),
                    new UserChatMessage(userPrompt)
                },
                new ChatCompletionOptions
                {
                    Temperature = 0.9f,
                    MaxOutputTokenCount = 200
                });

            return chatCompletion.Value.Content[0].Text.Trim();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating pet-friendly description");
            return $"{venueName} welcomes {string.Join(" and ", allowedPets)} and provides a comfortable environment for pets and their owners.";
        }
    }

    private static string? GetStringProperty(JsonElement element, string propertyName)
    {
        try
        {
            if (element.TryGetProperty(propertyName, out JsonElement property))
            {
                return property.GetString();
            }
        }
        catch
        {
            // Fall through to return null
        }
        return null;
    }

    private static List<string> GetStringArray(JsonElement element, string propertyName)
    {
        try
        {
            if (element.TryGetProperty(propertyName, out JsonElement property) && property.ValueKind == JsonValueKind.Array)
            {
                var list = new List<string>();
                foreach (var item in property.EnumerateArray())
                {
                    if (item.ValueKind == JsonValueKind.String)
                    {
                        var value = item.GetString();
                        if (!string.IsNullOrEmpty(value))
                        {
                            list.Add(value);
                        }
                    }
                }
                return list;
            }
        }
        catch
        {
            // Fall through to return empty list
        }
        
        return new List<string>();
    }
}