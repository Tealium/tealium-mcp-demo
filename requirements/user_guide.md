# Tealium MCP Ingestion App - User Guide

## Overview

The Tealium MCP Ingestion App is a web-based tool designed to help you test and validate your Tealium EventStream API integration using the Modern Context Protocol (MCP) format. This application provides a user-friendly interface to send test events to your Tealium account and verify the data flow.

## Prerequisites

Before using the application, ensure you have:

1. A Tealium account with access to EventStream
2. An HTTP API data source configured in your Tealium profile
3. Your Tealium account details:
   - Account name
   - Profile name
   - Data source key

## Getting Started

1. **Start the Application**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000/tealium-config`

2. **Access the Configuration UI**
   - Open your web browser
   - Navigate to `http://localhost:3000/tealium-config`

## Using the Application

### 1. Basic Configuration

The main form contains the following fields:

- **Tealium Account**: Your Tealium account name
- **Tealium Profile**: Your Tealium profile name
- **Data Source Key**: The key from your HTTP API data source
- **Event Name**: Name of the test event (default: `test_event`)
- **User ID**: Optional identifier for the user (default: `anonymous`)

### 2. Advanced Options

- **Use Direct API Call**: Toggle this option to send requests directly to Tealium (may cause CORS issues)
- **Debug Panel**: Shows detailed information about requests and responses

### 3. Sending Test Events

1. Fill in the required fields:
   - Tealium Account
   - Tealium Profile
   - Data Source Key

2. Optionally modify:
   - Event Name
   - User ID

3. Click "Send Test Event to Tealium"

4. Check the debug panel for:
   - Request details
   - Response status
   - Any error messages

## Understanding the Response

The application provides detailed feedback in several ways:

### 1. Toast Notifications
- Success: Green notification when the event is sent successfully
- Error: Red notification with error details if something goes wrong
- Warning: Yellow notification for potential issues (e.g., CORS warnings)

### 2. Debug Panel
Shows detailed information including:
- Request URL
- Request headers
- Request payload
- Response status
- Response headers
- Response body
- Helpful tips for troubleshooting

### 3. Common Response Codes
- **200**: Success - Event was sent successfully
- **400**: Bad Request - Check your payload format and required fields
- **401**: Authentication Failed - Verify your credentials
- **403**: Access Denied - Check your permissions
- **404**: Not Found - Verify your data source key and URL format

## Troubleshooting

### Common Issues

1. **404 Errors**
   - Verify your data source key is correct
   - Ensure your Tealium profile is published
   - Check if you're using the correct account and profile names

2. **CORS Issues**
   - Use the proxy API (default) instead of direct API calls
   - If using direct API, ensure your Tealium configuration allows your domain

3. **400 Bad Request**
   - Check that all required fields are filled
   - Verify the data source key format
   - Ensure your Tealium profile is properly configured

### Debugging Tips

1. **Check the Debug Panel**
   - Look for detailed request and response information
   - Pay attention to any error messages or helpful tips

2. **Verify Tealium Configuration**
   - Confirm your data source is active in Tealium
   - Check that your profile is published
   - Verify your account permissions

3. **Test with Different Formats**
   - Try both direct and proxy API options
   - Check if different URL formats work better

## Technical Details

### API Endpoints

The application uses two main endpoints:

1. **Frontend Form** (`/tealium-config`)
   - Handles user input and form submission
   - Provides real-time feedback

2. **Proxy API** (`/api/tealium`)
   - Forwards requests to Tealium
   - Handles CORS issues
   - Provides detailed error information

### Payload Structure

The application sends data in MCP format:

```json
{
  "data": {
    "event_name": "test_event",
    "description": "Test event sent via config UI",
    "timestamp": "2025-03-27T09:26:03.583Z",
    "tealium_visitor_id": "anonymous",
    "visitor_id": "anonymous",
    "tealium_account": "your-account",
    "tealium_profile": "your-profile",
    "tealium_datasource": "your-data-source-key",
    "source": "Tealium MCP Configuration UI",
    "tealium_event": "test_event"
  },
  "digital_data": {
    "event": {
      "eventName": "test_event",
      "eventInfo": {
        "description": "Test event sent via config UI",
        "timestamp": "2025-03-27T09:26:03.584Z"
      }
    },
    "user": {
      "userID": "anonymous"
    },
    "context": {
      "source": "Tealium MCP Configuration UI",
      "tealium_account": "your-account",
      "tealium_profile": "your-profile",
      "tealium_datasource": "your-data-source-key"
    }
  }
}
```

## Best Practices

1. **Always Use the Proxy API**
   - Avoids CORS issues
   - Provides better error handling
   - More reliable connection

2. **Check Debug Information**
   - Review request and response details
   - Look for helpful tips in error messages
   - Verify payload structure

3. **Test with Different Scenarios**
   - Try various event names
   - Test with different user IDs
   - Verify data appears in Tealium

4. **Keep Your Configuration Updated**
   - Verify data source key is current
   - Check account and profile names
   - Ensure Tealium profile is published

## Support

If you encounter issues:

1. Check the debug panel for detailed error information
2. Verify your Tealium configuration
3. Try different URL formats
4. Contact Tealium support if issues persist

## Security Notes

1. Never share your data source key
2. Use appropriate user IDs for testing
3. Keep your Tealium credentials secure
4. Use the proxy API for better security

## Updates and Maintenance

The application is designed to be easily updated and maintained. Regular updates may include:

1. New URL format support
2. Enhanced error handling
3. Additional debugging features
4. Improved user interface

Check the repository regularly for updates and new features. 
