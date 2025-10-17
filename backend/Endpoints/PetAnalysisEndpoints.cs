using Octopets.Backend.Models;
using Octopets.Backend.Services.Interfaces;

namespace Octopets.Backend.Endpoints;

public static class PetAnalysisEndpoints
{
    public static void MapPetAnalysisEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/pet-analysis")
                       .WithTags("Pet Analysis");

        // POST analyze pet for venue compatibility
        group.MapPost("/analyze", async (PetAnalysisRequest request, IOpenAIService openAIService) =>
        {
            if (string.IsNullOrWhiteSpace(request.PetName) || string.IsNullOrWhiteSpace(request.PetType))
            {
                return Results.BadRequest("Pet name and type are required");
            }

            var analysis = await openAIService.AnalyzePetForVenueCompatibilityAsync(request);
            return Results.Ok(analysis);
        })
        .WithName("AnalyzePetForVenues")
        .WithDescription("Analyzes a pet's details and provides venue compatibility recommendations using AI")
        .WithOpenApi(operation =>
        {
            operation.Summary = "Get AI-powered pet venue compatibility analysis";
            operation.Description = "Analyzes pet characteristics and provides recommendations for suitable venues, safety considerations, and behavioral predictions.";
            return operation;
        });

        // POST get venue recommendations for pet
        group.MapPost("/recommendations", async (
            string petType, 
            string breed, 
            List<string> preferences, 
            IOpenAIService openAIService) =>
        {
            if (string.IsNullOrWhiteSpace(petType))
            {
                return Results.BadRequest("Pet type is required");
            }

            var recommendations = await openAIService.GenerateVenueRecommendationsAsync(petType, breed, preferences);
            return Results.Ok(new { Recommendations = recommendations });
        })
        .WithName("GetPetVenueRecommendations")
        .WithDescription("Gets AI-generated venue recommendations based on pet characteristics and preferences")
        .WithOpenApi(operation =>
        {
            operation.Summary = "Get personalized venue recommendations";
            operation.Description = "Generates venue type recommendations based on pet breed, type, and owner preferences using AI.";
            return operation;
        });

        // POST generate pet-friendly description for venue
        group.MapPost("/venue-description", async (
            string venueName,
            string venueType,
            List<string> allowedPets,
            IOpenAIService openAIService) =>
        {
            if (string.IsNullOrWhiteSpace(venueName) || string.IsNullOrWhiteSpace(venueType))
            {
                return Results.BadRequest("Venue name and type are required");
            }

            var description = await openAIService.GeneratePetFriendlyDescriptionAsync(venueName, venueType, allowedPets);
            return Results.Ok(new { Description = description });
        })
        .WithName("GeneratePetFriendlyDescription")
        .WithDescription("Generates AI-powered marketing descriptions for pet-friendly venues")
        .WithOpenApi(operation =>
        {
            operation.Summary = "Generate pet-friendly venue description";
            operation.Description = "Creates engaging marketing copy that highlights a venue's pet-friendly features and amenities.";
            return operation;
        });

        // GET health check for OpenAI service
        group.MapGet("/health", async (IOpenAIService openAIService) =>
        {
            try
            {
                // Simple test request to verify OpenAI connectivity
                var testRequest = new PetAnalysisRequest
                {
                    PetName = "Test",
                    PetType = "Dog",
                    Breed = "Test Breed",
                    Age = 1,
                    Size = "Small",
                    TemperamentDescription = "Friendly",
                    ActivityLevel = "Medium"
                };

                // This is just a connectivity test - we won't actually use the result
                var testAnalysis = await openAIService.AnalyzePetForVenueCompatibilityAsync(testRequest);
                
                return Results.Ok(new 
                { 
                    Status = "Healthy", 
                    Service = "OpenAI Pet Analysis Service",
                    Timestamp = DateTime.UtcNow,
                    LastAnalysis = testAnalysis.AnalysisDate
                });
            }
            catch (Exception ex)
            {
                return Results.Json(new 
                { 
                    Status = "Unhealthy", 
                    Service = "OpenAI Pet Analysis Service",
                    Error = ex.Message,
                    Timestamp = DateTime.UtcNow
                }, statusCode: 503);
            }
        })
        .WithName("PetAnalysisHealthCheck")
        .WithDescription("Health check for the OpenAI-powered pet analysis service")
        .WithOpenApi();
    }
}