/**
 * Nusantara App Builder - REST & JSON API Service & Live API Tester
 * Phase 6: Secure endpoint execution, JSON response parser, and JSON path mapping.
 */

import { ApiEndpoint, ApiTestExecutionResult } from '../types';

export class ApiService {
  /**
   * Validates target URL for security (must be HTTP/HTTPS, reject dangerous schemes)
   */
  public static validateEndpointUrl(url: string): { isValid: boolean; isHttps: boolean; error?: string } {
    const trimmed = url.trim();
    if (!trimmed) {
      return { isValid: false, isHttps: false, error: 'Endpoint URL cannot be empty.' };
    }

    const lower = trimmed.toLowerCase();
    if (lower.startsWith('javascript:') || lower.startsWith('file:') || lower.startsWith('data:')) {
      return { isValid: false, isHttps: false, error: 'Dangerous URL scheme rejected for security.' };
    }

    try {
      const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
      return {
        isValid: true,
        isHttps: parsed.protocol === 'https:',
      };
    } catch {
      return { isValid: false, isHttps: false, error: 'Invalid URL format.' };
    }
  }

  /**
   * Executes a live API test request safely from the desktop IDE
   */
  public static async executeTestRequest(endpoint: ApiEndpoint): Promise<ApiTestExecutionResult> {
    const startTime = Date.now();
    const urlValidation = this.validateEndpointUrl(endpoint.url);

    if (!urlValidation.isValid) {
      return {
        timestamp: new Date().toISOString(),
        statusCode: 0,
        statusText: 'Validation Error',
        responseTimeMs: 0,
        headers: {},
        data: null,
        error: urlValidation.error || 'Invalid URL',
        isSuccess: false,
      };
    }

    // Build URL with query parameters
    let fullUrl = endpoint.url.startsWith('http') ? endpoint.url : `https://${endpoint.url}`;
    try {
      const urlObj = new URL(fullUrl);
      for (const qp of endpoint.queryParams) {
        if (qp.enabled && qp.key) {
          urlObj.searchParams.append(qp.key, qp.value);
        }
      }

      // Add API Key to query param if configured
      if (
        endpoint.authType === 'api_key' &&
        endpoint.authConfig.addTo === 'query' &&
        endpoint.authConfig.keyName &&
        endpoint.authConfig.keyValue
      ) {
        urlObj.searchParams.append(endpoint.authConfig.keyName, endpoint.authConfig.keyValue);
      }

      fullUrl = urlObj.toString();
    } catch (e) {
      return {
        timestamp: new Date().toISOString(),
        statusCode: 0,
        statusText: 'Malformed URL',
        responseTimeMs: 0,
        headers: {},
        data: null,
        error: (e as Error).message,
        isSuccess: false,
      };
    }

    // Build Headers
    const headers: Record<string, string> = {
      'Accept': 'application/json, text/plain, */*',
    };

    if (endpoint.bodyType === 'json' && endpoint.method !== 'GET') {
      headers['Content-Type'] = 'application/json';
    }

    for (const h of endpoint.headers) {
      if (h.enabled && h.key) {
        headers[h.key] = h.value;
      }
    }

    // Authentication headers
    if (endpoint.authType === 'bearer' && endpoint.authConfig.token) {
      headers['Authorization'] = `Bearer ${endpoint.authConfig.token}`;
    } else if (
      endpoint.authType === 'basic' &&
      (endpoint.authConfig.username || endpoint.authConfig.password)
    ) {
      const creds = btoa(`${endpoint.authConfig.username || ''}:${endpoint.authConfig.password || ''}`);
      headers['Authorization'] = `Basic ${creds}`;
    } else if (
      endpoint.authType === 'api_key' &&
      endpoint.authConfig.addTo === 'header' &&
      endpoint.authConfig.keyName &&
      endpoint.authConfig.keyValue
    ) {
      headers[endpoint.authConfig.keyName] = endpoint.authConfig.keyValue;
    }

    // Controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), endpoint.timeoutMs || 10000);

    try {
      const fetchOptions: RequestInit = {
        method: endpoint.method,
        headers,
        signal: controller.signal,
      };

      if (['POST', 'PUT', 'PATCH'].includes(endpoint.method) && endpoint.bodyContent) {
        fetchOptions.body = endpoint.bodyContent;
      }

      const response = await fetch(fullUrl, fetchOptions);
      clearTimeout(timeoutId);
      const responseTimeMs = Date.now() - startTime;

      const respHeaders: Record<string, string> = {};
      response.headers.forEach((val, key) => {
        respHeaders[key] = val;
      });

      const contentType = response.headers.get('content-type') || '';
      let parsedData: any = null;

      if (contentType.includes('application/json')) {
        try {
          parsedData = await response.json();
        } catch {
          parsedData = await response.text();
        }
      } else {
        parsedData = await response.text();
      }

      return {
        timestamp: new Date().toISOString(),
        statusCode: response.status,
        statusText: response.statusText,
        responseTimeMs,
        headers: respHeaders,
        data: parsedData,
        isSuccess: response.ok,
      };
    } catch (err) {
      clearTimeout(timeoutId);
      const responseTimeMs = Date.now() - startTime;
      const errorObj = err as Error;

      return {
        timestamp: new Date().toISOString(),
        statusCode: 0,
        statusText: errorObj.name === 'AbortError' ? 'Timeout' : 'Network Error',
        responseTimeMs,
        headers: {},
        data: null,
        error: errorObj.message || 'Request failed.',
        isSuccess: false,
      };
    }
  }

  /**
   * Safely resolves a JSON path string from an object (e.g. "data.users[0].name" or "data[]")
   */
  public static extractJsonPath(obj: any, path: string): any {
    if (!obj || !path) return obj;

    const cleanPath = path.replace(/\[(\w+)\]/g, '.$1').replace(/^\./, '');
    const segments = cleanPath.split('.');

    let current = obj;
    for (const seg of segments) {
      if (seg === '' || seg === '[]') continue;
      if (current === null || current === undefined) return undefined;
      current = current[seg];
    }
    return current;
  }
}
