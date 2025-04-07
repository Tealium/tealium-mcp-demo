import { NextRequest, NextResponse } from 'next/server';
import { TEALIUM_ACCOUNT, TEALIUM_PROFILE, TEALIUM_ENGINE_ID, SAMPLE_DATA } from '@/lib/config';

interface EndpointTest {
  name: string;
  url: string;
  response: any;
  status: number | null;
  error: string | null;
}

export async function GET(request: NextRequest) {
  try {
    // Get account configuration from centralized config
    const account = TEALIUM_ACCOUNT;
    const profile = TEALIUM_PROFILE;
    const engineId = TEALIUM_ENGINE_ID;
    const apiKey = process.env.TEALIUM_MOMENTS_API_KEY || '';
    
    // Get email from query params or use default
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email') || SAMPLE_DATA.email;
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
            'Authorization': `Bearer ${apiKey}`,
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
    
    // Additional curl command for users to try
    const curlCommands = {
      exactAttributePattern: `curl -H "Authorization: Bearer YOUR_API_KEY" "https://personalization-api.eu-central-1.prod.tealiumapis.com/personalization/accounts/${account}/profiles/${profile}/engines/${engineId}/attributes/id:email/values/${encodeURIComponent(email)}"`,
      exactVisitorPattern: `curl -H "Authorization: Bearer YOUR_API_KEY" "https://personalization-api.eu-central-1.prod.tealiumapis.com/personalization/accounts/${account}/profiles/${profile}/engines/${engineId}/visitors/${visitorId}"`
    };
    
    // Determine API key issue
    let apiKeyIssue = "No issue detected";
    if (apiKey.length < 30) {
      apiKeyIssue = "API key appears to be a placeholder or invalid (too short)";
    } else if (apiKey.includes("YOUR_API_KEY") || apiKey.includes("your_tealium_api_key")) {
      apiKeyIssue = "API key is still using placeholder value";
    }
    
    // Access and API info
    return NextResponse.json({
      testEmail: email,
      tealiumConfig: {
        account,
        profile,
        engineId,
        apiKeyConfigured: apiKey.length > 0,
        apiKeyLength: apiKey.length,
        apiKeyMasked: apiKey ? `${apiKey.substring(0, 3)}...${apiKey.substring(apiKey.length - 3)}` : 'Not configured',
        apiKeyIssue
      },
      endpointTests: endpoints,
      apiDocumentation: {
        visitorAPI: 'https://docs.tealium.com/server-side/personalization/api/#visitor-api',
        audienceStreamAPI: 'https://community.tealiumiq.com/t5/Customer-Data-Hub/Audience-Stream-REST-APIs/ta-p/15991'
      },
      curlCommands: curlCommands,
      recommendedActions: [
        "1. Update your API key to a valid key from Tealium CDH → Admin → API Access",
        "2. Ensure your API key has 'Visitor Profile API' permissions",
        "3. Use the exact URL patterns from the screenshots for lookups"
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
