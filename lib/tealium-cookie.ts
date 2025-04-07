/**
 * Tealium Cookie Utilities
 * Functions for parsing Tealium cookies to extract visitor ID and other information
 * Based on implementation guide at: https://docs.tealium.com/server-side/moments-api/implementation/
 */

/**
 * Parse the utag_main cookie for Tealium utag.js 4.50+
 * @returns Object containing the cookie values
 */
export function parseUtagCookieModern(): Record<string, string> {
  if (typeof document === 'undefined' || !document.cookie) {
    return {};
  }
  
  const cookies = document.cookie.split("; ");
  return cookies.reduce((result: Record<string, string>, cookie) => {
    const kv = cookie.split("=");
    if (kv[0].startsWith("utag_")) {
      const cookie_name = kv[0].split("_")[1];
      const cookie_name_with_tag = "utag_" + cookie_name;
      const name_trimmed = kv[0].replace(cookie_name_with_tag + "_", "");
      result[name_trimmed] = String(kv[1]).replace(/%3b/g, ';');
    }
    return result;
  }, {});
}

/**
 * Parse the utag_main cookie for Tealium utag.js 4.49 and below
 * @returns The visitor ID or empty string if not found
 */
export function parseUtagCookieLegacy(): string {
  if (typeof document === 'undefined') {
    return '';
  }
  
  function getCookie(cname: string): string {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  // Extracting the visitor ID from the utag_main cookie
  const utag_cookie = getCookie("utag_main");
  if (!utag_cookie) return '';
  
  const parts = utag_cookie.split("v_id:");
  if (parts.length < 2) return '';
  
  return parts[1].split("$")[0] || "";
}

/**
 * Get the Tealium visitor ID from cookies
 * Tries both modern and legacy methods
 * @returns The visitor ID or null if not found
 */
export function getTealiumVisitorId(): string | null {
  // Try modern method first
  const modernCookies = parseUtagCookieModern();
  if (modernCookies.v_id) {
    return modernCookies.v_id;
  }
  
  // Fall back to legacy method
  const legacyId = parseUtagCookieLegacy();
  if (legacyId) {
    return legacyId;
  }
  
  return null;
}

/**
 * Get all visitor info from Tealium cookies
 * @returns Object with visitor information
 */
export function getTealiumVisitorInfo(): Record<string, any> {
  const modernCookies = parseUtagCookieModern();
  const legacyId = parseUtagCookieLegacy();
  
  return {
    visitorId: modernCookies.v_id || legacyId || null,
    sessionId: modernCookies.ses_id || null,
    isNewVisitor: modernCookies.is_new_visitor === '1',
    firstVisitTimestamp: modernCookies.v_first || null,
    lastVisitTimestamp: modernCookies.v_last || null
  };
} 