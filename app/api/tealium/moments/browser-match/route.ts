import { NextRequest, NextResponse } from 'next/server';
import { properties } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    // Get account configuration from centralized properties
    const account = properties.account;
    const profile = properties.profile;
    const engineId = properties.engineId;
    
    // Get email and visitorId from query params
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email') || properties.email;
    const visitorId = searchParams.get('visitorId');
    
    // Extract Referer and Origin from headers or use defaults
    const referer = request.headers.get('referer') || 'https://www.yourdomain.com';
    const origin = request.headers.get('origin') || 'https://www.yourdomain.com';
    
    // Initialize variables in wider scope
    let visitorResponseStatus = 'Not attempted';
    
    // If a specific visitor ID is provided, look it up directly
    if (visitorId) {
      const visitorUrl = `https://personalization-api.eu-central-1.prod.tealiumapis.com/personalization/accounts/${account}/profiles/${profile}/engines/${engineId}/visitors/${visitorId}`;
      
      console.log(`Fetching visitor data by ID: ${visitorUrl}`);
      
      const visitorResponse = await fetch(visitorUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Referer': referer,
          'Origin': origin
        }
      });
      
      visitorResponseStatus = String(visitorResponse.status);
      
      if (visitorResponse.ok) {
        const visitorData = await visitorResponse.json();
        return NextResponse.json({
          success: true,
          method: 'visitor_id_lookup',
          visitor: visitorData
        }, { status: 200 });
      } else {
        console.log(`Visitor ID lookup failed: ${visitorResponse.status}`);
      }
    }
    
    // Try email lookup (even if visitor ID lookup failed)
    const emailUrl = `https://personalization-api.eu-central-1.prod.tealiumapis.com/personalization/accounts/${account}/profiles/${profile}/engines/${engineId}/attributes/id:email/values/${encodeURIComponent(email)}`;
    
    console.log(`Fetching visitor data by email: ${emailUrl}`);
    
    const emailResponse = await fetch(emailUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Referer': referer,
        'Origin': origin
      }
    });
    
    if (emailResponse.ok) {
      const emailData = await emailResponse.json();
      return NextResponse.json({
        success: true,
        method: 'email_lookup',
        visitor: emailData
      }, { status: 200 });
    }
    
    // If both lookups failed, try to create a new visitor via event
    return NextResponse.json({
      success: false,
      error: 'Visitor not found',
      emailLookupStatus: emailResponse.status,
      visitorIdLookupStatus: visitorId ? visitorResponseStatus : 'Not attempted',
      recommendation: 'Your browser can access this data directly because it has a valid session with Tealium. For API access, you may need to:',
      steps: [
        '1. Make sure your domain is in Tealium\'s allowlist',
        '2. Use the actual visitor ID from your screenshots',
        '3. Try accessing the URL directly in your browser and inspect the network requests',
        '4. For programmatic access, consider using a Puppeteer-based solution that maintains browser cookies and headers'
      ]
    }, { status: 404 });
  } catch (error) {
    console.error('Error in browser-match endpoint:', error);
    return NextResponse.json(
      { error: 'Error processing request', message: (error as Error).message },
      { status: 500 }
    );
  }
}
