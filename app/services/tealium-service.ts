/**
 * Tealium Service - Client-side utility for sending events to Tealium
 * Uses the server-side API endpoint to handle credential management securely
 */

// Types for the event data
export interface TealiumEventData {
  [key: string]: any;
}

export interface TealiumEvent {
  email?: string;
  customVisitorId?: string; 
  eventName: string;
  eventData?: TealiumEventData;
}

/**
 * Send an event to Tealium via the server-side API
 * @param event The event details to send
 * @returns Promise with the API response
 */
export async function sendTealiumEvent(event: TealiumEvent): Promise<{
  success: boolean;
  visitorId?: string;
  error?: string;
  details?: any;
}> {
  // Validate required fields
  if (!event.eventName) {
    console.error('Tealium event requires an eventName');
    return { 
      success: false, 
      error: 'Event name is required' 
    };
  }

  if (!event.email && !event.customVisitorId) {
    console.warn('Tealium event should have either email or visitorId for tracking');
  }

  try {
    // Call the server-side API endpoint
    const response = await fetch('/api/tealium/moments/send-test-event', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        email: event.email,
        customVisitorId: event.customVisitorId,
        eventName: event.eventName,
        eventData: event.eventData || {}
      })
    });

    // Parse the response
    const result = await response.json();

    if (!response.ok) {
      console.error('Error sending event to Tealium:', result.error || response.statusText);
      return {
        success: false,
        error: result.error || 'Failed to send event',
        details: result
      };
    }

    // Return the successful result with visitor ID
    return {
      success: true,
      visitorId: result.visitorId,
      details: result
    };
  } catch (error) {
    console.error('Exception sending event to Tealium:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: { exception: error }
    };
  }
}

/**
 * Track a page view event
 * @param pageName Name of the page
 * @param email User email (optional)
 * @param additionalData Any additional data to include
 */
export async function trackPageView(
  pageName: string, 
  email?: string, 
  additionalData: TealiumEventData = {}
) {
  return sendTealiumEvent({
    email,
    eventName: 'page_view',
    eventData: {
      page_name: pageName,
      url: typeof window !== 'undefined' ? window.location.href : '',
      timestamp: new Date().toISOString(),
      ...additionalData
    }
  });
}

/**
 * Track a user action event
 * @param actionName Name of the action
 * @param email User email (optional)
 * @param additionalData Any additional data to include
 */
export async function trackUserAction(
  actionName: string,
  email?: string,
  additionalData: TealiumEventData = {}
) {
  return sendTealiumEvent({
    email,
    eventName: 'user_action',
    eventData: {
      action_name: actionName,
      timestamp: new Date().toISOString(),
      ...additionalData
    }
  });
}

/**
 * Track a form submission event
 * @param formName Name of the form
 * @param email User email (optional)
 * @param additionalData Any additional data to include
 */
export async function trackFormSubmission(
  formName: string,
  email?: string,
  additionalData: TealiumEventData = {}
) {
  return sendTealiumEvent({
    email,
    eventName: 'form_submit',
    eventData: {
      form_name: formName,
      timestamp: new Date().toISOString(),
      ...additionalData
    }
  });
}
