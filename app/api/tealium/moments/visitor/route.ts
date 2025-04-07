import { NextRequest, NextResponse } from 'next/server';
import { TEALIUM_ACCOUNT, TEALIUM_PROFILE, TEALIUM_VISITOR_API, SAMPLE_DATA } from '@/lib/config';

/**
 * Tealium Moments API Visitor Endpoint
 * 
 * This endpoint fetches visitor data from Tealium Moments API
 */
export async function GET(request: NextRequest) {
  try {
    // Get the email from the query parameters
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    
    console.log(`[Moments Visitor] Fetching visitor data for email: ${email}`);
    console.log(`[Moments Visitor] Using account: ${TEALIUM_ACCOUNT}, profile: ${TEALIUM_PROFILE}`);
    
    // Validate email
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Missing email parameter' },
        { status: 400 }
      );
    }
    
    // Construct the Moments API endpoint for visitor lookup
    const momentsEndpoint = `${TEALIUM_VISITOR_API}/${TEALIUM_ACCOUNT}/${TEALIUM_PROFILE}/visitors/${encodeURIComponent(email)}`;
    console.log(`[Moments Visitor] Calling Moments API at: ${momentsEndpoint}`);
    
    // Make the API request
    const response = await fetch(momentsEndpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    // Get the response as text first to safely handle non-JSON responses
    const responseText = await response.text();
    console.log(`[Moments Visitor] Response status: ${response.status}`);
    
    try {
      // Try to parse as JSON
      const responseData = JSON.parse(responseText);
      console.log('[Moments Visitor] Successfully parsed response as JSON');
      
      if (response.status === 404) {
        // This is normal for a new visitor - just return empty data
        console.log(`[Moments Visitor] Visitor not found (this is normal for new visitors)`);
        return NextResponse.json({
          success: false,
          error: "Visitor not found",
          message: responseData.message || "No visitor profile found",
          status: 404
        });
      }
      
      // Return the visitor profile data
      return NextResponse.json({
        success: true,
        visitor_id: email,
        status: response.status,
        data: responseData
      });
    } catch (e: any) {
      // If we can't parse as JSON, return the text response
      console.error('[ERROR] Unable to parse Moments API visitor response as JSON:', e.message);
      console.error(`[ERROR] Raw response (first 500 chars): ${responseText.substring(0, 500)}`);
      
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON response from Moments API',
        message: e.message,
        rawResponse: responseText.substring(0, 1000) // Truncate very long responses
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('[ERROR] Error in Moments visitor API route:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error in Moments visitor API route'
    }, { status: 500 });
  }
}

/**
 * POST handler for the Moments API Visitor Endpoint
 * This allows more flexibility in how we lookup visitors, supporting both
 * direct visitor ID lookups and attribute-based lookups from the request body
 */
export async function POST(request: NextRequest) {
  try {
    // Extract request body parameters
    const body = await request.json();
    const { 
      account = TEALIUM_ACCOUNT, 
      profile = TEALIUM_PROFILE, 
      engine_id,  
      visitor_id, 
      attribute_id, 
      attribute_value 
    } = body;
    
    // For backwards compatibility, also try camelCase if snake_case is undefined
    const engineId = engine_id || body.engineId || '';
    
    console.log(`[Moments Visitor] POST request received`);
    
    if (!engineId) {
      return NextResponse.json({
        success: false,
        error: 'Missing engineId parameter',
        message: 'Engine ID is required for Moments API'
      }, { status: 400 });
    }
    
    // Determine which type of lookup to perform
    let momentsApiEndpoint = '';
    
    if (visitor_id) {
      // Visitor ID lookup
      momentsApiEndpoint = `https://personalization-api.eu-central-1.prod.tealiumapis.com/personalization/accounts/${account}/profiles/${profile}/engines/${engineId}/visitors/${encodeURIComponent(visitor_id)}`;
      console.log(`[Moments Visitor] Performing visitor ID lookup: ${visitor_id}`);
    } else if (attribute_id && attribute_value) {
      // Attribute-based lookup
      momentsApiEndpoint = `https://personalization-api.eu-central-1.prod.tealiumapis.com/personalization/accounts/${account}/profiles/${profile}/engines/${engineId}/visitors?attributeId=${encodeURIComponent(attribute_id)}&attributeValue=${encodeURIComponent(attribute_value)}`;
      console.log(`[Moments Visitor] Performing attribute lookup: ${attribute_id}=${attribute_value}`);
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid lookup parameters',
        message: 'Either visitorId or both attributeId and attributeValue must be provided'
      }, { status: 400 });
    }
    
    console.log(`[Moments Visitor] Looking up visitor data for: ${visitor_id || attribute_id}=${attribute_value}`);
    console.log(`[Moments Visitor] Using Tealium account: ${account}, profile: ${profile}`);
    
    // Add detailed logging for the request
    if (visitor_id && visitor_id.includes('@')) {
      console.log(`[Moments Visitor] Email-based lookup detected. Will search visitor profiles by email attribute.`);
    } else if (visitor_id) {
      console.log(`[Moments Visitor] Standard visitor ID lookup. Using direct visitor ID endpoint.`);
    } else {
      console.log(`[Moments Visitor] Attribute-based lookup. Searching visitors by ${attribute_id}=${attribute_value}`);
    }
    
    console.log(`[Moments Visitor] Calling Tealium Moments API: ${momentsApiEndpoint}`);
    
    // Prepare headers
    const headers: HeadersInit = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
    
    // Make the API request
    const response = await fetch(momentsApiEndpoint, {
      method: 'GET',
      headers,
      cache: 'no-store'
    });
    
    console.log(`[Moments Visitor] Moments API response status: ${response.status}`);
    
    // Handle non-OK responses
    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = 'Could not read error response';
      }
      
      console.error(`[Moments Visitor] Error from Moments API: ${response.status}`, errorText);
      
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json({
          success: false,
          error: 'Authentication failed',
          message: 'Authentication failed. You may need an API key for this Tealium instance.',
          status: response.status
        }, { status: response.status });
      }
      
      if (response.status === 404) {
        return NextResponse.json({
          success: false,
          error: 'Visitor not found',
          message: attribute_id 
            ? `No visitor found with ${attribute_id}=${attribute_value}` 
            : `Visitor ID '${visitor_id}' not found in Tealium`,
          status: 404
        }, { status: 404 });
      }
      
      return NextResponse.json({
        success: false,
        error: `API request failed with status ${response.status}`,
        details: errorText,
        status: response.status
      }, { status: response.status });
    }
    
    // Parse the successful response
    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      trace_id: `moments-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      visitor_id: visitor_id || data.visitor_id,
      attribute_lookup: attribute_id ? { id: attribute_id, value: attribute_value } : undefined,
      ...data
    });
    
  } catch (error: any) {
    console.error('[Moments Visitor] Error in Visitor API (POST):', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error.message || 'Unknown error'
    }, { status: 500 });
  }
}

// Define the runtime to use Edge for better performance
export const runtime = 'edge';
