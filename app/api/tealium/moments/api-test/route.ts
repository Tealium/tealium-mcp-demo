import { NextRequest, NextResponse } from 'next/server';
import { properties } from '@/lib/config';

interface EndpointTest {
  name: string;
  url: string;
  response: any;
  status: number | null;
  error: string | null;
}

export async function GET(request: NextRequest) {
  try {
    // Get account configuration from centralized properties
    const account = properties.account;
    const profile = properties.profile;
    const engineId = properties.engineId;
    
    // Get email from query params or use default
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email') || properties.email;
    const visitorId = searchParams.get('visitorId') || 'tealium_visitor_id';
    
    // Test multiple API endpoints to determine which one works
    const endpoints: EndpointTest[] = [
      {
        name: 'Exact Visitor ID Attribute Pattern (from screenshot)',
        url: `https://personalization-api.eu-central-1.prod.tealiumapis.com/personalization/accounts/${account}/profiles/${profile}/engines/${engineId}/attributes/id:email/values/${encodeURIComponent(email)}`,
        response: null,
        status: null,
        error: null
      },
      {
        name: 'Exact Visitor ID Lookup Pattern (from screenshot)',
        url: `https://personalization-api.eu-central-1.prod.tealiumapis.com/personalization/accounts/${account}/profiles/${profile}/engines/${engineId}/visitors/${encodeURIComponent(visitorId)}`,
        response: null,
        status: null,
        error: null
      },
      {
        name: 'Standard Engine Direct Email Lookup',
        url: `https://personalization-api.eu-central-1.prod.tealiumapis.com/personalization/accounts/${account}/profiles/${profile}/engines/${engineId}?attributeId=email&attributeValue=${encodeURIComponent(email)}`,
        response: null,
        status: null,
        error: null
      },
      {
        name: 'Standard Profile Email Lookup',
        url: `https://personalization-api.eu-central-1.prod.tealiumapis.com/personalization/accounts/${account}/profiles/${profile}/lookup?email=${encodeURIComponent(email)}`,
        response: null,
        status: null,
        error: null
      }
    ];
    
    // Test each endpoint
    for (let endpoint of endpoints) {
      try {
        console.log(`Testing endpoint: ${endpoint.name} - ${endpoint.url}`);
        
        const response = await fetch(endpoint.url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        endpoint.status = response.status;
        
        try {
          endpoint.response = await response.json();
        } catch (e) {
          try {
            const text = await response.text();
            endpoint.response = { raw: text };
          } catch (err) {
            endpoint.response = { error: 'Could not read response body' };
          }
        }
        
        console.log(`Response for ${endpoint.name}: ${endpoint.status}`);
      } catch (error) {
        endpoint.error = (error as Error).message;
        console.error(`Error testing ${endpoint.name}: ${endpoint.error}`);
      }
    }
    
    // Generate report of environment and configuration data
    let accountIssue = "No issue detected";
    let profileIssue = "No issue detected";
    let engineIdIssue = "No issue detected";
    
    if (account.length < 1) {
      accountIssue = "Account name appears to be missing";
    } else if (account.includes("YOUR_ACCOUNT")) {
      accountIssue = "Account is still using placeholder value";
    }
    
    if (profile.length < 1) {
      profileIssue = "Profile name appears to be missing";
    } else if (profile.includes("YOUR_PROFILE")) {
      profileIssue = "Profile is still using placeholder value";
    }
    
    if (engineId.length < 1) {
      engineIdIssue = "Engine ID appears to be missing";
    } else if (engineId.includes("YOUR_ENGINE_ID")) {
      engineIdIssue = "Engine ID is still using placeholder value";
    }
    
    // Additional curl command for users to try
    const curlCommands = {
      exactAttributePattern: `curl "https://personalization-api.eu-central-1.prod.tealiumapis.com/personalization/accounts/${account}/profiles/${profile}/engines/${engineId}/attributes/id:email/values/${encodeURIComponent(email)}"`,
      exactVisitorPattern: `curl "https://personalization-api.eu-central-1.prod.tealiumapis.com/personalization/accounts/${account}/profiles/${profile}/engines/${engineId}/visitors/${visitorId}"`
    };
    
    // Return all results
    return NextResponse.json({
      success: true,
      environmentData: {
        accountConfigured: account.length > 0,
        accountName: account,
        profileConfigured: profile.length > 0,
        profileName: profile,
        engineIdConfigured: engineId.length > 0,
        engineIdValue: engineId,
        accountIssue,
        profileIssue,
        engineIdIssue
      },
      endpointTests: endpoints,
      apiDocumentation: {
        visitorAPI: 'https://docs.tealium.com/server-side/personalization/api/#visitor-api',
        audienceStreamAPI: 'https://community.tealiumiq.com/t5/Customer-Data-Hub/Audience-Stream-REST-APIs/ta-p/15991'
      },
      curlCommands: curlCommands,
      recommendedActions: [
        "1. Ensure your account, profile, and engine ID are correctly configured",
        "2. Use the exact URL patterns from the screenshots for lookups"
      ]
    }, { status: 200 });
  } catch (error) {
    console.error('Error in API test:', error);
    return NextResponse.json(
      { error: 'Error processing request', message: (error as Error).message },
      { status: 500 }
    );
  }
}
