'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { sendModelDeployment, sendModelQuery, sendModelResponse, TealiumConfig } from '@/lib/tealium-service';
import { TEALIUM_ACCOUNT, TEALIUM_PROFILE, TEALIUM_DATASOURCE_KEY, TEALIUM_ENGINE_ID } from '@/lib/config';

export default function ModelDeploymentTester() {
  // Tealium configuration
  const [tealiumAccount, setTealiumAccount] = useState(TEALIUM_ACCOUNT || '');
  const [tealiumProfile, setTealiumProfile] = useState(TEALIUM_PROFILE || '');
  const [dataSourceKey, setDataSourceKey] = useState(TEALIUM_DATASOURCE_KEY || '');
  const [engineId, setEngineId] = useState(TEALIUM_ENGINE_ID || '');
  const [tealiumIntegration, setTealiumIntegration] = useState<'eventstream' | 'moments'>('moments');
  const [useVisitorContext, setUseVisitorContext] = useState(true);
  
  // Model configuration
  const [modelPlatform, setModelPlatform] = useState('openai');
  const [modelName, setModelName] = useState('GPT-4');
  const [modelVersion, setModelVersion] = useState('turbo');
  const [modelType, setModelType] = useState('chat');
  
  // Query/Response test
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [queryId, setQueryId] = useState('');
  const [visitorId, setVisitorId] = useState(`visitor-${Date.now()}`);
  const [visitorContext, setVisitorContext] = useState<any>(null);
  
  // Status indicators
  const [isDeploying, setIsDeploying] = useState(false);
  const [isQuerying, setIsQuerying] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<any>(null);
  const [queryResult, setQueryResult] = useState<any>(null);
  const [responseResult, setResponseResult] = useState<any>(null);

  // Create model configuration object from state
  const getModelConfig = () => {
    return {
      platform: modelPlatform,
      model_name: modelName,
      model_version: modelVersion,
      model_type: modelType,
      model_description: `${modelName} ${modelVersion} for ${modelType}`,
      parameters: {
        max_tokens: 2048,
        temperature: 0.7
      },
      custom_params: {
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      },
      environment: 'testing'
    };
  };

  // Get Tealium configuration object from state
  const getTealiumConfig = (): TealiumConfig => {
    return {
      account: tealiumAccount,
      profile: tealiumProfile,
      dataSourceKey,
      integration: tealiumIntegration,
      useVisitorContext,
      engineId
    };
  };

  // Handle model deployment
  const handleDeployModel = async () => {
    if (!tealiumAccount || !tealiumProfile || !dataSourceKey || (tealiumIntegration === 'moments' && !engineId)) {
      toast.error('Please enter all required Tealium configuration fields');
      return;
    }

    setIsDeploying(true);
    setDeploymentResult(null);
    
    try {
      const modelConfig = getModelConfig();
      const tealiumConfig = getTealiumConfig();
      
      const result = await sendModelDeployment(modelConfig, tealiumConfig);
      
      setDeploymentResult(result);
      toast.success('Model deployed and event sent to Tealium');
    } catch (error) {
      console.error('Error deploying model:', error);
      toast.error('Failed to deploy model: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsDeploying(false);
    }
  };

  // Handle sending model query
  const handleSendQuery = async () => {
    if (!query) {
      toast.error('Please enter a query');
      return;
    }
    if (!tealiumAccount || !tealiumProfile || !dataSourceKey || (tealiumIntegration === 'moments' && !engineId)) {
      toast.error('Please enter all required Tealium configuration fields');
      return;
    }

    setIsQuerying(true);
    setQueryResult(null);
    setVisitorContext(null);
    
    try {
      const modelConfig = getModelConfig();
      const tealiumConfig = getTealiumConfig();
      
      const queryData = {
        query,
        user_id: 'test-user-' + Date.now(),
        visitor_id: visitorId,
        session_id: 'test-session-' + Date.now()
      };
      
      const result = await sendModelQuery(queryData, modelConfig, tealiumConfig);
      
      setQueryId(result.query_id);
      setQueryResult(result);
      
      // If we got visitor context back (from Moments API)
      if (result.visitor_context) {
        setVisitorContext(result.visitor_context);
        toast.success('Query sent to Tealium and visitor context received');
      } else {
        toast.success('Query sent to Tealium');
      }
    } catch (error) {
      console.error('Error sending query:', error);
      toast.error('Failed to send query: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsQuerying(false);
    }
  };

  // Handle sending model response
  const handleSendResponse = async () => {
    if (!response) {
      toast.error('Please enter a response');
      return;
    }
    if (!queryId) {
      toast.error('Please send a query first');
      return;
    }
    if (!tealiumAccount || !tealiumProfile || !dataSourceKey || (tealiumIntegration === 'moments' && !engineId)) {
      toast.error('Please enter all required Tealium configuration fields');
      return;
    }

    setIsResponding(true);
    setResponseResult(null);
    
    try {
      const modelConfig = getModelConfig();
      const tealiumConfig = getTealiumConfig();
      
      const responseData = {
        query_id: queryId,
        response,
        visitor_id: visitorId,
        latency: Math.floor(Math.random() * 2000), // Simulated latency
        tokens_used: Math.floor(Math.random() * 1000), // Simulated token usage
        context_used: visitorContext // Include the context that was used (if any)
      };
      
      const result = await sendModelResponse(responseData, modelConfig, tealiumConfig);
      
      setResponseResult(result);
      toast.success('Response sent to Tealium');
    } catch (error) {
      console.error('Error sending response:', error);
      toast.error('Failed to send response: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsResponding(false);
    }
  };

  // Email input and visitor data fetching
  const [emailInput, setEmailInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [momentsApiKey, setMomentsApiKey] = useState('');
  const [visitorData, setVisitorData] = useState(null);
  
  // Fetch visitor data based on email
  const fetchVisitorData = async () => {
    if (!tealiumAccount || !tealiumProfile || !emailInput || (tealiumIntegration === 'moments' && !engineId)) {
      toast.error('Please enter all required fields');
      return;
    }

    setIsLoading(true);
    try {
      // Construct URL with all configuration parameters
      let url = `/api/tealium/moments/direct-test?email=${encodeURIComponent(emailInput)}`;
      
      // Add all Tealium configuration params
      url += `&account=${encodeURIComponent(tealiumAccount)}`;
      url += `&profile=${encodeURIComponent(tealiumProfile)}`;
      url += `&dataSourceKey=${encodeURIComponent(dataSourceKey)}`;
      url += `&integration=${encodeURIComponent(tealiumIntegration)}`;
      url += `&useVisitorContext=${encodeURIComponent(useVisitorContext)}`;
      
      // Add engine ID for Moments API
      if (engineId) {
        url += `&engineId=${encodeURIComponent(engineId)}`;
      }
      
      // Add API key if available
      if (momentsApiKey) {
        url += `&apiKey=${encodeURIComponent(momentsApiKey)}`;
      }

      console.log('Fetching visitor data with full configuration');
      const response = await fetch(url);
      const data = await response.json();
      setVisitorData(data);
    } catch (error) {
      console.error('Error fetching visitor data:', error);
      toast.error('Failed to fetch visitor data: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Model Deployment & Tealium Integration Tester</CardTitle>
          <CardDescription>
            Configure and test model deployments with Tealium integration using either Functions or Moments API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tealium Integration Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Tealium Integration Method</h3>
            <div className="flex flex-col space-y-2">
              <div 
                className={`flex items-center space-x-3 p-3 rounded-md border ${tealiumIntegration === 'eventstream' ? 'border-green-200 bg-green-50' : ''}`}
                onClick={() => setTealiumIntegration('eventstream')}
                style={{ cursor: 'pointer' }}
              >
                <div className={`h-4 w-4 rounded-full border ${tealiumIntegration === 'eventstream' ? 'bg-green-600 border-green-600' : 'border-gray-300'}`} />
                <div className="grid gap-1.5">
                  <Label className="font-medium">
                    Tealium EventStream <span className="ml-2 text-xs bg-green-600 text-white px-2 py-0.5 rounded">Recommended</span>
                  </Label>
                  <p className="text-sm text-gray-600">
                    Uses Tealium's EventStream for processing queries and retrieving visitor context
                  </p>
                </div>
              </div>
              
              <div 
                className={`flex items-center space-x-3 p-3 rounded-md border ${tealiumIntegration === 'moments' ? 'border-blue-200 bg-blue-50' : ''}`}
                onClick={() => setTealiumIntegration('moments')}
                style={{ cursor: 'pointer' }}
              >
                <div className={`h-4 w-4 rounded-full border ${tealiumIntegration === 'moments' ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`} />
                <div className="grid gap-1.5">
                  <Label className="font-medium">Tealium Moments API</Label>
                  <p className="text-sm text-gray-600">
                    Uses Tealium's Moments API for real-time interaction based on behavior patterns
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 mt-4">
              <Switch
                id="visitor-context"
                checked={useVisitorContext}
                onCheckedChange={setUseVisitorContext}
              />
              <Label htmlFor="visitor-context">Use visitor context for model personalization</Label>
            </div>
          </div>

          {/* Tealium Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Tealium Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="tealium-account">Tealium Account</Label>
                <Input
                  id="tealium-account"
                  value={tealiumAccount}
                  onChange={(e) => setTealiumAccount(e.target.value)}
                  placeholder="your_tealium_account"
                />
              </div>
              <div>
                <Label htmlFor="tealium-profile">Tealium Profile</Label>
                <Input
                  id="tealium-profile"
                  value={tealiumProfile}
                  onChange={(e) => setTealiumProfile(e.target.value)}
                  placeholder="your_tealium_profile"
                />
              </div>
              <div>
                <Label htmlFor="data-source-key">Data Source Key</Label>
                <Input
                  id="data-source-key"
                  value={dataSourceKey}
                  onChange={(e) => setDataSourceKey(e.target.value)}
                  placeholder="your_datasource_key"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="engine-id">Engine ID</Label>
              <Input
                id="engine-id"
                value={engineId}
                onChange={(e) => setEngineId(e.target.value)}
                placeholder="your_tealium_engine_id"
              />
              <p className="text-xs text-gray-500 mt-1">Required for Moments API integration</p>
            </div>
            
            {tealiumIntegration === 'moments' && (
              <div>
                <Label htmlFor="moments-api-key">Moments API Key</Label>
                <Input
                  id="moments-api-key"
                  value={momentsApiKey}
                  onChange={(e) => setMomentsApiKey(e.target.value)}
                  placeholder="your_moments_api_key"
                  type="password"
                />
                <p className="text-xs text-gray-500 mt-1">Required for authenticated Moments API requests</p>
              </div>
            )}
            
            <div>
              <Label htmlFor="visitor-id">Visitor ID</Label>
              <Input
                id="visitor-id"
                value={visitorId}
                onChange={(e) => setVisitorId(e.target.value)}
                placeholder="visitor-123"
              />
              <p className="text-xs text-gray-500 mt-1">Unique identifier for the visitor (required for Moments API)</p>
            </div>
          </div>

          {/* Model Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Model Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="model-platform">Platform</Label>
                <Input
                  id="model-platform"
                  value={modelPlatform}
                  onChange={(e) => setModelPlatform(e.target.value)}
                  placeholder="openai"
                />
              </div>
              <div>
                <Label htmlFor="model-name">Model Name</Label>
                <Input
                  id="model-name"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder="GPT-4"
                />
              </div>
              <div>
                <Label htmlFor="model-version">Version</Label>
                <Input
                  id="model-version"
                  value={modelVersion}
                  onChange={(e) => setModelVersion(e.target.value)}
                  placeholder="turbo"
                />
              </div>
              <div>
                <Label htmlFor="model-type">Type</Label>
                <Input
                  id="model-type"
                  value={modelType}
                  onChange={(e) => setModelType(e.target.value)}
                  placeholder="chat"
                />
              </div>
            </div>
          </div>

          {/* Deploy Button */}
          <div className="pt-2">
            <Button 
              onClick={handleDeployModel} 
              disabled={isDeploying}
              className="w-full md:w-auto"
            >
              {isDeploying ? 'Deploying...' : 'Deploy Model & Send to Tealium'}
            </Button>
            
            {deploymentResult && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <h4 className="font-medium mb-2">Deployment Result:</h4>
                <pre className="text-xs overflow-auto p-2 bg-gray-100 rounded">
                  {JSON.stringify(deploymentResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Query & Response</CardTitle>
          <CardDescription>
            Send test queries and responses to Tealium with {tealiumIntegration === 'eventstream' ? 'EventStream' : 'Moments API'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Query */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="query">User Query</Label>
              <Textarea
                id="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What is the weather like today?"
                rows={3}
              />
            </div>
            <Button 
              onClick={handleSendQuery} 
              disabled={isQuerying}
              className="w-full md:w-auto"
            >
              {isQuerying ? 'Sending Query...' : 'Send Query to Tealium'}
            </Button>
            
            {queryResult && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <h4 className="font-medium mb-2">Query Result:</h4>
                <div className="mb-2">
                  <span className="font-medium">Query ID: </span>
                  <code className="bg-gray-100 px-1 rounded">{queryId}</code>
                </div>
                <pre className="text-xs overflow-auto p-2 bg-gray-100 rounded">
                  {JSON.stringify(queryResult, null, 2)}
                </pre>
              </div>
            )}
            
            {/* Display visitor context if available (from Moments API) */}
            {visitorContext && (
              <div className="mt-4 p-4 bg-blue-50 rounded-md">
                <h4 className="font-medium mb-2 text-blue-800">Visitor Context from Tealium:</h4>
                <p className="text-sm text-blue-700 mb-2">
                  The following context was retrieved for this visitor and can be used to personalize the model response:
                </p>
                <pre className="text-xs overflow-auto p-2 bg-blue-100 rounded">
                  {JSON.stringify(visitorContext, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Response */}
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="response">Model Response</Label>
              <Textarea
                id="response"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="It's sunny with a high of 75°F."
                rows={3}
              />
              {visitorContext && (
                <p className="text-xs text-green-600 mt-1">
                  Your response can be personalized based on the visitor context above
                </p>
              )}
            </div>
            <Button 
              onClick={handleSendResponse} 
              disabled={isResponding || !queryId}
              className="w-full md:w-auto"
            >
              {isResponding ? 'Sending Response...' : 'Send Response to Tealium'}
            </Button>
            
            {responseResult && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <h4 className="font-medium mb-2">Response Result:</h4>
                <pre className="text-xs overflow-auto p-2 bg-gray-100 rounded">
                  {JSON.stringify(responseResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fetch Visitor Data</CardTitle>
          <CardDescription>
            Fetch visitor data from Tealium using the provided email address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="email-input">Email Address</Label>
              <Input
                id="email-input"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            <Button 
              onClick={fetchVisitorData} 
              disabled={isLoading}
              className="w-full md:w-auto"
            >
              {isLoading ? 'Fetching...' : 'Fetch Visitor Data'}
            </Button>
            
            {visitorData && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <h4 className="font-medium mb-2">Visitor Data:</h4>
                <pre className="text-xs overflow-auto p-2 bg-gray-100 rounded">
                  {JSON.stringify(visitorData, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 