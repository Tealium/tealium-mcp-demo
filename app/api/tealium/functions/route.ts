import { NextResponse } from 'next/server';

/**
 * Tealium Functions API endpoint
 * This endpoint proxies requests to Tealium's Functions API for visitor data processing
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { account, profile, visitor_id, events } = body;
    
    if (!account || !profile || !visitor_id || !events) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // The API endpoint for Tealium Functions
    const functionsApiEndpoint = `https://functions.tealiumiq.com/functions/${account}/${profile}/dist/`;
    
    // Make the request to Tealium Functions API
    const response = await fetch(functionsApiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        visitor_id,
        events
      }),
    });
    
    // Handle error responses
    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = 'Could not read error response';
      }
      
      console.error(`Error from Tealium Functions API: ${response.status}`, errorText);
      
      return NextResponse.json(
        { 
          error: `Tealium Functions API request failed with status ${response.status}`,
          details: errorText
        },
        { status: response.status }
      );
    }
    
    // Return the response from Tealium Functions API
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in Tealium Functions API proxy:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 