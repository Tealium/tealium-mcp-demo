/**
 * Functions Service - Handles interactions with Tealium Functions API
 */

import Logger from '@/lib/debug-logger';

// Define the base URL for the Tealium Functions API proxy
const FUNCTIONS_API_ENDPOINT = '/api/tealium/functions';

export interface FunctionsConfig {
  account: string;
  profile: string;
  dataSourceKey?: string;
  debug?: boolean;
}

export interface FunctionsEvent {
  name: string;
  data: Record<string, any>;
}

/**
 * Process visitor events using Tealium Functions
 * 
 * @param visitorId The visitor ID to process events for
 * @param events Array of events to process for this visitor
 * @param config Tealium Functions configuration
 * @returns The processed visitor data from Functions API
 */
export async function processVisitorEvents(
  visitorId: string,
  events: FunctionsEvent[],
  config: FunctionsConfig
): Promise<any> {
  try {
    const { account, profile, debug } = config;
    
    if (debug) {
      Logger.debug('Functions API request:', { visitorId, events, config });
    }
    
    // Prepare the request payload for the Functions API
    const payload = {
      account,
      profile,
      visitor_id: visitorId,
      events: events.map(event => ({
        name: event.name,
        data: {
          ...event.data,
          tealium_account: account,
          tealium_profile: profile,
          timestamp: event.data.timestamp || new Date().toISOString()
        }
      }))
    };
    
    if (debug) {
      Logger.debug('Sending payload to Functions API');
      Logger.api.request(FUNCTIONS_API_ENDPOINT, 'POST', { accountProfile: `${account}/${profile}`, visitorId, eventCount: events.length });
    }
    
    // Make the API request to our proxy endpoint
    const response = await fetch(FUNCTIONS_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (debug) {
      Logger.debug(`Functions API response status: ${response.status}`);
    }
    
    // Handle non-OK responses
    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = 'Could not read error response';
      }
      
      Logger.error(`Error from Functions API: ${response.status}`, errorText);
      
      throw new Error(`Functions API request failed with status ${response.status}: ${errorText}`);
    }
    
    // Parse and return the response
    const data = await response.json();
    
    if (debug) {
      Logger.debug('Functions API response received');
      Logger.api.response(FUNCTIONS_API_ENDPOINT, response.status, {
        dataSize: JSON.stringify(data).length,
        keys: Object.keys(data)
      });
    }
    
    return data;
  } catch (error) {
    Logger.error('Error in processVisitorEvents:', error);
    throw error;
  }
}

/**
 * Get visitor context for an AI query using Tealium Functions
 * 
 * @param visitorId The visitor ID to get context for
 * @param queryText The text of the user's query
 * @param config Tealium Functions configuration
 * @returns The contextualized visitor data for the AI model
 */
export async function getVisitorContextForQuery(
  visitorId: string,
  queryText: string,
  config: FunctionsConfig
): Promise<any> {
  try {
    // Create a model query event to process in Functions
    const events = [{
      name: 'ai_model_query',
      data: {
        query_text: queryText,
        timestamp: new Date().toISOString(),
        query_id: `query-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      }
    }];
    
    // Process this event using Functions API
    const result = await processVisitorEvents(visitorId, events, config);
    
    // Return the processed context
    return {
      visitorContext: result,
      queryContext: result.context || {},
      segments: result.segments || [],
      preferences: result.preferences || {},
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    Logger.error('Error getting visitor context for query:', error);
    throw error;
  }
}

/**
 * Find a visitor by email using Tealium Functions
 * 
 * @param email The email to look up
 * @param config Tealium Functions configuration
 * @returns The visitor data, including visitor ID
 */
export async function findVisitorByEmail(
  email: string,
  config: FunctionsConfig
): Promise<any> {
  try {
    // Create a lookup event for the Functions API
    const events = [{
      name: 'visitor_lookup',
      data: {
        lookup_type: 'email',
        email: email,
        timestamp: new Date().toISOString()
      }
    }];
    
    // Use a temporary visitor ID for the lookup
    const tempVisitorId = `lookup-${Date.now()}`;
    
    // Process this event using Functions API
    const result = await processVisitorEvents(tempVisitorId, events, config);
    
    // If we found a visitor ID, return it
    if (result && result.visitor_id) {
      return {
        visitor_id: result.visitor_id,
        profile: result.profile || {},
        email: email,
        found: true
      };
    }
    
    return null;
  } catch (error) {
    Logger.error('Error finding visitor by email:', error);
    throw error;
  }
} 