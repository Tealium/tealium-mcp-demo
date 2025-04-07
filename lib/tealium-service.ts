/**
 * Tealium Service - Handles sending data to Tealium for AI model operations
 */

// Default configuration for Tealium API requests
const defaultConfig: TealiumConfig = {
  account: process.env.NEXT_PUBLIC_TEALIUM_ACCOUNT || process.env.TEALIUM_ACCOUNT || '',
  profile: process.env.NEXT_PUBLIC_TEALIUM_PROFILE || process.env.TEALIUM_PROFILE || '',
  dataSourceKey: process.env.NEXT_PUBLIC_TEALIUM_DATA_SOURCE_KEY || process.env.TEALIUM_DATA_SOURCE_KEY || '',
  integration: 'eventstream',
  apiEndpoint: 'https://collect.tealiumiq.com/event',
  momentEndpoint: '/api/tealium/moments',  // Default moments endpoint
  engineId: process.env.NEXT_PUBLIC_TEALIUM_ENGINE_ID || process.env.TEALIUM_ENGINE_ID || '',
  debug: false,
  useVisitorContext: false
};

/**
 * Configuration interface for Tealium integration
 */
export interface TealiumConfig {
  account: string;
  profile: string;
  dataSourceKey: string;
  integration?: 'eventstream' | 'moments' | 'both';
  debug?: boolean;
  apiEndpoint?: string;
  momentEndpoint?: string;
  visitorId?: string;
  tealiumTraceId?: string;
  useVisitorContext?: boolean;
  engineId?: string;
  apiKey?: string;
}

/**
 * Default configuration for Tealium API
 */
const defaultTealiumConfig: TealiumConfig = {
  account: '',
  profile: '',
  dataSourceKey: '',
  integration: 'eventstream',
  apiEndpoint: 'https://collect.tealiumiq.com/event',
  engineId: '',
  debug: false
};

/**
 * Creates a base event payload with common properties
 */
function createBaseEventPayload(event_name: string, visitor_id?: string, trace_id?: string) {
  const payload: any = {
    event_name,
    tealium_event: event_name,
    timestamp: new Date().toISOString(),
    visitor_id: visitor_id || 'anonymous',
    device_platform: typeof window !== 'undefined' ? 'web' : 'server',
    source: 'Tealium MCP AI App'
  };
  
  // Add trace ID if provided for debugging
  if (trace_id) {
    payload.tealium_trace_id = trace_id;
  }
  
  return payload;
}

/**
 * Send model deployment data to Tealium
 */
