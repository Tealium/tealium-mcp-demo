import { NextRequest, NextResponse } from 'next/server';
import Logger from '../../../../../lib/debug-logger';
import { getVisitorData } from '../../../../../lib/moments-service';

/**
 * Debug endpoint for finding visitor data in Tealium with exhaustive methods
 * This endpoint tries all possible variations of visitor ID formats and attribute lookups
 */
export async function GET(request: NextRequest) {
  try {
    // Parse request URL and get search params
    const { searchParams } = new URL(request.url);
    
    // Required params
    const account = searchParams.get('account') || '';
    const profile = searchParams.get('profile') || '';
    const engineId = searchParams.get('engineId') || '';
    const identifier = searchParams.get('identifier'); // Email or other ID
    
    // Check required parameters
    if (!account || !profile || !engineId || !identifier) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: account, profile, engineId, and identifier are required'
      }, { status: 400 });
    }
    
    Logger.debug('Starting comprehensive debug lookup for:', identifier);
    
    const results = {
      attempts: [] as any[],
      foundVisitor: false,
      visitorData: null as any,
      searchParams: { account, profile, engineId, identifier }
    };
    
    // 1. Try direct visitorId lookup
    try {
      Logger.debug('1. Direct lookup attempt with identifier as visitorId');
      const directResult = await getVisitorData({ 
        visitorId: identifier 
      }, {
        account,
        profile,
        engineId,
        debug: true
      });
      
      results.attempts.push({
        method: 'direct_lookup',
        visitorId: identifier,
        success: !!directResult,
        error: null
      });
      
      if (directResult) {
        results.foundVisitor = true;
        results.visitorData = directResult;
        Logger.debug('Success with direct lookup!');
      }
    } catch (directError) {
      results.attempts.push({
        method: 'direct_lookup',
        visitorId: identifier,
        success: false,
        error: directError instanceof Error ? directError.message : 'Unknown error'
      });
    }
    
    // If we haven't found the visitor yet, try variations if it looks like an email
    if (!results.foundVisitor && identifier.includes('@')) {
      // 2. Email variations as visitor IDs
      const variations = [
        encodeURIComponent(identifier),
        identifier.replace('@', '%40'),
        identifier.replace(/[^\w]/g, ''),
        identifier.toLowerCase(),
        `email:${encodeURIComponent(identifier)}`
      ];
      
      for (const varId of variations) {
        try {
          Logger.debug(`2. Trying email variation: ${varId}`);
          const varResult = await getVisitorData({ 
            visitorId: varId 
          }, {
            account,
            profile,
            engineId,
            debug: true
          });
          
          results.attempts.push({
            method: 'email_variation',
            variation: varId,
            success: !!varResult,
            error: null
          });
          
          if (varResult && !results.foundVisitor) {
            results.foundVisitor = true;
            results.visitorData = varResult;
            Logger.debug(`Success with email variation: ${varId}`);
            break;
          }
        } catch (varError) {
          results.attempts.push({
            method: 'email_variation',
            variation: varId,
            success: false,
            error: varError instanceof Error ? varError.message : 'Unknown error'
          });
        }
      }
    }
    
    // 3. Try comprehensive lookup with multiple attributes
    if (!results.foundVisitor) {
      Logger.debug('3. Trying comprehensive attribute lookup');
      try {
        const multiResult = await getVisitorData({ 
          attributeId: 'email', 
          attributeValue: identifier 
        }, {
          account,
          profile,
          engineId,
          debug: true
        });
        
        results.attempts.push({
          method: 'multiple_attributes',
          identifier,
          success: !!multiResult,
          error: null
        });
        
        if (multiResult) {
          results.foundVisitor = true;
          results.visitorData = multiResult;
          Logger.debug('Success with multiple attribute lookup!');
        }
      } catch (multiError) {
        results.attempts.push({
          method: 'multiple_attributes',
          identifier,
          success: false,
          error: multiError instanceof Error ? multiError.message : 'Unknown error'
        });
      }
    }
    
    // Return all results, successful or not
    return NextResponse.json({
      success: results.foundVisitor,
      results,
      message: results.foundVisitor 
        ? `Found visitor data for ${identifier}` 
        : `Could not find visitor data for ${identifier} after ${results.attempts.length} attempts`
    });
    
  } catch (error) {
    Logger.error('Error in debug endpoint:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error in debug endpoint',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

// Define the runtime to use Edge for better performance
export const runtime = 'edge'; 