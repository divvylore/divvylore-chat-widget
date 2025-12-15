/**
 * Advanced MCP connectivity diagnostics
 * 
 * This utility provides detailed connectivity testing with the MCP server,
 * helping to identify any network, CORS, or authentication issues.
 */

import { mcpFetch } from '../utils/mcpFetch';

/**
 * Results from a connectivity test
 */
export interface ConnectivityTestResult {
  success: boolean;
  stage: string;
  message: string;
  details?: any;
  latencyMs?: number;
}

/**
 * Options for MCP connectivity diagnostics
 */
export interface MCPDiagnosticsOptions {
  endpoint: string;
  apiKey?: string;
  orgId: string;
  timeoutMs?: number;
  runAllTests?: boolean;
  headers?: Record<string, string>;
  paths?: {
    health?: string;
    chat?: string;
    chatStream?: string;
  };
}

/**
 * Run comprehensive connectivity diagnostics against an MCP endpoint
 * 
 * @param options Diagnostics options
 * @returns Array of test results
 */
export async function runMCPDiagnostics(
  options: MCPDiagnosticsOptions
): Promise<ConnectivityTestResult[]> {
  const results: ConnectivityTestResult[] = [];
  const { endpoint, apiKey, orgId, timeoutMs = 10000, runAllTests = true } = options;
    // Remove trailing slash if present
  const baseUrl = endpoint.replace(/\/$/, '');
  
  // Get paths from options or use defaults
  const paths = options.paths || {};
  const healthPath = paths.health || '/api/health';
  const chatPath = paths.chat || '/api/chat';
  const chatStreamPath = paths.chatStream || '/api/chat/stream';
  
  console.log('Starting comprehensive MCP diagnostics');
  console.log(`Endpoint: ${baseUrl}`);
  console.log(`Organization: ${orgId}`);
  
  // Test 1: Basic connectivity to the server (DNS resolution, TCP connection)
  try {    console.log('Test 1: Basic connectivity test');    const startTime = Date.now();
    
    const basicResult = await mcpFetch(`${baseUrl}${healthPath}`, {
      method: 'GET',
      timeoutMs,
      maxRetries: 1
    });
    
    const latency = Date.now() - startTime;
    
    results.push({
      success: basicResult.ok,
      stage: 'basic-connectivity',
      message: basicResult.ok 
        ? `Successfully connected to MCP server. Status: ${basicResult.status}` 
        : `Connection succeeded but returned status ${basicResult.status}`,
      details: {
        status: basicResult.status,
        statusText: basicResult.statusText
      },
      latencyMs: latency
    });
    
    console.log(`  Result: ${results[0].success ? 'Success' : 'Failed'} (${latency}ms)`);
    
    // If this test fails and we're not running all tests, exit early
    if (!results[0].success && !runAllTests) {
      return results;
    }
  } catch (error) {
    results.push({
      success: false,
      stage: 'basic-connectivity',
      message: `Failed to connect to MCP server: ${error instanceof Error ? error.message : String(error)}`,
      details: { error }
    });
    console.log(`  Result: Failed - ${error instanceof Error ? error.message : String(error)}`);
    
    if (!runAllTests) {
      return results;
    }
  }
  
  // Test 2: Authentication test
  if (apiKey) {
    try {
      console.log('Test 2: Authentication test');
      const startTime = Date.now();
        const authResult = await mcpFetch(`${baseUrl}${healthPath}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          ...(options.headers || {})
        },
        timeoutMs
      });
      
      const latency = Date.now() - startTime;
      
      results.push({
        success: authResult.status !== 401 && authResult.status !== 403,
        stage: 'authentication',
        message: authResult.ok 
          ? 'Authentication successful' 
          : `Authentication test returned status ${authResult.status}`,
        details: {
          status: authResult.status,
          statusText: authResult.statusText
        },
        latencyMs: latency
      });
      
      console.log(`  Result: ${results[results.length - 1].success ? 'Success' : 'Failed'} (${latency}ms)`);
      
      // If auth fails and we're not running all tests, exit early
      if (!results[results.length - 1].success && !runAllTests) {
        return results;
      }
    } catch (error) {
      results.push({
        success: false,
        stage: 'authentication',
        message: `Authentication test failed: ${error instanceof Error ? error.message : String(error)}`,
        details: { error }
      });
      console.log(`  Result: Failed - ${error instanceof Error ? error.message : String(error)}`);
      
      if (!runAllTests) {
        return results;
      }
    }
  }
  
  // Test 3: Chat API endpoint test
  try {
    console.log('Test 3: Chat API endpoint test');
    const startTime = Date.now();
    
    // Create a minimal chat request
    const chatPayload = {
      prompt: 'test message',
      orgId: orgId,
      conversation: []
    };
      const chatResult = await mcpFetch(`${baseUrl}${chatPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {}),
        ...(options.headers || {})
      },
      body: JSON.stringify(chatPayload),
      timeoutMs: timeoutMs * 2 // Allow more time for actual chat request
    });
    
    const latency = Date.now() - startTime;
    
    let chatResponse;
    try {
      chatResponse = await chatResult.json();
    } catch (e) {
      chatResponse = { error: 'Failed to parse JSON response' };
    }
    
    results.push({
      success: chatResult.ok,
      stage: 'chat-api',
      message: chatResult.ok 
        ? 'Chat API endpoint successfully responded' 
        : `Chat API returned status ${chatResult.status}`,
      details: {
        status: chatResult.status,
        statusText: chatResult.statusText,
        response: chatResponse
      },
      latencyMs: latency
    });
    
    console.log(`  Result: ${results[results.length - 1].success ? 'Success' : 'Failed'} (${latency}ms)`);
  } catch (error) {
    results.push({
      success: false,
      stage: 'chat-api',
      message: `Chat API test failed: ${error instanceof Error ? error.message : String(error)}`,
      details: { error }
    });
    console.log(`  Result: Failed - ${error instanceof Error ? error.message : String(error)}`);
  }
  
  // Test 4: Stream API endpoint (if available)
  try {
    console.log('Test 4: Stream API endpoint test');
    const startTime = Date.now();
    
    // Create a minimal stream request
    const streamPayload = {
      prompt: 'test message',
      orgId: orgId,
      conversation: [],
      stream: true
    };
      const streamResult = await mcpFetch(`${baseUrl}${chatStreamPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {}),
        ...(options.headers || {})
      },
      body: JSON.stringify(streamPayload),
      timeoutMs: timeoutMs * 2 // Allow more time for streaming
    });
    
    const latency = Date.now() - startTime;
    
    results.push({
      success: streamResult.ok,
      stage: 'stream-api',
      message: streamResult.ok 
        ? 'Stream API endpoint is available' 
        : `Stream API returned status ${streamResult.status}`,
      details: {
        status: streamResult.status,
        statusText: streamResult.statusText,
        streamingSupported: streamResult.ok && streamResult.body !== null
      },
      latencyMs: latency
    });
    
    console.log(`  Result: ${results[results.length - 1].success ? 'Success' : 'Failed'} (${latency}ms)`);
    
    // Clean up the stream
    if (streamResult.body) {
      try {
        const reader = streamResult.body.getReader();
        reader.cancel();
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  } catch (error) {
    results.push({
      success: false,
      stage: 'stream-api',
      message: `Stream API test failed: ${error instanceof Error ? error.message : String(error)}`,
      details: { error }
    });
    console.log(`  Result: Failed - ${error instanceof Error ? error.message : String(error)}`);
  }
  
  console.log('MCP diagnostics completed');
  return results;
}

/**
 * Generate a summary report from diagnostic results
 * 
 * @param results Diagnostic test results
 * @returns A formatted summary string
 */
export function generateDiagnosticReport(results: ConnectivityTestResult[]): string {
  const successCount = results.filter(r => r.success).length;
  const totalTests = results.length;
  
  let report = `# MCP Connectivity Diagnostic Report\n\n`;
  report += `## Summary\n`;
  report += `- ${successCount}/${totalTests} tests passed\n`;
  report += `- Overall status: ${successCount === totalTests ? '✅ Good' : '❌ Issues detected'}\n\n`;
  
  report += `## Test Results\n\n`;
  
  for (const result of results) {
    report += `### ${result.stage.toUpperCase()}\n`;
    report += `- Status: ${result.success ? '✅ Success' : '❌ Failed'}\n`;
    report += `- Message: ${result.message}\n`;
    
    if (result.latencyMs !== undefined) {
      report += `- Latency: ${result.latencyMs}ms\n`;
    }
    
    if (result.details) {
      report += `- Details:\n\`\`\`\n${JSON.stringify(result.details, null, 2)}\n\`\`\`\n`;
    }
    
    report += `\n`;
  }
  
  return report;
}

/**
 * Primary function to run diagnostics and get a formatted report
 * 
 * @param options Diagnostics options
 * @returns Formatted diagnostic report
 */
export async function diagnoseAndReportMCPConnection(
  options: MCPDiagnosticsOptions
): Promise<string> {
  const results = await runMCPDiagnostics(options);
  return generateDiagnosticReport(results);
}
