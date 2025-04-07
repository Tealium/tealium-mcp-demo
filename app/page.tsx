import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-slate-50">
      <div className="max-w-3xl w-full text-center">
        <h1 className="text-4xl font-bold mb-8">Tealium MCP Ingestion App</h1>
        
        {/* Prominent instructions link */}
        <Link href="/instructions" className="block bg-teal-600 hover:bg-teal-700 text-white p-6 rounded-lg shadow-lg transition-all hover:shadow-xl mb-8">
          <h2 className="text-2xl font-bold mb-2">📖 Project Instructions</h2>
          <p>Learn about the project's goals, value, configuration, and technical details</p>
        </Link>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link href="/chatbot" className="block bg-purple-600 hover:bg-purple-700 text-white p-8 rounded-lg shadow-lg transition-all hover:shadow-xl">
            <h2 className="text-2xl font-bold mb-2">AI Chatbot</h2>
            <p>Interactive chatbot with Tealium visitor context integration</p>
          </Link>
          
          <Link href="/tealium-config" className="block bg-blue-600 hover:bg-blue-700 text-white p-8 rounded-lg shadow-lg transition-all hover:shadow-xl">
            <h2 className="text-2xl font-bold mb-2">Tealium Config</h2>
            <p>Configure and test Tealium MCP data transmission</p>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/ai-model-config" className="block bg-green-600 hover:bg-green-700 text-white p-8 rounded-lg shadow-lg transition-all hover:shadow-xl">
            <h2 className="text-2xl font-bold mb-2">AI Model Config</h2>
            <p>Configure AI model settings for Tealium integration</p>
          </Link>
          
          <Link href="/ai-model-debug" className="block bg-amber-600 hover:bg-amber-700 text-white p-8 rounded-lg shadow-lg transition-all hover:shadow-xl">
            <h2 className="text-2xl font-bold mb-2">Debug Tools</h2>
            <p>Debug and test the Tealium API connections</p>
          </Link>
        </div>
        
        <p className="mt-8 text-gray-600">
          This application provides tools for integrating AI chatbots with Tealium's visitor data platform
        </p>
      </div>
    </main>
  );
}