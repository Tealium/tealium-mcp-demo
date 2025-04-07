import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get the payload from the request
    const payload = await request.json();
    
    // Extract the Tealium configuration from the request
    const { 
      account: tealiumAccount, 
      profile: tealiumProfile, 
      dataSourceKey: tealiumDataSourceKey, 
      integration = 'eventstream', 
      debug: tealiumDebug = false,
      tealiumTraceId
    } = payload;
    
    // Check if this is coming from a "both" integration type request
    const isBothIntegration = integration === 'both';
    
    // For debugging only
    console.log(`Processing Tealium API request: ${tealiumAccount}/${tealiumProfile}`);
    console.log(`Integration type: ${integration}${isBothIntegration ? ' (sending to both APIs)' : ''}`);
    if (tealiumTraceId) {
      console.log(`Trace ID for debugging: ${tealiumTraceId}`);
    }
    console.log(`Request headers:`, request.headers);
    console.log(`Request payload:`, JSON.stringify(payload, null, 2));
    
    // Check if we should use the Moments API (either moments only or both)
    if (integration === 'moments' || isBothIntegration) {
      // Forward to the Moments API endpoint
      try {
        console.log('Forwarding to Moments API');
        
        // The rest of this block is handled by the moments/route.ts file
        const momentsResponse = await fetch(new URL('/api/tealium/moments', request.url), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });
        
        if (!momentsResponse.ok) {
          console.error(`Error forwarding to Moments API: ${momentsResponse.status}`);
        } else {
          console.log('Successfully forwarded to Moments API');
        }
        
        // If moments only, return the response
        if (integration === 'moments') {
          const responseText = await momentsResponse.text();
          try {
            return NextResponse.json(JSON.parse(responseText));
          } catch (e) {
            return NextResponse.json({ success: false, error: responseText });
          }
        }
      } catch (error) {
        console.error('Error forwarding to Moments API:', error);
        
        // If moments only, return the error
        if (integration === 'moments') {
          return NextResponse.json({ success: false, error: String(error) });
        }
      }
    }
    
    // Only proceed if integration is eventstream or both
    if (integration !== 'eventstream' && !isBothIntegration) {
      return NextResponse.json({ success: false, error: 'Skipping EventStream API since integration type is not eventstream or both' });
    }
    
    // Format the payload in the required structure for the collect endpoint
    const formattedPayload = {
      ...payload,
      tealium_account: tealiumAccount,
      tealium_profile: tealiumProfile,
      tealium_datasource: tealiumDataSourceKey,
      tealium_event: "model_context_protocol", // Required field for event identification
      cp_test: "tealium_mcp_ingestion" // Add a test variable to help with debugging
    };
    
    // Add trace ID to the payload data if provided
    if (tealiumTraceId) {
      formattedPayload["cp.trace_id"] = tealiumTraceId;
    }
    
    // The Tealium Collect API endpoint - Using EventStream endpoint
    const tealiumEndpoint = `https://collect.tealiumiq.com/event`;
    
    console.log(`Sending to Tealium Collect API: ${tealiumEndpoint}`);
    console.log('Formatted payload:', JSON.stringify(formattedPayload, null, 2));
    
    // Send the data to Tealium using the JSON with headers method (confirmed working)
    const response = await fetch(tealiumEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tealium-Account': tealiumAccount,
        'X-Tealium-Profile': tealiumProfile,
        'X-Tealium-Key': tealiumDataSourceKey
      },
      body: JSON.stringify(formattedPayload)
    });
    
    // Log the response
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));
    
    // Parse the response
    let responseData;
    let responseText = '';
    let tealiumTraceIdFromResponse = '';
    
    // Check for trace ID in response headers
    const traceIdHeader = response.headers.get('X-Tealium-Trace-ID') || 
                          response.headers.get('X-Tealium-Trace-Id') || 
                          response.headers.get('X-Tealium-Traceid');
    
    if (traceIdHeader) {
      tealiumTraceIdFromResponse = traceIdHeader;
      console.log('Received Tealium trace ID from response headers:', tealiumTraceIdFromResponse);
    }
    
    try {
      responseText = await response.text();
      console.log('Raw Tealium response:', responseText);
      
      try {
        responseData = JSON.parse(responseText);
        
        // Check for trace ID in response body
        if (responseData && (responseData.trace_id || responseData.traceId || responseData.traceid)) {
          tealiumTraceIdFromResponse = responseData.trace_id || responseData.traceId || responseData.traceid;
          console.log('Received Tealium trace ID from response body:', tealiumTraceIdFromResponse);
        }
      } catch (e) {
        responseData = responseText;
      }
    } catch (e) {
      responseData = 'Failed to read response body';
    }
    
    console.log('Tealium API response status:', response.status);
    
    // Return the response
    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'Data sent to Tealium successfully',
        tealium_response: responseData || responseText,
        timestamp: new Date().toISOString(),
        tealium_trace_id: tealiumTraceIdFromResponse || null
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Error sending data to Tealium',
        status: response.status,
        statusText: response.statusText,
        tealium_response: responseData || responseText,
        timestamp: new Date().toISOString(),
        tealium_trace_id: tealiumTraceIdFromResponse || null
      }, { status: response.status });
    }
  } catch (error) {
    console.error('Error processing Tealium request:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// Define the runtime to use Edge for better performance
export const runtime = 'edge'; 