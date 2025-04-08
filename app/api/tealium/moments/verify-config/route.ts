import { NextRequest, NextResponse } from 'next/server';
import { properties } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    // Get configuration from centralized properties
    const account = properties.account;
    const profile = properties.profile;
    const engineId = properties.engineId;
    const dataSourceKey = properties.dataSourceKey;
    
    // Check for essential configuration
    const missingConfig = [];
    if (!account) missingConfig.push('account');
    if (!profile) missingConfig.push('profile');
    if (!engineId) missingConfig.push('engineId');
    
    // Construct the URLs we want to validate
    const region = 'eu-central-1'; // Default region used in your tests
    
    const endpointByVisitorId = `https://personalization-api.${region}.prod.tealiumapis.com/personalization/accounts/${account}/profiles/${profile}/engines/${engineId}/visitors/test-visitor-1`;
    
    const endpointByEmail = `https://personalization-api.${region}.prod.tealiumapis.com/personalization/accounts/${account}/profiles/${profile}/engines/${engineId}?attributeId=email&attributeValue=${encodeURIComponent(properties.email)}`;
    
    // Create a response object with configuration and URLs to test
    const configData = {
      configuration: {
        account,
        profile,
        engineId,
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
