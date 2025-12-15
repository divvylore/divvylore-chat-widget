/**
 * Logger Test Utility
 * 
 * This file tests the logger behavior with different client configurations
 */

import { logger, updateLoggerConfig, LogLevel } from './src/utils/logger';

// Test configurations
const enterpriseConfig = {
  debug_mode: false,
  log_level: "error",
  log_categories: ["ERROR", "CONFIG"],
  show_timestamps: true
};

const techStartupConfig = {
  debug_mode: true,
  log_level: "debug",
  log_categories: ["CONFIG", "API", "UI", "SERVICE", "ANIMATION"],
  show_timestamps: true
};

console.log('=== Testing Logger Utility ===\n');

// Test 1: Enterprise Client (Should show minimal logs)
console.log('1. Testing Enterprise Client (debug_mode: false)');
updateLoggerConfig(enterpriseConfig);
console.log('Current config:', logger.getConfig());

logger.debug('This debug message should NOT appear');
logger.info('This info message should NOT appear');
logger.config('This config message should NOT appear');
logger.ui('This UI message should NOT appear');
logger.error('This error message SHOULD appear');

console.log('\n---\n');

// Test 2: Tech Startup Client (Should show all logs)
console.log('2. Testing Tech Startup Client (debug_mode: true)');
updateLoggerConfig(techStartupConfig);
console.log('Current config:', logger.getConfig());

logger.debug('This debug message SHOULD appear');
logger.info('This info message SHOULD appear');
logger.config('This config message SHOULD appear');
logger.ui('This UI message SHOULD appear');
logger.error('This error message SHOULD appear');

console.log('\n---\n');

// Test 3: Back to Enterprise (Should suppress logs again)
console.log('3. Back to Enterprise Client (debug_mode: false)');
updateLoggerConfig(enterpriseConfig);
console.log('Current config:', logger.getConfig());

logger.debug('This debug message should NOT appear');
logger.info('This info message should NOT appear');
logger.config('This config message should NOT appear');
logger.ui('This UI message should NOT appear');
logger.error('This error message SHOULD appear');

console.log('\n=== Test Complete ===');
