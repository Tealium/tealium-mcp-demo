/**
 * Central configuration file for Tealium MCP Ingestion App
 * All environment variables and constants are managed here
 */

// Tealium account configuration
export const TEALIUM_ACCOUNT = process.env.TEALIUM_ACCOUNT || process.env.NEXT_PUBLIC_TEALIUM_ACCOUNT || '';
export const TEALIUM_PROFILE = process.env.TEALIUM_PROFILE || process.env.NEXT_PUBLIC_TEALIUM_PROFILE || '';
export const TEALIUM_DATASOURCE_KEY = process.env.TEALIUM_DATASOURCE_KEY || process.env.NEXT_PUBLIC_TEALIUM_DATA_SOURCE_KEY || '';
export const TEALIUM_ENGINE_ID = process.env.TEALIUM_ENGINE_ID || process.env.NEXT_PUBLIC_TEALIUM_ENGINE_ID || '';
export const TEALIUM_MOMENTS_API_KEY = process.env.TEALIUM_MOMENTS_API_KEY || process.env.NEXT_PUBLIC_TEALIUM_MOMENTS_API_KEY || '';

// Application configuration
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Default model configuration
export const MODEL_PLATFORM = process.env.NEXT_PUBLIC_MODEL_PLATFORM || 'openai';
export const MODEL_NAME = process.env.NEXT_PUBLIC_MODEL_NAME || 'GPT-4';
export const MODEL_VERSION = process.env.NEXT_PUBLIC_MODEL_VERSION || 'turbo';
export const MODEL_TYPE = process.env.NEXT_PUBLIC_MODEL_TYPE || 'chat';

// Tealium API endpoints
export const TEALIUM_COLLECT_API = 'https://collect.tealiumiq.com/event';
export const TEALIUM_VISITOR_API = `https://visitor-service.tealiumiq.com/v2/${TEALIUM_ACCOUNT}/${TEALIUM_PROFILE}`;

// Sample data (for demo/test purposes)
export const SAMPLE_DATA = {
  email: 'visitor@example.com',
  phone: '+1234567890',
  name: 'Test User',
  city: 'Example City',
  country: 'Example Country'
};

// MCP (Model Context Protocol) configuration
export const MCP_CONFIG = {
  defaultQueryEvent: 'mcp_query',
  defaultResponseEvent: 'mcp_response',
  defaultCpTestValue: 'tealium_mcp_ingestion',
  serverSideFlag: true
};

// Debug and logging configuration
export const DEBUG_CONFIG = {
  enableDebugLogs: process.env.NODE_ENV !== 'production',
  logPayloads: process.env.NODE_ENV !== 'production'
};
