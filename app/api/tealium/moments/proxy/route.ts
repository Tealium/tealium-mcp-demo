import { NextRequest, NextResponse } from 'next/server';
import Logger from '../../../../../lib/debug-logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tealiumUrl, headers = {}, method = 'GET', requestBody } = body;

    if (!tealiumUrl) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing tealiumUrl in request' 
      }, { status: 400 });
    }

    Logger.debug('Proxying request to Tealium API', { 
      url: tealiumUrl, 
      method, 
      headers: { ...headers, Authorization: headers.Authorization ? '***' : undefined }
    });

    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...headers
      },
      // Only add body for non-GET requests
      ...(method !== 'GET' && requestBody ? { body: JSON.stringify(requestBody) } : {})
    };

    // Make the actual request to Tealium API
    const response = await fetch(tealiumUrl, requestOptions);
    const responseData = await response.json().catch(() => null);

    // If the response wasn't successful, log the error details
    if (!response.ok) {
      Logger.error('Error from Tealium API', { 
        status: response.status, 
        statusText: response.statusText,
        responseData
      });

      return NextResponse.json({
        success: false,
        error: 'Error from Tealium API',
        status: response.status,
        statusText: response.statusText,
        details: responseData
      }, { status: response.status });
    }

    // Return the successful response
    return NextResponse.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    // Log and return any caught errors
    Logger.error('Error in Tealium proxy:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error in Tealium proxy',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
