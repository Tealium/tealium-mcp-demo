import { NextRequest, NextResponse } from 'next/server';
import { TEALIUM_ACCOUNT, TEALIUM_PROFILE, TEALIUM_ENGINE_ID, SAMPLE_DATA } from '@/lib/config';

/**
 * Advanced diagnostics endpoint for Tealium Moments API
 * This endpoint performs comprehensive testing of all requirements for visitor lookups
 */
export async function GET(request: NextRequest) {
  try {
    // Get account configuration from centralized config
    const account = TEALIUM_ACCOUNT;
    const profile = TEALIUM_PROFILE;
    const engineId = TEALIUM_ENGINE_ID;
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email') || SAMPLE_DATA.email;
    const region = searchParams.get('region') || 'eu-central-1';
    const testMultipleRegions = searchParams.get('testRegions') === 'true';
    
    const results: any = {
      configuration: {
        account,
        profile,
        engineId,
        apiKeyPresent: !!process.env.TEALIUM_MOMENTS_API_KEY,
        email,
      },
      regionTests: {},
      possibleIssues: [],
      recommendedFixes: []
    };
    
    // List of regions to test if requested
    const regions = testMultipleRegions 
      ? ['eu-central-1', 'us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-2']
      : [region];
    
    // Define potential endpoint patterns
    const patterns = [
      // Pattern 1: Main documented visitor ID attribute pattern
      `/personalization/accounts/${account}/profiles/${profile}/engines/${engineId}?attributeId=email&attributeValue=${encodeURIComponent(email)}`,
      
      // Pattern 2: Alternative visitor lookup directly by email
      `/personalization/accounts/${account}/profiles/${profile}/visitor-lookup?email=${encodeURIComponent(email)}`,
      
      // Pattern 3: Visitor ID lookup (if the email were used as visitor ID)
      `/personalization/accounts/${account}/profiles/${profile}/visitors/${encodeURIComponent(email)}`,
      
      // Pattern 4: Direct engine visitor lookup
      `/personalization/accounts/${account}/profiles/${profile}/engines/${engineId}/visitors/${encodeURIComponent(email)}`,
    ];
    
    // Basic validation checks
    if (!process.env.TEALIUM_MOMENTS_API_KEY) {
      results.possibleIssues.push("Missing API key - TEALIUM_MOMENTS_API_KEY environment variable not set");
      results.recommendedFixes.push("Add your Tealium API key to the .env.local file as TEALIUM_MOMENTS_API_KEY");
    }
    
    if (email.length < 6) {
      results.possibleIssues.push("Email too short for Visitor ID attribute - must be 6-255 characters");
    }
    
    // Check if email has the required format for a visitor ID attribute
    const uniqueChars = new Set(email.split('')).size;
    if (uniqueChars < 3) {
      results.possibleIssues.push("Email doesn't have enough unique characters for a Visitor ID attribute - needs at least 3");
    }
    
    // Test each region and pattern
    for (const currentRegion of regions) {
      results.regionTests[currentRegion] = { endpoints: {} };
      
      const baseUrl = `https://personalization-api.${currentRegion}.prod.tealiumapis.com`;
      
      for (let i = 0; i < patterns.length; i++) {
        const pattern = patterns[i];
        const url = `${baseUrl}${pattern}`;
        
        try {
          // Make a new request for each endpoint test
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${process.env.TEALIUM_MOMENTS_API_KEY}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
          
          // Store status information
          const statusInfo = {
            url,
            status: response.status,
            statusText: response.statusText,
          };
          
          // Try to get the response body
          let responseBody: any = {};
          
          // Check if we can parse as JSON
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            try {
              const clonedResponse = response.clone();
              responseBody = await clonedResponse.json();
            } catch (e) {
              // If JSON parsing fails, try to get text
              const textClone = response.clone();
              const textBody = await textClone.text();
              responseBody = { text: textBody.substring(0, 200) };
            }
          } else {
            // Not JSON, try to get as text
            const textClone = response.clone();
            const textBody = await textClone.text();
            responseBody = { text: textBody.substring(0, 200) };
          }
          
          // Store the complete result
          results.regionTests[currentRegion].endpoints[`pattern${i+1}`] = {
            ...statusInfo,
            responseBody
          };
          
          // If we get a successful response, note it
          if (response.ok) {
            results.successfulPattern = `pattern${i+1}`;
            results.successfulRegion = currentRegion;
          }
          
          // Response analysis for specific error messages
          if (response.status === 404) {
            const responseText = typeof responseBody === 'object' && responseBody.text 
              ? responseBody.text 
              : JSON.stringify(responseBody);
              
            if (responseText.includes('Resource not found')) {
              results.possibleIssues.push(`Endpoint pattern ${i+1} invalid in region ${currentRegion}`);
            } else {
              results.possibleIssues.push(`No visitor found using email=${email} with pattern ${i+1} in region ${currentRegion}`);
            }
          } else if (response.status === 401 || response.status === 403) {
            results.possibleIssues.push(`Authentication failure: API key may be invalid or lack necessary permissions`);
            results.recommendedFixes.push("Check API key permissions in Tealium");
          }
        } catch (error) {
          results.regionTests[currentRegion].endpoints[`pattern${i+1}`] = {
            url,
            error: (error as Error).message,
          };
        }
      }
    }
    
    // Add general recommendations based on documentation
    results.recommendedFixes.push(
      "Ensure email is properly configured as a Visitor ID Attribute in Tealium",
      "Verify that visitor stitching is enabled in your Tealium account",
      "Make sure data for this visitor exists in Tealium - send test events first",
      "Try different regions (use ?testRegions=true query parameter)",
      "Contact Tealium support to verify your account configuration"
    );
    
    // Include link to Tealium documentation
    results.documentation = {
      visitorIdAttributes: "https://docs.tealium.com/server-side/visitor-stitching/visitor-id-attribute/",
      momentsApiEndpoint: "https://docs.tealium.com/server-side/moments-api/endpoint/",
      visitorStitching: "https://docs.tealium.com/server-side/visitor-stitching/"
    };
    
    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('Error in advanced diagnostics endpoint:', error);
    return NextResponse.json(
      { error: 'Diagnostics failed', message: (error as Error).message },
      { status: 500 }
    );
  }
}
