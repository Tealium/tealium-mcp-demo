import { NextRequest, NextResponse } from 'next/server';
import { SAMPLE_DATA } from '@/lib/config';
import { v4 as uuidv4 } from 'uuid';

// Define interfaces for our lookupAttempt
interface LookupAttempt {
  approach: string;
  attempt: number;
  timestamp: string;
  url?: string;
  status?: number;
  statusText?: string;
  responseBody?: any;
  error?: string;
}

interface DebugInfo {
  sendEventDetails: {
    email: string;
    visitorId: string;
    eventName: string;
    customEventData: any;
    completeEventData: any;
    timestamp: string;
  };
  sendEventResponse: {
    status: number;
    statusText: string;
    responseBody: any;
  } | null;
  lookupAttempts: LookupAttempt[];
  finalLookupResult: LookupAttempt | null;
  success: boolean;
  message: string;
  recommendedAction: string;
  tealiumConfig: {
    account: string;
    profile: string;
    engineId: string;
    datasourceKeyPresent: boolean;
    apiKeyPresent: boolean;
  };
  apiKeyDetails?: {
    firstFiveChars?: string;
    lastFiveChars?: string;
    length?: number;
  };
}

// Enhanced debug endpoint for creating visitor profiles in Tealium
export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json();
    const { 
      email = SAMPLE_DATA.email || 'visitor@example.com',
      eventName = 'test_page_view',
      eventData = {},
      waitTimeMs = 5000, // Time to wait before attempting lookup
      retryCount = 3,    // Number of lookup attempts to make
      retryDelayMs = 3000 // Delay between retries
    } = body;

    // Get environment variables
    const account = process.env.TEALIUM_ACCOUNT || '';
    const profile = process.env.TEALIUM_PROFILE || '';
    const datasourceKey = process.env.TEALIUM_DATASOURCE_KEY || '';
    const apiKey = process.env.TEALIUM_MOMENTS_API_KEY || '';
    const engineId = process.env.TEALIUM_ENGINE_ID || '';

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured. Set TEALIUM_MOMENTS_API_KEY in environment variables.' },
        { status: 500 }
      );
    }

    // Generate a visitor ID if not provided
    const visitorId = uuidv4();
    
    // Create event data with enhanced attributes
    const completeEventData = {
      ...eventData,
      tealium_event: eventName,
      tealium_visitor_id: visitorId,
      email: email,
      // Additional attributes that might help visitor stitching
      customer_email: email,
      user_email: email,
      visitor_email: email,
      email_address: email,
      // Add timestamp
      event_timestamp: new Date().toISOString(),
      // Add random data to ensure uniqueness
      event_id: uuidv4()
    };

    // API Key information (without revealing the full key)
    const apiKeyDetails = apiKey ? {
      firstFiveChars: apiKey.substring(0, 5),
      lastFiveChars: apiKey.substring(apiKey.length - 5),
      length: apiKey.length
    } : undefined;

    // Debugging information to return to the caller
    const debugInfo: DebugInfo = {
      sendEventDetails: {
        email,
        visitorId,
        eventName,
        customEventData: eventData,
        completeEventData,
        timestamp: new Date().toISOString()
      },
      sendEventResponse: null,
      lookupAttempts: [],
      finalLookupResult: null,
      success: false,
      message: '',
      recommendedAction: '',
      tealiumConfig: {
        account,
        profile,
        engineId,
        datasourceKeyPresent: !!datasourceKey,
        apiKeyPresent: !!apiKey
      },
      apiKeyDetails
    };

    // Construct the URL for the Tealium EventStream API
    const eventStreamUrl = `https://collect.tealiumiq.com/event`;

    // Send the event to Tealium
    try {
      console.log(`[DEBUG] Sending event to Tealium for email ${email}`);
      const eventResponse = await fetch(eventStreamUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tealium-Account': account,
          'X-Tealium-Profile': profile,
          'X-Tealium-Key': datasourceKey || ''
        },
        body: JSON.stringify({
          tealium_account: account,
          tealium_profile: profile,
          tealium_visitor_id: visitorId,
          email,
          ...completeEventData
        })
      });

      const eventResponseBody = await eventResponse.text();
      
      console.log(`[DEBUG] Event response status: ${eventResponse.status} ${eventResponse.statusText}`);
      console.log(`[DEBUG] Event response body: ${eventResponseBody}`);
      
      debugInfo.sendEventResponse = {
        status: eventResponse.status,
        statusText: eventResponse.statusText,
        responseBody: eventResponseBody || '(empty response)'
      };

      if (!eventResponse.ok) {
        debugInfo.message = `Failed to send event to Tealium: ${eventResponse.status} ${eventResponse.statusText}`;
        debugInfo.recommendedAction = 'Check your Tealium datasource key and account configuration';
        return NextResponse.json(debugInfo, { status: 200 });
      }
    } catch (error) {
      console.error(`[ERROR] Exception sending event: ${(error as Error).message}`);
      debugInfo.message = `Exception sending event: ${(error as Error).message}`;
      debugInfo.recommendedAction = 'Check your network connection and Tealium endpoint';
      return NextResponse.json(debugInfo, { status: 200 });
    }

    // Wait before attempting lookup to allow time for Tealium to process the event
    await new Promise(resolve => setTimeout(resolve, waitTimeMs));

    // Attempt to look up the visitor using multiple approaches
    const approaches = [
      {
        name: 'Direct email lookup (attributeId)',
        url: `https://personalization-api.eu-central-1.prod.tealiumapis.com/personalization/accounts/${account}/profiles/${profile}/engines/${engineId}?attributeId=email&attributeValue=${encodeURIComponent(email)}`
      },
      {
        name: 'Visitor ID lookup',
        url: `https://personalization-api.eu-central-1.prod.tealiumapis.com/personalization/accounts/${account}/profiles/${profile}/engines/${engineId}/visitors/${encodeURIComponent(visitorId)}`
      },
      {
        name: 'Alternative email lookup',
        url: `https://personalization-api.eu-central-1.prod.tealiumapis.com/personalization/accounts/${account}/profiles/${profile}/lookup?email=${encodeURIComponent(email)}`
      },
      {
        name: 'Direct visitor lookup (no engine)',
        url: `https://personalization-api.eu-central-1.prod.tealiumapis.com/personalization/accounts/${account}/profiles/${profile}/visitors/lookup?attributeId=email&attributeValue=${encodeURIComponent(email)}`
      },
      {
        name: 'AudienceStream lookup',
        url: `https://api.tealiumiq.com/audiencestream/v2/accounts/${account}/profiles/${profile}/lookup?email=${encodeURIComponent(email)}`
      }
    ];

    // Try each lookup approach with retries
    for (let approach of approaches) {
      let lookupSuccess = false;
      
      for (let attempt = 1; attempt <= retryCount; attempt++) {
        try {
          console.log(`[DEBUG] Trying lookup approach: ${approach.name}, attempt ${attempt}`);
          console.log(`[DEBUG] URL: ${approach.url}`);
          
          const lookupResponse = await fetch(approach.url, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });

          let responseBody;
          try {
            responseBody = await lookupResponse.json();
          } catch (e) {
            const text = await lookupResponse.text();
            responseBody = { rawText: text };
          }

          console.log(`[DEBUG] Lookup response status: ${lookupResponse.status} ${lookupResponse.statusText}`);
          
          const attemptInfo: LookupAttempt = {
            approach: approach.name,
            attempt,
            timestamp: new Date().toISOString(),
            url: approach.url,
            status: lookupResponse.status,
            statusText: lookupResponse.statusText,
            responseBody
          };

          debugInfo.lookupAttempts.push(attemptInfo);

          // If we found the visitor, store the result and exit
          if (lookupResponse.ok) {
            console.log(`[DEBUG] Successfully found visitor using ${approach.name}`);
            debugInfo.finalLookupResult = attemptInfo;
            debugInfo.success = true;
            debugInfo.message = `Visitor found using ${approach.name} on attempt ${attempt}`;
            lookupSuccess = true;
            break;
          } else {
            console.log(`[DEBUG] Lookup failed with status ${lookupResponse.status}`);
          }
          
          // Wait before retrying
          if (attempt < retryCount) {
            await new Promise(resolve => setTimeout(resolve, retryDelayMs));
          }
        } catch (error) {
          console.error(`[ERROR] Exception during lookup: ${(error as Error).message}`);
          const errorAttempt: LookupAttempt = {
            approach: approach.name,
            attempt,
            timestamp: new Date().toISOString(),
            error: (error as Error).message
          };
          
          debugInfo.lookupAttempts.push(errorAttempt);
        }
      }

      // If we found the visitor, no need to try other approaches
      if (lookupSuccess) {
        break;
      }
    }

    // Final result handling
    if (!debugInfo.success) {
      console.log(`[DEBUG] Failed to find visitor after all lookup attempts`);
      debugInfo.message = 'Failed to find visitor after sending event';
      debugInfo.recommendedAction = 'Wait longer before lookup, check Tealium configuration, or verify visitor ID attribute settings';
    }

    return NextResponse.json(debugInfo, { status: 200 });
  } catch (error) {
    console.error('Error in debug-event-creation:', error);
    return NextResponse.json(
      { error: 'Error processing request', message: (error as Error).message },
      { status: 500 }
    );
  }
}
