import React from 'react';
import Link from 'next/link';
import ModelDeploymentDoc from './model-deployment-doc';
import TealiumIntegrationDoc from './tealium-integration-doc';

export default function AiModelDocumentationPage() {
  return (
    <div className="container mx-auto p-4 pb-16">
      <h1 className="text-3xl font-bold mb-8 text-center">AI Model Configuration Guide</h1>
      
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex justify-between">
          <Link 
            href="/ai-model-config" 
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
          >
            <span>Go to AI Model Configuration</span>
          </Link>
          
          <Link 
            href="/ai-model-debug" 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
          >
            <span>Go to Debug & Test</span>
          </Link>
        </div>

        {/* Table of Contents */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contents</h2>
          <ul className="space-y-2">
            <li>
              <a href="#introduction" className="text-blue-600 hover:text-blue-800">Introduction</a>
            </li>
            <li>
              <a href="#prerequisites" className="text-blue-600 hover:text-blue-800">Prerequisites</a>
            </li>
            <li>
              <a href="#stepbystep" className="text-blue-600 hover:text-blue-800">Step-by-Step Guide</a>
            </li>
            <li>
              <a href="#deployment" className="text-blue-600 hover:text-blue-800">Model Deployment & Tracking</a>
            </li>
            <li>
              <a href="#tealium-integration" className="text-blue-600 hover:text-blue-800">Tealium Integration for Model Queries</a>
            </li>
            <li>
              <a href="#examples" className="text-blue-600 hover:text-blue-800">Configuration Examples</a>
            </li>
            <li>
              <a href="#parameters" className="text-blue-600 hover:text-blue-800">Custom Parameters Reference</a>
            </li>
          </ul>
        </div>

        <div className="space-y-8">
          {/* Introduction Section */}
          <section className="bg-white p-6 rounded-lg shadow-md" id="introduction">
            <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
            <p className="mb-4">
              This guide explains how to use the enhanced AI Model Onboarding interface to configure and register AI models 
              through Tealium's MCP (Modern Context Protocol). The new multi-step wizard makes it easy to onboard any AI model 
              in real-time without requiring code changes or deployments.
            </p>
            <p>
              The improved interface allows you to select from popular AI platforms, choose specific models and versions,
              and customize exactly what data gets ingested into Tealium.
            </p>
          </section>

          {/* Prerequisites Section */}
          <section className="bg-white p-6 rounded-lg shadow-md" id="prerequisites">
            <h2 className="text-2xl font-semibold mb-4">Prerequisites</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>A Tealium account with access to EventStream</li>
              <li>An HTTP API data source created in your Tealium profile</li>
              <li>The data source key from Tealium EventStream → Sources → Data Sources</li>
              <li>Your Tealium account name and profile name</li>
              <li>Basic information about the AI model you want to configure</li>
            </ol>
          </section>

          {/* Step-by-Step Guide Section */}
          <section className="bg-white p-6 rounded-lg shadow-md" id="stepbystep">
            <h2 className="text-2xl font-semibold mb-4">Step-by-Step Guide</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-medium mb-2">Step 1: Select AI Platform and Model</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>AI Platform:</strong> Choose your AI provider (OpenAI, Anthropic, Google, etc.)</li>
                  <li><strong>Model:</strong> Select a specific model from the provider (e.g., GPT-4, Claude)</li>
                  <li><strong>Version:</strong> Pick the model version (e.g., turbo, Opus, 3.5)</li>
                  <li><strong>Model Type:</strong> Confirm or change the auto-selected type based on your use case</li>
                  <li><strong>Description:</strong> Add a brief description of how you plan to use this model</li>
                </ul>
                <p className="mt-2 text-sm text-gray-600">
                  The wizard will pre-populate appropriate values based on your platform and model selection.
                  For custom models, you can enter your own details.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-2">Step 2: Configure Model Parameters</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Max Tokens:</strong> Maximum number of tokens for text generation (e.g., 2048)</li>
                  <li><strong>Temperature:</strong> Controls randomness in generation (0.0-2.0, lower is more deterministic)</li>
                  <li><strong>Model Active:</strong> Toggle to enable or disable the model</li>
                  <li><strong>API Endpoint:</strong> Optional custom API endpoint if not using provider defaults</li>
                  <li><strong>API Key:</strong> Optional API key for authentication</li>
                  <li><strong>Custom Parameters:</strong> Any additional model-specific parameters in JSON format</li>
                </ul>
                <p className="mt-2 text-sm text-gray-600">
                  These parameters configure how the AI model will behave. You can adjust them 
                  based on your specific requirements.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-2">Step 3: Configure Tealium Integration</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Tealium Account:</strong> Your Tealium account name</li>
                  <li><strong>Tealium Profile:</strong> Your Tealium profile name</li>
                  <li><strong>Data Source Key:</strong> The key from your HTTP API data source in Tealium</li>
                  <li><strong>Integration Method:</strong> Choose between Tealium Functions (recommended) or Moments API</li>
                  <li><strong>Visitor Context:</strong> Toggle whether to use visitor context for personalization</li>
                </ul>
                <p className="mt-2 text-sm text-gray-600">
                  These settings connect your AI model configuration to your Tealium account.
                  Make sure your HTTP API data source is active in Tealium.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-2">Step 4: Configure Data Ingestion</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Event Types:</strong> Select which events to ingest (user queries, model responses, errors, etc.)</li>
                  <li><strong>Ingestion Frequency:</strong> Choose real-time, batch, or scheduled ingestion</li>
                  <li><strong>Batch Size:</strong> For batch ingestion, set how many events to send at once</li>
                  <li><strong>Data to Include:</strong> Configure which metadata and contextual information to include</li>
                </ul>
                <p className="mt-2 text-sm text-gray-600">
                  This step lets you control exactly what data gets sent to Tealium and how.
                  You can customize it based on your analytics and monitoring needs.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-2">Step 5: Review and Submit</h3>
                <p>
                  After completing all steps, you'll see a summary of your configuration.
                  Review it to ensure everything is correct, then click "Confirm and Onboard AI Model".
                  If successful, you'll see a confirmation message and the model will be immediately available for use.
                </p>
              </div>
            </div>
          </section>

          {/* Model Deployment Section */}
          <section className="bg-white p-6 rounded-lg shadow-md">
            <ModelDeploymentDoc />
          </section>

          {/* Tealium Integration Section */}
          <section className="bg-white p-6 rounded-lg shadow-md">
            <TealiumIntegrationDoc />
          </section>

          {/* Examples Section */}
          <section className="bg-white p-6 rounded-lg shadow-md" id="examples">
            <h2 className="text-2xl font-semibold mb-4">Configuration Examples</h2>
            
            <div className="space-y-8">
              {/* Example 1 */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-lg font-medium mb-2">Example 1: OpenAI GPT-4 Configuration</h3>
                <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
{`{
  "platform": "openai",
  "model_name": "GPT-4",
  "model_version": "turbo",
  "model_type": "chat",
  "model_description": "OpenAI's most capable and aligned model, designed for chat and text generation",
  "tealium_account": "your-account",
  "tealium_profile": "main",
  "data_source_key": "d365eb60bf2211eeadd3",
  "tealium_integration": "functions",
  "use_visitor_context": true,
  "max_tokens": 4096,
  "temperature": 0.7,
  "is_active": true,
  "api_endpoint": "https://api.openai.com/v1/chat/completions",
  "custom_params": {
    "top_p": 1,
    "frequency_penalty": 0,
    "presence_penalty": 0
  },
  "ingestion_config": {
    "event_types": ["user_query", "model_response", "error"],
    "frequency": "realtime",
    "include_metadata": true,
    "include_user_info": true,
    "include_model_config": true
  }
}`}
                </pre>
              </div>

              {/* Example 2 */}
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="text-lg font-medium mb-2">Example 2: Claude 3 Sonnet Configuration</h3>
                <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
{`{
  "platform": "anthropic",
  "model_name": "Claude",
  "model_version": "3 Sonnet",
  "model_type": "chat",
  "model_description": "Anthropic's balanced model offering high intelligence and speed",
  "tealium_account": "your-account",
  "tealium_profile": "production",
  "data_source_key": "f8b25a20bf2211ee8a4d",
  "tealium_integration": "moments",
  "use_visitor_context": true,
  "max_tokens": 4096,
  "temperature": 0.5,
  "is_active": true,
  "api_endpoint": "https://api.anthropic.com/v1/messages",
  "custom_params": {
    "anthropic_version": "2023-06-01",
    "system_prompt": "You are a helpful AI assistant."
  },
  "ingestion_config": {
    "event_types": ["user_query", "model_response", "feedback"],
    "frequency": "batch",
    "batch_size": 10,
    "include_metadata": true,
    "include_user_info": true,
    "include_model_config": false
  }
}`}
                </pre>
              </div>

              {/* Example 3 */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="text-lg font-medium mb-2">Example 3: Stable Diffusion Image Generation</h3>
                <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
{`{
  "platform": "stability",
  "model_name": "Stable Diffusion",
  "model_version": "XL",
  "model_type": "image-generation",
  "model_description": "High-quality image generation model",
  "tealium_account": "your-account",
  "tealium_profile": "development",
  "data_source_key": "1c94b980bf2311ee9876",
  "tealium_integration": "functions",
  "use_visitor_context": false,
  "max_tokens": 77,
  "temperature": 1.0,
  "is_active": true,
  "api_endpoint": "https://api.stability.ai/v1/generation",
  "custom_params": {
    "width": 1024,
    "height": 1024,
    "steps": 30,
    "cfg_scale": 7
  },
  "ingestion_config": {
    "event_types": ["user_query", "model_response", "usage"],
    "frequency": "realtime",
    "include_metadata": true,
    "include_user_info": false,
    "include_model_config": true
  }
}`}
                </pre>
              </div>
            </div>
          </section>

          {/* Custom Parameters Reference */}
          <section className="bg-white p-6 rounded-lg shadow-md" id="parameters">
            <h2 className="text-2xl font-semibold mb-4">Custom Parameters Reference</h2>
            <p className="mb-4">
              The Custom Parameters field accepts a JSON object with additional model-specific parameters. 
              Here are common parameters for different model types:
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Text Generation Models</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><code>top_p</code>: Controls diversity via nucleus sampling (0.0-1.0)</li>
                  <li><code>frequency_penalty</code>: Reduces repetition by penalizing frequent tokens (-2.0 to 2.0)</li>
                  <li><code>presence_penalty</code>: Reduces repetition by penalizing already used tokens (-2.0 to 2.0)</li>
                  <li><code>stop_sequences</code>: Array of strings where the model will stop generating</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Image Generation Models</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><code>width</code>: Output image width in pixels</li>
                  <li><code>height</code>: Output image height in pixels</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
} 