import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get environment variables
    const account = process.env.TEALIUM_ACCOUNT || '';
    const profile = process.env.TEALIUM_PROFILE || '';
    const engineId = process.env.TEALIUM_ENGINE_ID || '';
    const apiKey = process.env.TEALIUM_MOMENTS_API_KEY;
    const dataSourceKey = process.env.TEALIUM_DATASOURCE_KEY || '';
    
    // Check for essential configuration
    const missingConfig = [];
    if (!account) missingConfig.push('TEALIUM_ACCOUNT');
    if (!profile) missingConfig.push('TEALIUM_PROFILE');
    if (!engineId) missingConfig.push('TEALIUM_ENGINE_ID');
    if (!apiKey) missingConfig.push('TEALIUM_MOMENTS_API_KEY');
    
    // Construct the URLs we want to validate
    const region = 'eu-central-1'; // Default region used in your tests
    
    const endpointByVisitorId = `https://personalization-api.${region}.prod.tealiumapis.com/personalization/accounts/${account}/profiles/${profile}/engines/${engineId}/visitors/test-visitor-1`;
    
    const endpointByEmail = `https://personalization-api.${region}.prod.tealiumapis.com/personalization/accounts/${account}/profiles/${profile}/engines/${engineId}?attributeId=email&attributeValue=evarodenas%40hotmail.com`;
    
    // Create a response object with configuration and URLs to test
    const configData = {
      configuration: {
        account,
        profile,
        engineId,
        apiKeySet: !!apiKey,
        dataSourceKey,
        region,
      },
      testEndpoints: {
        byVisitorId: endpointByVisitorId,
        byEmail: endpointByEmail,
      },
      missingConfiguration: missingConfig.length > 0 ? missingConfig : null,
      recommendations: [
        "Ensure that visitor data exists in Tealium (visitors must have logged active sessions)",
        "Verify your account, profile, and engine ID in Tealium",
        "Check API key permissions in Tealium",
        "Confirm the correct region is being used (default: eu-central-1)",
        "Try running test events to create visitor data before looking it up"
      ]
    };
    
    return NextResponse.json(configData, { status: 200 });
  } catch (error) {
    console.error('Error in verify-config endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: (error as Error).message },
      { status: 500 }
    );
  }
}
