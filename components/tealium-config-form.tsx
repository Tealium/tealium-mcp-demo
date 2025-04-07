'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { TEALIUM_ACCOUNT, TEALIUM_PROFILE, TEALIUM_DATASOURCE_KEY, TEALIUM_ENGINE_ID, MCP_CONFIG, SAMPLE_DATA } from '@/lib/config';

interface TealiumConfigFormProps {
  onSubmitSuccess?: () => void; // Optional callback on success
}

const TealiumConfigForm: React.FC<TealiumConfigFormProps> = ({ onSubmitSuccess }) => {
  const [tealiumAccount, setTealiumAccount] = useState('');
  const [tealiumProfile, setTealiumProfile] = useState('');
  const [eventName, setEventName] = useState(MCP_CONFIG.defaultQueryEvent); // Default event name from config
  const [userId, setUserId] = useState('');
  const [tealiumSourceKey, setTealiumSourceKey] = useState(''); // Add data source key field
  const [tealiumEngineId, setTealiumEngineId] = useState(''); // Add engine ID field
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const [useDirectApi, setUseDirectApi] = useState(false);
  const [detailedDebug, setDetailedDebug] = useState(false);
  
  // Store detailed debugging information
  const [requestDetails, setRequestDetails] = useState<any>(null);
  const [responseDetails, setResponseDetails] = useState<any>(null);

  // Load config values on component mount
  useEffect(() => {
    setTealiumAccount(TEALIUM_ACCOUNT || '');
    setTealiumProfile(TEALIUM_PROFILE || '');
    setTealiumSourceKey(TEALIUM_DATASOURCE_KEY || '');
    setTealiumEngineId(TEALIUM_ENGINE_ID || '');
    setUserId(SAMPLE_DATA.email || '');
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setDebugInfo('');
    setRequestDetails(null);
    setResponseDetails(null);

    // Enhanced input validation
    if (!tealiumAccount.trim() || !tealiumProfile.trim()) {
      setIsLoading(false);
      toast.error('Please enter both Tealium Account and Profile');
      return;
    }

    if (!tealiumSourceKey.trim()) {
      setIsLoading(false);
      toast.error('Data Source Key is required for Tealium EventStream API');
      return;
    }

    // Validate data source key format (basic check)
    if (!/^[a-zA-Z0-9_-]+$/.test(tealiumSourceKey)) {
      setIsLoading(false);
      toast.error('Data Source Key should only contain letters, numbers, underscores, and hyphens');
      return;
    }

    // Create the MCP payload for the event
    const mcpPayload = {
      // Standard Tealium EventStream expected format
      data: {
        // Include event details
        event_name: eventName || 'test_event',
        description: "Test event sent via config UI",
        timestamp: new Date().toISOString(),
        
        // User identification
        tealium_visitor_id: userId || "anonymous",
        visitor_id: userId || "anonymous",
        
        // Context information
        tealium_account: tealiumAccount,
        tealium_profile: tealiumProfile,
        tealium_datasource: tealiumSourceKey,
        source: "Tealium MCP Configuration UI",
        
        // Ensure we have the event name in multiple formats for compatibility
        tealium_event: eventName || 'test_event',
      },
      
      // Also include the digital_data format for MCP
      digital_data: {
        event: {
          eventName: eventName || 'test_event',
          eventInfo: {
            description: "Test event sent via config UI",
            timestamp: new Date().toISOString()
          }
        },
        user: {
          userID: userId || "anonymous",
        },
        context: {
          source: "Tealium MCP Configuration UI",
          tealium_account: tealiumAccount,
          tealium_profile: tealiumProfile,
          tealium_datasource: tealiumSourceKey,
        }
      }
    };

    // Log the payload for debugging
    console.log("Payload:", JSON.stringify(mcpPayload, null, 2));
    
    try {
      let response;
      
      if (useDirectApi) {
        // Direct API approach (may encounter CORS issues)
        toast.info("Using direct API call - this may cause CORS issues");
        
        // EventStream API v2 with data source key (preferred format according to documentation)
        let tealiumUrl = `https://collect.tealiumiq.com/event`;
        
        // If data source key is provided, use it
        if (tealiumSourceKey) {
          tealiumUrl = `https://collect.tealiumiq.com/event/${tealiumSourceKey}`;
          console.log("Using data source key in URL:", tealiumUrl);
        } else {
          // Fallback to legacy formats if no data source key
          tealiumUrl = `https://collect.tealiumiq.com/eventstream/v2/${tealiumAccount}/${tealiumProfile}/event`;
          console.log("Using legacy URL format (may not work):", tealiumUrl);
          toast.warning("Using legacy URL format - this may not work with newer Tealium accounts");
          
          // Alternative format to try if the standard one fails
          if (tealiumAccount.includes('-')) {
            const [company, subaccount] = tealiumAccount.split('-');
            const alternativeUrl = `https://collect.tealiumiq.com/event/${company}/${subaccount}/${tealiumProfile}`;
            console.log("Alternative URL format to try:", alternativeUrl);
          }
        }
        
        // Add diagnostic headers to the request
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Origin': window.location.origin,
        };
        
        // If user ID exists, add it as a header for additional context
        if (userId) {
          headers['X-User-ID'] = userId;
        }
        
        // If data source key exists but not using it in URL, add it as a header
        if (tealiumSourceKey && !tealiumUrl.includes(tealiumSourceKey)) {
          headers['X-Data-Source-Key'] = tealiumSourceKey;
        }
        
        response = await fetch(tealiumUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(mcpPayload),
          mode: 'cors',
        });
      } else {
        // Use our proxy API endpoint to avoid CORS issues
        console.log("Using proxy API endpoint");
        
        response = await fetch('/api/tealium', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            account: tealiumAccount,
            profile: tealiumProfile,
            dataSourceKey: tealiumSourceKey, // Add data source key to proxy request
            engineId: tealiumEngineId, // Add engine ID to proxy request
            payload: mcpPayload
          }),
        });
      }

      // Log response details
      console.log("Response status:", response.status, response.statusText);
      
      // Handle non-successful responses
      if (!response.ok) {
        setIsLoading(false);
        
        // Get detailed error information
        let errorDetails = `Status: ${response.status} (${response.statusText || 'No status text'})`;
        let responseData;
        
        try {
          responseData = await response.json();
          console.error("Error response:", responseData);
          errorDetails += `\nDetails: ${JSON.stringify(responseData, null, 2)}`;
        } catch (parseError) {
          try {
            const textResponse = await response.text();
            console.error("Error response text:", textResponse);
            errorDetails += `\nResponse: ${textResponse.substring(0, 200)}${textResponse.length > 200 ? '...' : ''}`;
          } catch {
            errorDetails += "\nCould not read response body";
          }
        }
        
        // Show the error details in the debug panel
        setDebugInfo(errorDetails);
        
        // Show a toast notification with error message
        toast.error(`Error sending event: ${response.status} ${response.statusText || 'Unknown error'}`);
        
        // After processing the response in the error case:
        setResponseDetails({
          status: response.status,
          statusText: response.statusText,
          error: true,
          errorDetails: responseData || "Unknown error" // Fix the reference to 'error'
        });
        return;
      }

      // Process successful response
      setIsLoading(false);
      
      // Parse and display the response
      let responseData;
      try {
        responseData = await response.json();
        console.log("Success response:", responseData);
        
        // For proxy API responses, we need to extract the actual Tealium response
        const displayData = useDirectApi 
          ? responseData 
          : responseData.body || responseData;
          
        setDebugInfo(`Success! Response: ${JSON.stringify(displayData, null, 2)}`);
        
        // After processing the response in the success case:
        setResponseDetails({
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: responseData
        });
      } catch (parseError) {
        console.log("Response is not JSON:", parseError);
        try {
          const textResponse = await response.text();
          console.log("Text response:", textResponse);
          setDebugInfo(`Success! Response: ${textResponse}`);
        } catch {
          setDebugInfo('Success! (No response body)');
        }
      }
      
      // Show success notification
      toast.success("Test event sent to Tealium successfully!");
      
      // Call the success callback if provided
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }

    } catch (error: any) {
      setIsLoading(false);
      console.error("Request error:", error);
      
      // Determine if this is a CORS error
      const errorMessage = error.message || 'Unknown error';
      const isCorsError = errorMessage.includes('CORS') || 
                          errorMessage.includes('Cross-Origin') || 
                          error.name === 'TypeError';
      
      // Set appropriate error message
      const displayError = isCorsError && useDirectApi
        ? "CORS error: Try using the proxy API instead of direct mode"
        : `Error: ${errorMessage}`;
      
      // Show detailed error in debug panel
      setDebugInfo(`Error details: ${error.stack || error.message || String(error)}`);
      
      // Show error notification
      toast.error(displayError);
      
      // After processing the response in the error case:
      setResponseDetails({
        status: error.status || 0,
        statusText: error.statusText || 'Unknown error',
        error: true,
        errorDetails: error
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded-md shadow-md">
      <h2 className="text-xl font-semibold mb-4">Tealium MCP Configuration</h2>
      
      <div className="mb-4 p-3 bg-blue-50 rounded text-sm">
        <strong className="text-blue-700">Important:</strong>
        <ul className="text-blue-700 mt-1 space-y-1 list-disc list-inside">
          <li>You need to create an HTTP API data source in Tealium first.</li>
          <li>Get the data source key from your Tealium EventStream → Sources → Data Sources.</li>
          <li>Make sure you've <strong>saved and published</strong> your Tealium profile after creating the data source.</li>
          <li>Verify the data source is active by checking the "Status" column in Tealium.</li>
        </ul>
      </div>

      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="tealium-account">Tealium Account</Label>
          <Input
            type="text"
            id="tealium-account"
            placeholder="Your Tealium Account"
            value={tealiumAccount}
            onChange={(e) => setTealiumAccount(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="tealium-profile">Tealium Profile</Label>
          <Input
            type="text"
            id="tealium-profile"
            placeholder="Your Tealium Profile"
            value={tealiumProfile}
            onChange={(e) => setTealiumProfile(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="tealium-source-key" className="flex items-center">
            Data Source Key 
            <span className="ml-1 text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">Required</span>
          </Label>
          <Input
            type="text"
            id="tealium-source-key"
            placeholder="From Tealium HTTP API data source"
            value={tealiumSourceKey}
            onChange={(e) => setTealiumSourceKey(e.target.value)}
            required
          />
          <p className="text-xs text-gray-500 mt-1">Created when you add an HTTP API data source in Tealium</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="tealium-engine-id">Tealium Engine ID</Label>
          <Input
            type="text"
            id="tealium-engine-id"
            placeholder="Your Tealium Engine ID"
            value={tealiumEngineId}
            onChange={(e) => setTealiumEngineId(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="event-name">Event Name (Test Event)</Label>
          <Input
            type="text"
            id="event-name"
            placeholder="Event Name"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="user-id">User ID (Optional)</Label>
          <Input
            type="text"
            id="user-id"
            placeholder="User ID (optional)"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-2 mt-2">
          <input
            type="checkbox"
            id="use-direct-api"
            className="rounded border-gray-300"
            checked={useDirectApi}
            onChange={(e) => setUseDirectApi(e.target.checked)}
          />
          <Label htmlFor="use-direct-api" className="cursor-pointer">
            Use direct API call (may cause CORS issues)
          </Label>
        </div>
        
        <Button 
          type="submit" 
          className="mt-4"
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send Test Event to Tealium'}
        </Button>
        
        {debugInfo && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-60 whitespace-pre-wrap text-gray-700">
            <strong>Debug Info:</strong><br/>
            {debugInfo}
          </div>
        )}
      </div>
    </form>
  );
};

export default TealiumConfigForm; 