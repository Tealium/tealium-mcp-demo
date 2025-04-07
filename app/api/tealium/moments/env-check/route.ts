import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get environment variables
    const account = process.env.TEALIUM_ACCOUNT || '';
    const profile = process.env.TEALIUM_PROFILE || '';
    const engineId = process.env.TEALIUM_ENGINE_ID || '';
    const apiKey = process.env.TEALIUM_MOMENTS_API_KEY || '';
    const datasourceKey = process.env.TEALIUM_DATASOURCE_KEY || '';

    // Return masked env var info
    return NextResponse.json({
      env_vars_configured: {
        TEALIUM_ACCOUNT: account ? `${account}` : 'Not configured',
        TEALIUM_PROFILE: profile ? `${profile}` : 'Not configured',
        TEALIUM_ENGINE_ID: engineId ? `${engineId.substring(0, 5)}...${engineId.substring(engineId.length - 5)}` : 'Not configured',
        TEALIUM_MOMENTS_API_KEY: apiKey ? `${apiKey.substring(0, 3)}...${apiKey.substring(apiKey.length - 3)} (${apiKey.length} chars)` : 'Not configured',
        TEALIUM_DATASOURCE_KEY: datasourceKey ? `${datasourceKey.substring(0, 3)}...${datasourceKey.substring(datasourceKey.length - 3)} (${datasourceKey.length} chars)` : 'Not configured',
      },
      expected_values: {},
      check_passed: {
        account: account !== '',
        profile: profile !== '',
        engineId: !!engineId,
        apiKey: apiKey.length > 10,
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
