# OpenAI Integration Setup for Octopets

This document explains how to set up and use the OpenAI integration in the Octopets backend for pet analysis and venue recommendations.

## Prerequisites

1. **OpenAI API Key**: You'll need an OpenAI API key to use these features.
   - Sign up at [OpenAI Platform](https://platform.openai.com/)
   - Create an API key in your account dashboard
   - Make sure you have sufficient credits/usage limits

## Configuration

### Local Development

1. Add your OpenAI API key to `appsettings.Development.json`:
   ```json
   {
     "OpenAI": {
       "ApiKey": "sk-your-actual-openai-api-key-here"
     }
   }
   ```

### Production/Azure Deployment

For production, use one of these secure methods:

#### Option 1: User Secrets (Recommended for Development)
```bash
dotnet user-secrets set "OpenAI:ApiKey" "sk-your-actual-openai-api-key-here" --project backend
```

#### Option 2: Environment Variables
Set the environment variable:
```
OpenAI__ApiKey=sk-your-actual-openai-api-key-here
```

#### Option 3: Azure Key Vault (Recommended for Production)
Store the API key in Azure Key Vault and reference it in your configuration.

## API Endpoints

The OpenAI integration adds the following endpoints to your backend:

### 1. Pet Analysis for Venue Compatibility
**POST** `/api/pet-analysis/analyze`

Analyzes a pet's characteristics and provides venue compatibility recommendations.

**Request Body:**
```json
{
  "petName": "Buddy",
  "petType": "Dog",
  "breed": "Golden Retriever",
  "age": 3,
  "size": "Large",
  "temperamentDescription": "Friendly, energetic, good with people and other dogs",
  "specialNeeds": ["none"],
  "activityLevel": "High"
}
```

**Response:**
```json
{
  "petName": "Buddy",
  "suitabilityScore": "9/10 - Excellent venue companion with proper socialization",
  "recommendedVenueTypes": ["dog parks", "pet-friendly cafes", "outdoor restaurants"],
  "venueRequirements": ["secure fencing", "water stations", "adequate space"],
  "behaviorPrediction": "Likely to be social and well-behaved with proper supervision",
  "safetyConsiderations": ["Monitor interactions with smaller pets", "Ensure adequate exercise"],
  "recommendedAmenities": ["water bowls", "pet waste stations", "outdoor seating"],
  "generalAdvice": "Great for social venues, ensure regular exercise before visits",
  "analysisDate": "2025-10-16T10:30:00Z"
}
```

### 2. Venue Recommendations
**POST** `/api/pet-analysis/recommendations`

Gets personalized venue recommendations based on pet characteristics.

**Query Parameters:**
- `petType`: Type of pet (e.g., "Dog", "Cat")
- `breed`: Pet breed
- `preferences`: Array of owner preferences

### 3. Generate Pet-Friendly Venue Description
**POST** `/api/pet-analysis/venue-description`

Generates marketing descriptions for venues highlighting pet-friendly features.

**Query Parameters:**
- `venueName`: Name of the venue
- `venueType`: Type of venue (e.g., "restaurant", "cafe", "park")
- `allowedPets`: Array of allowed pet types

### 4. Health Check
**GET** `/api/pet-analysis/health`

Checks the health and connectivity of the OpenAI service.

## Usage Examples

### Using curl

```bash
# Pet Analysis
curl -X POST "https://localhost:7243/api/pet-analysis/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "petName": "Max",
    "petType": "Dog", 
    "breed": "Labrador",
    "age": 2,
    "size": "Large",
    "temperamentDescription": "Friendly and energetic",
    "specialNeeds": [],
    "activityLevel": "High"
  }'

# Venue Recommendations  
curl -X POST "https://localhost:7243/api/pet-analysis/recommendations?petType=Dog&breed=Beagle" \
  -H "Content-Type: application/json" \
  -d '["outdoor dining", "social environment"]'

# Health Check
curl -X GET "https://localhost:7243/api/pet-analysis/health"
```

### JavaScript/Frontend Integration

```javascript
// Pet Analysis
const analyzePet = async (petData) => {
  const response = await fetch('/api/pet-analysis/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(petData),
  });
  return await response.json();
};

// Usage
const analysis = await analyzePet({
  petName: "Luna",
  petType: "Cat",
  breed: "Persian",
  age: 4,
  size: "Medium",
  temperamentDescription: "Calm, prefers quiet environments",
  specialNeeds: ["requires grooming"],
  activityLevel: "Low"
});
```

## Cost Considerations

- The integration uses the `gpt-4o-mini` model for cost efficiency
- Each analysis request typically costs ~$0.001-0.01 depending on complexity
- Consider implementing rate limiting for production use
- Monitor your OpenAI usage dashboard

## Error Handling

The service includes comprehensive error handling:

- **API Key Issues**: Returns graceful fallback responses
- **Network Problems**: Provides default recommendations
- **Invalid Requests**: Returns appropriate HTTP status codes
- **Rate Limits**: Handles OpenAI rate limiting gracefully

## Security Best Practices

1. **Never commit API keys to source control**
2. **Use environment variables or secure secret management**
3. **Implement rate limiting to prevent abuse**
4. **Consider adding authentication to sensitive endpoints**
5. **Monitor API usage and costs regularly**

## Testing

The health check endpoint can be used to verify the integration is working:

```bash
curl -X GET "https://localhost:7243/api/pet-analysis/health"
```

A successful response indicates the OpenAI service is properly configured and accessible.

## Troubleshooting

### Common Issues

1. **"OpenAI API key not configured"**
   - Ensure the API key is properly set in configuration
   - Check the configuration section name matches exactly: `OpenAI:ApiKey`

2. **Network connectivity issues**
   - Verify internet connectivity
   - Check if your firewall allows outbound HTTPS connections
   - Ensure OpenAI services are accessible from your deployment environment

3. **Rate limiting errors**
   - Check your OpenAI account usage limits
   - Consider implementing request queuing for high-volume scenarios

4. **Unexpected responses**
   - The AI responses may vary; implement proper validation
   - Use the fallback responses when parsing fails

## Future Enhancements

Potential improvements to consider:

1. **Caching**: Implement response caching for similar requests
2. **Analytics**: Track popular pet types and venue preferences
3. **Fine-tuning**: Train custom models on venue-specific data
4. **Multi-language**: Support for multiple languages
5. **Image Analysis**: Add support for pet photo analysis