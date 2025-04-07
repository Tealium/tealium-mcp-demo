// Script to check environment variables
console.log('=== Environment Variables Check ===');
console.log('PUBLIC ENV VARS:');
console.log(`NEXT_PUBLIC_TEALIUM_ACCOUNT: ${process.env.NEXT_PUBLIC_TEALIUM_ACCOUNT || '(not set)'}`);
console.log(`NEXT_PUBLIC_TEALIUM_PROFILE: ${process.env.NEXT_PUBLIC_TEALIUM_PROFILE || '(not set)'}`);
console.log(`NEXT_PUBLIC_TEALIUM_DATA_SOURCE_KEY: ${process.env.NEXT_PUBLIC_TEALIUM_DATA_SOURCE_KEY || '(not set)'}`);
console.log(`NEXT_PUBLIC_TEALIUM_ENGINE_ID: ${process.env.NEXT_PUBLIC_TEALIUM_ENGINE_ID || '(not set)'}`);

console.log('\nSERVER ENV VARS:');
console.log(`TEALIUM_ACCOUNT: ${process.env.TEALIUM_ACCOUNT || '(not set)'}`);
console.log(`TEALIUM_PROFILE: ${process.env.TEALIUM_PROFILE || '(not set)'}`);
console.log(`TEALIUM_DATASOURCE_KEY: ${process.env.TEALIUM_DATASOURCE_KEY || '(not set)'}`);
console.log(`TEALIUM_ENGINE_ID: ${process.env.TEALIUM_ENGINE_ID || '(not set)'}`);
