# Chatbot Workflow Requirements

## Overview

This document outlines the comprehensive workflow for the Tealium-integrated chatbot system. The chatbot is designed to provide personalized responses by leveraging user identification and context retrieval through Tealium's data platform. This document serves as a reference for developers implementing and maintaining the chatbot functionality.

## Workflow Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│      Step 1     │     │      Step 2     │     │      Step 3     │     │      Step 4     │
│       User      │     │      Query      │     │     Tealium     │     │     Context     │
│  Identification ├────►│      Input      ├────►│   Visitor ID    ├────►│    Retrieval    │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
                                                                                │
                                                                                ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│      Step 7     │     │      Step 6     │     │      Step 5     │
│     Response    │     │      Model      │     │     Context     │
│     Display     │◄────┤     Response    │◄────┤    Attribute    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Detailed Workflow Steps

### 1. User Identification

- **Purpose**: Determine if the user is known or anonymous to provide appropriate context.
- **Process**:
  - The system checks if the user is already identified (known customer).
  - If anonymous, the chatbot prompts the user to provide an email address or phone number.
  - If the user declines to provide an identifier (by typing "anonymous" or "no"), the chatbot will continue with generic, non-personalized responses.
- **Technical Implementation**:
  - Track user identification status with state variables (`userEmail`, `userDeclinedIdentification`).
  - Display appropriate identification prompts in the chat interface.
  - Store provided identifiers securely for the session.

### 2. User Query Input

- **Purpose**: Capture the user's question or request.
- **Process**:
  - User inputs a query via the chatbot interface.
  - The query is captured and prepared for processing.
- **Technical Implementation**:
  - Input field for query submission.
  - Front-end validation to ensure non-empty queries.
  - Query preprocessing (e.g., trimming, basic formatting).

### 3. Tealium Visitor ID Check

- **Purpose**: Determine if contextual information is available for the user.
- **Process**:
  - The system checks for an existing Tealium visitor ID associated with the user.
  - If a visitor ID exists, proceed to context retrieval.
  - If no visitor ID exists, proceed with generic model response.
- **Technical Implementation**:
  - API call to Tealium to check for existing visitor ID.
  - Handling of visitor ID lookup failures gracefully.
  - Logging and monitoring of visitor ID check processes.

### 4. Context Retrieval (if Visitor ID exists)

- **Purpose**: Gather contextual information about the user to enhance responses.
- **Process**:
  - If a visitor ID is found, the system retrieves additional context attributes using one of two methods:
    - **Tealium Functions API**: Server-side JavaScript environment for visitor data processing.
    - **Tealium Moments API**: API for real-time user journey insights.
- **Technical Implementation**:
  - API integration with either Tealium Functions or Moments API.
  - Configuration settings to select the preferred API method.
  - Error handling and fallback mechanisms.

#### Tealium Functions API

Tealium Functions provides a serverless JavaScript environment for processing visitor data:

- **Key Benefits**:
  - Direct access to complete visitor profiles
  - Flexible JavaScript environment
  - Event-driven architecture
  - Powerful data transformation capabilities

- **Implementation Example**:
```javascript
// In your Tealium Function
export function onVisitorEvent(event, visitor) {
  // Check if this is a model query event
  if (event.data.event_name === 'ai_model_query') {
    
    // Extract visitor context
    const context = {
      segments: visitor.audiences.map(a => a.name),
      attributes: {
        lifetime_value: visitor.getAttributeValue('lifetime_value'),
        product_preferences: visitor.getAttributeValue('product_preferences'),
        recent_purchases: visitor.getAttributeValue('recent_purchases')
      }
    };
    
    // Return context to be used with model
    return context;
  }
}
```

#### Tealium Moments API

Tealium Moments API focuses on real-time interaction based on visitor behavior patterns:

- **Key Benefits**:
  - Real-time behavioral insights
  - Journey-focused capabilities
  - Predefined triggers based on behavior patterns
  - Direct API for insights

