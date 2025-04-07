'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  getVisitorData, 
  VisitorDataRequest as VisitorParams,
  MomentsApiConfig as MomentsConfig 
} from '@/lib/moments-service';
import {
  getVisitorContextForQuery,
  findVisitorByEmail,
  FunctionsConfig
} from '@/lib/functions-service';
import {
  TEALIUM_ACCOUNT,
  TEALIUM_PROFILE,
  TEALIUM_DATASOURCE_KEY,
  TEALIUM_ENGINE_ID,
  MCP_CONFIG,
  SAMPLE_DATA
} from '@/lib/config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { sendModelQuery, sendModelResponse } from '@/lib/tealium-service';
import { getFixedResponse } from './fixed-responses';  // Import the fixed responses

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  queryId?: string;
  isIdentificationRequest?: boolean;
}

export default function ChatbotPage() {
  // Tealium configuration
  const [tealiumAccount, setTealiumAccount] = useState(TEALIUM_ACCOUNT || '');
  const [tealiumProfile, setTealiumProfile] = useState(TEALIUM_PROFILE || '');
  const [tealiumSourceKey, setTealiumSourceKey] = useState(TEALIUM_DATASOURCE_KEY || '');
  const [tealiumIntegration, setTealiumIntegration] = useState<'functions' | 'moments'>('moments'); 
  const [useVisitorContext, setUseVisitorContext] = useState(true);
  const [tealiumTraceId, setTealiumTraceId] = useState('');
  const [eventNamePrefix, setEventNamePrefix] = useState(MCP_CONFIG.defaultQueryEvent.split('_')[0] + '_');
  const [cpTestValue, setCpTestValue] = useState(MCP_CONFIG.defaultCpTestValue);
  
  // Chat state
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. To provide personalized assistance, could you please share your email or phone number? If you prefer to remain anonymous, you can type "anonymous".',
      timestamp: new Date(),
      isIdentificationRequest: true
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  // Commented out visitor ID generation as we'll use email as the primary identifier
  // const [visitorId, setVisitorId] = useState(`visitor-${Date.now()}`);
  const [visitorContext, setVisitorContext] = useState<any>(null);
  const [engineId, setEngineId] = useState(TEALIUM_ENGINE_ID || '');
  const [isLoadingVisitorData, setIsLoadingVisitorData] = useState(false);
  const [hasAskedForEmail, setHasAskedForEmail] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userDeclinedIdentification, setUserDeclinedIdentification] = useState(false);
  const [waitingForEmailResponse, setWaitingForEmailResponse] = useState(true);
  const [momentsApiKey, setMomentsApiKey] = useState('');
  const [visitorDataLoaded, setVisitorDataLoaded] = useState(false); // New state to track if visitor data has been loaded
  
  // Model configuration
  const [modelPlatform, setModelPlatform] = useState('openai');
  const [modelName, setModelName] = useState('GPT-4');
  const [modelVersion, setModelVersion] = useState('turbo');
  const [modelType, setModelType] = useState('chat');
  
  // Debug state
  const [lastApiResponse, setLastApiResponse] = useState<any>(null);
  const [lastApiError, setLastApiError] = useState<string | null>(null);
  const [showDebugInfo, setShowDebugInfo] = useState(true);
  
  // Reference for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Automatically load visitor data when email is set and chat initialized
  useEffect(() => {
    // Only auto-load visitor data when:
    // 1. We have messages (chat has started)
    // 2. We have a valid userEmail (not null or empty)
    // 3. We haven't specifically declined identification
    if (messages.length > 0 && userEmail && !userDeclinedIdentification && !visitorDataLoaded) {
      console.log('Auto-loading visitor data for:', userEmail);
      setVisitorDataLoaded(true); // Mark as loaded to prevent multiple attempts
      loadVisitorData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, userEmail, userDeclinedIdentification, visitorDataLoaded]);
  
  // Load visitor data when visitor ID changes
  const loadVisitorData = async () => {
    if (!userEmail || userDeclinedIdentification) return false;
    
    setIsLoadingVisitorData(true);
    setLastApiError(null);
    
    try {
      console.log(`Fetching visitor data for email: ${userEmail} using ${tealiumIntegration} integration`);
      console.log('Current configuration:', { 
        tealiumAccount, 
        tealiumProfile, 
        tealiumSourceKey, 
        engineId, 
        momentsApiKey
      });
      
      let visitorData = null;
      
      // STEP 3: Tealium Visitor ID Check - Choose integration method
      if (tealiumIntegration === 'moments') {
        // Use Moments API
        try {
          // Create a proper VisitorParams object
          const visitorParams: VisitorParams = {};
          
          // If it looks like an email, use our direct test endpoint which we know works
          if (typeof userEmail === 'string' && userEmail.includes('@')) {
            try {
              console.log('Detected email input, using direct Tealium endpoint');
              console.log('Using engineId:', engineId);
              
              // Check if engineId is available
              if (!engineId) {
                console.error('Missing engineId! Required for Moments API');
                toast.error('Please enter an Engine ID in the configuration');
                setIsLoadingVisitorData(false);
                return false;
              }
              
              // Use our confirmed working endpoint
              const emailResponse = await fetch(`/api/tealium/moments/direct-test?email=${encodeURIComponent(userEmail)}&engineId=${encodeURIComponent(engineId)}&account=${encodeURIComponent(tealiumAccount)}&profile=${encodeURIComponent(tealiumProfile)}&apiKey=${encodeURIComponent(momentsApiKey)}`);
              
              if (!emailResponse.ok) {
                console.error('Email lookup failed:', await emailResponse.text());
                setLastApiError(`Email lookup error: Failed to connect to API`);
                toast.error(`Couldn't find your profile with that email. Please try again.`);
                setIsLoadingVisitorData(false);
                return false;
              }
              
              const responseData = await emailResponse.json();
              console.log('Full response data from direct-test endpoint:', responseData);
              
              // Check if we have a successful result from any endpoint format
              const successfulResult = responseData.results.find((r: any) => r.success === true);
              
              if (successfulResult && successfulResult.body) {
                console.log('Email lookup successful, setting visitor context with:', successfulResult.body);
                // Store the data in visitor context for the chatbot to use
                setVisitorContext(successfulResult.body);
                
                // Also log what's happening with visitor context after setting
                setTimeout(() => {
                  console.log('Current visitor context state:', visitorContext);
                }, 100);
                
                toast.success(`Found your profile, ${successfulResult.body.properties?.[5294] || ''}!`);
                setIsLoadingVisitorData(false);
                return true;
              } else {
                console.log('No visitor data found for email');
                setVisitorContext(null);
                toast.warning('No profile data available for that email.');
                setIsLoadingVisitorData(false);
                return false;
              }
            } catch (error) {
              console.error('Error in email lookup:', error);
              setLastApiError(`Email lookup error: ${error instanceof Error ? error.message : String(error)}`);
              toast.error('Failed to look up your profile with that email.');
              setIsLoadingVisitorData(false);
              return false;
            }
          } else {
            // Otherwise process as before for visitor IDs
            try {
              visitorParams.visitorId = String(userEmail);
              
              console.log('Using Moments API with params:', visitorParams);
              
              const momentsConfig: MomentsConfig = {
                account: tealiumAccount,
                profile: tealiumProfile,
                visitorApi: `https://visitor-service.tealiumiq.com/v2/${tealiumAccount}/${tealiumProfile}`,
                engineId: engineId,
                apiKey: momentsApiKey,
                debug: true
              };
              
              visitorData = await getVisitorData(
                visitorParams,
                momentsConfig
              );
            } catch (error) {
              console.error('Error fetching visitor data from Moments API:', error);
              setLastApiError(`Moments API error: ${error instanceof Error ? error.message : String(error)}`);
              toast.error('Error connecting to Moments API. Please check your API configuration.');
              return false;
            }
          }
        } catch (error) {
          console.error('Error fetching visitor data from Moments API:', error);
          setLastApiError(`Moments API error: ${error instanceof Error ? error.message : String(error)}`);
          toast.error('Error connecting to Moments API. Please check your API configuration.');
          return false;
        }
      } else {
        // Use Functions API
        try {
          visitorData = await getVisitorContextForQuery(
            userEmail,
            "Loading visitor context",
            {
              account: tealiumAccount,
              profile: tealiumProfile,
              dataSourceKey: tealiumSourceKey,
              debug: true
            }
          );
        } catch (error) {
          console.error('Error fetching visitor data from Functions API:', error);
          setLastApiError(`Functions API error: ${error instanceof Error ? error.message : String(error)}`);
          toast.error('Error connecting to Functions API. Please check your API configuration.');
          return false;
        }
      }
      
      // Store the API response for debugging
      setLastApiResponse(visitorData);
      
      if (visitorData) {
        console.log('Visitor data found:', visitorData);
        setVisitorContext(visitorData);
        toast.success(`Loaded visitor profile data for ${userEmail}`);
        return true;
      } else {
        console.log('No visitor data found for ID');
        setVisitorContext(null);
        toast.warning('No visitor data available. Please check your Tealium configuration.');
        return false;
      }
    } catch (error) {
      console.error('Error loading visitor data:', error);
      setLastApiError(error instanceof Error ? error.message : 'Unknown error loading visitor data');
      toast.error('Failed to load visitor data from Tealium');
      
      // Clear visitor context as fallback
      setVisitorContext(null);
      
      return false;
    } finally {
      setIsLoadingVisitorData(false);
    }
  };
  
  // Simplified identification validator
  const isValidIdentifier = (text: string): {isValid: boolean, type: 'email' | 'phone' | null} => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(\+\d{1,3}[-.\s]?)?(\d{3}[-.\s]?\d{3}[-.\s]?\d{4}|\d{10})$/;
    
    if (emailRegex.test(text)) {
      return {isValid: true, type: 'email'};
    } else if (phoneRegex.test(text)) {
      return {isValid: true, type: 'phone'};
    }
    
    return {isValid: false, type: null};
  };
  
  // STEP 1: User Identification - Simplified process
  const processIdentificationResponse = async (userResponse: string): Promise<boolean> => {
    // Check if the user wants to remain anonymous
    if (userResponse.toLowerCase() === 'anonymous' || userResponse.toLowerCase() === 'no') {
      console.log('User declined identification');
      setUserDeclinedIdentification(true);
      setWaitingForEmailResponse(false);
      setHasAskedForEmail(true);
    
      // Add message indicating anonymous mode
      setMessages(prevMessages => [
        ...prevMessages,
        {
          role: 'assistant',
          content: 'You\'ve chosen to remain anonymous. I\'ll do my best to assist you with general information.',
          timestamp: new Date()
        }
      ]);
    
      return false;
    }
    
    // Check if it's a valid identifier
    const {isValid, type} = isValidIdentifier(userResponse);
    
    if (isValid) {
      // Update UI state
      setHasAskedForEmail(true);
      setWaitingForEmailResponse(false);
      setUserEmail(userResponse);
      
      // Try to load visitor data
      const dataLoaded = await loadVisitorData();
      
      // Add success message
      setMessages(prevMessages => [
        ...prevMessages,
        {
          role: 'assistant',
          content: dataLoaded 
            ? `Thank you! I now have your profile information. How can I help you today?`
            : `Thank you! I'll continue with general assistance since I couldn't find your profile data.`,
          timestamp: new Date()
        }
      ]);
      
      return true;
    } else {
      // Not a valid identifier, provide feedback
      setMessages(prevMessages => [
        ...prevMessages,
        {
          role: 'assistant',
          content: `I couldn't recognize that as a valid email or phone number. Please provide a valid email, phone number, or type "anonymous" to continue without identification.`,
          timestamp: new Date(),
          isIdentificationRequest: true
        }
      ]);
      
      return false;
    }
  };
  
  // Get model configuration for Tealium events
  const getModelConfig = () => {
    return {
      platform: modelPlatform,
      model_name: modelName,
      model_version: modelVersion,
      model_type: modelType,
      parameters: {
        temperature: 0.7,
        max_tokens: 1000
      },
      custom_params: {
        use_visitor_context: useVisitorContext
      }
    };
  };

  // Get Tealium configuration for API calls
  const getTealiumConfig = () => {
    // Map the old integration name to the new one
    const integrationMapping: {[key: string]: 'eventstream' | 'moments' | 'both'} = {
      'functions': 'eventstream',
      'moments': 'moments',
    };
    
    return {
      account: tealiumAccount,
      profile: tealiumProfile,
      dataSourceKey: tealiumSourceKey,
      integration: integrationMapping[tealiumIntegration] || 'both', // Use 'both' as default to send to both APIs
      useVisitorContext: useVisitorContext,
      visitorId: userEmail || undefined,
      tealiumTraceId: tealiumTraceId,
      engineId: engineId,
      apiKey: momentsApiKey
    };
  };
  
  // STEP 6: Model Response Generation with Context - Use fixed responses for now
  const generateAIResponse = async (userMessage: string, visitorContext: any): Promise<string> => {
    try {
      // Start performance tracking
      const startTime = Date.now();
      
      // Simply use our fixed responses with context when available
      const response = getFixedResponse(userMessage, visitorContext);
      
      // Calculate latency
      const latency = Date.now() - startTime;
      
      // Generate a random number of tokens for demonstration
      const tokensUsed = Math.floor(Math.random() * 1000) + 500;
      
      // Send response event to Tealium for analytics
      if (messages.length > 0) {
        const lastUserMessage = messages.filter(m => m.role === 'user').pop();
        if (lastUserMessage?.queryId) {
          sendModelResponse(
            {
              query_id: lastUserMessage.queryId,
              response: response,
              visitor_id: userEmail || 'anonymous', // Add fallback for null
              latency: latency,
              tokens_used: tokensUsed,
              context_used: visitorContext || null
            },
            getModelConfig(),
            getTealiumConfig()
          ).catch(error => {
            console.error("Error sending model response to Tealium:", error);
          });
        }
      }
      
      return response;
    } catch (error) {
      console.error('Error generating AI response:', error);
      return 'I apologize, but I encountered an error while processing your request. Please try again.';
    }
  };
  
  // STEP 2: User Query Input - Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Don't process empty messages
    if (!inputMessage.trim()) return;
    
    // Get the user's message and reset input
    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // If this is potentially an identification message
    if (waitingForEmailResponse) {
      setWaitingForEmailResponse(false);
      
      // Add the user's message to the chat
      setMessages(prevMessages => [
        ...prevMessages,
        {
          role: 'user',
          content: userMessage,
          timestamp: new Date()
        }
      ]);
      
      // Show processing state
      setIsProcessing(true);
      
      try {
        // If it looks like an email, use it for visitor lookup
        if (userMessage.includes('@')) {
          console.log('First message is email, using for lookup:', userMessage);
          setUserEmail(userMessage);
          
          // Try to load visitor data using the email
          setIsLoadingVisitorData(true);
          const success = await loadVisitorData();
          setIsLoadingVisitorData(false);
          
          // Generate response based on visitor data
          let aiResponse = "";
          
          // Debug what happened with the visitor context
          console.log('After loadVisitorData:', { 
            success, 
            hasContext: !!visitorContext, 
            visitorContext 
          });
          
          // Directly fetch from our test endpoint which we know works
          try {
            console.log('Fetching direct from test endpoint for:', userMessage);
            
            // Check if engineId is available
            if (!engineId) {
              console.error('Missing engineId! Required for Moments API');
              toast.error('Please enter an Engine ID in the configuration');
              setIsLoadingVisitorData(false);
              return;
            }
            
            const emailResponse = await fetch(`/api/tealium/moments/direct-test?email=${encodeURIComponent(userMessage)}&engineId=${encodeURIComponent(engineId)}&account=${encodeURIComponent(tealiumAccount)}&profile=${encodeURIComponent(tealiumProfile)}&apiKey=${encodeURIComponent(momentsApiKey)}`);
            
            if (emailResponse.ok) {
              const responseData = await emailResponse.json();
              console.log('Direct test endpoint response:', responseData);
              
              // Check if we have a successful result from any endpoint format
              const successfulResult = responseData.results.find((r: any) => r.success === true);
              
              if (successfulResult && successfulResult.body) {
                console.log('Setting visitor context manually with:', successfulResult.body);
                // Store the visitor data for the chatbot to use
                setVisitorContext(successfulResult.body);
                setUserEmail(userMessage);
                
                // After a short delay to ensure the context is set
                setTimeout(() => {
                  // Generate response based on visitor data
                  let aiResponse = "";
                  
                  // We found visitor data - personalize the greeting
                  const firstName = successfulResult.body.properties?.[5294];
                  if (firstName) {
                    aiResponse = `Hello ${firstName}! I've found your profile and I'm ready to help with personalized assistance. What can I do for you today?`;
                  } else {
                    aiResponse = "I've found your profile data! I'm ready to provide personalized assistance. How can I help you today?";
                  }
                  
                  // Add the response to chat
                  setMessages(prevMessages => [
                    ...prevMessages,
                    {
                      role: 'assistant',
                      content: aiResponse,
                      timestamp: new Date()
                    }
                  ]);
                  
                  setIsLoadingVisitorData(false);
                  setIsProcessing(false);
                }, 300);
                
                return;
              }
            }
          } catch (error) {
            console.error('Error in direct test lookup:', error);
          }
          
          // If we reach here, no visitor data was found
          setMessages(prevMessages => [
            ...prevMessages,
            {
              role: 'assistant',
              content: "Thank you! I'll continue with general assistance since I couldn't find your profile data.",
              timestamp: new Date()
            }
          ]);
          
          setIsLoadingVisitorData(false);
          setIsProcessing(false);
        } else if (userMessage.toLowerCase() === 'anonymous') {
          // Handle anonymous case
          setMessages(prevMessages => [
            ...prevMessages,
            {
              role: 'assistant',
              content: 'You\'ve chosen to remain anonymous. I\'ll do my best to assist you with general information.',
              timestamp: new Date()
            }
          ]);
        }
      } catch (error) {
        console.error('Error processing message:', error);
        
        // Add error message
        setMessages(prevMessages => [
          ...prevMessages,
          {
            role: 'assistant',
            content: 'I apologize, but I encountered an error while processing your request. Please try again.',
            timestamp: new Date()
          }
        ]);
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Add the user's message to the chat
      const queryId = `query-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      setMessages(prevMessages => [
        ...prevMessages,
        {
          role: 'user',
          content: userMessage,
          timestamp: new Date(),
          queryId: queryId
        }
      ]);
      
      // Show processing state
      setIsProcessing(true);
      
      // Track start time for latency calculation
      const startTime = Date.now();
      
      try {
        // Send query event to Tealium for analytics
        const tealiumBaseUrl = '/api/tealium';
        try {
          // Use separate server-side endpoint for query tracking
          const queryResponse = await fetch(`${tealiumBaseUrl}/track-query`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query_id: queryId,
              query: userMessage,
              visitor_id: userEmail || 'anonymous', // Add fallback for null
              context: visitorContext,
              model_config: getModelConfig(),
              tealium_account: tealiumAccount,
              tealium_profile: tealiumProfile,
              tealium_datasource: tealiumSourceKey,
              tealium_trace_id: tealiumTraceId
            })
          });
          
          if (!queryResponse.ok) {
            console.error('Server tracking API error:', await queryResponse.text());
          } else {
            console.log('Query tracked server-side successfully');
          }
        } catch (error) {
          console.error('Error sending model query to server (continuing anyway):', error);
        }
        
        // Generate AI response
        const aiResponse = await generateAIResponse(userMessage, visitorContext);
        
        // STEP 7: Response Display - Add the AI response to the chat
        setMessages(prevMessages => [
          ...prevMessages,
          {
            role: 'assistant',
            content: aiResponse,
            timestamp: new Date(),
            queryId: queryId
          }
        ]);
        
        // Track the response server-side
        try {
          const responseResponse = await fetch(`${tealiumBaseUrl}/track-response`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query_id: queryId,
              response: aiResponse,
              visitor_id: userEmail || 'anonymous', // Add fallback for null
              context_used: visitorContext,
              latency: Date.now() - startTime,
              tokens_used: Math.floor(Math.random() * 1000) + 500,
              model_config: getModelConfig(),
              tealium_account: tealiumAccount,
              tealium_profile: tealiumProfile,
              tealium_datasource: tealiumSourceKey,
              tealium_trace_id: tealiumTraceId
            })
          });
          
          if (!responseResponse.ok) {
            console.error('Server tracking API error for response:', await responseResponse.text());
          } else {
            console.log('Response tracked server-side successfully');
          }
        } catch (error) {
          console.error('Error sending model response to server (continuing anyway):', error);
        }
      } catch (error) {
        console.error('Error processing message:', error);
        
        // Add error message
        setMessages(prevMessages => [
          ...prevMessages,
          {
            role: 'assistant',
            content: 'I apologize, but I encountered an error while processing your request. Please try again.',
            timestamp: new Date()
          }
        ]);
      } finally {
        setIsProcessing(false);
      }
    }
  };
  
  // Handle visitor ID change
  const handleVisitorIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserEmail(e.target.value);
  };
  
  // Handle refreshing visitor data
  const handleRefreshVisitorData = () => {
    loadVisitorData();
  };
  
  // Reset the identification flow
  const handleResetIdentification = () => {
    setHasAskedForEmail(false);
    setUserEmail(null);
    setUserDeclinedIdentification(false);
    setWaitingForEmailResponse(true);
    setVisitorContext(null);
    
    // Add identification request message
    setMessages([
      {
        role: 'assistant',
        content: 'Hello! I\'m your AI assistant. To provide personalized assistance, could you please share your email or phone number? If you prefer to remain anonymous, you can type "anonymous".',
        timestamp: new Date(),
        isIdentificationRequest: true
      }
    ]);
  };

  // The JSX code for the UI
  return (
    <div className="container mx-auto p-4 flex flex-col lg:flex-row gap-4">
      <div className="lg:w-3/4">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Tealium AI Chatbot</CardTitle>
            <CardDescription>
              Chat with AI using Tealium visitor context
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex-grow flex flex-col">
            <div className="flex-grow overflow-auto p-4 space-y-4 mb-4 max-h-[60vh]">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`p-3 rounded-lg max-w-[80%] ${
                      message.role === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.content}
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                placeholder={isProcessing ? "Processing..." : "Type your message..."}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isProcessing}
              />
              <Button type="submit" disabled={isProcessing}>Send</Button>
            </form>
          </CardContent>
        </Card>
      </div>
      
      <div className="lg:w-1/4">
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>
              Tealium and model settings
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tealium-account">Tealium Account</Label>
              <Input 
                id="tealium-account" 
                value={tealiumAccount}
                onChange={(e) => setTealiumAccount(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tealium-profile">Tealium Profile</Label>
              <Input 
                id="tealium-profile" 
                value={tealiumProfile}
                onChange={(e) => setTealiumProfile(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="data-source-key">Data Source Key</Label>
              <Input 
                id="data-source-key" 
                value={tealiumSourceKey}
                onChange={(e) => setTealiumSourceKey(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="moments-api-key">Moments API Key</Label>
              <Input
                id="moments-api-key"
                value={momentsApiKey}
                onChange={(e) => setMomentsApiKey(e.target.value)}
                placeholder="Enter your Moments API key (if required)"
                className="font-mono text-xs"
              />
              <p className="text-xs text-gray-500">
                Required for most Tealium accounts to access the Moments API.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="engine-id">Engine ID</Label>
              <Input
                id="engine-id"
                value={engineId}
                onChange={(e) => setEngineId(e.target.value)}
                placeholder="Enter your Tealium Engine ID"
                className="font-mono text-xs"
              />
              <p className="text-xs text-gray-500">
                Required for Moments API to identify the correct engine.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Integration Type</Label>
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={tealiumIntegration === 'moments'}
                  onCheckedChange={(val) => setTealiumIntegration(val ? 'moments' : 'functions')}
                />
                <span>{tealiumIntegration === 'moments' ? 'Moments API' : 'Functions API'}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Use Visitor Context</Label>
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={useVisitorContext}
                  onCheckedChange={setUseVisitorContext}
                />
                <span>{useVisitorContext ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="visitor-id">Current Visitor ID</Label>
              <div className="flex space-x-2">
                <Input 
                  id="visitor-id" 
                  value={userEmail || ''} // Add empty string fallback for null
                  onChange={handleVisitorIdChange}
                  placeholder={SAMPLE_DATA.email}
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleRefreshVisitorData}
                  disabled={isLoadingVisitorData}
                >
                  {isLoadingVisitorData ? '...' : '↻'}
                </Button>
              </div>
              {userEmail && (
                <p className="text-xs text-blue-600">Using email</p>
              )}
            </div>
            
            <Button 
              onClick={handleResetIdentification}
              variant="outline"
              size="sm"
            >
              Reset Identification
            </Button>
            
            {/* Debug information */}
            {showDebugInfo && (
              <div className="mt-4 border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-semibold">Debug Information</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowDebugInfo(!showDebugInfo)}
                  >
                    Hide Debug
                  </Button>
                </div>
                
                <div className="text-xs space-y-2">
                  <div>
                    <strong>Status:</strong> {isLoadingVisitorData ? 'Loading data...' : 'Idle'}
                  </div>
                  
                  <div>
                    <strong>Context Available:</strong> {visitorContext ? 'Yes' : 'No'}
                  </div>
                  
                  <div>
                    <strong>Tealium Trace ID:</strong> {tealiumTraceId || 'None'}
                  </div>
                  
                  {lastApiError && (
                    <div className="bg-red-50 p-2 rounded text-red-800 whitespace-pre-wrap">
                      <strong>Last Error:</strong> {lastApiError}
                    </div>
                  )}
                  
                  {lastApiResponse && (
                    <div>
                      <strong>Last API Response:</strong>
                      <div className="bg-gray-50 p-2 rounded mt-1 max-h-40 overflow-auto">
                        <pre>{JSON.stringify(lastApiResponse, null, 2)}</pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
