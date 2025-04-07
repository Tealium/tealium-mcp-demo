'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import ModelDeploymentTester from '@/components/model-deployment-tester';

// Example payload to demonstrate the configuration
const EXAMPLE_CONFIG = {
  platform: "openai",
  model_name: "GPT-4",
  model_version: "turbo",
  model_type: "chat",
  model_description: "OpenAI's GPT-4 Turbo model for chat applications",
  tealium_account: "example-account",
  tealium_profile: "main",
  data_source_key: "example-ds-key-12345",
  max_tokens: 4096,
  temperature: 0.7,
  is_active: true,
  api_endpoint: "https://api.openai.com/v1/chat/completions",
  custom_params: {
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0
  },
  ingestion_config: {
    event_types: ["user_query", "model_response", "error"],
    frequency: "realtime",
    include_metadata: true,
    include_user_info: true,
    include_model_config: true
  }
};

export default function AiModelDebugPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [requestPayload, setRequestPayload] = useState<string>('');
  const [responseData, setResponseData] = useState<string>('');
  const [showResponse, setShowResponse] = useState(false);
  const [activeTab, setActiveTab] = useState('config'); // 'config' or 'deployment'

  // Format the config as MCP payload
  useEffect(() => {
    const mcpPayload = {
      data: {
        event_name: 'ai_model_configuration',
        description: "AI Model onboarding via MCP Configuration UI",
        timestamp: new Date().toISOString(),
        
        // Tealium information
        tealium_account: EXAMPLE_CONFIG.tealium_account,
        tealium_profile: EXAMPLE_CONFIG.tealium_profile,
        tealium_datasource: EXAMPLE_CONFIG.data_source_key,
        source: "Tealium MCP Configuration UI",
        tealium_event: 'ai_model_configuration',
        
        // AI Model specific information
        model_platform: EXAMPLE_CONFIG.platform,
        model_name: EXAMPLE_CONFIG.model_name,
        model_version: EXAMPLE_CONFIG.model_version,
        model_type: EXAMPLE_CONFIG.model_type,
        model_description: EXAMPLE_CONFIG.model_description,
        model_configuration: {
          max_tokens: EXAMPLE_CONFIG.max_tokens,
          temperature: EXAMPLE_CONFIG.temperature,
          is_active: EXAMPLE_CONFIG.is_active,
          api_endpoint: EXAMPLE_CONFIG.api_endpoint,
          ...EXAMPLE_CONFIG.custom_params
        },
        
        // Ingestion configuration
        ingestion_config: EXAMPLE_CONFIG.ingestion_config
      },
      
      // Digital data format for MCP
      digital_data: {
        event: {
          eventName: 'ai_model_configuration',
          eventInfo: {
            description: "AI Model onboarding via MCP Configuration UI",
            timestamp: new Date().toISOString()
          }
        },
        ai_model: {
          platform: EXAMPLE_CONFIG.platform,
          name: EXAMPLE_CONFIG.model_name,
          version: EXAMPLE_CONFIG.model_version,
          type: EXAMPLE_CONFIG.model_type,
          description: EXAMPLE_CONFIG.model_description,
          configuration: {
            max_tokens: EXAMPLE_CONFIG.max_tokens,
            temperature: EXAMPLE_CONFIG.temperature,
            is_active: EXAMPLE_CONFIG.is_active,
            api_endpoint: EXAMPLE_CONFIG.api_endpoint,
            ...EXAMPLE_CONFIG.custom_params
          }
        },
        ingestion: EXAMPLE_CONFIG.ingestion_config,
        context: {
          source: "Tealium MCP Configuration UI",
          tealium_account: EXAMPLE_CONFIG.tealium_account,
          tealium_profile: EXAMPLE_CONFIG.tealium_profile,
          tealium_datasource: EXAMPLE_CONFIG.data_source_key,
        }
      }
    };
    
    // Format the API request payload
    const apiPayload = {
      account: EXAMPLE_CONFIG.tealium_account,
      profile: EXAMPLE_CONFIG.tealium_profile,
      dataSourceKey: EXAMPLE_CONFIG.data_source_key,
      payload: mcpPayload
    };
    
    setRequestPayload(JSON.stringify(apiPayload, null, 2));
  }, []);

  const handleTestSubmit = async () => {
    setIsLoading(true);
    setShowResponse(false);
    
    try {
      // Create the MCP payload
      const mcpPayload = {
        data: {
          event_name: 'ai_model_configuration',
          description: "AI Model onboarding via MCP Configuration UI (DEBUG)",
          timestamp: new Date().toISOString(),
          
          // Tealium information
          tealium_account: EXAMPLE_CONFIG.tealium_account,
          tealium_profile: EXAMPLE_CONFIG.tealium_profile,
          tealium_datasource: EXAMPLE_CONFIG.data_source_key,
          source: "Tealium MCP Configuration UI",
          tealium_event: 'ai_model_configuration',
          
          // AI Model specific information
          model_platform: EXAMPLE_CONFIG.platform,
          model_name: EXAMPLE_CONFIG.model_name,
          model_version: EXAMPLE_CONFIG.model_version,
          model_type: EXAMPLE_CONFIG.model_type,
          model_description: EXAMPLE_CONFIG.model_description,
          model_configuration: {
            max_tokens: EXAMPLE_CONFIG.max_tokens,
            temperature: EXAMPLE_CONFIG.temperature,
            is_active: EXAMPLE_CONFIG.is_active,
            api_endpoint: EXAMPLE_CONFIG.api_endpoint,
            ...EXAMPLE_CONFIG.custom_params
          },
          
          // Ingestion configuration
          ingestion_config: EXAMPLE_CONFIG.ingestion_config,
          
          // Debug flag
          is_debug: true
        },
        
        digital_data: {
          event: {
            eventName: 'ai_model_configuration',
            eventInfo: {
              description: "AI Model onboarding via MCP Configuration UI (DEBUG)",
              timestamp: new Date().toISOString()
            }
          },
          ai_model: {
            platform: EXAMPLE_CONFIG.platform,
            name: EXAMPLE_CONFIG.model_name,
            version: EXAMPLE_CONFIG.model_version,
            type: EXAMPLE_CONFIG.model_type,
            description: EXAMPLE_CONFIG.model_description,
            configuration: {
              max_tokens: EXAMPLE_CONFIG.max_tokens,
              temperature: EXAMPLE_CONFIG.temperature,
              is_active: EXAMPLE_CONFIG.is_active,
              api_endpoint: EXAMPLE_CONFIG.api_endpoint,
              ...EXAMPLE_CONFIG.custom_params
            }
          },
          ingestion: EXAMPLE_CONFIG.ingestion_config,
          context: {
            source: "Tealium MCP Configuration UI (Debug Test)",
            tealium_account: EXAMPLE_CONFIG.tealium_account,
            tealium_profile: EXAMPLE_CONFIG.tealium_profile,
            tealium_datasource: EXAMPLE_CONFIG.data_source_key,
            is_debug: true
          }
        }
      };

      // Use the proxy API endpoint
      const response = await fetch('/api/tealium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account: EXAMPLE_CONFIG.tealium_account,
          profile: EXAMPLE_CONFIG.tealium_profile,
          dataSourceKey: EXAMPLE_CONFIG.data_source_key,
          payload: mcpPayload,
          debug: true // Add debug flag
        }),
      });

      // Get response data
      let responseText;
      try {
        const responseJson = await response.json();
        responseText = JSON.stringify(responseJson, null, 2);
      } catch (e) {
        responseText = await response.text();
      }

      setResponseData(responseText);
      setShowResponse(true);
      
      if (response.ok) {
        toast.success("Debug request successful!");
      } else {
        toast.error(`Error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error("Debug test error:", error);
      setResponseData(`Error: ${error instanceof Error ? error.message : String(error)}`);
      setShowResponse(true);
      toast.error("Failed to send debug request");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">AI Model Debug & Test Tools</h1>

      <div className="flex justify-center mb-6">
        <div className="bg-gray-100 rounded-lg p-1 inline-flex">
          <button
            className={`px-4 py-2 rounded-md ${activeTab === 'config' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
            onClick={() => setActiveTab('config')}
          >
            Configuration Test
          </button>
          <button
            className={`px-4 py-2 rounded-md ${activeTab === 'deployment' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
            onClick={() => setActiveTab('deployment')}
          >
            Deployment & Query Test
          </button>
        </div>
      </div>
      
      {activeTab === 'config' && (
        <div className="max-w-5xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Test Configuration API</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-4">
                <p className="text-sm text-gray-700">
                  This tool tests the Tealium MCP Configuration API. It sends an example AI model configuration payload to your Tealium account.
                </p>
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> This uses example data and will not affect your actual model configuration.
                    Make sure your Tealium account, profile, and data source key are correctly set up.
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Example Payload:</h3>
                <div className="bg-gray-50 p-4 rounded-md overflow-auto max-h-96">
                  <pre className="text-sm">{requestPayload}</pre>
                </div>
              </div>
              
              <div className="mt-6">
                <Button 
                  onClick={handleTestSubmit} 
                  disabled={isLoading}
                  className="mr-4"
                >
                  {isLoading ? 'Testing...' : 'Test Configuration API'}
                </Button>
                
                {showResponse && (
                  <Button 
                    variant="outline" 
                    onClick={() => setShowResponse(false)}
                  >
                    Hide Response
                  </Button>
                )}
              </div>
              
              {showResponse && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">API Response:</h3>
                  <div className="bg-gray-50 p-4 rounded-md overflow-auto max-h-96">
                    <pre className="text-sm">
                      {responseData}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="flex justify-between items-center mt-8">
            <Link
              href="/ai-model-config"
              className="text-purple-600 hover:text-purple-800 font-medium"
            >
              ← Back to Model Configuration
            </Link>
            
            <Link
              href="/ai-model-documentation"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View Documentation →
            </Link>
          </div>
        </div>
      )}
      
      {activeTab === 'deployment' && (
        <div className="max-w-5xl mx-auto">
          <ModelDeploymentTester />
          
          <div className="flex justify-between items-center mt-8">
            <Link
              href="/ai-model-config"
              className="text-purple-600 hover:text-purple-800 font-medium"
            >
              ← Back to Model Configuration
            </Link>
            
            <Link
              href="/ai-model-documentation"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View Documentation →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 