- **Implementation Example**:
```javascript
// Request to Moments API
const momentsRequest = {
  account: "your-account",
  profile: "your-profile",
  visitor_id: "visitor-123",
  events: [{
    name: "ai_model_query",
    data: {
      query_text: "What products would you recommend?",
      timestamp: new Date().toISOString()
    }
  }]
};

// Process Moments API response
const processResponse = (response) => {
  return {
    visitorContext: response.visitor_context,
    segments: response.visitor_context.segments,
    preferences: response.visitor_context.preferences
  };
};
```

### 5. Context Attribute Provision

- **Purpose**: Prepare and format the retrieved context for use by the chatbot model.
- **Process**:
  - The chosen Tealium API delivers relevant context attributes based on the visitor ID.
  - Context attributes are formatted appropriately for the model.
- **Technical Implementation**:
  - Processing of raw API responses into structured context objects.
  - Filtering of irrelevant attributes.
  - Transformation of attributes into model-compatible format.
  - Caching mechanisms for performance optimization.

### 6. Model Response Generation with Context

- **Purpose**: Generate a contextually relevant response to the user's query.
- **Process**:
  - The chatbot model generates a response using:
    - The user's original query
    - The context attributes retrieved from Tealium (if available)
    - For anonymous users, only the query is used (no personalized context)
- **Technical Implementation**:
  - AI model integration with appropriate context injection.
  - Response scoring and quality checks.
  - Fallback mechanisms for context-free responses.
  - Performance monitoring for response generation.

### 7. Response Display and Tealium Collection

- **Purpose**: Present the response to the user and log the interaction data.
- **Process**:
  - The generated response is displayed to the user in the chat interface.
  - Tealium collects data about the interaction for analytics and future personalization.
- **Technical Implementation**:
  - UI rendering of model responses.
  - Tracking implementation for all chat interactions.
  - Data collection for:
    - Query details (text, timestamp, etc.)
    - Response details (text, generation time, etc.)
    - Context used (what attributes influenced the response)
    - User identifiers (if available)

## Implementation Considerations

### API Selection: Functions vs. Moments

When deciding between Tealium Functions API and Moments API, consider:

| Tealium Functions API | Tealium Moments API |
|------------------------|---------------------|
| Preferred for comprehensive visitor data | Preferred for behavioral journey insights |
| Better for complex data transformations | Better for audience-based personalization |
| Stateless request/response model | Real-time journey-focused model |
| Access to all visitor attributes | Focus on specific moments in user journey |
| More flexible programming environment | More streamlined API integration |

Choose Functions API when you need complete control over visitor data processing, and Moments API when focusing on specific behavioral triggers or journey milestones.

### Anonymous vs. Known User Handling

- **Known Users**:
  - Full personalization using Tealium context
  - Response customization based on user history and preferences
  - Consistent experience across sessions

- **Anonymous Users**:
  - Generic responses without personal context
  - Option to become identified during the chat session
  - Basic personalization based on current session only (if applicable)

### Data Collection Design

Tealium collects the following data points for each chatbot interaction:

- **Query Event**:
  - Query text
  - Timestamp
  - User ID (if identified)
  - Visitor ID
  - Session ID
  - Device/browser information

- **Response Event**:
  - Response text
  - Generation time/latency
  - Tokens used
  - Context attributes used
  - Model confidence score (if available)
  - Query ID (linking to the original query)

### Troubleshooting and Error Handling

- **Visitor ID Lookup Failures**:
  - Implement fallback to anonymous mode
  - Log errors for debugging
  - Provide user-friendly error messages

- **Context Retrieval Failures**:
  - Continue with limited or no context
  - Implement retry mechanisms
  - Log errors with Tealium API details

- **Model Response Failures**:
  - Provide predefined fallback responses
  - Inform users of temporary issues
  - Implement circuit breakers for persistent failures

## Configuration Requirements

To implement this workflow, the following configuration options should be available:

- Tealium account details (account, profile, data source key)
- API selection (Functions vs Moments)
- Engine ID for Moments API
- Visitor context toggle (enable/disable)
- Model configuration (platform, model name, version, type)
- Identification requirements settings

## Conclusion

This document outlines the complete 7-step workflow for the Tealium-integrated chatbot system. By following this workflow, developers can implement a chatbot that leverages user context through Tealium to provide personalized responses while gracefully handling anonymous users. 