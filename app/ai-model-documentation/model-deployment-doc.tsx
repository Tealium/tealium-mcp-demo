import React from 'react';

export default function ModelDeploymentDoc() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold" id="deployment">Model Deployment & Tracking</h2>
      
      <p>
        This feature allows you to deploy AI models and track all model-related events in Tealium.
        You can send deployment events, user queries, and model responses as structured data directly to your Tealium account.
      </p>
      
      <h3 className="text-xl font-semibold mt-6">How It Works</h3>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-bold text-lg mb-2">1. Model Deployment</h4>
          <p className="text-sm">
            Track when and how models are deployed, including all configuration parameters.
            This allows you to analyze which model configurations are most effective.
          </p>
        </div>
        
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-bold text-lg mb-2">2. User Queries</h4>
          <p className="text-sm">
            Capture all user queries sent to your AI models. This data can help you understand 
            what users are asking and identify common patterns or trends.
          </p>
        </div>
        
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-bold text-lg mb-2">3. Model Responses</h4>
          <p className="text-sm">
            Record all model responses along with metadata like latency and token usage.
            This helps you track performance and optimize costs.
          </p>
        </div>
      </div>
      
      <h3 className="text-xl font-semibold mt-8">Tealium Integration</h3>
      
      <p className="mb-4">
        All events are sent to Tealium using the Modern Context Protocol (MCP) format. 
        The data is structured to provide rich context for analysis in your Tealium-connected tools.
      </p>
      
      <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-80">
        <p className="font-medium mb-2">Example Deployment Event:</p>
        <pre className="text-xs">
{`{
  "data": {
    "event_name": "ai_model_deployment",
    "description": "AI Model deployment event",
    "timestamp": "2023-06-14T15:23:42.315Z",
    
    "tealium_account": "your-account",
    "tealium_profile": "main",
    "tealium_datasource": "your-datasource-key",
    "tealium_event": "ai_model_deployment",
    
    "model_platform": "openai",
    "model_name": "GPT-4",
    "model_version": "turbo",
    "model_type": "chat",
    "model_description": "GPT-4 turbo for chat",
    "model_configuration": {
      "max_tokens": 2048,
      "temperature": 0.7,
      "top_p": 1,
      "frequency_penalty": 0,
      "presence_penalty": 0
    },
    
    "deployment_id": "deploy-1234567890",
    "deployment_timestamp": "2023-06-14T15:23:42.315Z",
    "deployment_status": "successful",
    "deployment_environment": "production"
  }
}`}
        </pre>
      </div>
      
      <h3 className="text-xl font-semibold mt-8">Query/Response Tracking</h3>
      
      <p className="mb-4">
        The system uses unique identifiers to link queries with their corresponding responses, 
        allowing you to analyze the full conversation flow.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-80">
          <p className="font-medium mb-2">Example Query Event:</p>
          <pre className="text-xs">
{`{
  "data": {
    "event_name": "ai_model_query",
    "description": "User query to AI model",
    "timestamp": "2023-06-14T15:23:45.123Z",
    
    "tealium_account": "your-account",
    "tealium_profile": "main",
    "tealium_datasource": "your-datasource-key",
    "tealium_event": "ai_model_query",
    
    "model_platform": "openai",
    "model_name": "GPT-4",
    "model_version": "turbo",
    "model_type": "chat",
    
    "query_id": "query-abc123",
    "query_text": "What's the weather like today?",
    "query_timestamp": "2023-06-14T15:23:45.123Z",
    
    "user_id": "user-12345",
    "session_id": "session-67890"
  }
}`}
          </pre>
        </div>
        
        <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-80">
          <p className="font-medium mb-2">Example Response Event:</p>
          <pre className="text-xs">
{`{
  "data": {
    "event_name": "ai_model_response",
    "description": "AI model response to user query",
    "timestamp": "2023-06-14T15:23:46.456Z",
    
    "tealium_account": "your-account",
    "tealium_profile": "main",
    "tealium_datasource": "your-datasource-key",
    "tealium_event": "ai_model_response",
    
    "model_platform": "openai",
    "model_name": "GPT-4",
    "model_version": "turbo",
    "model_type": "chat",
    
    "query_id": "query-abc123",
    
    "response_text": "I don't have real-time data, but I can help you find weather information...",
    "response_timestamp": "2023-06-14T15:23:46.456Z",
    "response_latency_ms": 1333,
    "tokens_used": 156
  }
}`}
          </pre>
        </div>
      </div>
      
      <h3 className="text-xl font-semibold mt-8">Setting Up</h3>
      
      <ol className="list-decimal list-inside space-y-2 ml-4 mt-2">
        <li>Configure your AI model in the Configuration tab</li>
        <li>Go to the Debug & Test page</li>
        <li>Click the "Deployment & Query Test" tab</li>
        <li>Enter your Tealium account details and model configuration</li>
        <li>Use the interface to deploy models and send test queries/responses</li>
      </ol>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
        <h4 className="font-bold text-yellow-800">Important Notes</h4>
        <ul className="list-disc list-inside mt-2 text-yellow-700 space-y-1">
          <li>You must have a valid Tealium account with an HTTP API data source set up</li>
          <li>Make sure your data source key is correct and active</li>
          <li>All events include timestamps and unique identifiers for correlation</li>
          <li>For production use, integrate these functions into your AI application code</li>
        </ul>
      </div>
      
      <h3 className="text-xl font-semibold mt-8">Using the API</h3>
      
      <p className="mb-4">
        For developers, here's how to use the deployment tracking API in your code:
      </p>
      
      <div className="bg-gray-100 p-4 rounded-lg overflow-auto">
        <pre className="text-xs">
{`// Import the Tealium service functions
import { 
  sendModelDeployment, 
  sendModelQuery, 
  sendModelResponse 
} from '@/lib/tealium-service';

// Configure your Tealium account
const tealiumConfig = {
  account: 'your-account',
  profile: 'main',
  dataSourceKey: 'your-datasource-key'
};

// Your model configuration
const modelConfig = {
  platform: 'openai',
  model_name: 'GPT-4',
  model_version: 'turbo',
  model_type: 'chat',
  parameters: {
    max_tokens: 2048,
    temperature: 0.7
  },
  custom_params: {
    top_p: 1
  }
};

// STEP 1: Track model deployment
await sendModelDeployment(modelConfig, tealiumConfig);

// STEP 2: Track a user query
const queryResult = await sendModelQuery(
  {
    query: 'What's the weather like today?',
    user_id: 'user-123',
    session_id: 'session-456'
  },
  modelConfig,
  tealiumConfig
);

// STEP 3: Get the query ID to link query and response
const queryId = queryResult.query_id;

// STEP 4: Track the model's response
await sendModelResponse(
  {
    query_id: queryId,
    response: 'I don't have real-time data, but I can help you find weather information...',
    latency: 1333, // milliseconds
    tokens_used: 156
  },
  modelConfig,
  tealiumConfig
);`}
        </pre>
      </div>
    </div>
  );
} 