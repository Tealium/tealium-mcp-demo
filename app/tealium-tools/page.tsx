'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SAMPLE_DATA } from '@/lib/config';

export default function TealiumTools() {
  const [email, setEmail] = useState(SAMPLE_DATA.email || 'visitor@example.com');
  const [visitorId, setVisitorId] = useState('');
  const [eventName, setEventName] = useState('test_page_view');
  const [eventAttributes, setEventAttributes] = useState('{"page_name": "home", "test_data": true}');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [configData, setConfigData] = useState<any>(null);
  const [configLoading, setConfigLoading] = useState(false);
  
  // New state for advanced diagnostics
  const [diagEmail, setDiagEmail] = useState(SAMPLE_DATA.email || 'visitor@example.com');
  const [diagRegion, setDiagRegion] = useState('eu-central-1');
  const [testAllRegions, setTestAllRegions] = useState(false);
  const [diagLoading, setDiagLoading] = useState(false);
  const [diagResults, setDiagResults] = useState<any>(null);
  
  // New state for debug event creation
  const [debugEmail, setDebugEmail] = useState(SAMPLE_DATA.email || 'visitor@example.com');
  const [debugEventName, setDebugEventName] = useState('debug_visitor_creation');
  const [debugEventAttributes, setDebugEventAttributes] = useState('{"debug_source": "tealium_tools", "test_visitor": true}');
  const [debugWaitTime, setDebugWaitTime] = useState(5000);
  const [debugRetryCount, setDebugRetryCount] = useState(3);
  const [debugRetryDelay, setDebugRetryDelay] = useState(3000);
  const [debugLoading, setDebugLoading] = useState(false);
  const [debugResults, setDebugResults] = useState<any>(null);

  const handleSendEvent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Parse the JSON attributes
      let parsedAttributes = {};
      try {
        parsedAttributes = JSON.parse(eventAttributes);
      } catch (e) {
        setError('Invalid JSON in event attributes');
        setLoading(false);
        return;
      }
      
      // Prepare the payload
      const payload = {
        email,
        customVisitorId: visitorId || undefined,
        eventName,
        eventData: parsedAttributes
      };
      
      // Send the request
      const response = await fetch('/api/tealium/moments/send-test-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Failed to send event');
      } else {
        setResult(data);
      }
    } catch (e) {
      setError(`Error: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkConfig = async () => {
    try {
      setConfigLoading(true);
      setError(null);
      
      const response = await fetch('/api/tealium/moments/verify-config');
      const data = await response.json();
      
      setConfigData(data);
    } catch (e) {
      setError(`Error: ${(e as Error).message}`);
    } finally {
      setConfigLoading(false);
    }
  };

  const lookupVisitor = async (lookupEmail: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/tealium/moments/direct-test?email=${encodeURIComponent(lookupEmail)}`);
      const data = await response.json();
      
      setResult({
        lookupResult: data,
        message: 'Visitor lookup complete'
      });
    } catch (e) {
      setError(`Error: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // New function for advanced diagnostics
  const runAdvancedDiagnostics = async () => {
    try {
      setDiagLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams({
        email: diagEmail,
        region: diagRegion,
        testRegions: testAllRegions ? 'true' : 'false'
      });
      
      const response = await fetch(`/api/tealium/moments/advanced-diagnostics?${queryParams.toString()}`);
      const data = await response.json();
      
      setDiagResults(data);
    } catch (e) {
      setError(`Diagnostics Error: ${(e as Error).message}`);
    } finally {
      setDiagLoading(false);
    }
  };
  
  // New function for debug event creation
  const runDebugEventCreation = async () => {
    try {
      setDebugLoading(true);
      setError(null);
      
      // Parse the JSON attributes
      let parsedAttributes = {};
      try {
        parsedAttributes = JSON.parse(debugEventAttributes);
      } catch (e) {
        setError('Invalid JSON in debug event attributes');
        setDebugLoading(false);
        return;
      }
      
      // Prepare the payload
      const payload = {
        email: debugEmail,
        eventName: debugEventName,
        eventData: parsedAttributes,
        waitTimeMs: debugWaitTime,
        retryCount: debugRetryCount,
        retryDelayMs: debugRetryDelay
      };
      
      const response = await fetch('/api/tealium/moments/debug-event-creation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      setDebugResults(data);
      
      // If debug was successful, also update the main result
      if (data.success) {
        setResult({
          message: 'Visitor successfully created and verified in Tealium',
          visitorData: data.finalLookupResult
        });
      }
    } catch (e) {
      setError(`Debug Error: ${(e as Error).message}`);
    } finally {
      setDebugLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Tealium API Tools</h1>
      
      <div className="mb-8">
        <Link href="/" className="text-blue-500 hover:underline mb-4 inline-block">
          &larr; Back to Home
        </Link>
      </div>
      
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <p className="text-yellow-700">
          <strong>Important:</strong> According to Tealium documentation, you must first send events for a visitor 
          before you can look them up. Follow these steps to troubleshoot 404 errors:
        </p>
        <ol className="list-decimal ml-5 mt-2 text-yellow-700">
          <li>Run Advanced Diagnostics to check for API connection issues</li>
          <li>Use the Debug Event Creation tool to create and verify a visitor profile</li>
          <li>Then try to look up the visitor (may take a few minutes to propagate)</li>
        </ol>
      </div>
      
      <div className="grid grid-cols-1 gap-8">
        {/* Advanced Diagnostics - New Section */}
        <div className="border rounded-lg p-6 bg-white shadow">
          <h2 className="text-xl font-semibold mb-4">Advanced Diagnostics</h2>
          <p className="mb-4 text-gray-600">
            Test all available API endpoints and identify potential visitor lookup issues.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Email to Test:
              </label>
              <input
                type="email"
                value={diagEmail}
                onChange={(e) => setDiagEmail(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Tealium Region:
              </label>
              <select
                value={diagRegion}
                onChange={(e) => setDiagRegion(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="eu-central-1">EU Central (Frankfurt)</option>
                <option value="us-east-1">US East (N. Virginia)</option>
                <option value="us-west-2">US West (Oregon)</option>
                <option value="eu-west-1">EU West (Ireland)</option>
                <option value="ap-southeast-2">Asia Pacific (Sydney)</option>
              </select>
            </div>
            
            <div className="flex items-center mt-7">
              <input
                type="checkbox"
                id="testAllRegions"
                checked={testAllRegions}
                onChange={(e) => setTestAllRegions(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="testAllRegions" className="text-gray-700 text-sm">
                Test all regions
              </label>
            </div>
          </div>
          
          <button 
            onClick={runAdvancedDiagnostics}
            disabled={diagLoading}
            className="bg-indigo-600 hover:bg-indigo-800 text-white font-bold py-2 px-4 rounded mb-4"
          >
            {diagLoading ? 'Running Tests...' : 'Run Advanced Diagnostics'}
          </button>
          
          {diagResults && (
            <div className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="font-semibold mb-2">Configuration:</h3>
                  <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-36 text-sm">
                    {JSON.stringify(diagResults.configuration, null, 2)}
                  </pre>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Possible Issues:</h3>
                  {diagResults.possibleIssues.length > 0 ? (
                    <ul className="list-disc pl-5 bg-red-50 p-3 rounded">
                      {diagResults.possibleIssues.map((issue: string, i: number) => (
                        <li key={i} className="text-red-700 text-sm mb-1">{issue}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-green-600">No issues detected!</p>
                  )}
                  
                  <h3 className="font-semibold mt-4 mb-2">Recommended Fixes:</h3>
                  <ul className="list-disc pl-5 bg-blue-50 p-3 rounded">
                    {diagResults.recommendedFixes.map((fix: string, i: number) => (
                      <li key={i} className="text-blue-700 text-sm mb-1">{fix}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Endpoint Test Results:</h3>
                <div className="bg-gray-100 p-4 rounded overflow-auto max-h-80 text-sm">
                  <p className="font-medium mb-2">Hover over each region to see details:</p>
                  
                  {Object.keys(diagResults.regionTests).map((region: string) => (
                    <div key={region} className="mb-4">
                      <details>
                        <summary className="cursor-pointer font-medium text-blue-600 hover:text-blue-800">
                          Region: {region}
                        </summary>
                        <div className="pl-4 mt-2">
                          {Object.keys(diagResults.regionTests[region].endpoints).map((pattern: string) => (
                            <details key={pattern} className="mb-2">
                              <summary className="cursor-pointer text-sm">
                                Pattern {pattern}: 
                                <span className={diagResults.regionTests[region].endpoints[pattern].status === 200 
                                  ? "text-green-600 ml-2" 
                                  : "text-red-600 ml-2"}>
                                  {diagResults.regionTests[region].endpoints[pattern].status || "Error"}
                                </span>
                              </summary>
                              <pre className="text-xs mt-1 pl-4 whitespace-pre-wrap">
                                {JSON.stringify(diagResults.regionTests[region].endpoints[pattern], null, 2)}
                              </pre>
                            </details>
                          ))}
                        </div>
                      </details>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Documentation Links:</h3>
                <div className="flex flex-col space-y-2">
                  {diagResults.documentation && Object.entries(diagResults.documentation).map(([key, url]: [string, any]) => (
                    <a 
                      key={key} 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline text-sm"
                    >
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Debug Event Creation - New Section */}
        <div className="border rounded-lg p-6 bg-white shadow">
          <h2 className="text-xl font-semibold mb-4">Debug Event Creation</h2>
          <p className="mb-4 text-gray-600">
            Create a visitor profile and verify it exists in Tealium. This tool sends an event and immediately checks if the visitor was created.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Email for Visitor:
                </label>
                <input
                  type="email"
                  value={debugEmail}
                  onChange={(e) => setDebugEmail(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Event Name:
                </label>
                <input
                  type="text"
                  value={debugEventName}
                  onChange={(e) => setDebugEventName(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Event Attributes (JSON):
                </label>
                <textarea
                  value={debugEventAttributes}
                  onChange={(e) => setDebugEventAttributes(e.target.value)}
                  rows={4}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
            </div>
            
            <div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Wait Time Before Lookup (ms):
                </label>
                <input
                  type="number"
                  value={debugWaitTime}
                  onChange={(e) => setDebugWaitTime(parseInt(e.target.value))}
                  min="1000"
                  step="1000"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
                <p className="text-xs text-gray-500 mt-1">Initial wait time before attempting lookup (ms)</p>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Retry Count:
                </label>
                <input
                  type="number"
                  value={debugRetryCount}
                  onChange={(e) => setDebugRetryCount(parseInt(e.target.value))}
                  min="1"
                  max="5"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
                <p className="text-xs text-gray-500 mt-1">Number of lookup attempts to make</p>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Retry Delay (ms):
                </label>
                <input
                  type="number"
                  value={debugRetryDelay}
                  onChange={(e) => setDebugRetryDelay(parseInt(e.target.value))}
                  min="1000"
                  step="1000"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
                <p className="text-xs text-gray-500 mt-1">Delay between retry attempts (ms)</p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={runDebugEventCreation}
            disabled={debugLoading}
            className="bg-green-600 hover:bg-green-800 text-white font-bold py-2 px-4 rounded mb-4"
          >
            {debugLoading ? 'Creating & Verifying...' : 'Create & Verify Visitor'}
          </button>
          
          {debugResults && (
            <div className="mt-4">
              <div className="flex items-center mb-4">
                <div className={`w-4 h-4 rounded-full mr-2 ${debugResults.success ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <h3 className="font-semibold">
                  {debugResults.success ? 'Success: Visitor Created and Verified!' : 'Visitor Creation Process Completed'}
                </h3>
              </div>
              
              <div className="bg-gray-50 p-3 rounded mb-4">
                <p className="font-medium">{debugResults.message}</p>
                {debugResults.recommendedAction && (
                  <p className="text-blue-600 text-sm mt-1">{debugResults.recommendedAction}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Event Details:</h4>
                  <pre className="bg-gray-100 p-3 rounded overflow-auto text-xs max-h-60">
                    {JSON.stringify(debugResults.sendEventDetails, null, 2)}
                  </pre>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Event Response:</h4>
                  <pre className="bg-gray-100 p-3 rounded overflow-auto text-xs max-h-60">
                    {JSON.stringify(debugResults.sendEventResponse, null, 2)}
                  </pre>
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="font-medium mb-2">Lookup Attempts:</h4>
                <div className="bg-gray-100 p-3 rounded overflow-auto max-h-80">
                  {debugResults.lookupAttempts.map((attempt: any, i: number) => (
                    <details key={i} className="mb-2">
                      <summary className="cursor-pointer text-sm">
                        Attempt {i+1}: {attempt.approach} - 
                        <span className={attempt.status === 200 
                          ? "text-green-600 ml-1" 
                          : "text-red-600 ml-1"}>
                          {attempt.status || attempt.error || "Unknown"}
                        </span>
                      </summary>
                      <pre className="text-xs mt-1 pl-4 whitespace-pre-wrap">
                        {JSON.stringify(attempt, null, 2)}
                      </pre>
                    </details>
                  ))}
                </div>
              </div>
              
              {debugResults.finalLookupResult && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2 text-green-600">Final Successful Lookup Result:</h4>
                  <pre className="bg-green-50 p-3 rounded overflow-auto text-xs max-h-60 border border-green-200">
                    {JSON.stringify(debugResults.finalLookupResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Config Verification */}
          <div className="border rounded-lg p-6 bg-white shadow">
            <h2 className="text-xl font-semibold mb-4">Verify Configuration</h2>
            <button 
              onClick={checkConfig}
              disabled={configLoading}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
            >
              {configLoading ? 'Checking...' : 'Check Configuration'}
            </button>
            
            {configData && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Configuration:</h3>
                <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-80 text-sm">
                  {JSON.stringify(configData, null, 2)}
                </pre>
              </div>
            )}
          </div>
          
          {/* Event Sender */}
          <div className="border rounded-lg p-6 bg-white shadow">
            <h2 className="text-xl font-semibold mb-4">Send Test Event</h2>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Email:
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Custom Visitor ID (optional):
              </label>
              <input
                type="text"
                value={visitorId}
                onChange={(e) => setVisitorId(e.target.value)}
                placeholder="Leave empty to generate automatically"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Event Name:
              </label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Event Attributes (JSON):
              </label>
              <textarea
                value={eventAttributes}
                onChange={(e) => setEventAttributes(e.target.value)}
                rows={4}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            <div className="flex space-x-2">
              <button 
                onClick={handleSendEvent}
                disabled={loading}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                {loading ? 'Sending...' : 'Send Event'}
              </button>
              
              <button 
                onClick={() => lookupVisitor(email)}
                disabled={loading}
                className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
              >
                Lookup Visitor
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Results Display */}
      {(result || error) && (
        <div className="mt-8 border rounded-lg p-6 bg-white shadow">
          <h2 className="text-xl font-semibold mb-4">Results</h2>
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
              <p>{error}</p>
            </div>
          )}
          
          {result && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Response:</h3>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
