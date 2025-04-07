import React from 'react';
import TealiumConfigForm from '@/components/tealium-config-form';

export default function TealiumConfigPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Tealium MCP Configuration UI</h1>
      
      <div className="max-w-md mx-auto mb-8 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">Before You Start</h2>
        <ol className="list-decimal list-inside space-y-2 text-blue-700">
          <li>Create an HTTP API data source in your Tealium profile</li>
          <li>Get your data source key from EventStream → Sources → Data Sources</li>
          <li>Save and publish your Tealium profile</li>
          <li>Verify the data source is active in Tealium</li>
        </ol>
      </div>

      <TealiumConfigForm />
      
      <div className="mt-8 max-w-md mx-auto text-sm text-gray-600 space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">How to Use</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>Enter your Tealium Account and Profile</li>
            <li>Add your Data Source Key from Tealium</li>
            <li>Optionally set an Event Name and User ID</li>
            <li>Click "Send Test Event to Tealium"</li>
          </ol>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Troubleshooting</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Check the debug panel for detailed response information</li>
            <li>Verify your data source key is correct and active</li>
            <li>Ensure your Tealium profile is published</li>
            <li>Try using the proxy API if you encounter CORS issues</li>
          </ul>
        </div>

        <p className="text-xs mt-2 text-gray-500">
          This app sends events using the Modern Context Protocol (MCP) format.
        </p>
      </div>
    </div>
  );
} 