import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import Logger from '@/lib/debug-logger';

/**
 * API route for caching Tealium visitor data in Supabase
 * This improves reliability by allowing fallback to cached data when the API is unavailable
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { visitorId, visitorData, attributeId, attributeValue } = body;
    
    if (!visitorId || !visitorData) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters',
        message: 'visitorId and visitorData are required'
      }, { status: 400 });
    }

    // Ensure the tealium_visitors table exists (upsert the record)
    const { error } = await supabase
      .from('tealium_visitors')
      .upsert({
        visitor_id: visitorId,
        visitor_data: visitorData,
        attribute_id: attributeId || null,
        attribute_value: attributeValue || null,
        last_updated: new Date().toISOString()
      });

    if (error) {
      Logger.error('Error caching visitor data in Supabase:', error);
      return NextResponse.json({
        success: false,
        error: 'Database error',
        message: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Visitor data cached successfully'
    });
    
  } catch (error) {
    Logger.error('Error in Supabase cache API:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * API route for retrieving cached Tealium visitor data from Supabase
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const visitorId = url.searchParams.get('visitorId');
    const attributeId = url.searchParams.get('attributeId');
    const attributeValue = url.searchParams.get('attributeValue');
    
    if (!visitorId && (!attributeId || !attributeValue)) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters',
        message: 'Either visitorId or both attributeId and attributeValue are required'
      }, { status: 400 });
    }

    let query = supabase.from('tealium_visitors').select('*');
    
    if (visitorId) {
      query = query.eq('visitor_id', visitorId);
    } else if (attributeId && attributeValue) {
      query = query.eq('attribute_id', attributeId).eq('attribute_value', attributeValue);
    }
    
    // Get the most recently updated entry if multiple exist
    query = query.order('last_updated', { ascending: false }).limit(1);
    
    const { data, error } = await query;

    if (error) {
      Logger.error('Error retrieving cached visitor data from Supabase:', error);
      return NextResponse.json({
        success: false,
        error: 'Database error',
        message: error.message
      }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Not found',
        message: 'No cached visitor data found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      cachedData: data[0]
    });
    
  } catch (error) {
    Logger.error('Error in Supabase cache retrieval API:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
