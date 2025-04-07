/**
 * Fixed responses for chatbot when no AI service is available
 * This provides a basic fallback to ensure the chatbot always responds
 */

// Mapping of Tealium attribute IDs to human-readable names
const ATTRIBUTE_MAP = {
  // Properties
  '5290': 'LastName',
  '5294': 'FirstName',
  '5349': 'OriginAirport',
  '5351': 'DestinationAirport',
  
  // Metrics
  '5019': 'BookingValue',
  '5298': 'FlightsBooked',
  '5324': 'TotalSpend',
  '5387': 'CanceledBookings',
  '5389': 'ChangedBookings',
  
  // Flags
  '27': 'HasMarketingConsent',
  '5330': 'HasBookedWithChildren'
};

export const getFixedResponse = (message: string, context?: any): string => {
  const lowerMessage = message.toLowerCase().trim();
  
  // More detailed logging to help debug what's happening 
  console.log('getFixedResponse input:', { message, contextType: typeof context, hasContext: !!context });
  if (context) {
    console.log('Context details:', { 
      keys: Object.keys(context), 
      hasProperties: !!context.properties,
      propertyKeys: context.properties ? Object.keys(context.properties) : [],
      firstName: context.properties?.['5294']
    });
  }
  
  // Check for greetings
  if (lowerMessage.match(/^(hi|hello|hey|howdy|greetings)/)) {
    // Use first name if available
    if (context && context.properties && context.properties['5294']) {
      return `Hello ${context.properties['5294']}! I'm your AI assistant. How can I help you today?`;
    }
    return "Hello! I'm your AI assistant. How can I help you today?";
  }
  
  // Check for flight-related queries
  if (lowerMessage.includes('flight') || 
      lowerMessage.includes('booking') || 
      lowerMessage.includes('reservation')) {
    
    if (context && context.properties) {
      const origin = context.properties['5349'];
      const destination = context.properties['5351'];
      
      if (origin && destination) {
        return `I can see you're interested in flights from ${origin} to ${destination}. Would you like to check availability or get more information about this route?`;
      }
    }
    return "I can help you with flight information, bookings, and reservations. Do you have a specific question about a flight?";
  }
  
  // Check for loyalty/status queries
  if (lowerMessage.includes('loyalty') || 
      lowerMessage.includes('status') || 
      lowerMessage.includes('points') ||
      lowerMessage.includes('tier') ||
      lowerMessage.includes('rewards')) {
    
    if (context && context.metrics) {
      const totalSpend = context.metrics['5324'] ? `€${context.metrics['5324'].toFixed(2)}` : 'not available';
      const flightsBooked = context.metrics['5298'] || 0;
      
      return `Based on your profile, you've booked ${flightsBooked} flights with a total spend of ${totalSpend}. Keep flying with us to enjoy more rewards and benefits!`;
    }
    return "I can provide information about your loyalty status and available rewards. For personalized information, please ensure you're logged in.";
  }
  
  // Check for profile/account questions
  if (lowerMessage.includes('profile') || 
      lowerMessage.includes('account') || 
      lowerMessage.includes('my info') ||
      lowerMessage.includes('my information') ||
      lowerMessage.includes('who am i')) {
    
    console.log('Detected profile request with context:', context);
    
    if (context && Object.keys(context).length > 0) {
      let response = "Here's what I know about you:\n";
      
      if (context.properties) {
        // Handle properties with numeric IDs
        const firstName = context.properties['5294'] || 'Not available';
        const lastName = context.properties['5290'] || 'Not available';
        
        response += `\nName: ${firstName} ${lastName}`;
        
        if (context.properties['5349'] && context.properties['5351']) {
          response += `\nYou've shown interest in flights from ${context.properties['5349']} to ${context.properties['5351']}`;
        }
      }
      
      if (context.audiences && context.audiences.length > 0) {
        response += "\nCustomer segment: " + context.audiences.join(', ');
      }
      
      if (context.badges && context.badges.length > 0) {
        response += "\nPreferences: " + context.badges.join(', ');
      }
      
      if (context.metrics) {
        if (context.metrics['5298']) {
          response += `\nFlights booked: ${context.metrics['5298']}`;
        }
        if (context.metrics['5324']) {
          response += `\nTotal spend: €${context.metrics['5324'].toFixed(2)}`;
        }
      }
      
      return response;
    } else {
      return "I don't have specific information about your profile at the moment. You can ask me about flights, bookings, or general assistance.";
    }
  }
  
  // Check for help request
  if (lowerMessage.includes('help') || 
      lowerMessage === 'menu' || 
      lowerMessage === 'options' ||
      lowerMessage.includes('can you do') ||
      lowerMessage.includes('what do you do')) {
    return "I can help you with:\n\n- Flight information and bookings\n- Loyalty program status and rewards\n- Account information\n- Travel recommendations\n\nWhat would you like assistance with today?";
  }
  
  // Check for thanks/goodbye
  if (lowerMessage.match(/^(thanks|thank you|great|awesome|goodbye|bye)/)) {
    return "You're welcome! Is there anything else I can help you with today?";
  }
  
  // Default response with personalization if available
  if (context && context.properties && context.properties['5294']) {
    return `I'm here to help with your travel needs, ${context.properties['5294']}. You can ask about flights, loyalty status, or account information. How can I assist you today?`;
  }
  
  // Generic default response
  return "I'm here to help with your travel and booking needs. You can ask about flights, loyalty status, or account information. How can I assist you today?";
};
