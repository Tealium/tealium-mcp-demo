const fs = require('fs');
const path = require('path');

// Environment variables content
const envContent = `# Supabase (optional - for future enhancements)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Tealium Configuration - Client-side variables (must be prefixed with NEXT_PUBLIC_)
NEXT_PUBLIC_TEALIUM_ACCOUNT=your_tealium_account
NEXT_PUBLIC_TEALIUM_PROFILE=your_tealium_profile
NEXT_PUBLIC_TEALIUM_ENGINE_ID=your_engine_id
NEXT_PUBLIC_TEALIUM_DATA_SOURCE_KEY=your_datasource_key
NEXT_PUBLIC_TEALIUM_MOMENTS_API_KEY=your_moments_api_key

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Server-side Tealium Config (used in API routes)
TEALIUM_ACCOUNT=your_tealium_account
TEALIUM_PROFILE=your_tealium_profile
TEALIUM_ENGINE_ID=your_engine_id
TEALIUM_MOMENTS_API_KEY=your_moments_api_key
TEALIUM_DATASOURCE_KEY=your_datasource_key

# Model Configuration
NEXT_PUBLIC_MODEL_PLATFORM=openai
NEXT_PUBLIC_MODEL_NAME=GPT-4
NEXT_PUBLIC_MODEL_VERSION=turbo
NEXT_PUBLIC_MODEL_TYPE=chat
`;

const envPath = path.join(__dirname, '.env.local');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Successfully created .env.local file with placeholder environment variables.');
  console.log('⚠️ Please replace the placeholder values with your actual configuration before running the application.');
} catch (error) {
  console.error('Error creating .env.local file:', error);
}
