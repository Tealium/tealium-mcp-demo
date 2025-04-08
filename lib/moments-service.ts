import { properties } from './config';

/**
 * Configuration options for the Moments API
 */
export interface MomentsApiConfig {
  account: string;
  profile: string;
  visitorApi: string;
  engineId?: string;
  apiKey?: string;
  debug?: boolean;
  useMockData?: boolean;
}

/**
 * Visitor data request options
 */
export interface VisitorDataRequest {
  visitorId?: string;    // Anonymous Tealium visitor ID
  attributeId?: string;  // Visitor ID attribute ID
  attributeValue?: string; // Visitor ID attribute value
  email?: string;
}

/**
 * Interface for visitor profile data returned from the Moments API
 */
export interface VisitorProfile {
  visitor_id: string;
  [key: string]: any;
}

/**
 * Default configuration for the Moments API
 */
const defaultConfig: MomentsApiConfig = {
  account: properties.account,
  profile: properties.profile,
  visitorApi: properties.visitorApi,
  debug: false,
  useMockData: false
};

/**
 * Retrieve visitor data using the Tealium Moments API
 * Can search by anonymous visitor ID or by a visitor ID attribute
 */
export async function getVisitorData(
  requestOptions: VisitorDataRequest,
  config: Partial<MomentsApiConfig> = {}
): Promise<VisitorProfile | null> {
  // Merge provided config with defaults
  const fullConfig: MomentsApiConfig = { ...defaultConfig, ...config };
  
  try {
    // Determine which endpoint to use based on the provided parameters
    let endpoint: string;
    let queryParams: Record<string, string> = {};
    
    // Log what we're doing in debug mode
    if (fullConfig.debug) {
      console.log('Retrieving visitor data with Moments API');
      console.log('Request options:', requestOptions);
      console.log('Configuration:', fullConfig);
    }
    
    if (requestOptions.visitorId) {
      // Use anonymous visitor ID endpoint
      endpoint = `${fullConfig.visitorApi}/visitors/${requestOptions.visitorId}`;
    } else if (requestOptions.attributeId && requestOptions.attributeValue) {
      // Use visitor ID attribute endpoint
      endpoint = `${fullConfig.visitorApi}/visitors/lookup`;
      queryParams = {
        attributeId: requestOptions.attributeId,
        attributeValue: requestOptions.attributeValue
      };
    } else if (requestOptions.email) {
      // Use email endpoint
      endpoint = `${fullConfig.visitorApi}/visitors/${encodeURIComponent(requestOptions.email)}`;
    } else {
      throw new Error('Either visitorId, both attributeId and attributeValue, or email must be provided');
    }
    
    // Add query parameters if needed
    if (Object.keys(queryParams).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        searchParams.append(key, value);
      });
      endpoint += `?${searchParams.toString()}`;
    }
    
    if (fullConfig.debug) {
      console.log('Making request to endpoint:', endpoint);
    }
    
    // Use Next.js API route as a proxy in browser environment
    // This avoids CORS issues when making direct API calls from the client
    if (typeof window !== 'undefined') {
      const localEndpoint = '/api/tealium/moments/visitor';
      const response = await fetch(localEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account: fullConfig.account,
          profile: fullConfig.profile,
          visitorId: requestOptions.visitorId,
          attributeId: requestOptions.attributeId,
          attributeValue: requestOptions.attributeValue,
          email: requestOptions.email,
          useMockData: fullConfig.useMockData
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Handle 404 "Not Found" responses as a non-error for new visitors
        if (response.status === 404 && requestOptions.visitorId) {
          if (fullConfig.debug) {
            console.log(`Visitor ID '${requestOptions.visitorId}' not found in Tealium. This is normal for new visitors.`);
          }
          return null;
        }
        throw new Error(data.message || 'Failed to retrieve visitor data');
      }
      
      return data.visitor_profile;
    }
    
    // Direct API call (for server-side execution)
    const headers: HeadersInit = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
    
    if (requestOptions.attributeId && requestOptions.attributeValue) {
      // Make the API request
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          attribute_id: requestOptions.attributeId,
          attribute_value: requestOptions.attributeValue
        })
      });
      
      // Handle the response
      if (!response.ok) {
        // If using a demo environment, return mock data
        if (process.env.NODE_ENV === 'development') {
          console.log('Using mock visitor data in development environment');
          return getMockVisitorData(requestOptions.attributeValue);
        }
        
        // Otherwise return the error
        const data = await response.json();
        throw new Error(data.message || 'Failed to retrieve visitor data');
      }
      
      // Parse and return the visitor data
      const data = await response.json();
      return data;
    } else {
      // Make the API request
      const response = await fetch(endpoint, {
        method: 'GET',
        headers
      });
      
      // Handle the response
      if (!response.ok) {
        // If using a demo environment, return mock data
        if (process.env.NODE_ENV === 'development') {
          console.log('Using mock visitor data in development environment');
          return getMockVisitorData(requestOptions.email || requestOptions.visitorId);
        }
        
        // Otherwise return the error
        const data = await response.json();
        throw new Error(data.message || 'Failed to retrieve visitor data');
      }
      
      // Parse and return the visitor data
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.error('Error retrieving visitor data from Moments API:', error instanceof Error ? error.message : String(error));
    
    if (fullConfig.debug) {
      console.error('Error details:', error instanceof Error ? { 
        message: error.message, 
        name: error.name, 
        stack: error.stack 
      } : String(error));
    }
    
    // Return null on error
    return null;
  }
}

/**
 * Generate mock visitor data for testing and development
 */
function getMockVisitorData(identifier: string | undefined) {
  const visitorId = identifier || `anonymous-${Date.now()}`;
  
  return {
    visitor_id: `mock-visitor-${Date.now()}`,
    attributes: {
      email: visitorId,
      phone: properties.phone,
      name: properties.name
    },
    audiences: ["New Visitor", "Website Visitor"],
    badges: ["First Visit"],
    properties: {
      city: properties.city,
      country: properties.country,
      interest: "AI Technology",
      last_visit: new Date().toISOString()
    },
    metrics: {
      lifetime_value: 0,
      visit_count: 1,
      page_views: 5
    },
    current_visit: {
      start_time: new Date().toISOString(),
      duration: 120,
      pages: ["/", "/chatbot"]
    }
  };
}

/**
 * Helper function to enrich chatbot context with visitor data
 */
export async function enrichChatbotContext(
  existingContext: any,
  requestOptions: VisitorDataRequest,
  config: Partial<MomentsApiConfig> = {}
): Promise<any> {
  try {
    // Get visitor data from Moments API
    const visitorData = await getVisitorData(requestOptions, config);
    
    if (!visitorData) {
      // If no visitor data is available, return original context
      return existingContext;
    }
    
    // Merge visitor data with existing context
    return {
      ...existingContext,
      visitorProfile: visitorData
    };
  } catch (error) {
    console.error('Error enriching chatbot context:', error);
    // Return original context on error
    return existingContext;
  }
}