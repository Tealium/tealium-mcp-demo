'use client';

import React, { useState, useEffect } from 'react';
import { 
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Wizard,
  WizardStep,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui';
import { toast } from 'sonner';
import { ChevronDown, ChevronUp } from "lucide-react";
import { TEALIUM_ACCOUNT, TEALIUM_PROFILE, TEALIUM_DATASOURCE_KEY, MCP_CONFIG } from '@/lib/config';

// Define types for our model data
type ModelVersion = string;
type ParameterField = {
  name: string;
  label: string;
  type: 'text' | 'number' | 'switch' | 'select' | 'textarea';
  defaultValue: string | number | boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string; label: string }[];
  description: string;
  required?: boolean;
};

type ModelName = { 
  name: string; 
  versions: ModelVersion[];
  compatibleTypes: string[];
  parameters?: {
    common: ParameterField[];
    advanced: ParameterField[];
  };
  customParameterHints?: {
    examples: {
      basic: string;
      advanced?: string;
    };
    description: string;
  };
};
type ModelPlatform = { [key: string]: ModelName[] };
type ModelType = { value: string; label: string };

interface AiModelConfigFormProps {
  onSubmitSuccess?: () => void;
}

const AiModelConfigForm: React.FC<AiModelConfigFormProps> = ({ onSubmitSuccess }) => {
  // State for storing fetched data
  const [availableModelPlatforms, setAvailableModelPlatforms] = useState<ModelPlatform>({});
  const [modelTypes, setModelTypes] = useState<ModelType[]>([]);
  const [filteredModelTypes, setFilteredModelTypes] = useState<ModelType[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  // Platform & model selection
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [availableModels, setAvailableModels] = useState<ModelName[]>([]);
  const [selectedModelName, setSelectedModelName] = useState<string>('');
  const [availableVersions, setAvailableVersions] = useState<string[]>([]);
  
  // Dynamic parameter handling
  const [commonParameters, setCommonParameters] = useState<ParameterField[]>([]);
  const [advancedParameters, setAdvancedParameters] = useState<ParameterField[]>([]);
  const [parameterValues, setParameterValues] = useState<Record<string, any>>({});
  
  // Custom parameter hints
  const [currentParameterHints, setCurrentParameterHints] = useState<{
    examples: {
      basic: string;
      advanced?: string;
    };
    description: string;
  } | null>(null);
  
  // Basic model info
  const [modelName, setModelName] = useState('');
  const [modelVersion, setModelVersion] = useState('');
  const [modelType, setModelType] = useState('');
  const [modelDescription, setModelDescription] = useState('');
  
  // Tealium integration info
  const [tealiumAccount, setTealiumAccount] = useState('');
  const [tealiumProfile, setTealiumProfile] = useState('');
  const [tealiumSourceKey, setTealiumSourceKey] = useState('');
  
  // Model configuration
  const [maxTokens, setMaxTokens] = useState('2048');
  const [temperature, setTemperature] = useState('0.7');
  const [isActive, setIsActive] = useState(true);
  
  // Additional configuration
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [customParams, setCustomParams] = useState('{}');
  const [stopSequences, setStopSequences] = useState('[]');
  const [embeddingDimensions, setEmbeddingDimensions] = useState('1536');
  
  // Ingestion configuration
  const [eventTypes, setEventTypes] = useState<string[]>(['user_query', 'model_response']);
  const [ingestionFrequency, setIngestionFrequency] = useState('realtime');
  const [batchSize, setBatchSize] = useState('1');
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [includeUserInfo, setIncludeUserInfo] = useState(true);
  const [includeModelConfig, setIncludeModelConfig] = useState(true);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const [configCompleted, setConfigCompleted] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Fetch model data from API when component mounts
  useEffect(() => {
    // Set default values on component mount
    setTealiumAccount(TEALIUM_ACCOUNT || '');
    setTealiumProfile(TEALIUM_PROFILE || '');
    setTealiumSourceKey(TEALIUM_DATASOURCE_KEY || '');
    
    // Load model configurations...
    const fetchModelData = async () => {
      try {
        setIsDataLoading(true);
        const response = await fetch('/api/models');
        
        if (!response.ok) {
          throw new Error('Failed to fetch model data');
        }
        
        const data = await response.json();
        setAvailableModelPlatforms(data.models);
        setModelTypes(data.modelTypes);
        setFilteredModelTypes(data.modelTypes); // Initially show all
        
        // Set default model type if available
        if (data.modelTypes && data.modelTypes.length > 0) {
          setModelType(data.modelTypes[0].value);
        }
        
        setIsDataLoading(false);
      } catch (error) {
        console.error('Error fetching model data:', error);
        toast.error('Failed to load model data. Please refresh the page.');
        setIsDataLoading(false);
      }
    };
    
    fetchModelData();
  }, []);

  // Update available models when platform changes
  useEffect(() => {
    if (selectedPlatform && availableModelPlatforms[selectedPlatform]) {
      setAvailableModels(availableModelPlatforms[selectedPlatform]);
      setSelectedModelName('');
      setModelVersion('');
      // Reset to all model types when platform changes
      setFilteredModelTypes(modelTypes);
    } else {
      setAvailableModels([]);
    }
  }, [selectedPlatform, availableModelPlatforms, modelTypes]);

  // Update available versions and parameter hints when model changes
  useEffect(() => {
    if (selectedModelName) {
      const model = availableModels.find(m => m.name === selectedModelName);
      if (model) {
        setAvailableVersions(model.versions);
        setModelVersion('');

        // Set parameter hints based on selected model
        if (model.customParameterHints) {
          setCurrentParameterHints(model.customParameterHints);
          
          // Initialize customParams with a valid empty object to prevent parsing errors
          if (!customParams || customParams.trim() === '') {
            setCustomParams('{}');
          }
        } else {
          setCurrentParameterHints(null);
        }
        
        // Set dynamic parameters based on the selected model
        if (model.parameters) {
          setCommonParameters(model.parameters.common);
          setAdvancedParameters(model.parameters.advanced);
          
          // Initialize parameter values with defaults
          const initialValues: Record<string, any> = {};
          
          // Set default values for common parameters
          model.parameters.common.forEach(param => {
            initialValues[param.name] = param.defaultValue;
          });
          
          // Set default values for advanced parameters
          model.parameters.advanced.forEach(param => {
            initialValues[param.name] = param.defaultValue;
          });
          
          setParameterValues(initialValues);
          
          // Update maxTokens and temperature from dynamic parameters
          const maxTokensParam = model.parameters.common.find(p => 
            p.name === 'max_tokens' || p.name === 'max_output_tokens' || p.name === 'max_gen_len'
          );
          
          if (maxTokensParam) {
            setMaxTokens(String(maxTokensParam.defaultValue));
          }
          
          const temperatureParam = model.parameters.common.find(p => p.name === 'temperature');
          if (temperatureParam) {
            setTemperature(String(temperatureParam.defaultValue));
          }
        }

        // Filter model types based on compatibility
        if (model.compatibleTypes && model.compatibleTypes.length > 0) {
          const compatibleModelTypes = modelTypes.filter(type => 
            model.compatibleTypes.includes(type.value)
          );
          setFilteredModelTypes(compatibleModelTypes);
          
          // Set default model type to first compatible one if current selection is not compatible
          if (compatibleModelTypes.length > 0) {
            if (!model.compatibleTypes.includes(modelType)) {
              setModelType(compatibleModelTypes[0].value);
            }
          }
        } else {
          // If no compatible types specified, show all
          setFilteredModelTypes(modelTypes);
        }
      }
    } else {
      setAvailableVersions([]);
      setCurrentParameterHints(null);
      setCommonParameters([]);
      setAdvancedParameters([]);
      setParameterValues({});
    }
  }, [selectedModelName, availableModels, modelTypes, modelType, customParams]);

  // Set default model type based on model name
  useEffect(() => {
    if (selectedModelName) {
      if (selectedModelName.includes('Stable Diffusion') || selectedModelName.includes('DALL-E')) {
        setModelType('image-generation');
      } else if (selectedModelName.includes('Embedding')) {
        setModelType('embeddings');
      } else if (selectedModelName.includes('Claude') || selectedModelName.includes('GPT')) {
        setModelType('chat');
      }
      
      // Update the model name display
      setModelName(selectedModelName);
    }
  }, [selectedModelName]);

  // Update model version when selected
  useEffect(() => {
    if (modelVersion) {
      // Update the model version display
      setModelVersion(modelVersion);
    }
  }, [modelVersion]);

  const handleWizardComplete = () => {
    setConfigCompleted(true);
  };

  // Dynamic Parameter Component to render different parameter types
  const DynamicParameter: React.FC<{
    parameter: ParameterField;
    value: any;
    onChange: (name: string, value: any) => void;
  }> = ({ parameter, value, onChange }) => {
    switch (parameter.type) {
      case 'number':
        return (
          <div>
            <Label htmlFor={parameter.name}>{parameter.label}</Label>
            <Input
              type="number"
              id={parameter.name}
              placeholder={parameter.placeholder || String(parameter.defaultValue)}
              value={value}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                onChange(parameter.name, e.target.valueAsNumber || parameter.defaultValue)
              }
              min={parameter.min}
              max={parameter.max}
              step={parameter.step}
              className="mt-1"
              required={parameter.required}
            />
            <p className="text-xs text-gray-500 mt-1">{parameter.description}</p>
          </div>
        );
      
      case 'text':
        return (
          <div>
            <Label htmlFor={parameter.name}>{parameter.label}</Label>
            <Input
              type="text"
              id={parameter.name}
              placeholder={parameter.placeholder || String(parameter.defaultValue)}
              value={value}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                onChange(parameter.name, e.target.value)
              }
              className="mt-1"
              required={parameter.required}
            />
            <p className="text-xs text-gray-500 mt-1">{parameter.description}</p>
          </div>
        );
      
      case 'textarea':
        return (
          <div>
            <Label htmlFor={parameter.name}>{parameter.label}</Label>
            <Textarea
              id={parameter.name}
              placeholder={parameter.placeholder || String(parameter.defaultValue)}
              value={value}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                onChange(parameter.name, e.target.value)
              }
              className="mt-1 resize-none"
              rows={3}
              required={parameter.required}
            />
            <p className="text-xs text-gray-500 mt-1">{parameter.description}</p>
          </div>
        );
      
      case 'select':
        return (
          <div>
            <Label htmlFor={parameter.name}>{parameter.label}</Label>
            <Select
              value={String(value)}
              onValueChange={(val: string) => onChange(parameter.name, val)}
            >
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder={`Select ${parameter.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {parameter.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">{parameter.description}</p>
          </div>
        );
      
      case 'switch':
        return (
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor={parameter.name}>{parameter.label}</Label>
              <Switch
                id={parameter.name}
                checked={!!value}
                onCheckedChange={(checked: boolean) => onChange(parameter.name, checked)}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{parameter.description}</p>
          </div>
        );
      
      default:
        return <div>Unknown parameter type: {parameter.type}</div>;
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setDebugInfo('');
    
    try {
      // Input validation
      if (!modelName.trim() || !modelVersion.trim()) {
        setIsLoading(false);
        toast.error('Please enter both Model Name and Version');
        return;
      }

      if (!tealiumAccount.trim() || !tealiumProfile.trim() || !tealiumSourceKey.trim()) {
        setIsLoading(false);
        toast.error('Tealium Account, Profile, and Data Source Key are required');
        return;
      }

      // Parse custom parameters from JSON if present
      let parsedCustomParams: Record<string, any> = {};
      if (customParams && customParams.trim() !== '{}' && customParams.trim() !== '') {
        try {
          parsedCustomParams = JSON.parse(customParams);
        } catch (e) {
          toast.error('Invalid JSON in custom parameters');
          setDebugInfo(`Custom parameters parse error: ${e instanceof Error ? e.message : String(e)}`);
          setIsLoading(false);
          return;
        }
      }

      // Create model configuration object
      const modelConfig: Record<string, any> = {
        // Standard fields that are always present
        is_active: isActive,
        api_endpoint: apiEndpoint || undefined,
        api_key: apiKey || undefined,
        max_tokens: parseInt(maxTokens, 10),
        temperature: parseFloat(temperature)
      };

      // Add all parameter values from dynamic parameters
      Object.entries(parameterValues).forEach(([key, value]) => {
        // Only add non-empty values and don't duplicate max_tokens/temperature
        if (value !== undefined && value !== null && value !== '' && 
            key !== 'max_tokens' && key !== 'temperature') {
          modelConfig[key] = value;
        }
      });

      // Add any custom parameters
      Object.entries(parsedCustomParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          modelConfig[key] = value;
        }
      });

      // Parse stop sequences if provided for text generation models
      if ((modelType === 'text-generation' || modelType === 'chat') && stopSequences.trim() !== '[]') {
        try {
          const stopSeqArray = JSON.parse(stopSequences);
          if (Array.isArray(stopSeqArray)) {
            modelConfig.stop = stopSeqArray;
          }
        } catch (e) {
          toast.error('Invalid JSON in stop sequences');
          setDebugInfo(`Stop sequences parse error: ${e instanceof Error ? e.message : String(e)}`);
          setIsLoading(false);
          return;
        }
      }
      
      // Add embedding dimensions for embedding models
      if (modelType === 'embeddings' && embeddingDimensions) {
        modelConfig.dimensions = parseInt(embeddingDimensions, 10);
      }

      // Create the AI model configuration payload with MCP format
      const mcpPayload = {
        data: {
          event_name: 'ai_model_configuration',
          description: "AI Model onboarding via MCP Configuration UI",
          timestamp: new Date().toISOString(),
          
          // Tealium information
          tealium_account: tealiumAccount,
          tealium_profile: tealiumProfile,
          tealium_datasource: tealiumSourceKey,
          source: "Tealium MCP Configuration UI",
          tealium_event: 'ai_model_configuration',
          
          // AI Model specific information
          model_platform: selectedPlatform,
          model_name: modelName,
          model_version: modelVersion,
          model_type: modelType,
          model_description: modelDescription,
          model_configuration: modelConfig,
          
          // Ingestion configuration
          ingestion_config: {
            event_types: eventTypes,
            frequency: ingestionFrequency,
            batch_size: parseInt(batchSize, 10),
            include_metadata: includeMetadata,
            include_user_info: includeUserInfo,
            include_model_config: includeModelConfig
          }
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
            platform: selectedPlatform,
            name: modelName,
            version: modelVersion,
            type: modelType,
            description: modelDescription,
            configuration: modelConfig
          },
          ingestion: {
            event_types: eventTypes,
            frequency: ingestionFrequency,
            batch_size: parseInt(batchSize, 10),
            include_metadata: includeMetadata,
            include_user_info: includeUserInfo,
            include_model_config: includeModelConfig
          },
          context: {
            source: "Tealium MCP Configuration UI",
            tealium_account: tealiumAccount,
            tealium_profile: tealiumProfile,
            tealium_datasource: tealiumSourceKey,
          }
        }
      };

      // Use the proxy API endpoint to avoid CORS issues
      const response = await fetch('/api/tealium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account: tealiumAccount,
          profile: tealiumProfile,
          dataSourceKey: tealiumSourceKey,
          payload: mcpPayload
        }),
      });

      // Handle response
      if (!response.ok) {
        setIsLoading(false);
        
        let errorDetails = `Status: ${response.status} (${response.statusText || 'No status text'})`;
        try {
          const responseData = await response.json();
          errorDetails += `\nDetails: ${JSON.stringify(responseData, null, 2)}`;
        } catch (parseError) {
          try {
            const textResponse = await response.text();
            errorDetails += `\nResponse: ${textResponse.substring(0, 200)}${textResponse.length > 200 ? '...' : ''}`;
          } catch {
            errorDetails += "\nCould not read response body";
          }
        }
        
        setDebugInfo(errorDetails);
        toast.error(`Error onboarding AI model: ${response.status} ${response.statusText || 'Unknown error'}`);
        return;
      }

      // Process successful response
      setIsLoading(false);
      
      let responseData;
      try {
        responseData = await response.json();
        setDebugInfo(`Success! Response: ${JSON.stringify(responseData, null, 2)}`);
      } catch (parseError) {
        try {
          const textResponse = await response.text();
          setDebugInfo(`Success! Response: ${textResponse}`);
        } catch {
          setDebugInfo('Success! (No response body)');
        }
      }
      
      toast.success("AI Model configured and onboarded successfully!");
      
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error: any) {
      setIsLoading(false);
      console.error("Request error:", error);
      
      const errorMessage = error.message || 'Unknown error';
      setDebugInfo(`Error details: ${error.stack || error.message || String(error)}`);
      toast.error(`Error: ${errorMessage}`);
    }
  };

  // Handle parameter value changes
  const handleParameterChange = (paramName: string, value: any) => {
    setParameterValues(prev => ({
      ...prev,
      [paramName]: value
    }));
    
    // Update main state variables for common parameters
    if (paramName === 'max_tokens' || paramName === 'max_output_tokens' || paramName === 'max_gen_len') {
      setMaxTokens(String(value));
    }
    if (paramName === 'temperature') {
      setTemperature(String(value));
    }
  };

  if (configCompleted) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-md shadow-md">
        <form onSubmit={handleSubmit}>
          <h2 className="text-xl font-semibold mb-4">Review and Submit</h2>
          
          <div className="mb-4">
            <Card>
              <CardHeader>
                <CardTitle>AI Model Configuration Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <strong>Platform:</strong> {selectedPlatform}
                </div>
                <div>
                  <strong>Model:</strong> {modelName} {modelVersion}
                </div>
                <div>
                  <strong>Type:</strong> {modelTypes.find(t => t.value === modelType)?.label || modelType}
                </div>
                
                {/* Model Parameters */}
                <div className="mt-4">
                  <strong className="block mb-2">Model Parameters:</strong>
                  <div className="bg-gray-50 p-3 rounded space-y-1 text-sm">
                    {Object.entries(parameterValues).map(([key, value]) => {
                      // Find the parameter definition
                      const paramDef = [...commonParameters, ...advancedParameters].find(p => p.name === key);
                      if (!paramDef) return null;
                      
                      return (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-600">{paramDef.label}:</span>
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      );
                    })}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active:</span>
                      <span className="font-medium">{isActive ? 'Yes' : 'No'}</span>
                    </div>
                    {apiEndpoint && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">API Endpoint:</span>
                        <span className="font-medium">{apiEndpoint}</span>
                      </div>
                    )}
                    {apiKey && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">API Key:</span>
                        <span className="font-medium">••••••••</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-2">
                  <strong>Tealium Account:</strong> {tealiumAccount}
                </div>
                <div>
                  <strong>Tealium Profile:</strong> {tealiumProfile}
                </div>
                <div>
                  <strong>Event Types:</strong> {eventTypes.join(', ')}
                </div>
                <div>
                  <strong>Ingestion Frequency:</strong> {ingestionFrequency}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Button 
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Onboarding...' : 'Confirm and Onboard AI Model'}
          </Button>
          
          <Button 
            type="button"
            variant="outline"
            className="w-full mt-2"
            onClick={() => setConfigCompleted(false)}
          >
            Go Back to Edit
          </Button>
          
          {debugInfo && (
            <div className="mt-4 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-60 whitespace-pre-wrap text-gray-700">
              <strong>Debug Info:</strong><br/>
              {debugInfo}
            </div>
          )}
        </form>
      </div>
    );
  }

  const modelSelectionStep = (
    <WizardStep title="Select AI Platform and Model">
      <Card>
        <CardHeader>
          <CardTitle>Select AI Platform and Model</CardTitle>
          <CardDescription>
            Choose which AI platform and model you want to configure for Tealium
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isDataLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Loading available models...</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="platform">AI Platform</Label>
                <Select 
                  value={selectedPlatform} 
                  onValueChange={setSelectedPlatform}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select AI platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(availableModelPlatforms).map((platform) => (
                      <SelectItem key={platform} value={platform}>
                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedPlatform && (
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="model">Model</Label>
                    <Select 
                      value={selectedModelName} 
                      onValueChange={setSelectedModelName}
                      disabled={availableModels.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableModels.map((model) => (
                          <SelectItem key={model.name} value={model.name}>
                            {model.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {selectedModelName && (
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="version">Version</Label>
                    <Select 
                      value={modelVersion} 
                      onValueChange={setModelVersion}
                      disabled={availableVersions.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select version" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableVersions.map((version) => (
                          <SelectItem key={version} value={version}>
                            {version}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="modelType">Model Type</Label>
                <Select 
                  value={modelType} 
                  onValueChange={setModelType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select model type" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredModelTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedModelName && filteredModelTypes.length < modelTypes.length && (
                  <p className="text-xs text-amber-600 mt-1">
                    <span className="font-medium">Note:</span> Only showing model types compatible with {selectedModelName}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="modelDescription">Model Description</Label>
                <Textarea 
                  id="modelDescription" 
                  placeholder="Brief description of the model's capabilities and use cases"
                  value={modelDescription}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setModelDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </WizardStep>
  );

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-md shadow-md">
      <Wizard onComplete={handleWizardComplete}>
        {modelSelectionStep}

        {/* Step 2: Configure Model Parameters */}
        <WizardStep title="Configure Model Parameters">
          <Card>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-4">
                {isDataLoading ? (
                  <div className="p-8 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" role="status">
                      <span className="sr-only">Loading...</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading model parameters...</p>
                  </div>
                ) : (
                  <>
                    {/* Common Parameters */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Basic Parameters</h3>
                      {commonParameters.map(param => (
                        <DynamicParameter 
                          key={param.name}
                          parameter={param}
                          value={parameterValues[param.name]}
                          onChange={handleParameterChange}
                        />
                      ))}
                      
                      <div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="is-active">Model Active</Label>
                          <Switch
                            id="is-active"
                            checked={isActive}
                            onCheckedChange={setIsActive}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Enable or disable this model</p>
                      </div>
                      
                      <div>
                        <Label htmlFor="api-endpoint">API Endpoint (Optional)</Label>
                        <Input
                          type="text"
                          id="api-endpoint"
                          placeholder="https://api.example.com/v1/completions"
                          value={apiEndpoint}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApiEndpoint(e.target.value)}
                          className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">Custom API endpoint if not using default</p>
                      </div>
                      
                      <div>
                        <Label htmlFor="api-key">API Key (Optional)</Label>
                        <Input
                          type="password"
                          id="api-key"
                          placeholder="sk-..."
                          value={apiKey}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApiKey(e.target.value)}
                          className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">API key for authentication</p>
                      </div>
                    </div>
                    
                    {/* Advanced Parameters */}
                    {advancedParameters.length > 0 && (
                      <Collapsible 
                        className="border rounded-md p-3 space-y-2"
                        open={isAdvancedOpen}
                        onOpenChange={setIsAdvancedOpen}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">Advanced Options</h4>
                          <CollapsibleTrigger className="rounded-full hover:bg-gray-100 p-1 transition-colors">
                            {isAdvancedOpen ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </CollapsibleTrigger>
                        </div>
                        
                        <CollapsibleContent className="space-y-4 pt-3">
                          {advancedParameters.map(param => (
                            <DynamicParameter 
                              key={param.name}
                              parameter={param}
                              value={parameterValues[param.name]}
                              onChange={handleParameterChange}
                            />
                          ))}
                          
                          {/* Legacy custom parameters for backward compatibility */}
                          <div>
                            <Label htmlFor="custom-params">Custom Parameters (JSON)</Label>
                            <Textarea
                              id="custom-params"
                              placeholder={currentParameterHints?.examples.basic || '{"param": "value"}'}
                              value={customParams}
                              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCustomParams(e.target.value)}
                              className="mt-1 resize-none"
                              rows={3}
                            />
                            
                            {selectedModelName ? (
                              <div className="mt-2">
                                <p className="text-xs text-gray-500 mb-1">
                                  <span className="font-medium">{selectedModelName} parameters:</span> {currentParameterHints?.description || 'No specific parameters documented'}
                                </p>
                                
                                {currentParameterHints?.examples && (
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    <button
                                      type="button"
                                      onClick={() => setCustomParams(currentParameterHints.examples.basic)}
                                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors"
                                    >
                                      Use Basic Example
                                    </button>
                                    
                                    {currentParameterHints.examples.advanced && (
                                      <button
                                        type="button"
                                        onClick={() => setCustomParams(currentParameterHints.examples.advanced!)}
                                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors"
                                      >
                                        Use Advanced Example
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-xs text-gray-500 mt-1">
                                Additional parameters in JSON format
                              </p>
                            )}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </WizardStep>

        {/* Step 3: Configure Tealium Integration */}
        <WizardStep title="Configure Tealium Integration">
          <Card>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="tealium-account">Tealium Account</Label>
                  <Input
                    type="text"
                    id="tealium-account"
                    placeholder="example-company"
                    value={tealiumAccount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTealiumAccount(e.target.value)}
                    className="mt-1"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Your Tealium account name</p>
                </div>
                
                <div>
                  <Label htmlFor="tealium-profile">Tealium Profile</Label>
                  <Input
                    type="text"
                    id="tealium-profile"
                    placeholder="main"
                    value={tealiumProfile}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTealiumProfile(e.target.value)}
                    className="mt-1"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Your Tealium profile name</p>
                </div>
                
                <div>
                  <Label htmlFor="tealium-source-key">Data Source Key</Label>
                  <Input
                    type="text"
                    id="tealium-source-key"
                    placeholder="xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxx"
                    value={tealiumSourceKey}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTealiumSourceKey(e.target.value)}
                    className="mt-1"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    HTTP API data source key from Tealium EventStream
                  </p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-md">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">
                    About Data Source Keys
                  </h4>
                  <p className="text-xs text-blue-700">
                    You must create an HTTP API data source in your Tealium EventStream 
                    configuration before using this integration. The data source key 
                    can be found in your Tealium EventStream settings under 
                    "HTTP API Connector" sources.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </WizardStep>

        {/* Step 4: Configure Data Ingestion */}
        <WizardStep title="Configure Data Ingestion">
          <Card>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-4">
                <div>
                  <Label>Event Types to Ingest</Label>
                  <p className="text-xs text-gray-500 mt-1 mb-2">
                    Select which events from your AI application to track in Tealium
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="event-user-query"
                        checked={eventTypes.includes('user_query')}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          if (e.target.checked) {
                            setEventTypes([...eventTypes, 'user_query']);
                          } else {
                            setEventTypes(eventTypes.filter(type => type !== 'user_query'));
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <div>
                        <Label htmlFor="event-user-query" className="text-sm font-normal">User Queries</Label>
                        <p className="text-xs text-gray-500">Example: "What's the weather like today?"</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="event-model-response"
                        checked={eventTypes.includes('model_response')}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          if (e.target.checked) {
                            setEventTypes([...eventTypes, 'model_response']);
                          } else {
                            setEventTypes(eventTypes.filter(type => type !== 'model_response'));
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <div>
                        <Label htmlFor="event-model-response" className="text-sm font-normal">Model Responses</Label>
                        <p className="text-xs text-gray-500">Example: AI's answer to user questions</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="event-error"
                        checked={eventTypes.includes('error')}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          if (e.target.checked) {
                            setEventTypes([...eventTypes, 'error']);
                          } else {
                            setEventTypes(eventTypes.filter(type => type !== 'error'));
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <div>
                        <Label htmlFor="event-error" className="text-sm font-normal">Errors</Label>
                        <p className="text-xs text-gray-500">Example: API failures, timeout errors</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="event-feedback"
                        checked={eventTypes.includes('feedback')}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          if (e.target.checked) {
                            setEventTypes([...eventTypes, 'feedback']);
                          } else {
                            setEventTypes(eventTypes.filter(type => type !== 'feedback'));
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <div>
                        <Label htmlFor="event-feedback" className="text-sm font-normal">User Feedback</Label>
                        <p className="text-xs text-gray-500">Example: Thumbs up/down ratings</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-2">
                  <Label htmlFor="ingestion-frequency">Ingestion Frequency</Label>
                  <Select 
                    value={ingestionFrequency} 
                    onValueChange={setIngestionFrequency}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time</SelectItem>
                      <SelectItem value="batch">Batch</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="mt-2 bg-gray-50 p-3 rounded-md">
                    <p className="text-xs text-gray-700">
                      <span className="font-medium">Real-time:</span> Send each event immediately (e.g., track each user question as it happens)
                    </p>
                    <p className="text-xs text-gray-700 mt-1">
                      <span className="font-medium">Batch:</span> Group multiple events together (e.g., send 10 events at once)
                    </p>
                    <p className="text-xs text-gray-700 mt-1">
                      <span className="font-medium">Scheduled:</span> Send events on a timed basis (e.g., every 5 minutes)
                    </p>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="batch-size">Batch Size</Label>
                  <Input
                    type="number"
                    id="batch-size"
                    placeholder="1"
                    value={batchSize}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBatchSize(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Number of events to collect before sending to Tealium</p>
                  <p className="text-xs text-gray-500">Example: A batch size of 5 means send data after collecting 5 events</p>
                </div>
                
                <div className="space-y-3 bg-gray-50 p-4 rounded-md">
                  <h4 className="text-sm font-medium">Include in Events:</h4>
                  <p className="text-xs text-gray-500 mb-3">Select what additional information to include with each event</p>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="include-metadata" className="text-sm font-normal">Metadata</Label>
                      <p className="text-xs text-gray-500">Includes: timestamps, session IDs, request IDs</p>
                    </div>
                    <Switch
                      id="include-metadata"
                      checked={includeMetadata}
                      onCheckedChange={setIncludeMetadata}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="include-user-info" className="text-sm font-normal">User Information</Label>
                      <p className="text-xs text-gray-500">Includes: user IDs, device info, location data</p>
                    </div>
                    <Switch
                      id="include-user-info"
                      checked={includeUserInfo}
                      onCheckedChange={setIncludeUserInfo}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="include-model-config" className="text-sm font-normal">Model Configuration</Label>
                      <p className="text-xs text-gray-500">Includes: model settings like temperature, max tokens</p>
                    </div>
                    <Switch
                      id="include-model-config"
                      checked={includeModelConfig}
                      onCheckedChange={setIncludeModelConfig}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </WizardStep>
      </Wizard>
    </div>
  );
};

export default AiModelConfigForm; 