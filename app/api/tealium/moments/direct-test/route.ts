import { NextRequest, NextResponse } from 'next/server';
import Logger from '../../../../../lib/debug-logger';

export async function GET(request: NextRequest) {
  try {
    // Get email from query parameters
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const requestEngineId = searchParams.get('engineId');
    const requestAccount = searchParams.get('account');
    const requestProfile = searchParams.get('profile');
    const requestApiKey = searchParams.get('apiKey');
    
    if (!email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing email parameter' 
      }, { status: 400 });
    }

    Logger.debug('Looking up visitor by email', {
      email,
      requestEngineId,
      requestAccount,
      requestProfile,
      requestApiKey: requestApiKey ? '[REDACTED]' : undefined,
      requestUrl: request.url
    });
    
    // Tealium account configuration - prioritize request params over env vars
    const account = requestAccount || process.env.TEALIUM_ACCOUNT || '';
    const profile = requestProfile || process.env.TEALIUM_PROFILE || '';
    
    // Remove any leading slashes from the engineId to prevent double slashes in the URL
    const engineId = (requestEngineId || process.env.TEALIUM_ENGINE_ID || '').replace(/^\/+/, '');
    const apiKey = requestApiKey || process.env.TEALIUM_MOMENTS_API_KEY;
    
    Logger.debug('Using Tealium configuration', { 
      account, 
      profile, 
      engineId,
      engineIdSource: requestEngineId ? 'request' : 'environment',
      apiKeySource: requestApiKey ? 'request' : 'environment'
    });

    // Ensure required parameters are present
    if (!account || !profile || !engineId) {
      const missingParams = [];
      if (!account) missingParams.push('account');
      if (!profile) missingParams.push('profile');
      if (!engineId) missingParams.push('engineId');
      
      Logger.error('Missing required configuration parameters', { missingParams });
      
      return NextResponse.json({
        success: false,
        error: `Missing required configuration: ${missingParams.join(', ')}`,
        missingParams
      }, { status: 400 });
    }

    // Removed the API key requirement check
    // Instead we'll attempt the request with alternative URL patterns

    // Set up headers for the Tealium API
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Add API key if available (essential for authentication)
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
      Logger.debug('Added Authorization header with API key');
    } else {
      Logger.warning('No API key provided for Tealium API - authentication will likely fail');
    }

    // Add referrer headers which may help with no-auth access
    headers['Referer'] = 'https://tealium-mcp-ingestion-app.vercel.app';
    headers['Origin'] = 'https://tealium-mcp-ingestion-app.vercel.app';

    // Find the visitor profile by email
    // We'll try a few different URL patterns to see which one works
    const urlPatterns = [
      // Pattern 1: Using attributes/id:email endpoint
      `https://personalization-api.eu-central-1.prod.tealiumapis.com/personalization/accounts/${account}/profiles/${profile}/engines/${engineId}/attributes/id:email/values/${encodeURIComponent(email)}`,
      
      // Pattern 2: Using attributeId=email as a query param
      `https://personalization-api.eu-central-1.prod.tealiumapis.com/personalization/accounts/${account}/profiles/${profile}/engines/${engineId}?attributeId=email&attributeValue=${encodeURIComponent(email)}`,
      
      // Pattern 3: Using attributeId=5003 (email attribute) as a query param (some accounts use this)
      `https://personalization-api.eu-central-1.prod.tealiumapis.com/personalization/accounts/${account}/profiles/${profile}/engines/${engineId}?attributeId=5003&attributeValue=${encodeURIComponent(email)}`
    ];

    // Initialize an array to collect results from all attempts
    const results: Array<{
      url: string;
      success: boolean;
      status?: number;
      statusText?: string;
      data?: any;
      error?: string;
    }> = [];
    let successfulResponse = null;

    // Try each URL pattern
    for (const tealiumUrl of urlPatterns) {
      try {
        Logger.debug(`Trying URL pattern: ${tealiumUrl}`);
        
        // Make request to Tealium API
        const response = await fetch(tealiumUrl, {
          method: 'GET',
          headers,
          cache: 'no-store'
        });

        Logger.debug(`Response from ${tealiumUrl}:`, { 
          status: response.status, 
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries())
        });

        // Get the response data (try JSON first, fall back to text)
        let responseData;
        try {
          // Clone the response before reading the body to avoid "Body already read" errors
          const responseClone = response.clone();
          try {
            responseData = await responseClone.json();
          } catch (e) {
            // If JSON parsing fails, try to get text
            const textClone = response.clone();
            responseData = await textClone.text();
          }
        } catch (error) {
          Logger.error(`Error reading response body from ${tealiumUrl}:`, { error });
          responseData = { error: error instanceof Error ? error.message : String(error) };
        }

        // Record this attempt result
        const result = {
          url: tealiumUrl,
          success: response.ok,
          status: response.status,
          statusText: response.statusText,
          data: responseData
        };
        
        results.push(result);
        
        // If successful, store this as our primary response
        if (response.ok) {
          Logger.debug('Found successful response pattern', { pattern: tealiumUrl });
          successfulResponse = result;
          break; // Stop trying more patterns once we have a success
        }
      } catch (error) {
        // Log error for this pattern but continue trying others
        Logger.error(`Error with URL pattern ${tealiumUrl}:`, { error });
        results.push({
          url: tealiumUrl,
          success: false,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    // If we found a successful response, return it as the primary result
    if (successfulResponse) {
      return NextResponse.json({
        success: true,
        results: [
          {
            success: true,
            body: successfulResponse.data,
            request: { url: successfulResponse.url }
          },
          ...results.map(r => ({
            success: r.success,
            body: r.data || { error: r.error },
            request: { url: r.url }
          }))
        ]
      });
    }

    // If all attempts failed, return error with all results
    Logger.error('All Tealium API patterns failed', { results });
    return NextResponse.json({
      success: false,
      error: 'Could not retrieve visitor data with any of the attempted patterns',
      results: results.map(r => ({
        success: r.success,
        body: r.data || { error: r.error },
        request: { url: r.url }
      }))
    }, { status: 400 });
  } catch (error) {
    // Log and return any caught errors
    Logger.error('Error in direct test endpoint:', { error });
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
