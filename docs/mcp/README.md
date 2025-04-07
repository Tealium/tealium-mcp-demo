# Tealium MCP (Model Context Protocol) Integration Guide

This document provides detailed information about the Tealium MCP implementation in this project, including access details, configuration, and usage examples.

## Table of Contents
- [Access Information](#access-information)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Data Structure](#data-structure)
- [Integration Examples](#integration-examples)
- [Troubleshooting](#troubleshooting)

## Access Information

### Base URLs
- **Moments API Base URL**: `https://personalization-api.eu-central-1.prod.tealiumapis.com/personalization/accounts/`

### Account Information
- **Account**: `my-account`
- **Profile**: `my-profile`
- **Engine ID**: `my-engine-id`

### Important Attribute IDs
- **Email Attribute ID**: `5003` (Used for email-based lookups)
- **First Name**: `5294` 
- **Last Name**: `5290`
- **Origin Airport**: `5349`
- **Destination Airport**: `5351`
- **Booking Value**: `5019`
- **Flights Booked**: `5298`
- **Total Spend**: `5324`
- **Canceled Bookings**: `5387`
- **Changed Bookings**: `5389`
- **Marketing Consent**: `27`
- **Booked With Children**: `5330`

## API Endpoints

### Visitor Lookup by Email
```
GET ${MOMENTS_API_BASE_URL}${TEALIUM_ACCOUNT}/profiles/${TEALIUM_PROFILE}/engines/${ENGINE_ID}?attributeId=5003&attributeValue=${email}
```

Example:
```
GET https://personalization-api.eu-central-1.prod.tealiumapis.com/personalization/accounts/my-account/profiles/my-profile/engines/my-engine-id?attributeId=5003&attributeValue=example@email.com
```

### Visitor Lookup by Visitor ID
```
GET ${MOMENTS_API_BASE_URL}${TEALIUM_ACCOUNT}/profiles/${TEALIUM_PROFILE}/engines/${ENGINE_ID}?visitorId=${visitorId}
```

Example:
```
GET https://personalization-api.eu-central-1.prod.tealiumapis.com/personalization/accounts/my-account/profiles/my-profile/engines/my-engine-id?visitorId=12345abcde
```

## Authentication

Authentication is performed using the `TEALIUM_MOMENTS_API_KEY` as a header:

```javascript
const headers = {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json'
};
```

This API key should be kept secure and never exposed in client-side code.

## Data Structure

The API returns visitor data in the following structure:

```javascript
{
  "results": [
    {
      "success": true,
      "request": { /* Request details */ },
      "body": {
        "visitorId": "visitor-123456789",
        "properties": {
          "5294": "John",         // First Name
          "5290": "Smith",        // Last Name
          "5349": "BCN",          // Origin Airport
          "5351": "MAD"           // Destination Airport
        },
        "metrics": {
          "5019": 459.99,         // Booking Value
          "5298": 12,             // Flights Booked
          "5324": 2543.87         // Total Spend
        },
        "audiences": ["frequent_flyer", "business_traveler"],
        "badges": ["premium_member"],
        "dates": {
          "firstSeen": "2023-01-15T14:32:18Z",
          "lastSeen": "2023-03-28T12:45:33Z"
        }
      }
    }
  ]
}
```

## Integration Examples

### Server-Side API Route Example (Next.js)

```typescript
import { NextRequest, NextResponse } from 'next/server';

// Environment variables
const API_KEY = process.env.TEALIUM_MOMENTS_API_KEY || '';
const TEALIUM_ACCOUNT = process.env.TEALIUM_ACCOUNT || 'my-account';
const TEALIUM_PROFILE = process.env.TEALIUM_PROFILE || 'my-profile';
const ENGINE_ID = process.env.TEALIUM_ENGINE_ID || 'my-engine-id';
const MOMENTS_API_BASE_URL = 'https://personalization-api.eu-central-1.prod.tealiumapis.com/personalization/accounts/';

export async function GET(request: NextRequest) {
  // Get email from query params
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  
  if (!email) {
    return NextResponse.json({
      success: false,
      error: 'Email is required'
    }, { status: 400 });
  }
  
  // Construct the endpoint
  const endpoint = `${MOMENTS_API_BASE_URL}${TEALIUM_ACCOUNT}/profiles/${TEALIUM_PROFILE}/engines/${ENGINE_ID}?attributeId=5003&attributeValue=${encodeURIComponent(email)}`;
  
  // Set up headers with auth
  const headers = {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  };
  
  try {
    // Make the request
    const response = await fetch(endpoint, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error connecting to Moments API:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to connect to Tealium Moments API'
    }, { status: 500 });
  }
}
```

### Using the Visitor Data in a React Component

```tsx
import { useState, useEffect } from 'react';

interface VisitorData {
  visitorId: string;
  properties: Record<string, any>;
  metrics: Record<string, number>;
  audiences: string[];
}

const ProfileComponent = ({ email }: { email: string }) => {
  const [visitorData, setVisitorData] = useState<VisitorData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (!email) return;
    
    const fetchVisitorData = async () => {
      setLoading(true);
      setError('');
      
      try {
        const response = await fetch(`/api/tealium/moments/email-lookup?email=${encodeURIComponent(email)}`);
        
        if (!response.ok) {
          throw new Error(`API responded with status ${response.status}`);
        }
        
        const data = await response.json();
        
        // Check if we have a successful result
        const successfulResult = data.results?.find((r: any) => r.success === true);
        if (successfulResult && successfulResult.body) {
          setVisitorData(successfulResult.body);
        } else {
          setError('No visitor data found');
        }
      } catch (error) {
        console.error('Error fetching visitor data:', error);
        setError('Failed to fetch visitor data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchVisitorData();
  }, [email]);
  
  if (loading) return <div>Loading visitor data...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!visitorData) return <div>No visitor data available</div>;
  
  return (
    <div>
      <h2>Visitor Profile</h2>
      <p>Name: {visitorData.properties['5294']} {visitorData.properties['5290']}</p>
      <p>Flight Preferences: {visitorData.properties['5349']} to {visitorData.properties['5351']}</p>
      <p>Total Flights Booked: {visitorData.metrics['5298']}</p>
      <p>Total Spend: €{visitorData.metrics['5324'].toFixed(2)}</p>
      <div>
        <h3>Audiences</h3>
        <ul>
          {visitorData.audiences.map(audience => (
            <li key={audience}>{audience}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProfileComponent;
```

## Troubleshooting

### Common Errors

1. **"Either visitorId or both attributeId and attributeValue must be provided"**
   - Solution: Ensure you're providing either a valid visitorId OR both attributeId and attributeValue in the API request.

2. **401 Unauthorized**
   - Solution: Check that your API key is valid and included in the Authorization header.

3. **404 Not Found**
   - Solution: Verify the account, profile, and engine ID are correct.

4. **No visitor data returned**
   - Solution: Confirm the email or visitor ID exists in the Tealium database.

### Debugging Tips

1. Enable logging in your API requests to see the exact request and response details:

```typescript
// Log the request
console.log(`Making request to: ${endpoint}`);

// Log the response
const data = await response.json();
console.log('Response data:', data);
```

2. Check the network tab in your browser devtools to see the API requests and responses.

3. Ensure you're using the correct attribute ID for email lookups (5003).

4. For security, mask sensitive information in logs:

```typescript
const emailParts = email.split('@');
const maskedEmail = `${emailParts[0].substring(0, 2)}***@${emailParts[1]}`;
console.log(`Looking up visitor by email: ${maskedEmail}`);
```

5. If you're receiving unexpected data formats, log the structure:

```typescript
console.log('Visitor data structure:', JSON.stringify(data, null, 2));
```
