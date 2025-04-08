import { NextRequest, NextResponse } from 'next/server';
import { properties } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    // Better error handling for request parsing
    let body;
    try {
      // Clone the request to ensure the body can be read
      const clonedRequest = request.clone();
      const bodyText = await clonedRequest.text();
      console.log('Request body text:', bodyText);
      
      if (!bodyText || bodyText.trim() === '') {
        return NextResponse.json(
          { error: 'Empty request body' },
          { status: 400 }
        );
      }
      
      body = JSON.parse(bodyText);
      console.log('Parsed body:', body);
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body', details: (parseError as Error).message },
        { status: 400 }
      );
    }
    
    const { email, customVisitorId, eventName, eventData } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Get account configuration from centralized properties
    const account = properties.account;
    const profile = properties.profile;
    const dataSourceKey = properties.dataSourceKey;
    
    // Create a visitor ID if none was provided (based on email)
    const visitorId = customVisitorId || `email-${email.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}`;
    
    // Build the event payload
    const payload = {
      tealium_account: account,
      tealium_profile: profile,
      tealium_visitor_id: visitorId,
      email: email,
      event_name: eventName || 'test_event',
      timestamp_epoch: Math.floor(Date.now() / 1000),
      ...eventData
    };

    // Define event collection endpoint - UPDATED TO USE WORKING API PATTERN
    const eventEndpoint = properties.collectApi;
    
    console.log(`Sending test event to: ${eventEndpoint}`);
    console.log('Payload:', JSON.stringify(payload, null, 2));

    // Send the event using the working header-based approach
    const response = await fetch(eventEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tealium-Account': account,
        'X-Tealium-Profile': profile,
        'X-Tealium-Key': dataSourceKey
      },
      body: JSON.stringify(payload)
    });

    // Log all response details for debugging
    console.log('Tealium response status:', response.status, response.statusText);
    
    // Log headers in a TypeScript-compatible way
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    console.log('Tealium response headers:', headers);
    
    // Check response
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error sending event:', errorText);
      return NextResponse.json(
        { 
          error: 'Failed to send event', 
          status: response.status, 
          details: errorText 
        },
        { status: response.status }
      );
    }

    // Try to parse the response as JSON, but handle text responses as well
    let responseData;
    const contentType = response.headers.get('content-type');
    try {
      // First, read the response text
      const responseText = await response.text();
      console.log('Raw response text:', responseText, 'Length:', responseText.length);
      
      // Handle empty responses
      if (!responseText || responseText.trim() === '') {
        console.log('Empty response received from Tealium API');
        responseData = { 
          responseText: '(empty response)', 
          message: 'Success - no content returned'
        };
      } 
      // Handle JSON responses
      else if (contentType && contentType.includes('application/json')) {
        try {
          responseData = JSON.parse(responseText);
        } catch (jsonError) {
          console.warn('Failed to parse response as JSON despite content-type:', jsonError);
          responseData = { responseText };
        }
      } 
      // Handle non-JSON responses
      else {
        responseData = { responseText };
      }
    } catch (parseError) {
      console.error('Error reading response body:', parseError);
      responseData = { 
        parseError: (parseError as Error).message,
        note: 'Tealium request was likely successful, but response could not be processed'
      };
    }

    // Return success with visitor ID
    return NextResponse.json({
      success: true,
      visitorId,
      email,
      response: responseData
    });
  } catch (error) {
    console.error('Error in send-test-event endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: (error as Error).message },
      { status: 500 }
    );
  }
}
