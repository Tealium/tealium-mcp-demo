import { NextRequest, NextResponse } from 'next/server';
import { getVisitorData } from '../../../../../lib/moments-service';

/**
 * Test endpoint for directly calling Tealium Moments API
 * This endpoint helps with debugging by showing the raw response
 */
export async function GET(request: NextRequest) {
  try {
    // Parse request URL and get search params
    const { searchParams } = new URL(request.url);
    
    // Required params
    const account = searchParams.get('account');
    const profile = searchParams.get('profile');
    const engineId = searchParams.get('engineId');
    const visitorId = searchParams.get('visitorId');
    
    // Optional params
    const debug = searchParams.get('debug') === 'true';
    
    // Check required parameters
    if (!account || !profile || !engineId || !visitorId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: account, profile, engineId, and visitorId are required'
      }, { status: 400 });
    }
    
    console.log('Testing direct Moments API connection with:');
    console.log({
      account,
      profile,
      engineId,
      visitorId,
      debug
    });
    
    // Call the Moments API directly
    try {
      const result = await getVisitorData({
        visitorId
      }, {
        account,
        profile,
        engineId,
        debug
      });
      
      if (result) {
        return NextResponse.json({
          success: true,
          data: result
        });
      } else {
        return NextResponse.json({
          success: false,
          error: 'No data found for the provided visitor ID'
        });
      }
    } catch (error) {
      console.error('Error calling Moments API:', error);
      
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error calling Moments API',
        details: error instanceof Error ? error.stack : undefined
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in test endpoint:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error in test endpoint',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

// Define the runtime to use Edge for better performance
export const runtime = 'edge';