export async function sendModelDeployment(
  modelConfig: any,
  tealiumConfig: TealiumConfig
) {
  try {
    // Create MCP payload for model deployment
    const mcpPayload = {
      event_name: 'ai_model_deployment',
      description: "AI Model deployment event",
      timestamp: new Date().toISOString(),
      
      // Tealium information
      tealium_account: tealiumConfig.account,
      tealium_profile: tealiumConfig.profile,
      tealium_datasource: tealiumConfig.dataSourceKey,
      source: "Tealium MCP AI App",
      tealium_event: 'ai_model_deployment',
      tealium_integration: tealiumConfig.integration || 'functions',
      
      // AI Model specific information
      model_platform: modelConfig.platform,
      model_name: modelConfig.model_name,
      model_version: modelConfig.model_version,
      model_type: modelConfig.model_type,
      model_description: modelConfig.model_description || `${modelConfig.model_name} ${modelConfig.model_version}`,
      model_configuration: {
        ...modelConfig.parameters,
        ...modelConfig.custom_params
      },
      
      // Deployment metadata
      deployment_id: `deploy-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      deployment_timestamp: new Date().toISOString(),
      deployment_status: "successful",
      deployment_environment: modelConfig.environment || "production",
    };
    
    // Send to Tealium via our API endpoint
    return await sendToTealium(tealiumConfig, mcpPayload);
  } catch (error) {
    console.error('Error sending model deployment data to Tealium:', error);
    throw error;
  }
}

/**
 * Send model query data to Tealium
 */
export async function sendModelQuery(
  queryData: {
    query_id: string;
    query: string;
    visitor_id?: string;
    context?: any;
  },
  modelConfig: any,
  tealiumConfig: TealiumConfig
) {
  try {
    const { account, profile, dataSourceKey, integration = 'eventstream', tealiumTraceId } = tealiumConfig;
    
    console.log(`[Tealium] Sending model query with integration type: ${integration}`);
    if (tealiumTraceId) {
      console.log(`[Tealium] Using trace ID: ${tealiumTraceId} for debugging`);
    }
    
    // Create the event payload
    const payload = {
      ...createBaseEventPayload('model_query', queryData.visitor_id, tealiumTraceId),
      query_id: queryData.query_id,
      query_text: queryData.query,
      model_id: modelConfig?.id || 'default',
      model_provider: modelConfig?.platform || 'openai',
      model_name: modelConfig?.model_name || 'gpt-4',
      model_version: modelConfig?.model_version || '1.0',
      model_type: modelConfig?.model_type || 'chat',
      model_parameters: modelConfig?.parameters || {},
      visitor_id: queryData.visitor_id,
      customer_id: queryData.visitor_id,
      email: queryData.visitor_id,
      visitor_context: queryData.context || {}
    };
    
    // Determine which API(s) to use based on integration type
    if (integration === 'eventstream' || integration === 'both') {
      try {
        await sendToTealium(tealiumConfig, payload);
      } catch (eventStreamError: any) {
        console.error('[ERROR] Error sending to EventStream API:', 
          eventStreamError?.message || JSON.stringify(eventStreamError));
      }
    }
    
    if (integration === 'moments' || integration === 'both') {
      try {
        await sendToMomentsAPI(tealiumConfig, payload);
      } catch (momentsError: any) {
        console.error('[ERROR] Error sending to Moments API:', 
          momentsError?.message || JSON.stringify(momentsError));
      }
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('[ERROR] Error sending model query to Tealium:', 
      error?.message || JSON.stringify(error));
    // Don't throw, to avoid breaking the flow
    return { success: false, error };
  }
}

/**
 * Send model response data to Tealium
 */
export async function sendModelResponse(
  responseData: {
    query_id: string;
    response: string;
    visitor_id?: string;
    latency?: number;
    tokens_used?: number;
    error?: any;
    context_used?: any;
  },
  modelConfig: any,
  tealiumConfig: TealiumConfig
) {
  try {
    const { account, profile, dataSourceKey, integration = 'eventstream', tealiumTraceId } = tealiumConfig;
    
    console.log(`[Tealium] Sending model response with integration type: ${integration}`);
    if (tealiumTraceId) {
      console.log(`[Tealium] Using trace ID: ${tealiumTraceId} for debugging`);
    }
    
    // Create the event payload
    const payload = {
      ...createBaseEventPayload('model_response', responseData.visitor_id, tealiumTraceId),
      query_id: responseData.query_id,
      response_text: responseData.response,
      model_id: modelConfig?.id || 'default',
      model_provider: modelConfig?.platform || 'openai',
      model_name: modelConfig?.model_name || 'gpt-4',
      model_version: modelConfig?.model_version || '1.0',
      model_type: modelConfig?.model_type || 'chat',
      model_parameters: modelConfig?.parameters || {},
      visitor_id: responseData.visitor_id,
      customer_id: responseData.visitor_id,
      email: responseData.visitor_id,
      response_time_ms: responseData.latency || 0,
      tokens_used: responseData.tokens_used || 0,
      error: responseData.error || null,
      visitor_context: responseData.context_used || {}
    };
    
    // Determine which API(s) to use based on integration type
    if (integration === 'eventstream' || integration === 'both') {
      try {
        await sendToTealium(tealiumConfig, payload);
      } catch (eventStreamError: any) {
        console.error('[ERROR] Error sending response to EventStream API:', 
          eventStreamError?.message || JSON.stringify(eventStreamError));
      }
    }
    
    if (integration === 'moments' || integration === 'both') {
      try {
        await sendToMomentsAPI(tealiumConfig, payload);
      } catch (momentsError: any) {
        console.error('[ERROR] Error sending response to Moments API:', 
          momentsError?.message || JSON.stringify(momentsError));
      }
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('[ERROR] Error sending model response to Tealium:', 
      error?.message || JSON.stringify(error));
    // Don't throw, to avoid breaking the flow
    return { success: false, error };
  }
}

/**
 * Helper function to send data to Tealium via the API endpoint
 */
async function sendToTealium(
  tealiumConfig: TealiumConfig,
  payload: any,
  options = defaultConfig
) {
  try {
    const { account, profile, dataSourceKey, debug, apiEndpoint, tealiumTraceId } = tealiumConfig;
    
    // If debug is true, don't actually send to Tealium but simulate a response
    if (debug) {
      console.log('[Tealium] Debug mode - not sending to Tealium');
      console.log('[Tealium] Payload:', JSON.stringify(payload, null, 2));
      return { success: true, debug: true };
    }
    
    // Log attempt for debugging
    console.log(`[Tealium] Sending data to Tealium EventStream API`);
    
    // Format the payload in the required structure for the collect endpoint
    const formattedPayload = {
      ...payload,
      tealium_account: account,
      tealium_profile: profile,
      tealium_datasource: dataSourceKey,
      tealium_event: "model_context_protocol", // Required field for event identification
      cp_test: "tealium_mcp_ingestion" // Add a test variable to help with debugging
    };
    
    // Add trace ID to the payload data if provided
    if (tealiumTraceId) {
      formattedPayload["cp.trace_id"] = tealiumTraceId;
    }
    
    console.log('[Tealium] Formatted payload:', JSON.stringify(formattedPayload, null, 2));
    
    // Use browser or server-side fetch based on environment
    let endpoint = apiEndpoint || `https://collect.tealiumiq.com/event`;
    
    // For browser environment, use the client-side endpoint with proper CORS handling
    if (typeof window !== 'undefined') {
      // Add a timestamp to prevent caching
      formattedPayload.timestamp = new Date().toISOString();
      
      // Use the proxy endpoint for browser environment to handle CORS
      endpoint = '/api/tealium';
      console.log('[Tealium] Using proxy endpoint in browser environment for CORS handling');
    }
    
    // Validate endpoint to prevent TypeScript error
    if (!endpoint) {
      throw new Error('No API endpoint specified for Tealium');
    }

    console.log(`[Tealium] Sending to endpoint: ${endpoint}`);
    
    // According to our test results, sending JSON with proper headers works best
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tealium-Account': account,
        'X-Tealium-Profile': profile,
        'X-Tealium-Key': dataSourceKey
      },
      body: JSON.stringify(formattedPayload)
    });
    
    // Log response information
    console.log(`Tealium API response: ${response.status}`, 
      response.ok ? 'SUCCESS' : 'FAILED');
    
    // Return the API response
    return await response.json();
  } catch (error) {
    console.error('Error in Tealium service:', error);
    throw error;
  }
}

