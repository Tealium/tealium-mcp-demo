import React from 'react';

export default function TealiumIntegrationDoc() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold" id="tealium-integration">Tealium Integration for Model Query/Response</h2>
      
      <p>
        This application supports two methods for integrating AI model query and response data with Tealium:
        Tealium Functions (recommended) and Tealium Moments API. Both methods enable personalized model responses
        by retrieving visitor context from Tealium.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="border border-green-200 bg-green-50 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-green-800 mb-2">
            Tealium Functions 
            <span className="ml-2 text-xs bg-green-600 text-white px-2 py-0.5 rounded">Recommended</span>
          </h3>
          <p className="text-sm mb-4">
            Tealium Functions provide a serverless JavaScript environment where you can process events and 
            access visitor data to enrich AI model queries with personalized context.
          </p>
          
          <h4 className="font-semibold mb-1 text-green-700">Key Advantages:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm mb-4">
            <li>Direct access to complete visitor profiles and attributes</li>
            <li>Flexible JavaScript environment for complex data processing</li>
            <li>Event-driven architecture matches query/response workflow</li>
            <li>Better for stateless request/response patterns</li>
            <li>More powerful data transformation capabilities</li>
          </ul>
          
          <h4 className="font-semibold mb-1 text-green-700">Use When:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>You need comprehensive visitor data for context</li>
            <li>You want to perform complex transformations on query/response data</li>
            <li>You're implementing a stateless query workflow</li>
            <li>You need access to visitor attributes, badges, and enrichments</li>
          </ul>
        </div>
        
        <div className="border border-blue-200 bg-blue-50 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-blue-800 mb-2">Tealium Moments API</h3>
          <p className="text-sm mb-4">
            Tealium Moments API is designed for real-time interaction based on visitor behavior patterns and 
            journey insights, focusing on specific moments in the customer journey.
          </p>
          
          <h4 className="font-semibold mb-1 text-blue-700">Key Advantages:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm mb-4">
            <li>Focused on real-time behavioral moments</li>
            <li>Better for tracking specific milestones in user journeys</li>
            <li>Predefined triggers based on user behavior patterns</li>
            <li>More audience-focused capabilities</li>
            <li>Direct API for sending events and getting insights</li>
          </ul>
          
          <h4 className="font-semibold mb-1 text-blue-700">Use When:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Your model responses need to react to specific moments in user journeys</li>
            <li>You're focusing on audience membership for personalization</li>
            <li>You need to trigger specific actions based on behavioral patterns</li>
            <li>You want to use Tealium's engines to identify moments</li>
          </ul>
        </div>
      </div>
      
      <h3 className="text-xl font-semibold mt-8">Implementation Flow</h3>
      
      <div className="bg-white border p-6 rounded-lg mt-4">
        <h4 className="font-bold mb-3">How the AI Model Query/Response Flow Works</h4>
        
        <ol className="space-y-6 mt-4">
          <li className="flex">
            <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-gray-200 font-bold mr-3">1</div>
            <div>
              <h5 className="font-semibold">User writes a query to model</h5>
              <p className="text-sm text-gray-600 mt-1">
                The user submits a natural language question or request to the AI model through your application.
              </p>
            </div>
          </li>
          
          <li className="flex">
            <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-gray-200 font-bold mr-3">2</div>
            <div>
              <h5 className="font-semibold">Query is sent to Tealium</h5>
              <p className="text-sm text-gray-600 mt-1">
                The application sends the query event to Tealium along with the visitor ID to check if there's visitor context available.
              </p>
              <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
{`// Send query to Tealium
const result = await sendModelQuery(
  {
    query: "What products would you recommend for me?",
    visitor_id: "visitor-123",
    user_id: "user-456"
  },
  modelConfig,
  { 
    account: "your-account", 
    profile: "your-profile", 
    dataSourceKey: "your-key",
    integration: "functions" // or "moments"
  }
);`}
              </pre>
            </div>
          </li>
          
          <li className="flex">
            <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-gray-200 font-bold mr-3">3</div>
            <div>
              <h5 className="font-semibold">Context is retrieved through Functions or Moments API</h5>
              <p className="text-sm text-gray-600 mt-1">
                If a visitor ID is available, additional context about the user is retrieved from Tealium:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="border border-green-100 rounded p-2">
                  <p className="text-xs font-medium text-green-800 mb-1">Tealium Functions Implementation:</p>
                  <pre className="text-xs bg-green-50 p-2 rounded overflow-auto">
{`// In your Tealium Function
export function onVisitorEvent(event, visitor) {
  // Check if this is a model query event
  if (event.data.event_name === 'ai_model_query') {
    
    // Extract visitor context
    const context = {
      segments: visitor.audiences.map(a => a.name),
      attributes: {
        lifetime_value: visitor.getAttributeValue('lifetime_value'),
        product_preferences: visitor.getAttributeValue('product_preferences'),
        recent_purchases: visitor.getAttributeValue('recent_purchases')
      }
    };
    
    // Return context to be used with model
    return context;
  }
}`}
                  </pre>
                </div>
                
                <div className="border border-blue-100 rounded p-2">
                  <p className="text-xs font-medium text-blue-800 mb-1">Tealium Moments API Implementation:</p>
                  <pre className="text-xs bg-blue-50 p-2 rounded overflow-auto">
{`// Request to Moments API
const momentsRequest = {
  account: "your-account",
  profile: "your-profile",
  visitor_id: "visitor-123",
  events: [{
    name: "ai_model_query",
    data: {
      query_text: "What products would you recommend?",
      timestamp: new Date().toISOString()
    }
  }]
};

// Moments API responds with visitor context
const response = {
  visitor_context: {
    segments: ["returning_customer", "high_value"],
    preferences: ["electronics", "gadgets"],
    recent_activity: [
      { type: "purchase", product: "smartphone" }
    ]
  }
};`}
                  </pre>
                </div>
              </div>
            </div>
          </li>
          
          <li className="flex">
            <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-gray-200 font-bold mr-3">4</div>
            <div>
              <h5 className="font-semibold">Model generates a contextualized response</h5>
              <p className="text-sm text-gray-600 mt-1">
                The AI model generates a response using both the initial query and the visitor context from Tealium.
              </p>
              <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
{`// Call to AI model with enriched context
const modelRequest = {
  query: "What products would you recommend for me?",
  userContext: visitorContext, // From Tealium
  modelParameters: {
    temperature: 0.7,
    max_tokens: 2048
  }
};

// Model returns personalized response
const modelResponse = await callAIModel(modelRequest);

// Response incorporates visitor context
// "Based on your recent smartphone purchase and interest in electronics,
// you might enjoy our new wireless earbuds or smartwatch accessories..."`}
              </pre>
            </div>
          </li>
          
          <li className="flex">
            <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-gray-200 font-bold mr-3">5</div>
            <div>
              <h5 className="font-semibold">Response is sent back to Tealium</h5>
              <p className="text-sm text-gray-600 mt-1">
                The model's response is sent back to Tealium to track the interaction and for further analysis.
              </p>
              <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
{`// Send model response back to Tealium
await sendModelResponse(
  {
    query_id: queryResult.query_id, // Link to original query
    response: modelResponse.text,
    visitor_id: "visitor-123",
    latency: modelResponse.latency,
    tokens_used: modelResponse.usage.total_tokens,
    context_used: visitorContext // Include what context was used
  },
  modelConfig,
  tealiumConfig
);`}
              </pre>
            </div>
          </li>
        </ol>
      </div>
      
      <h3 className="text-xl font-semibold mt-8">Implementation Code Examples</h3>
      
      <div className="bg-gray-50 p-6 rounded-lg mt-4">
        <h4 className="font-bold mb-4">Tealium Functions Example (Recommended)</h4>
        <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
{`// Tealium Function to enrich AI model queries with visitor context
export function onVisitorEvent(event, visitor) {
  // Check if this is a model query event
  if (event.data.event_name === 'ai_model_query') {
    console.log('Processing AI model query for visitor:', visitor.id);
    
    try {
      // Extract the query details
      const queryId = event.data.query_id;
      const queryText = event.data.query_text;
      const modelName = event.data.model_name;
      
      // Build visitor context from available attributes
      const visitorContext = {
        // Basic visitor info
        id: visitor.id,
        first_seen: visitor.first_seen,
        visit_count: visitor.visit_count,
        
        // Audience memberships
        audiences: visitor.audiences.map(audience => audience.name),
        
        // Retrieve relevant attributes
        preferences: visitor.getAttributeValue('product_preferences') || [],
        recent_purchases: visitor.getAttributeValue('recent_purchases') || [],
        lifetime_value: visitor.getAttributeValue('lifetime_value') || 0,
        locations: visitor.getAttributeValue('visited_locations') || [],
        
        // Add any other contextual information
        device_type: visitor.getAttributeValue('device_type'),
        current_location: visitor.getAttributeValue('current_location'),
        language_preference: visitor.getAttributeValue('language_preference')
      };
      
      // Call your AI model API with the enriched context
      const modelApiEndpoint = 'https://your-ai-model-api.com/generate';
      
      // Send to model API
      const modelResponse = await fetch(modelApiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_API_KEY'
        },
        body: JSON.stringify({
          query: queryText,
          model: modelName,
          visitor_context: visitorContext,
          query_id: queryId
        })
      });
      
      // Parse model response
      const modelResult = await modelResponse.json();
      
      // Log response for debugging
      console.log('Model response:', modelResult.response);
      
      // Send response back to Tealium via Collect API
      const tealiumResponse = await fetch('https://collect.tealiumiq.com/event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tealium-Account': event.data.tealium_account,
          'X-Tealium-Profile': event.data.tealium_profile,
          'X-Tealium-Key': event.data.tealium_datasource
        },
        body: JSON.stringify({
          // Link back to the original query
          query_id: queryId,
          
          // Event information
          event_name: 'ai_model_response',
          timestamp: new Date().toISOString(),
          
          // Response content
          response_text: modelResult.response,
          
          // Metadata
          response_latency_ms: modelResult.latency,
          tokens_used: modelResult.usage?.total_tokens,
          model_name: modelName,
          
          // Include what context was used
          visitor_context_used: true,
          visitor_id: visitor.id
        })
      });
      
      // Return status for logging
      return {
        status: 'success',
        message: 'Successfully processed AI model query with visitor context'
      };
    } catch (error) {
      console.error('Error processing AI model query:', error);
      return {
        status: 'error',
        message: error.message
      };
    }
  }
  
  // Not a model query event
  return null;
}`}
        </pre>
      </div>
      
      <div className="bg-gray-50 p-6 rounded-lg mt-6">
        <h4 className="font-bold mb-4">Tealium Moments API Example</h4>
        <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
{`// Client-side implementation using Moments API

// 1. Import the Tealium service functions
import { sendModelQuery, sendModelResponse } from '@/lib/tealium-service';

// 2. Setup your configuration
const modelConfig = {
  platform: 'openai',
  model_name: 'GPT-4',
  model_version: 'turbo',
  model_type: 'chat'
};

const tealiumConfig = {
  account: 'your-account',
  profile: 'your-profile',
  dataSourceKey: 'your-datasource-key',
  integration: 'moments' // Specify to use Moments API
};

// 3. Handle user query
async function handleUserQuery(query, visitorId) {
  try {
    // Send query to Tealium Moments API
    const queryResult = await sendModelQuery(
      {
        query: query,
        visitor_id: visitorId,
        user_id: 'user-123'
      },
      modelConfig,
      tealiumConfig
    );
    
    // Get the visitor context from Moments API response
    const visitorContext = queryResult.visitor_context;
    
    if (visitorContext) {
      console.log('Received visitor context:', visitorContext);
      
      // 4. Call your AI model with the context
      const modelResponse = await fetch('https://your-ai-model-api.com/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_API_KEY'
        },
        body: JSON.stringify({
          query: query,
          model: modelConfig.model_name,
          context: visitorContext
        })
      });
      
      const modelResult = await modelResponse.json();
      
      // 5. Send the response back to Tealium
      await sendModelResponse(
        {
          query_id: queryResult.query_id,
          response: modelResult.response,
          visitor_id: visitorId,
          latency: modelResult.latency,
          tokens_used: modelResult.usage?.total_tokens,
          context_used: visitorContext
        },
        modelConfig,
        tealiumConfig
      );
      
      // Return the personalized response
      return modelResult.response;
    } else {
      console.log('No visitor context available, using standard response');
      
      // Call model without context
      const modelResponse = await fetch('https://your-ai-model-api.com/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_API_KEY'
        },
        body: JSON.stringify({
          query: query,
          model: modelConfig.model_name
        })
      });
      
      const modelResult = await modelResponse.json();
      
      // Send response back to Tealium
      await sendModelResponse(
        {
          query_id: queryResult.query_id,
          response: modelResult.response,
          visitor_id: visitorId,
          latency: modelResult.latency,
          tokens_used: modelResult.usage?.total_tokens,
          context_used: null
        },
        modelConfig,
        tealiumConfig
      );
      
      return modelResult.response;
    }
  } catch (error) {
    console.error('Error processing query with Moments API:', error);
    throw error;
  }
}`}
        </pre>
      </div>
      
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-bold text-yellow-800 mb-2">Important Notes</h4>
        <ul className="list-disc space-y-2 pl-5 text-sm text-yellow-800">
          <li>
            <strong>Setup Requirements:</strong> Both integration methods require you to have properly configured Tealium EventStream and data sources.
          </li>
          <li>
            <strong>Authentication:</strong> Ensure your API keys and access credentials are properly secured and not exposed in client-side code.
          </li>
          <li>
            <strong>Visitor Identification:</strong> For both methods to work effectively, you need a consistent visitor identification strategy.
          </li>
          <li>
            <strong>Data Privacy:</strong> Be mindful of what visitor context you send to your AI models and ensure compliance with privacy regulations.
          </li>
          <li>
            <strong>Testing:</strong> Use the Test Tool in the Debug section to validate your integration before deploying to production.
          </li>
        </ul>
      </div>
    </div>
  );
} 