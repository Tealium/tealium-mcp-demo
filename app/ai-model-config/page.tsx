import React from 'react';
import Link from 'next/link';
import AiModelConfigForm from '@/components/ai-model-config-form';

export default function AiModelConfigPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">AI Model Configuration UI</h1>
      
      <div className="flex justify-center mb-4">
        <Link
          href="/ai-model-documentation"
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
        >
          <span>View Detailed Documentation</span>
        </Link>
      </div>
      
      <div className="max-w-3xl mx-auto mb-8 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">Multi-Step AI Model Onboarding</h2>
        <p className="mb-2 text-blue-700">
          Follow the step-by-step wizard to configure and onboard your AI model with Tealium:
        </p>
        <ol className="list-decimal list-inside space-y-2 text-blue-700 ml-4">
          <li><strong>Select AI Platform and Model</strong> - Choose your AI provider and model</li>
          <li><strong>Configure Model Parameters</strong> - Set up model-specific settings</li>
          <li><strong>Configure Tealium Integration</strong> - Connect with your Tealium account</li>
          <li><strong>Configure Data Ingestion</strong> - Customize what data to send and how</li>
        </ol>
        <div className="mt-3 text-sm text-blue-800">
          <strong>Before you start:</strong> Make sure you have created an HTTP API data source in your Tealium profile
          and have your data source key ready.
        </div>
      </div>

      <AiModelConfigForm />
      
      <div className="mt-8 max-w-3xl mx-auto text-sm text-gray-600 space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Key Benefits</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Quickly onboard any AI model from popular providers or custom solutions</li>
            <li>Flexible configuration with provider-specific presets and custom parameters</li>
            <li>Control exactly what data gets ingested and when</li>
            <li>Real-time configuration through Tealium's EventStream</li>
            <li>Standardized Modern Context Protocol (MCP) format for consistency</li>
          </ul>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Supported AI Platforms</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
            <div className="flex flex-col items-center">
              <span className="font-medium">OpenAI</span>
              <span className="text-xs text-gray-500">GPT-3.5, GPT-4</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-medium">Anthropic</span>
              <span className="text-xs text-gray-500">Claude models</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-medium">Google</span>
              <span className="text-xs text-gray-500">Gemini, PaLM</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-medium">Meta AI</span>
              <span className="text-xs text-gray-500">Llama models</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-medium">Stability AI</span>
              <span className="text-xs text-gray-500">Stable Diffusion</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-medium">Custom</span>
              <span className="text-xs text-gray-500">Any other model</span>
            </div>
          </div>
        </div>

        <p className="text-xs mt-2 text-gray-500">
          This app uses the Modern Context Protocol (MCP) to configure AI models through Tealium.
          Configuration changes take effect in real-time without requiring code changes.
        </p>
      </div>
      
      <div className="mt-6 text-center">
        <Link
          href="/ai-model-documentation"
          className="text-purple-600 hover:text-purple-800 font-medium mr-4"
        >
          Need help? View the detailed documentation →
        </Link>
        <Link
          href="/ai-model-debug"
          className="text-green-600 hover:text-green-800 font-medium"
        >
          Debug & Test Configuration →
        </Link>
      </div>
    </div>
  );
} 