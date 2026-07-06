import { db } from './db.js';

interface RedisEntry {
  value: any;
  expiresAt: number | null;
}

interface RedisStreamEntry {
  id: string;
  timestamp: string;
  data: Record<string, any>;
}

class RedisCacheSimulator {
  private cache: Map<string, RedisEntry> = new Map();
  private pubsub: Map<string, Array<(msg: string) => void>> = new Map();
  private streams: Map<string, RedisStreamEntry[]> = new Map();
  private hits: number = 0; // Starts from 0 on server boot
  private misses: number = 0; // Starts from 0 on server boot

  constructor() {
    console.log('[Redis Cache] Simulation Engine online. Connected to memory cluster.');
    
    // Log Redis boot metrics
    db.addAuditLog({
      eventType: 'SystemBootstrapped',
      step: 'event_bus',
      message: 'Redis Cache Memory Instance successfully initialized with 0.1ms ping.',
      logs: ['Redis master node online', 'Streams registry bound', 'Pub/Sub channels allocated']
    });
  }

  /**
   * Basic key-value SET with optional TTL in seconds
   */
  public set(key: string, value: any, ttlSeconds?: number): void {
    const start = Date.now();
    const expiresAt = ttlSeconds ? Date.now() + (ttlSeconds * 1000) : null;
    this.cache.set(key, { value, expiresAt });

    const latency = (Date.now() - start) + 0.1; // realistic sub-millisecond precision
    console.log(`[Redis] SET ${key} - TTL: ${ttlSeconds || 'unlimited'} (${latency.toFixed(2)}ms)`);
    
    db.addAuditLog({
      eventType: 'CacheSync',
      step: 'event_bus',
      message: `Redis SET successful for key "${key}" (TTL: ${ttlSeconds || 'None'}s).`,
      details: JSON.stringify({ key, ttlSeconds, latencyMs: latency }),
      logs: [`Redis write state active`, `Latency: ${latency.toFixed(2)}ms`, 'Cache synced with client states']
    });
  }

  /**
   * Basic key-value GET with automatic expiration handling
   */
  public get<T = any>(key: string): T | null {
    const start = Date.now();
    const entry = this.cache.get(key);
    const latency = (Date.now() - start) + 0.1;

    if (!entry) {
      console.log(`[Redis] GET ${key} - MISS (${latency.toFixed(2)}ms)`);
      this.misses++;
      return null;
    }

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      console.log(`[Redis] GET ${key} - EXPIRED (${latency.toFixed(2)}ms)`);
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    console.log(`[Redis] GET ${key} - HIT (${latency.toFixed(2)}ms)`);
    this.hits++;
    return entry.value as T;
  }

  /**
   * Internal probe method for monitoring latency without modifying hits/misses
   */
  public probe(key: string): any {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      return null;
    }
    return entry.value;
  }

  /**
   * Deletes a cache entry manually (invalidation)
   */
  public del(key: string): void {
    const start = Date.now();
    this.cache.delete(key);
    const latency = (Date.now() - start) + 0.1;
    console.log(`[Redis] DEL ${key} - Cache Invalidation complete (${latency.toFixed(2)}ms)`);
  }

  /**
   * Pub/Sub: Publish message to a channel
   */
  public publish(channel: string, message: string): void {
    const start = Date.now();
    const subscribers = this.pubsub.get(channel) || [];
    subscribers.forEach(cb => {
      try {
        cb(message);
      } catch (err) {
        console.error(`[Redis Pub/Sub] Callback error on channel ${channel}:`, err);
      }
    });

    const latency = (Date.now() - start) + 0.2;
    console.log(`[Redis Pub/Sub] PUBLISH to channel "${channel}" - Sent to ${subscribers.length} consumers (${latency.toFixed(2)}ms)`);
  }

  /**
   * Pub/Sub: Subscribe to a channel
   */
  public subscribe(channel: string, callback: (msg: string) => void): void {
    if (!this.pubsub.has(channel)) {
      this.pubsub.set(channel, []);
    }
    this.pubsub.get(channel)!.push(callback);
    console.log(`[Redis Pub/Sub] SUBSCRIBED consumer to channel "${channel}"`);
  }

  /**
   * Streams: XADD adds an entry to a Redis Stream (for telemetry logging)
   */
  public xadd(streamName: string, data: Record<string, any>): string {
    const start = Date.now();
    if (!this.streams.has(streamName)) {
      this.streams.set(streamName, []);
    }

    const id = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const entry: RedisStreamEntry = {
      id,
      timestamp: new Date().toISOString(),
      data
    };

    this.streams.get(streamName)!.push(entry);
    const latency = (Date.now() - start) + 0.2;

    console.log(`[Redis Stream] XADD ${streamName} [ID: ${id}] (${latency.toFixed(2)}ms)`);
    
    // Log Stream activity in audit logs
    db.addAuditLog({
      eventType: 'TelemetryStreamed',
      step: 'event_bus',
      message: `Ingested active physical telemetry stream payload to Redis Stream "${streamName}".`,
      details: JSON.stringify({ streamName, streamId: id, keys: Object.keys(data) }),
      logs: [`XADD executed successfully`, `Stream Data: ${JSON.stringify(data)}`, `Latency: ${latency.toFixed(2)}ms`]
    });

    return id;
  }

  /**
   * Streams: XREAD reads stream logs
   */
  public xread(streamName: string, count: number = 10): RedisStreamEntry[] {
    const list = this.streams.get(streamName) || [];
    return list.slice(-count);
  }

  /**
   * Returns live cache metrics for Mission Control
   */
  public getCacheStats() {
    return {
      keysCount: this.cache.size,
      streamsCount: this.streams.size,
      allKeys: Array.from(this.cache.keys()),
      streams: Array.from(this.streams.keys()),
      hits: this.hits,
      misses: this.misses
    };
  }

  /**
   * Clear all simulation states
   */
  public flushall(): void {
    this.cache.clear();
    this.streams.clear();
    console.log('[Redis] FLUSHALL completed. Clean cache slate.');
  }
}

export const redisCache = new RedisCacheSimulator();
export default redisCache;
