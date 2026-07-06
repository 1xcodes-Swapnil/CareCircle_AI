/**
 * Gemini API Circuit Breaker and Rate-Limit Resiliency Engine
 * 
 * Tracks 429 RESOURCE_EXHAUSTED / quota errors thrown by the Gemini API and triggers
 * immediate local rule-based safety fallbacks for a cooldown period (e.g., 2 minutes).
 * This prevents repeated slow network calls, rate-limit spamming, and keeps the application
 * fully responsive.
 */

let lastQuotaExceededTime = 0;
let isQuotaExhaustedGlobal = false;
const COOLDOWN_MS = 120000; // 2 minutes cooldown for standard rate limits (like RPM)
const QUOTA_COOLDOWN_MS = 3600000 * 12; // 12 hours cooldown for daily quota exhaustion

/**
 * Returns true if the Gemini API is currently under rate limit cooldown or quota exhaustion.
 */
export function isGeminiRateLimited(): boolean {
  if (isQuotaExhaustedGlobal) {
    return true;
  }
  if (lastQuotaExceededTime === 0) {
    return false;
  }
  const elapsed = Date.now() - lastQuotaExceededTime;
  if (elapsed < COOLDOWN_MS) {
    return true;
  }
  // Cooldown expired
  return false;
}

/**
 * Returns the remaining cooldown duration in seconds.
 */
export function getCooldownRemainingSeconds(): number {
  if (isQuotaExhaustedGlobal) return 43200; // 12 hours
  if (!isGeminiRateLimited()) return 0;
  const elapsed = Date.now() - lastQuotaExceededTime;
  return Math.ceil((COOLDOWN_MS - elapsed) / 1000);
}

/**
 * Parses any error to check if it's a 429, Resource Exhausted, or Quota Exceeded error.
 * If yes, activates the circuit breaker cooldown.
 */
export function reportGeminiError(err: any): boolean {
  if (!err) return false;

  const errorString = String(err.message || err || '').toLowerCase();
  const isQuota = errorString.includes('quota') || 
                  errorString.includes('resource_exhausted') || 
                  errorString.includes('limit: 20') ||
                  errorString.includes('exceeded your current quota');
                  
  const is429 = isQuota ||
                errorString.includes('429') || 
                errorString.includes('rate limit') ||
                err.status === 429 ||
                err.code === 429;

  const is503 = errorString.includes('503') ||
                errorString.includes('unavailable') ||
                errorString.includes('high demand') ||
                errorString.includes('spikes in demand') ||
                err.status === 503 ||
                err.code === 503;

  if (isQuota) {
    isQuotaExhaustedGlobal = true;
    lastQuotaExceededTime = Date.now();
    console.warn(`[Gemini Circuit Breaker] Daily/Free Tier Quota Exceeded (RESOURCE_EXHAUSTED) detected! Bypassing all Gemini calls for this session and using local high-fidelity rules engine fallback.`);
    return true;
  }

  if (is429) {
    lastQuotaExceededTime = Date.now();
    console.warn(`[Gemini Circuit Breaker] Rate Limit (429) detected! Bypassing Gemini calls and using local high-fidelity rules engine for the next ${COOLDOWN_MS / 1000}s.`);
    return true;
  }

  if (is503) {
    lastQuotaExceededTime = Date.now();
    console.warn(`[Gemini Circuit Breaker] High Demand / Service Unavailable (503) detected! Bypassing Gemini calls and using local high-fidelity rules engine for the next ${COOLDOWN_MS / 1000}s.`);
    return true;
  }

  return false;
}
