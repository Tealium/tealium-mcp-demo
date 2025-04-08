import Logger from '@/lib/debug-logger';
import { TEALIUM_MOMENTS_API_BASE_URL } from '@/lib/config';

// Use the correct API endpoint for Tealium Moments
const MOMENTS_API_BASE_URL = TEALIUM_MOMENTS_API_BASE_URL;

// Export the interface so it can be used in other files
export interface VisitorParams {
  visitorId?: string;
  attributeId?: string;
  attributeValue?: string;
}

export interface MomentsConfig {
  account: string;
  profile: string;
  engineId: string; // Required for this endpoint format
  debug?: boolean;
  // Note: Moments API currently doesn't require an API key
  useCache?: boolean; // Optional cache flag
}

/**
 * Get visitor data from the Tealium Moments API
 * This function retrieves visitor profile data using the specified parameters
 * 
 * @param params Parameters to identify the visitor (ID or attribute)
 * @param config Tealium account configuration
 * @returns Visitor profile data or null if not found
 */
export async function getVisitorData(params: VisitorParams, config: MomentsConfig): Promise<any> {
  try {
    const { account, profile, engineId, debug } = config;
    const { visitorId, attributeId, attributeValue } = params;
    
    if (!account || !profile || !engineId) {
      throw new Error('Missing required configuration: account, profile, and engineId are required');
    }
    
    if (debug) {
      Logger.debug('Moments API request:', { 
        params, 
        config 
      });
    }
    
    let endpoint = '';
    
    // Construct the endpoint based on the Tealium format
    if (visitorId) {
      // Visitor ID lookup format
      endpoint = `${MOMENTS_API_BASE_URL}${account}/profiles/${profile}/engines/${engineId}/visitors/${encodeURIComponent(visitorId)}`;
      
      if (debug) {
        Logger.debug(`Using visitor ID lookup: ${endpoint}`);
      }
    } else if (attributeId && attributeValue) {
      // Attribute-based lookup format
      endpoint = `${MOMENTS_API_BASE_URL}${account}/profiles/${profile}/engines/${engineId}?attributeId=${encodeURIComponent(attributeId)}&attributeValue=${encodeURIComponent(attributeValue)}`;
      
      if (debug) {
        Logger.debug(`Using attribute lookup: ${endpoint}`);
      }
    } else {
      throw new Error('Either visitorId or both attributeId and attributeValue must be provided');
    }
    
    // Set up the request headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    // Note: The Moments API currently doesn't require an API key
    
    // Try to get data from cache first (if using cache is enabled)
    try {
      if (config.useCache !== false) {
        Logger.debug('Attempting to get visitor data from cache');
        
        // Construct the cache request URL
        const cacheParams = new URLSearchParams();
        if (visitorId) {
          cacheParams.set('visitorId', visitorId);
        } else if (attributeId && attributeValue) {
          cacheParams.set('attributeId', attributeId);
          cacheParams.set('attributeValue', attributeValue);
        }
        
        const cacheResponse = await fetch(`/api/supabase/tealium-cache?${cacheParams.toString()}`);
        
        if (cacheResponse.ok) {
          const cacheData = await cacheResponse.json();
          
          if (cacheData.success && cacheData.cachedData) {
            Logger.debug('Found visitor data in cache', cacheData.cachedData);
            
            // Check if cache is fresh (less than 1 hour old)
            const lastUpdated = new Date(cacheData.cachedData.last_updated);
            const now = new Date();
            const cacheAgeMs = now.getTime() - lastUpdated.getTime();
            const cacheAgeHours = cacheAgeMs / (1000 * 60 * 60);
            
            if (cacheAgeHours < 1) {
              Logger.debug('Using cached visitor data (less than 1 hour old)');
              return cacheData.cachedData.visitor_data;
            } else {
              Logger.debug('Cached data is stale, fetching fresh data');
            }
          }
        }
      }
    } catch (cacheError) {
      // Cache error shouldn't stop the API request
      Logger.error('Error retrieving from cache (continuing with API request):', cacheError);
    }
    
    // Make the API request
    try {
      if (debug) {
        Logger.debug('Fetching visitor data from endpoint', endpoint);
      }
      
      // Instead of calling the Tealium API directly, use our proxy
      const response = await fetch('/api/tealium/moments/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tealiumUrl: endpoint,
          headers,
          method: 'GET'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error connecting to Moments API: ${errorData.error || response.statusText}`);
      }
      
      const responseData = await response.json();
      
      // Store the successful response in cache if caching is enabled
      if (config.useCache !== false && responseData.success && responseData.data) {
        try {
          // Prepare cache data
          const cacheBody = {
            visitorData: responseData.data,
            visitorId,
            attributeId,
            attributeValue
          };
          
          if (debug) {
            Logger.debug('Storing visitor data in cache', cacheBody);
          }
          
          // Store in cache
          const cacheResponse = await fetch('/api/supabase/tealium-cache', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(cacheBody)
          });
          
          if (!cacheResponse.ok) {
            Logger.warning('Failed to store visitor data in cache', await cacheResponse.json());
          }
        } catch (cacheError) {
          Logger.warning('Error storing visitor data in cache', cacheError);
        }
      }
      
      return responseData.data;
    } catch (error) {
      // Detailed error logging
      if (error instanceof Error) {
        Logger.error('Error fetching visitor data from Moments API:', error.message);
        throw new Error(`Error connecting to Moments API: ${error.message}`);
      } else if (error && typeof error === 'object') {
        try {
          const errorString = JSON.stringify(error);
          Logger.error('Error fetching visitor data from Moments API:', errorString);
          throw new Error(`Error connecting to Moments API: ${errorString}`);
        } catch (jsonError) {
          Logger.error('Error fetching visitor data from Moments API (could not stringify):', error);
          throw new Error(`Error connecting to Moments API: Unknown error object`);
        }
      } else {
        Logger.error('Error fetching visitor data from Moments API:', String(error));
        throw new Error(`Error connecting to Moments API: ${String(error)}`);
      }
    }
  } catch (error) {
    // Detailed error logging
    if (error instanceof Error) {
      Logger.error('Error fetching visitor data from Moments API:', error.message);
      throw new Error(`Error connecting to Moments API: ${error.message}`);
    } else if (error && typeof error === 'object') {
      try {
        const errorString = JSON.stringify(error);
        Logger.error('Error fetching visitor data from Moments API:', errorString);
        throw new Error(`Error connecting to Moments API: ${errorString}`);
      } catch (jsonError) {
        Logger.error('Error fetching visitor data from Moments API (could not stringify):', error);
        throw new Error(`Error connecting to Moments API: Unknown error object`);
      }
    } else {
      Logger.error('Error fetching visitor data from Moments API:', String(error));
      throw new Error(`Error connecting to Moments API: ${String(error)}`);
    }
  }
}

/**
 * Directly call the Moments API with minimal processing
 * This is a lower-level function that makes the direct API call
 * 
 * @param params Parameters for the visitor lookup
 * @param config Tealium account configuration
 * @returns Raw API response
 */
export async function getVisitorDataDirect(params: VisitorParams, config: MomentsConfig): Promise<any> {
  try {
    return await getVisitorData(params, config);
  } catch (error) {
    Logger.error('Direct Moments API call failed:', error);
    throw error;
  }
}

/**
 * Find a visitor using their email address
 * 
 * @param email Email address to search for
 * @param config Tealium account configuration
 * @returns Visitor profile or null if not found
 */
export async function findVisitorByEmail(email: string, config: MomentsConfig): Promise<any> {
  try {
    if (!email) {
      throw new Error('Email is required');
    }
    
    // Use the email attribute to look up the visitor
    return await getVisitorData(
      { attributeId: 'email', attributeValue: email },
      config
    );
  } catch (error) {
    Logger.error('Error finding visitor by email:', error);
    throw error;
  }
}

/**
 * Check multiple common attributes for a visitor
 * This is useful when you're not sure which attribute might identify the visitor
 * 
 * @param value Value to search for (email, phone, etc.)
 * @param config Tealium account configuration
 * @returns Visitor profile or null if not found
 */
export async function findVisitorByMultipleAttributes(
  value: string, 
  config: MomentsConfig
): Promise<any> {
  if (!value) {
    throw new Error('Search value is required');
  }
  
  // First try email (most common identifier)
  try {
    if (value.includes('@')) {
      const emailResult = await getVisitorData(
        { attributeId: 'email', attributeValue: value },
        config
      );
      
      if (emailResult) return emailResult;
    }
  } catch (emailError) {
    // Continue to next attribute
    Logger.debug('Email lookup failed, trying other attributes');
  }
  
  // Try phone number
  try {
    if (/^\+?[\d\s()-]{7,}$/.test(value)) {
      const phoneResult = await getVisitorData(
        { attributeId: 'phone', attributeValue: value },
        config
      );
      
      if (phoneResult) return phoneResult;
    }
  } catch (phoneError) {
    // Continue to next attribute
    Logger.debug('Phone lookup failed, trying other attributes');
  }
  
  // Try generic customer_id attribute
  try {
    const idResult = await getVisitorData(
      { attributeId: 'customer_id', attributeValue: value },
      config
    );
    
    if (idResult) return idResult;
  } catch (idError) {
    // Continue
    Logger.debug('Customer ID lookup failed');
  }
  
  // No matches found with any attribute
  return null;
}

/**
 * Enrich an existing context object with visitor data from Tealium Moments
 * 
 * @param existingContext Current context object
 * @param params Parameters to identify the visitor
 * @param config Tealium configuration
 * @returns Enriched context
 */
export async function enrichChatbotContext(
  existingContext: any, 
  params: VisitorParams, 
  config: MomentsConfig
): Promise<any> {
  try {
    // If we have an email or other attribute value, try finding the visitor
    if (params.attributeValue) {
      const visitorProfile = await findVisitorByMultipleAttributes(
        params.attributeValue,
        config
      );
      
      if (visitorProfile) {
        return {
          ...existingContext,
          ...visitorProfile, // Directly include all visitor data
          visitor_segments: visitorProfile.audiences || [],
          visitor_badges: visitorProfile.badges || [],
          visitor_metrics: visitorProfile.metrics || {},
          visitor_properties: visitorProfile.properties || {},
          visitor_flags: visitorProfile.flags || {},
          visitor_dates: visitorProfile.dates || {},
          lastUpdated: new Date().toISOString(),
        };
      }
    } 
    // Otherwise use standard lookup with visitor ID
    else if (params.visitorId) {
      const visitorProfile = await getVisitorData(params, config);
      
      if (visitorProfile) {
        return {
          ...existingContext,
          ...visitorProfile, // Directly include all visitor data
          visitor_segments: visitorProfile.audiences || [],
          visitor_badges: visitorProfile.badges || [],
          visitor_metrics: visitorProfile.metrics || {},
          visitor_properties: visitorProfile.properties || {},
          visitor_flags: visitorProfile.flags || {},
          visitor_dates: visitorProfile.dates || {},
          lastUpdated: new Date().toISOString(),
        };
      }
    }
    
    // If we reach here, we couldn't find a profile
    return { 
      ...existingContext, 
      error: 'Visitor not found in Tealium' 
    };
  } catch (error) {
    Logger.error('Error enriching context:', error);
    return { 
      ...existingContext, 
      error: error instanceof Error ? error.message : 'Unknown error enriching context' 
    };
  }
}