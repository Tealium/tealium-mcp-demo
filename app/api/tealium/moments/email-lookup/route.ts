import { NextRequest, NextResponse } from 'next/server';
import Logger from '../../../../../lib/debug-logger';

// Get environment variables (will be loaded server-side only)
const API_KEY = process.env.TEALIUM_MOMENTS_API_KEY || '';
const TEALIUM_ACCOUNT = process.env.TEALIUM_ACCOUNT || '';
const TEALIUM_PROFILE = process.env.TEALIUM_PROFILE || '';
const ENGINE_ID = process.env.TEALIUM_ENGINE_ID || '';

// API base URL
const MOMENTS_API_BASE_URL = 'https://personalization-api.eu-central-1.prod.tealiumapis.com/personalization/accounts/';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email is required'
      }, { status: 400 });
    }

    // Log attempt (without showing full email for privacy)
    const emailParts = email.split('@');
    const maskedEmail = `${emailParts[0].substring(0, 2)}***@${emailParts[1]}`;
    Logger.debug(`Looking up visitor by email: ${maskedEmail}`);

    // Set up headers with auth and referrer information
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Referer': 'https://tealium-mcp-ingestion-app.vercel.app',
      'Origin': 'https://tealium-mcp-ingestion-app.vercel.app'
    };
    
    // Only add Authorization if we have an API key
    if (API_KEY) {
      headers['Authorization'] = `Bearer ${API_KEY}`;
    } else {
      Logger.warning('No Tealium API key provided - attempting request without authentication');
    }

    // Array of URL patterns to try - different endpoints and formats
    const urlPatterns = [
      // Pattern 1: Using attributes/id:email/values format (from test script)
      `${MOMENTS_API_BASE_URL}${TEALIUM_ACCOUNT}/profiles/${TEALIUM_PROFILE}/engines/${ENGINE_ID}/attributes/id:email/values/${encodeURIComponent(email)}`,
      
      // Pattern 2: Using attributeId query parameter format
      `${MOMENTS_API_BASE_URL}${TEALIUM_ACCOUNT}/profiles/${TEALIUM_PROFILE}/engines/${ENGINE_ID}?attributeId=email&attributeValue=${encodeURIComponent(email)}`,
      
      // Pattern 3: Using numeric attribute ID (5003 for email)
      `${MOMENTS_API_BASE_URL}${TEALIUM_ACCOUNT}/profiles/${TEALIUM_PROFILE}/engines/${ENGINE_ID}?attributeId=5003&attributeValue=${encodeURIComponent(email)}`,
      
      // Pattern 4: Try alternative domains (collect.tealiumiq.com)
      `https://collect.tealiumiq.com/personalization/accounts/${TEALIUM_ACCOUNT}/profiles/${TEALIUM_PROFILE}/engines/${ENGINE_ID}/attributes/id:email/values/${encodeURIComponent(email)}`
    ];

    Logger.debug(`Attempting ${urlPatterns.length} different endpoint patterns for email lookup`);

    // Try each URL pattern until we find a successful one
    const results = [];
    for (const endpoint of urlPatterns) {
      try {
        // Log the endpoint (with masked email)
        const debugEndpoint = endpoint.replace(encodeURIComponent(email), encodeURIComponent(maskedEmail));
        Logger.debug(`Trying URL pattern: ${debugEndpoint}`);
        
        // Make the request to Tealium
        const response = await fetch(endpoint, {
          method: 'GET',
          headers,
          cache: 'no-store'
        });

        // Log raw response status
        Logger.debug(`Tealium API response status: ${response.status}`);
        
        // Parse the response body
        let responseBody;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          // JSON response
          responseBody = await response.json().catch(e => {
            Logger.error('Error parsing JSON response', e);
            return null;
          });
        } else {
          // Text response
          const textResponse = await response.text();
          responseBody = { rawText: textResponse };
        }
        
        // Record this attempt
        results.push({
          endpoint: debugEndpoint, // Use masked endpoint for logging
          status: response.status,
          success: response.ok,
          data: responseBody
        });
        
        // If successful, return this response
        if (response.ok) {
          Logger.debug('Successfully found visitor data with endpoint pattern', { pattern: debugEndpoint });
          
          return NextResponse.json({
            success: true,
            visitorData: responseBody,
            endpoint: debugEndpoint // Include the successful endpoint
          });
        }
      } catch (error) {
        // Log the error but continue trying other patterns
        Logger.error(`Error with endpoint ${endpoint}:`, error);
        results.push({
          endpoint: endpoint.replace(encodeURIComponent(email), encodeURIComponent(maskedEmail)),
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // If we get here, all attempts failed
    Logger.error('All Tealium API endpoint patterns failed for email lookup', { results });
    
    return NextResponse.json({
      success: false,
      error: 'Could not find visitor data with the provided email',
      attempts: results
    }, { status: 404 });
  } catch (error) {
    Logger.error('Error in email lookup:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error in email lookup'
    }, { status: 500 });
  }
}
