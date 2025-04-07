import { NextRequest, NextResponse } from 'next/server';

/**
 * Server-side tracking endpoint to guarantee direct server-to-server communication
 * with Tealium. Completely bypasses client-side implementation to ensure tracking
 * reliability and avoid CORS issues.
 */
export async function POST(request: NextRequest) {
  return await handleRequest(request, 'POST');
}

export async function GET(request: NextRequest) {
  return await handleRequest(request, 'GET');
}

/**
 * Handles both GET and POST requests to ensure maximum compatibility with Tealium
 */
async function handleRequest(request: NextRequest, method: 'GET' | 'POST') {
  try {
    // Extract payload based on method
    let payload: any = {};
    
    if (method === 'POST') {
      try {
        // Get the payload from the request body
        // Clone the request to avoid "body already used" errors
        const clonedRequest = request.clone();
        payload = await clonedRequest.json();
      } catch (error) {
        console.error('Error parsing request body:', error);
        return NextResponse.json({
          success: false,
          error: 'Invalid JSON body',
          timestamp: new Date().toISOString()
        }, { status: 400 });
      }
    } else {
      // For GET requests, extract from URL parameters
      const url = new URL(request.url);
      url.searchParams.forEach((value, key) => {
        payload[key] = value;
      });
    }
    
    // Extract the event type
    const { 
      event_type,
      tealium_account, 
      tealium_profile, 
      tealium_datasource, 
      tealium_trace_id,
      tealium_event
    } = payload;

    console.log(`Processing Server-Side Tealium event via ${method}:`);
    console.log(`Account/Profile: ${tealium_account || process.env.TEALIUM_ACCOUNT}/${tealium_profile || process.env.TEALIUM_PROFILE}`);
    
    if (tealium_trace_id) {
      console.log(`Trace ID for debugging: ${tealium_trace_id}`);
    }
    
    // Format the payload for the Tealium Collect API
    const formattedPayload = {
      ...payload,
      tealium_account: tealium_account || process.env.TEALIUM_ACCOUNT || '',
      tealium_profile: tealium_profile || process.env.TEALIUM_PROFILE || '',
      tealium_datasource: tealium_datasource || process.env.TEALIUM_DATASOURCE_KEY || '',
      tealium_event: tealium_event || `mcp_${event_type || 'event'}`, // Use provided event name or create one
      cp_test: "tealium_mcp_ingestion", // For debugging
      server_side: true // Flag to indicate this is server-side tracking
    };
    
    // Add trace ID to the payload data if provided
    if (tealium_trace_id) {
      formattedPayload["cp.trace_id"] = tealium_trace_id;
    }
    
    // The Tealium Collect API endpoint - Direct server-to-server connection
    const tealiumEndpoint = 'https://collect.tealiumiq.com/event';
    
    console.log(`Sending to Tealium Collect API from server via ${method}: ${tealiumEndpoint}`);
    console.log('Server formatted payload:', JSON.stringify(formattedPayload, null, 2));
    
    let response;
    
    try {
      if (method === 'POST') {
        // Send the data to Tealium using POST with JSON body
        response = await fetch(tealiumEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(formattedPayload)
        });
      } else {
        // For GET requests, convert payload to query parameters
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(formattedPayload)) {
          if (value !== undefined && value !== null) {
            if (typeof value === 'object') {
              params.append(key, JSON.stringify(value));
            } else {
              params.append(key, String(value));
            }
          }
        }
        
        // Send the data to Tealium using GET with query parameters
        response = await fetch(`${tealiumEndpoint}?${params.toString()}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Error sending to Tealium:', error);
      return NextResponse.json({
        success: false,
        error: `Error sending to Tealium: ${error}`,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
    // Check if the response is successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Tealium API Error: ${response.status} ${response.statusText}`);
      console.error('Error details:', errorText);
      
      return NextResponse.json({
        success: false,
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        timestamp: new Date().toISOString(),
        tealium_trace_id
      }, { status: 500 });
    }
    
    // Parse the response if possible
    let responseData;
    try {
      responseData = await response.json();
    } catch (e) {
      // Response might not be JSON
      responseData = await response.text();
    }
    
    console.log(`Server Tealium API response: ${response.status}`, 
      response.ok ? 'SUCCESS' : 'FAILED',
      typeof responseData === 'string' ? responseData : JSON.stringify(responseData, null, 2));
    
    // Return a success response with the Tealium response data
    return NextResponse.json({
      success: true,
      message: `Data sent to Tealium successfully (${event_type})`,
      tealium_response: responseData,
      timestamp: new Date().toISOString(),
      tealium_trace_id
    });
    
  } catch (error) {
    console.error('Error in server-side tracking:', error);
    
    // Return an error response
    return NextResponse.json({
      success: false,
      error: String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Define the runtime to use Edge for better performance
export const runtime = 'edge';
