'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestServerPage() {
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const sendTestEvent = async () => {
    setIsLoading(true);
    setResult('Sending test event...');
    
    try {
      const response = await fetch('/api/tealium/server-track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: 'test',
          visitor_id: 'tester@example.com',
          tealium_account: process.env.NEXT_PUBLIC_TEALIUM_ACCOUNT || '',
          tealium_profile: process.env.NEXT_PUBLIC_TEALIUM_PROFILE || '',
          tealium_datasource: process.env.NEXT_PUBLIC_TEALIUM_DATA_SOURCE_KEY || '',
          test_data: 'This is a test event',
          timestamp: new Date().toISOString()
        })
      });
      
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Tealium Server-Side API Test</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={sendTestEvent} 
            disabled={isLoading}
            className="mb-4"
          >
            {isLoading ? 'Sending...' : 'Send Test Event'}
          </Button>
          
          {result && (
            <div className="mt-4 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-60 whitespace-pre-wrap text-gray-700">
              <strong>Response:</strong><br/>
              {result}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
