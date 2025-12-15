/**
 * Utility functions for generating unique message identifiers
 * 
 * Ensures that each message gets a truly unique GUID that can be used
 * for tracking and updating chat transcripts.
 */

/**
 * Generate a unique message identifier using GUID format
 * 
 * @returns Unique GUID string
 */
export function generateUniqueMessageId(): string {
  return generateUUID();
}

/**
 * Generate a UUID v4 (RFC 4122 compliant)
 * 
 * @returns UUID v4 string
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
