import { db } from './db.js';
import { EventData, AuditLog } from '../src/types.js';
import { redisCache } from './redisCache.js';

type EventCallback = (event: EventData) => Promise<void>;

class EventBus {
  private subscribers: Map<string, EventCallback[]> = new Map();

  constructor() {
    console.log('[Event Bus] Online and ready.');
    
    // Subscribe our local memory sync client to the Redis Pub/Sub channel
    redisCache.subscribe('carecircle-sync-channel', (msg) => {
      console.log(`[Redis Pub/Sub Subscriber] Received real-time sync broadcast: ${msg}`);
    });
  }

  /**
   * Register a subscriber for a specific event type.
   */
  public subscribe(eventType: EventData['type'], callback: EventCallback) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    this.subscribers.get(eventType)!.push(callback);
    console.log(`[Event Bus] Subscribed agent/service to event: ${eventType}`);
  }

  /**
   * Publish an event asynchronously, triggering all registered consumers.
   */
  public async publish(type: EventData['type'], familyMemberId: string, payload: Record<string, any>): Promise<EventData> {
    const event: EventData = {
      id: `ev_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      type,
      timestamp: new Date().toISOString(),
      familyMemberId,
      payload
    };

    // 1. Stream the event through Redis Streams
    redisCache.xadd('sensor-streams', {
      eventId: event.id,
      type: event.type,
      familyMemberId: event.familyMemberId,
      ...payload
    });

    // 2. Publish to Redis Pub/Sub for cross-dashboard synchronization
    redisCache.publish('carecircle-sync-channel', JSON.stringify({
      action: 'sync_dashboard',
      eventId: event.id,
      type: event.type,
      familyMemberId: event.familyMemberId
    }));

    // 3. Log event occurrence to DB Audit Logs
    db.addAuditLog({
      eventType: type,
      step: 'event_bus',
      message: `Event Bus ingested event "${type}" for ${familyMemberId === 'fm_eleanor' ? 'Eleanor Vance' : familyMemberId}.`,
      details: JSON.stringify(payload),
      logs: [
        `Ingested: ${type}`,
        `Payload keys: ${Object.keys(payload).join(', ')}`,
        `Timestamp: ${event.timestamp}`,
        `Status: Forwarding to Planner Agent registry...`
      ]
    });

    // 4. Dispatch asynchronously to consumers
    const callbacks = this.subscribers.get(type) || [];
    
    // Run them in background so as not to block response
    setTimeout(async () => {
      for (const cb of callbacks) {
        try {
          await cb(event);
        } catch (err) {
          console.error(`[Event Bus] Error in subscriber for ${type}:`, err);
          db.addAuditLog({
            eventType: 'SubscriberError',
            step: 'event_bus',
            message: `Event consumer failed to process "${type}".`,
            details: err instanceof Error ? err.stack : String(err),
            logs: [`Error: ${err instanceof Error ? err.message : String(err)}`]
          });
        }
      }
    }, 0);

    return event;
  }
}

export const eventBus = new EventBus();
export default eventBus;
