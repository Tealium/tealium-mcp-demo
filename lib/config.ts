/**
 * Central configuration file for Tealium MCP Ingestion App
 * All environment variables and constants are managed here
 */

// Tealium account configuration
/**
 * Tealium account name
 */
export const TEALIUM_ACCOUNT = process.env.TEALIUM_ACCOUNT || process.env.NEXT_PUBLIC_TEALIUM_ACCOUNT || '';

/**
 * Tealium profile name
 */
export const TEALIUM_PROFILE = process.env.TEALIUM_PROFILE || process.env.NEXT_PUBLIC_TEALIUM_PROFILE || '';

/**
 * Tealium data source key
 */
export const TEALIUM_DATASOURCE_KEY = process.env.TEALIUM_DATASOURCE_KEY || process.env.NEXT_PUBLIC_TEALIUM_DATA_SOURCE_KEY || '';

/**
 * Tealium engine ID
 */
export const TEALIUM_ENGINE_ID = process.env.TEALIUM_ENGINE_ID || process.env.NEXT_PUBLIC_TEALIUM_ENGINE_ID || '';

/**
 * Consolidated properties object to abstract all personal and account information
 * Use this object for all references to account info and personal data
 */
export const properties = {
  // Account information
  account: TEALIUM_ACCOUNT,
  profile: TEALIUM_PROFILE,
  dataSourceKey: TEALIUM_DATASOURCE_KEY,
  engineId: TEALIUM_ENGINE_ID,
  
  // Sample personal information (for demo/test purposes)
  email: 'visitor@example.com',
  phone: '+1234567890',
  name: 'Test User',
  city: 'Example City',
  country: 'Example Country',
  
  // API endpoints
  collectApi: 'https://collect.tealiumiq.com/event',
  visitorApi: `https://visitor-service.tealiumiq.com/v2/${TEALIUM_ACCOUNT}/${TEALIUM_PROFILE}`,
  momentsApiBaseUrl: 'https://personalization-api.eu-central-1.prod.tealiumapis.com/personalization/accounts/'
};

// Application configuration
/**
 * Application URL
 */
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Default model configuration
/**
 * Model platform (e.g. openai)
 */
export const MODEL_PLATFORM = process.env.NEXT_PUBLIC_MODEL_PLATFORM || 'openai';

/**
 * Model name (e.g. GPT-4)
 */
export const MODEL_NAME = process.env.NEXT_PUBLIC_MODEL_NAME || 'GPT-4';

/**
 * Model version (e.g. turbo)
 */
export const MODEL_VERSION = process.env.NEXT_PUBLIC_MODEL_VERSION || 'turbo';

/**
 * Model type (e.g. chat)
 */
export const MODEL_TYPE = process.env.NEXT_PUBLIC_MODEL_TYPE || 'chat';

// Tealium API endpoints
/**
 * Tealium collect API endpoint
 */
export const TEALIUM_COLLECT_API = properties.collectApi;

/**
 * Tealium visitor API endpoint
 */
export const TEALIUM_VISITOR_API = properties.visitorApi;

/**
 * Tealium moments API base URL
 */
export const TEALIUM_MOMENTS_API_BASE_URL = properties.momentsApiBaseUrl;

// Sample data (for demo/test purposes)
/**
 * Sample visitor data
 */
export const SAMPLE_DATA = {
  email: properties.email,
  phone: properties.phone,
  name: properties.name,
  city: properties.city,
  country: properties.country
};

// MCP (Model Context Protocol) configuration
/**
 * MCP configuration
 */
export const MCP_CONFIG = {
  /**
   * Default query event name
   */
  defaultQueryEvent: 'mcp_query',
  /**
   * Default response event name
   */
  defaultResponseEvent: 'mcp_response',
  /**
   * Default CP test value
   */
  defaultCpTestValue: 'tealium_mcp_ingestion',
  /**
   * Server-side flag
   */
  serverSideFlag: true
};

// Debug and logging configuration
/**
 * Debug configuration
 */
export const DEBUG_CONFIG = {
  /**
   * Enable debug logs
   */
  enableDebugLogs: process.env.NODE_ENV !== 'production',
  /**
   * Log payloads
   */
  logPayloads: process.env.NODE_ENV !== 'production'
};