/**
 * Helper function to send data to Tealium Moments API
 */
async function sendToMomentsAPI(
  tealiumConfig: TealiumConfig,
  payload: any,
  options = defaultConfig
) {
  try {
    const { account, profile, dataSourceKey, debug, momentEndpoint, visitorId } = tealiumConfig;
    
    // If debug is true, don't actually send to Tealium but simulate a response
    if (debug) {
      console.log('[Tealium Moments] Debug mode - not sending to Moments API');
      console.log('[Tealium Moments] Payload:', JSON.stringify(payload, null, 2));
      return { success: true, debug: true };
    }
    
    // Log attempt for debugging
    console.log(`[Tealium Moments] Sending data to Tealium Moments API`);
    
    // Determine which endpoint to use
    let endpoint = momentEndpoint || '/api/tealium/moments';
    
    // Add visitor ID if available
    if (visitorId) {
      endpoint = `${endpoint}/visitor/${visitorId}`;
    }
    
    // Validate endpoint to prevent TypeScript error
    if (!endpoint) {
      throw new Error('No API endpoint specified for Tealium Moments API');
    }
    
    // Send to API endpoint
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account,
        profile,
        dataSourceKey,
        visitor_id: visitorId, // Add visitorId to the payload
        events: Array.isArray(payload) ? payload : [payload]
      })
    });
    
    // Log response information
    console.log(`Tealium Moments API response: ${response.status}`, 
      response.ok ? 'SUCCESS' : 'FAILED');
    
    // Return the API response
    return await response.json();
  } catch (error) {
    console.error('Error in Tealium Moments service:', error);
    throw error;
  }
} 