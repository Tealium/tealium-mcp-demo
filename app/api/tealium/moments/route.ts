import { NextRequest, NextResponse } from 'next/server';
import { properties } from '@/lib/config';

/**
 * Tealium Moments API Base Route
 * 
 * This endpoint serves as an entry point for basic Moments API operations
 */
export async function GET(request: NextRequest) {
  try {
    // Get params from request
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    
    console.log(`[Moments API] GET request received for: ${email || 'no email provided'}`);
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email parameter is required' },
        { status: 400 }
      );
    }
    
    // Construct the visitor API endpoint
    const visitorEndpoint = `${properties.visitorApi}/visitors/lookup`;
    console.log(`[Moments API] Calling visitor lookup endpoint: ${visitorEndpoint}`);
    
    // Prepare request payload
    const payload = {
      attribute_id: 'primary_email',
      attribute_value: email,
      include_audiences: true,
      include_badges: true,
      include_metrics: true,
      include_properties: true,
      include_current_visit: true,
      include_flags: true
    };
    
    // Make the API request
    const response = await fetch(visitorEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    // Parse the response
    const data = await response.json();
    
    // Return the visitor data
    return NextResponse.json(
      { 
        success: response.ok, 
        data,
        account: properties.account,
        profile: properties.profile
      },
      { status: response.ok ? 200 : 500 }
    );
  } catch (error) {
    console.error('[Moments API] Error in GET handler:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

/**
 * POST handler for the Moments API
 * 
 * Used for more complex Moments API operations
 */
export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json();
    
    console.log('[Moments API] POST request received');
    
    // Extract operation from body
    const { operation } = body;
    
    if (!operation) {
      return NextResponse.json(
        { success: false, error: 'Operation parameter is required' },
        { status: 400 }
      );
    }
    
    // Mock response for demonstration purposes
    const mockData = {
      visitor: {
        visitor_id: "sample-visitor-id",
        audiences: ["New User", "Mobile User"],
        badges: ["Loyalty Member", "Frequent Shopper"],
        properties: {
          "name": properties.name,
          "location": properties.city
        },
        metrics: {
          "lifetime_value": 250.75,
          "visit_count": 12
        }
      },
      account: properties.account,
      profile: properties.profile
    };
    
    return NextResponse.json(
      { 
        success: true, 
        operation,
        data: mockData
      }
    );
  } catch (error) {
    console.error('[Moments API] Error in POST handler:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// Define the runtime to use Edge for better performance
export const runtime = 'edge';