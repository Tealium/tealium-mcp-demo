# Tealium Model Context Protocol (MCP) Configuration Guide

This document provides detailed guidance on configuring the Tealium Model Context Protocol integration for your application.

## Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```
TEALIUM_ACCOUNT=my-account
TEALIUM_PROFILE=my-profile
TEALIUM_ENGINE_ID=my-engine-id
```

## Attribute Mapping

The application uses numeric IDs for Tealium attributes. Here's the complete mapping used in the application:

```javascript
// Properties
'5290': 'LastName',
'5294': 'FirstName',
'5349': 'OriginAirport',
'5351': 'DestinationAirport',
  
// Metrics
'5019': 'BookingValue',
'5298': 'FlightsBooked',
'5324': 'TotalSpend',
'5387': 'CanceledBookings',
'5389': 'ChangedBookings',
  
// Flags
'27': 'HasMarketingConsent',
'5330': 'HasBookedWithChildren'
```

## API Endpoint Configuration

The base URL for all Tealium Moments API requests is:

```
https://personalization-api.eu-central-1.prod.tealiumapis.com/personalization/accounts/
```

For email lookups, the complete endpoint is:

```
https://personalization-api.eu-central-1.prod.tealiumapis.com/personalization/accounts/my-account/profiles/my-profile/engines/my-engine-id?attributeId=5003&attributeValue=${email}
```

## Headers Configuration

All API requests should include the following headers:

```javascript
const headers = {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json'
};
```

## Security Considerations

1. **API Key Protection**: Never expose your Tealium API key in client-side code. Always make API calls from the server.

2. **Email Privacy**: When logging email addresses for debugging, mask the email to protect user privacy:

```javascript
const emailParts = email.split('@');
const maskedEmail = `${emailParts[0].substring(0, 2)}***@${emailParts[1]}`;
console.log(`Looking up visitor by email: ${maskedEmail}`);
```

3. **Error Handling**: Always provide user-friendly error messages without exposing system details.

## Customizing the Integration

To customize the integration for your own Tealium instance:

1. Update the environment variables with your account details
2. Modify the attribute mapping to match your Tealium attributes
3. Update the response handling to extract the relevant data for your use case
