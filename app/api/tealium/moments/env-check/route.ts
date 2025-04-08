import { NextRequest, NextResponse } from 'next/server';
import { properties } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get configuration from centralized properties
    const account = properties.account;
    const profile = properties.profile;
    const engineId = properties.engineId;
    const datasourceKey = properties.dataSourceKey;

    // Return environment variable information for debugging
    return NextResponse.json({
      success: true,
      environment: {
        TEALIUM_ACCOUNT: account || 'Not configured',
        TEALIUM_PROFILE: profile || 'Not configured',
        TEALIUM_ENGINE_ID: engineId || 'Not configured',
        TEALIUM_DATASOURCE_KEY: datasourceKey ? `${datasourceKey.substring(0, 3)}...${datasourceKey.substring(datasourceKey.length - 3)} (${datasourceKey.length} chars)` : 'Not configured',
        // Note: Moments API doesn't require an API key
      },
      checks: {
        account: account.length > 0,
        profile: profile.length > 0,
        engineId: engineId.length > 0,
        datasourceKey: datasourceKey.length > 0 || true // Optional
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error checking env vars:', error);
    return NextResponse.json(
      { error: 'Error checking environment variables', message: (error as Error).message },
      { status: 500 }
    );
  }
}
