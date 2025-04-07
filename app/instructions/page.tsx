'use client';

import React from 'react';
import Link from 'next/link';

export default function InstructionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-teal-700 mb-4">Tealium Moments API Integration Guide</h1>
          <p className="text-lg text-gray-600">Personalizing Customer Experiences with Real-Time Visitor Data</p>
        </header>
        
        <nav className="mb-10 bg-white p-4 rounded-lg shadow-sm">
          <h2 className="font-semibold text-lg mb-2">Quick Navigation</h2>
          <ul className="flex flex-wrap gap-4">
            <li><a href="#overview" className="text-teal-600 hover:underline">Overview</a></li>
            <li><a href="#value" className="text-teal-600 hover:underline">Business Value</a></li>
            <li><a href="#architecture" className="text-teal-600 hover:underline">Architecture</a></li>
            <li><a href="#configuration" className="text-teal-600 hover:underline">Configuration</a></li>
            <li><a href="#mcp" className="text-teal-600 hover:underline">MCP Implementation</a></li>
            <li><a href="#installation" className="text-teal-600 hover:underline">Installation</a></li>
            <li><a href="#use-cases" className="text-teal-600 hover:underline">Use Cases</a></li>
          </ul>
        </nav>
        
        <main className="bg-white rounded-lg shadow-sm p-6 mb-10">
          <section id="overview" className="mb-10">
            <h2 className="text-2xl font-bold text-teal-700 mb-4">Project Overview</h2>
            <p className="mb-4">
              This project demonstrates a powerful integration between an AI-powered chatbot and Tealium's Customer Data Platform,
              specifically leveraging the Moments API to deliver personalized customer experiences in real-time.
            </p>
            <p className="mb-4">
              The application showcases how marketing teams can transform customer interactions by seamlessly accessing visitor
              profiles stored in Tealium and using that data to create contextually relevant conversations.
            </p>
            <div className="bg-teal-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Key Features:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Real-time visitor profile lookup using email identifiers</li>
                <li>Personalized chatbot responses based on visitor data</li>
                <li>Support for anonymous browsing when no visitor data is available</li>
                <li>Seamless integration with Tealium's Moments API</li>
                <li>Fully customizable response patterns based on visitor attributes</li>
              </ul>
            </div>
          </section>
          
          <section id="value" className="mb-10">
            <h2 className="text-2xl font-bold text-teal-700 mb-4">Business Value</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">For Marketers</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Create highly personalized customer conversations without coding</li>
                  <li>Leverage existing customer data from Tealium in real-time</li>
                  <li>Deliver consistent experiences across touchpoints</li>
                  <li>Increase conversion rates with contextually relevant interactions</li>
                  <li>Build deeper customer relationships through personalization</li>
                </ul>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">For Business</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Maximize ROI from existing Tealium CDP investment</li>
                  <li>Reduce customer service costs through automated self-service</li>
                  <li>Improve customer satisfaction with personalized experiences</li>
                  <li>Gain competitive advantage through real-time personalization</li>
                  <li>Drive higher customer lifetime value (CLV)</li>
                </ul>
              </div>
            </div>
          </section>
          
          <section id="architecture" className="mb-10">
            <h2 className="text-2xl font-bold text-teal-700 mb-4">How It Works</h2>
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Architecture Overview</h3>
              <p className="mb-4">
                The application follows a modern architecture pattern using Next.js for server and client components,
                with dedicated API routes for secure communication with the Tealium Moments API.
              </p>
              
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <h4 className="font-semibold mb-2">Data Flow:</h4>
                <ol className="list-decimal list-inside space-y-2">
                  <li>User enters their email identifier in the chatbot interface</li>
                  <li>Application makes a secure server-side request to Tealium Moments API</li>
                  <li>Visitor profile data is retrieved and stored in the application context</li>
                  <li>Chatbot responses are dynamically personalized based on the visitor data</li>
                  <li>Interactions are tracked back to Tealium for closed-loop analytics</li>
                </ol>
              </div>
              
              <p>
                This architecture ensures that sensitive API keys remain secure on the server side while still allowing
                for real-time personalization in the client-facing chatbot interface.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">Key Components</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold">Chatbot Interface</h4>
                  <p className="text-sm">React-based UI component that handles user interactions and displays responses</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold">Tealium API Integration</h4>
                  <p className="text-sm">Server-side API routes for secure communication with Tealium's Moments API</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold">Response Generator</h4>
                  <p className="text-sm">Logic for crafting personalized responses based on visitor data</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold">Visitor Context Manager</h4>
                  <p className="text-sm">State management for visitor data across the application</p>
                </div>
              </div>
            </div>
          </section>
          
          <section id="configuration" className="mb-10">
            <h2 className="text-2xl font-bold text-teal-700 mb-4">Configuration Guide</h2>
            
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Tealium Configuration</h3>
              <p className="mb-2">To use this integration, you'll need to configure your Tealium account settings:</p>
              
              <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold mb-2">Required Tealium Settings:</h4>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 font-medium">TEALIUM_ACCOUNT</td>
                      <td className="py-2">Your Tealium account name (e.g., 'your-company')</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium">TEALIUM_PROFILE</td>
                      <td className="py-2">Your Tealium profile name (e.g., 'main')</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium">TEALIUM_ENGINE_ID</td>
                      <td className="py-2">Your personalization engine ID (UUID format)</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-medium">TEALIUM_MOMENTS_API_KEY</td>
                      <td className="py-2">Your Tealium API key with Moments API access</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                These settings are configured in your environment variables (.env.local file) for security.
              </p>
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Chatbot Configuration</h3>
              <p className="mb-4">
                The chatbot can be configured to respond to different user inputs based on visitor data.
                This is done by modifying the response patterns in the <code>fixed-responses.ts</code> file.
              </p>
              
              <div className="bg-gray-100 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Tealium Attribute Mapping:</h4>
                <p className="mb-2">The integration uses numeric attribute IDs mapped to human-readable names:</p>
                <pre className="bg-gray-800 text-white p-3 rounded text-sm overflow-x-auto">
{`// Properties
'5290': 'LastName',
'5294': 'FirstName',
'5349': 'OriginAirport',
'5351': 'DestinationAirport',

// Metrics
'5019': 'BookingValue',
'5298': 'FlightsBooked', 
'5324': 'TotalSpend'`}
                </pre>
                <p className="mt-2 text-sm">Customize these mappings based on your Tealium attribute IDs.</p>
              </div>
            </div>
          </section>
          
          <section id="mcp" className="mb-10">
            <h2 className="text-2xl font-bold text-teal-700 mb-4">MCP Implementation</h2>
            <p className="mb-4">
              This project leverages Tealium's MCP (Model Context Protocol) to enable real-time visitor data access
              directly from your web applications.
            </p>
            
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              <h3 className="font-semibold mb-2">What is MCP?</h3>
              <p>
                Model Context Protocol (MCP) is Tealium's approach to making visitor profile data accessible
                in real-time for personalization use cases, without requiring complex data pipelines or 
                infrastructure. It allows developers to query visitor data directly through APIs.
              </p>
            </div>
            
            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-2">MCP Components in This Project:</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <span className="font-medium">API Routes</span>: Dedicated server-side endpoints for communicating with Tealium
                  <ul className="list-disc ml-8 mt-1">
                    <li>email-lookup: For finding visitors by email</li>
                    <li>direct-test: For testing API connectivity</li>
                    <li>proxy: For secure communication with Tealium</li>
                  </ul>
                </li>
                <li>
                  <span className="font-medium">Moments Service</span>: A utility service that handles Tealium API communication
                </li>
                <li>
                  <span className="font-medium">Visitor Context</span>: State management for storing and accessing visitor data
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">Technical Implementation</h3>
              <p className="mb-4">
                The MCP implementation is built using modern JavaScript/TypeScript for optimal performance and maintainability.
                Key technical aspects include:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Server-side API communication to protect API keys</li>
                <li>Client-side state management for real-time personalization</li>
                <li>Error handling and fallback strategies for reliability</li>
                <li>Type-safe interactions with the Tealium API</li>
              </ul>
            </div>
          </section>
          
          <section id="installation" className="mb-10">
            <h2 className="text-2xl font-bold text-teal-700 mb-4">Installation Guide</h2>
            
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Prerequisites</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Node.js (v16 or higher)</li>
                <li>npm or yarn package manager</li>
                <li>A Tealium account with Moments API access</li>
              </ul>
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Installation Steps</h3>
              <ol className="list-decimal list-inside space-y-3">
                <li>
                  <p className="font-medium">Clone the repository</p>
                  <pre className="bg-gray-800 text-white p-3 rounded text-sm mt-2 overflow-x-auto">
                    git clone https://github.com/your-org/tealium-mcp-integration.git
                  </pre>
                </li>
                
                <li>
                  <p className="font-medium">Install dependencies</p>
                  <pre className="bg-gray-800 text-white p-3 rounded text-sm mt-2 overflow-x-auto">
                    cd tealium-mcp-integration
                    npm install
                  </pre>
                </li>
                
                <li>
                  <p className="font-medium">Create a .env.local file with your Tealium configuration</p>
                  <pre className="bg-gray-800 text-white p-3 rounded text-sm mt-2 overflow-x-auto">
{`TEALIUM_ACCOUNT=your-account
TEALIUM_PROFILE=your-profile
TEALIUM_ENGINE_ID=your-engine-id
TEALIUM_MOMENTS_API_KEY=your-api-key`}
                  </pre>
                </li>
                
                <li>
                  <p className="font-medium">Start the development server</p>
                  <pre className="bg-gray-800 text-white p-3 rounded text-sm mt-2 overflow-x-auto">
                    npm run dev
                  </pre>
                </li>
                
                <li>
                  <p className="font-medium">Open your browser to <code>http://localhost:3000/chatbot</code> to see the chatbot in action</p>
                </li>
              </ol>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">Deployment</h3>
              <p className="mb-4">
                This application can be deployed to any hosting service that supports Next.js applications, such as
                Vercel, Netlify, or any cloud provider.
              </p>
              <p>
                Be sure to configure your environment variables in your hosting provider's dashboard to ensure
                secure access to the Tealium API.
              </p>
            </div>
          </section>
          
          <section id="use-cases" className="mb-10">
            <h2 className="text-2xl font-bold text-teal-700 mb-4">Business Use Cases</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">E-commerce</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Personalized product recommendations based on browsing history</li>
                  <li>Tailored support responses based on purchase history</li>
                  <li>Customized promotional offers based on customer segment</li>
                  <li>Cart abandonment recovery with personalized incentives</li>
                </ul>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">Travel & Hospitality</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Personalized travel recommendations based on past bookings</li>
                  <li>Loyalty tier-specific offers and information</li>
                  <li>Customized itinerary suggestions based on preferences</li>
                  <li>Targeted upsells based on previous travel patterns</li>
                </ul>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">Financial Services</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Product recommendations based on financial profile</li>
                  <li>Personalized financial advice based on portfolio</li>
                  <li>Tailored educational content based on financial literacy</li>
                  <li>Life-event triggered recommendations</li>
                </ul>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">Media & Entertainment</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Content recommendations based on viewing history</li>
                  <li>Subscription level-specific support responses</li>
                  <li>Personalized content discovery experiences</li>
                  <li>Targeted upsell opportunities based on engagement</li>
                </ul>
              </div>
            </div>
          </section>
        </main>
        
        <footer className="text-center text-gray-600 text-sm">
          <p className="mb-2">Ready to experience the chatbot in action?</p>
          <Link href="/chatbot" className="inline-block bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors">
            Try the Demo Chatbot
          </Link>
          <p className="mt-6"> 2025 Tealium Moments API Integration Demo</p>
        </footer>
      </div>
    </div>
  );
}
