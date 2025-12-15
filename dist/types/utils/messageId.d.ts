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
export declare function generateUniqueMessageId(): string;
/**
 * Generate a UUID v4 (RFC 4122 compliant)
 *
 * @returns UUID v4 string
 */
export declare function generateUUID(): string;
