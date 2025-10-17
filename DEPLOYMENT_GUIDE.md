# 🚀 Deployment Guide: Octopets with OpenAI Integration

## Overview
This guide covers deploying the Octopets application with the new OpenAI pet analysis features to Azure using Azure Developer CLI (azd).

## 📋 Prerequisites

### Required Tools
- [Azure Developer CLI (azd)](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/install-azd)
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
- [.NET 9.0 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js 18+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Azure Account
- Active Azure subscription
- Sufficient credits for Container Apps, Storage, and other resources

## 🔐 Pre-Deployment: Secure OpenAI API Key Setup

Before deploying, we need to securely configure the OpenAI API key for production.

### Option 1: Azure Key Vault (Recommended)

1. **Create the Key Vault reference in AppHost:**

```csharp
// In apphost/Program.cs, add this configuration:
var keyVault = builder.AddAzureKeyVault("keyvault");

var api = builder.AddProject<Projects.Octopets_Backend>("octopets-backend")
    .WithReference(keyVault)
    .WithEnvironment("OpenAI__ApiKey", keyVault.GetSecret("OpenAI-ApiKey"));
```

2. **The Key Vault will be created during deployment, then manually add the secret.**

### Option 2: Azure App Configuration (Alternative)

We'll set this up using environment variables for now, then move to Key Vault post-deployment.

## 🛠️ Deployment Steps

### Step 1: Prepare the Project

1. **Navigate to the apphost directory:**
```bash
cd apphost
```

2. **Initialize Azure Developer CLI:**
```bash
azd init
```

When prompted:
- **Environment name**: `octopets-prod` (or your preferred name)
- **Location**: Choose your preferred Azure region (e.g., `East US 2`)

### Step 2: Configure Environment Variables

Create or update the `.env` file in the `apphost` directory:

```bash
# Create .env file for production configuration
echo "AZURE_ENV_NAME=octopets-prod" > .env
echo "AZURE_LOCATION=eastus2" >> .env
echo "OPENAI_API_KEY=your-openai-api-key-here" >> .env
echo "REACT_APP_USE_MOCK_DATA=false" >> .env
```

**⚠️ Important**: Replace `your-openai-api-key-here` with your actual OpenAI API key.

### Step 3: Update Azure Configuration

### Step 3: Deploy to Azure

Now let's deploy the application:

```bash
# Make sure you're in the apphost directory
cd c:\Users\surivineela\octopets\apphost

# Login to Azure (if not already logged in)
azd auth login

# Deploy the application
azd up
```

The deployment process will:
1. Create Azure resources (Container Apps, Storage, etc.)
2. Build and deploy the .NET backend
3. Build and deploy the React frontend
4. Set up monitoring and logging

**⏱️ Expected deployment time**: 5-10 minutes

### Step 4: Configure OpenAI API Key in Production

After deployment, you need to securely configure the OpenAI API key:

#### Option A: Azure Container Apps Environment Variables

1. **Find your Container App in Azure Portal:**
   - Go to [Azure Portal](https://portal.azure.com)
   - Search for your resource group (likely named `rg-octopets-prod`)
   - Find the Container App for the backend

2. **Set Environment Variables:**
   - Go to **Settings** > **Environment Variables**
   - Add a new environment variable:
     - **Name**: `OpenAI__ApiKey`
     - **Value**: Your OpenAI API key
     - **Source**: Manual entry
   - Click **Save**

#### Option B: Azure Key Vault (More Secure)

1. **Create Key Vault secret:**
```bash
# Replace with your actual values
az keyvault secret set --vault-name "kv-octopets-prod-xxx" --name "OpenAI-ApiKey" --value "your-openai-api-key"
```

2. **Update the Container App to reference Key Vault:**
   - In Container Apps settings, add environment variable:
     - **Name**: `OpenAI__ApiKey`
     - **Source**: Key vault reference
     - **Key vault secret**: Select your OpenAI-ApiKey secret

### Step 5: Verify Deployment

1. **Check Application Status:**
```bash
azd show
```

2. **Get Application URLs:**
The deployment will output URLs for:
- **Frontend Application**: The main Octopets web app
- **Backend API**: API endpoints with Swagger/Scalar documentation
- **Dashboard**: Azure Container Apps monitoring

3. **Test OpenAI Integration:**
   - Navigate to `{backend-url}/scalar/v1`
   - Look for "Pet Analysis" endpoints
   - Test the `/api/pet-analysis/health` endpoint

## 🧪 Post-Deployment Testing

### Test the Health Endpoint

```bash
# Replace with your actual backend URL
curl "https://your-backend-url.azurecontainerapps.io/api/pet-analysis/health"
```

Expected response:
```json
{
  "status": "Healthy",
  "service": "OpenAI Pet Analysis Service", 
  "timestamp": "2025-10-16T21:00:00Z"
}
```

### Test Pet Analysis

Use the Scalar API documentation to test the full pet analysis:

1. Go to `https://your-backend-url.azurecontainerapps.io/scalar/v1`
2. Find the "Pet Analysis" section
3. Try the `POST /api/pet-analysis/analyze` endpoint with sample data

## 🔧 Troubleshooting

### Common Issues

1. **OpenAI API Key Not Working:**
   - Verify the environment variable name: `OpenAI__ApiKey` (double underscore)
   - Check the key value in Azure Portal
   - Ensure sufficient OpenAI credits

2. **Container App Not Starting:**
   - Check logs in Azure Portal > Container Apps > Log Analytics
   - Verify all required environment variables are set

3. **Frontend Not Loading:**
   - Check if `REACT_APP_USE_MOCK_DATA=false` is set
   - Verify the frontend can reach the backend API

### View Logs

```bash
# View application logs
azd logs

# Or in Azure Portal:
# Container Apps > your-app > Monitoring > Log Analytics
```

## 🛡️ Security Best Practices

### Production Checklist

- [ ] OpenAI API key stored securely (Key Vault or encrypted env vars)
- [ ] HTTPS enabled (automatic with Container Apps)
- [ ] CORS configured for your domain only
- [ ] Rate limiting configured for OpenAI endpoints
- [ ] Monitor OpenAI usage and costs
- [ ] Set up Azure Application Insights alerts

### Cost Management

1. **Monitor OpenAI Usage:**
   - Set up billing alerts in OpenAI dashboard
   - Monitor token usage in Azure Application Insights

2. **Azure Resource Costs:**
   - Use Azure Cost Management to track spending
   - Consider scaling down Container Apps during low usage

## 🔄 Updates and Maintenance

### Deploying Updates

```bash
# Deploy code changes
azd deploy

# Or redeploy everything
azd up
```

### Monitoring

- **Application Insights**: Automatic monitoring and telemetry
- **Container Apps Metrics**: CPU, memory, request metrics
- **OpenAI Usage**: Monitor through OpenAI dashboard

## 🎉 Success!

Your Octopets application with OpenAI integration is now running in Azure!

### What You've Deployed:

✅ **React Frontend** - Pet-friendly venue discovery UI
✅ **ASP.NET Core Backend** - API with venue management
✅ **OpenAI Integration** - AI-powered pet analysis
✅ **Monitoring** - Azure Application Insights
✅ **Scalability** - Azure Container Apps auto-scaling
✅ **Security** - HTTPS, secure configuration

### Next Steps:

1. **Share the application** with users
2. **Monitor usage** and performance
3. **Collect feedback** for improvements
4. **Scale resources** as needed

Your application URLs will be displayed after deployment. Save them for future reference!