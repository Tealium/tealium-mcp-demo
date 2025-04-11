# Tealium MCP Ingestion App with AI Chatbot

## Core Purpose
The Tealium MCP Connector is a versatile tool designed to help any developer or business user send data to Tealium using the Model Context Protocol (MCP) format. It can be used with any application that needs to send customer data to Tealium, including AI-powered chatbots.

This application demonstrates integration between AI-powered chatbots and Tealium's customer data platform. It showcases how to personalize AI responses based on visitor context data from Tealium's ecosystem.

## How It Works

### Simple Configuration UI
A web-based form where users enter their Tealium account details:
- Tealium Account name
- Tealium Profile name
- Data Source Key

Optional fields for:
- Event Name (what type of event you're sending)
- User ID (to associate data with specific users)

### Data Transmission
- Formats data according to the MCP standard
- Sends the data to Tealium's EventStream API
- Reports back whether the transmission was successful

### Debug and Testing
Shows detailed information about:
- What data was sent
- The API response received
- Any errors that occurred

Helps users troubleshoot their Tealium integration

## Features

- **AI Chatbot with Tealium Integration**: A chatbot that leverages Tealium visitor data to provide personalized responses
- **Tealium Configuration UI**: Interface for configuring Tealium MCP (Model Context Protocol) data transmission
- **Dual Integration Options**: Support for both Tealium Functions and Moments API integrations
- **User Identification Flow**: Process to identify users and retrieve their profiles from Tealium
- **MCP-Compliant Data Transfer**: Standardized event tracking following Tealium's Model Context Protocol

## Use Cases (Beyond Chatbots)
This generic MCP connector can be used by:
- E-commerce platforms sending purchase events
- Marketing websites tracking user behavior
- Mobile apps logging user actions
- CRM systems updating customer profiles
- AI-powered systems for personalized experiences

## Architecture

The application follows a 7-step workflow for Tealium-integrated chatbots:

1. **User Identification**: Determine if the user is known or anonymous
2. **Query Input**: Capture the user's question or request
3. **Tealium Visitor ID Check**: Determine if contextual information is available
4. **Context Retrieval**: Gather user context from Tealium (if available)
5. **Context Attribute Provision**: Format the context for use by the AI model
6. **Model Response Generation**: Generate personalized responses using context
7. **Response Display & Collection**: Present the response and track the interaction

## Technologies Used

- **Next.js**: React framework for the frontend and API routes
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn UI**: Component library for the user interface
- **Tealium APIs**: 
  - Functions API for serverless processing of visitor data
  - Moments API for real-time user journey insights

## Project Structure

```
├── app/                 # Next.js application pages
│   ├── chatbot/         # Chatbot implementation
│   ├── tealium-config/  # Tealium configuration UI
│   └── api/             # API routes for Tealium integration
├── components/          # Reusable UI components
│   ├── ui/              # Basic UI elements
│   └── tealium/         # Tealium integration components
├── lib/                 # Utility functions and services
│   ├── tealium-service.ts      # Core Tealium integration
│   ├── functions-service.ts    # Tealium Functions API integration
│   └── moments-service.ts      # Tealium Moments API integration
└── requirements/        # Project requirements documentation
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Tealium account with EventStream access
- (Optional) Tealium Functions API access

### Installation

1. Clone the repository
   ```
   git clone https://github.com/Tealium/tealium-mcp-demo.git
   cd tealium-mcp-demo
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   - Create a `.env.local` file based on `.env.example`
   - Add your Tealium credentials

4. Start the development server
   ```
   npm run dev
   ```

5. Open your browser and navigate to http://localhost:3000

## Configuration

The Tealium configuration is centralized in the `properties` object in `lib/config.ts` and requires:

- **account**: Your Tealium account ID
- **profile**: The profile name in your Tealium account
- **dataSourceKey**: Your EventStream data source key
- **engineId**: (For Moments API) The engine ID for your Tealium instance
- **visitorApi**: Base URL for the Visitor API
- **sample data**: Sample values for testing (email, name, location, etc.)

This centralized configuration approach ensures that no personal or account information is hardcoded in the application code.

## Key Components

### Chatbot Implementation

The chatbot implements the full 7-step workflow from the requirements:

- Prompts users for identification (email or anonymous)
- Retrieves visitor context from Tealium when available
- Personalizes responses based on available context
- Tracks all interactions through Tealium for analytics

### Tealium Service

The core integration with Tealium's platform:

- `sendModelQuery`: Sends query events to Tealium when users ask questions
- `sendModelResponse`: Sends response events when AI responds
- `sendModelDeployment`: Tracks model deployment events

### Context Retrieval Services

Two methods for retrieving visitor context:

- **Functions Service**: Uses Tealium's serverless environment
- **Moments Service**: Uses Tealium's real-time user journey insights API

## API Integration

The app includes API endpoints that proxy requests to Tealium:

- `/api/tealium/functions`: Proxy for Tealium Functions API
- `/api/tealium/moments`: Proxy for Tealium Moments API

## Anonymous vs. Known User Handling

- **Known Users**: Receive personalized responses based on their Tealium profile
- **Anonymous Users**: Receive generic responses without personalization

## Extending the Application

To extend this application:

- **Add LLM Integration**: Replace the mock response generation with real LLM API calls
- **Additional Context Sources**: Integrate with other data sources beyond Tealium
- **Enhanced Personalization**: Implement more sophisticated personalization logic
- **User Authentication**: Add proper authentication for secure access to user data

## Acknowledgements

- Tealium for their customer data platform
- Shadcn UI for the component library
- The Next.js team for the framework
