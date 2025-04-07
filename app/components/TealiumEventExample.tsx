'use client';

import { useState } from 'react';
import { sendTealiumEvent, trackPageView, trackUserAction, trackFormSubmission } from '../services/tealium-service';
import { SAMPLE_DATA } from '@/lib/config';

export default function TealiumEventExample() {
  const [email, setEmail] = useState<string>(SAMPLE_DATA.email || 'visitor@example.com');
  const [eventName, setEventName] = useState<string>('custom_event');
  const [eventData, setEventData] = useState<string>('{\n  "product_name": "Example Product",\n  "price": 99.99,\n  "currency": "EUR"\n}');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Helper to format and display result
  const displayResult = (data: any) => {
    setResult(JSON.stringify(data, null, 2));
    setLoading(false);
  };

  // Handle custom event submission
  const handleSendCustomEvent = async () => {
    setLoading(true);
    setResult('Sending event...');

    try {
      // Parse the JSON event data
      const parsedEventData = eventData ? JSON.parse(eventData) : {};
      
      // Send the event
      const response = await sendTealiumEvent({
        email,
        eventName,
        eventData: parsedEventData
      });

      // Display the result
      displayResult(response);
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setLoading(false);
    }
  };

  // Handle page view tracking
  const handleTrackPageView = async () => {
    setLoading(true);
    setResult('Tracking page view...');
    
    const response = await trackPageView('example_page', email);
    displayResult(response);
  };

  // Handle user action tracking
  const handleTrackUserAction = async () => {
    setLoading(true);
    setResult('Tracking user action...');
    
    const response = await trackUserAction('button_click', email, {
      button_id: 'example_button',
      section: 'header'
    });
    displayResult(response);
  };

  // Handle form submission tracking
  const handleTrackFormSubmission = async () => {
    setLoading(true);
    setResult('Tracking form submission...');
    
    const response = await trackFormSubmission('contact_form', email, {
      form_id: 'contact_123',
      success: true
    });
    displayResult(response);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md mt-10">
      <h1 className="text-2xl font-bold mb-6">Tealium Event Tracking</h1>
      
      {/* Email Input */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Email (for visitor tracking)</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="user@example.com"
        />
      </div>
      
      {/* Event Type Buttons - Common Events */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Common Events</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleTrackPageView}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={loading}
          >
            Track Page View
          </button>
          <button
            onClick={handleTrackUserAction}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            disabled={loading}
          >
            Track User Action
          </button>
          <button
            onClick={handleTrackFormSubmission}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            disabled={loading}
          >
            Track Form Submission
          </button>
        </div>
      </div>
      
      {/* Custom Event Form */}
      <div className="mb-6 p-4 border rounded bg-gray-50">
        <h2 className="text-lg font-semibold mb-2">Custom Event</h2>
        
        {/* Event Name */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Event Name</label>
          <input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="custom_event"
          />
        </div>
        
        {/* Event Data */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Event Data (JSON)</label>
          <textarea
            value={eventData}
            onChange={(e) => setEventData(e.target.value)}
            className="w-full p-2 border rounded font-mono text-sm"
            rows={6}
            placeholder='{"key": "value"}'
          />
        </div>
        
        {/* Submit Button */}
        <button
          onClick={handleSendCustomEvent}
          className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 w-full"
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Custom Event'}
        </button>
      </div>
      
      {/* Result Display */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Result</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60 text-sm">
          {result || 'No results yet'}
        </pre>
      </div>
    </div>
  );
}
