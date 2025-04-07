import { NextRequest, NextResponse } from 'next/server';
import { TEALIUM_ACCOUNT, TEALIUM_PROFILE, TEALIUM_DATASOURCE_KEY, TEALIUM_COLLECT_API, MCP_CONFIG, DEBUG_CONFIG } from '@/lib/config';

/**
 * Track Query endpoint for Tealium integration
 * 
 * This endpoint handles tracking of MCP query events to Tealium
 */
export async function POST(request: NextRequest) {
  try {
    // Get the payload from the request
    const payload = await request.json();
    
    // Extract key fields
    const { 
      query_id,
      query,
      visitor_id,
      context,
      model_config,
      tealium_account, 
      tealium_profile, 
      tealium_datasource, 
      tealium_trace_id,
      event_name,
      cp_test_value
    } = payload;

    if (DEBUG_CONFIG.enableDebugLogs) {
      console.log(`Processing MCP Query Event for ${visitor_id}`);
      console.log(`Account/Profile: ${tealium_account || TEALIUM_ACCOUNT}/${tealium_profile || TEALIUM_PROFILE}`);
    }
    
    // Format the payload for the Tealium Collect API
    const formattedPayload = {
      ...payload,
      tealium_account: tealium_account || TEALIUM_ACCOUNT,
      tealium_profile: tealium_profile || TEALIUM_PROFILE,
      tealium_datasource: tealium_datasource || TEALIUM_DATASOURCE_KEY,
      tealium_event: event_name || MCP_CONFIG.defaultQueryEvent,
      cp_test: cp_test_value || MCP_CONFIG.defaultCpTestValue,
      server_side: MCP_CONFIG.serverSideFlag,
      timestamp: new Date().toISOString() // Add timestamp to avoid caching
    };
    
    // Add trace ID to the payload data if provided
    if (tealium_trace_id) {
      formattedPayload["cp.trace_id"] = tealium_trace_id;
    }
    
    if (DEBUG_CONFIG.logPayloads) {
      console.log(`Sending query event to Tealium: ${TEALIUM_COLLECT_API}`);
    }
    
    try {
      // Send the data to Tealium using POST
      const response = await fetch(TEALIUM_COLLECT_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formattedPayload)
      });
      
      // Check if the request was successful
      if (response.ok) {
        return NextResponse.json({ 
          success: true, 
          message: 'Query event tracked successfully',
          query_id
        });
      } else {
        console.error(`Error tracking query event: ${response.status} ${response.statusText}`);
        return NextResponse.json({ 
          success: false, 
          error: `Failed to track query event: ${response.status} ${response.statusText}`
        }, { status: response.status });
      }
    } catch (error) {
      console.error('Error sending query event to Tealium:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to send query event to Tealium' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error processing query tracking request:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error processing query tracking request' 
    }, { status: 400 });
  }
}

// Define the runtime to use Edge for better performance
export const runtime = 'edge';
