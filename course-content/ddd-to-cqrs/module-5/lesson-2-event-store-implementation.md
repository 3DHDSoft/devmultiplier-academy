# Module 5, Lesson 2: Event Store Implementation

**Duration:** 20 minutes
**Learning Objectives:**
- Design and implement domain events with proper schemas
- Build an event store using PostgreSQL
- Implement append-only event logging
- Handle optimistic concurrency with version numbers
- Use snapshots for performance optimization
- Understand event versioning strategies

---

## Introduction

The Event Store is the heart of an event-sourced system. It's the database that stores all domain events in an append-only log. Unlike traditional databases where you update records, the event store only allows appending new events and reading existing ones.

In this lesson, we'll build a production-ready event store from scratch using PostgreSQL and TypeScript.

## Designing Domain Events

### Event Structure

```typescript
// Base event interface
interface DomainEvent {
  // Unique identifier for this event
  eventId: string;

  // Which aggregate this event belongs to
  aggregateId: string;
  aggregateType: string; // 'Order', 'BankAccount', etc.

  // Event type and data
  eventType: string;
  eventData: unknown;

  // Metadata
  occurredAt: Date;
  version: number; // For optimistic concurrency
  userId?: string; // Who caused this event
  correlationId?: string; // For tracing related events
  causationId?: string; // Event that caused this event
}
```

### Specific Event Types

```typescript
// Define specific events with strong typing

interface OrderCreatedEvent extends DomainEvent {
  aggregateType: 'Order';
  eventType: 'OrderCreated';
  eventData: {
    customerId: string;
    items: Array<{
      productId: string;
      productName: string; // Snapshot at time of order
      quantity: number;
      pricePerUnit: number;
      currency: string;
    }>;
    shippingAddress: {
      street: string;
      city: string;
      postalCode: string;
      country: string;
    };
  };
}

interface OrderItemAddedEvent extends DomainEvent {
  aggregateType: 'Order';
  eventType: 'OrderItemAdded';
  eventData: {
    productId: string;
    productName: string;
    quantity: number;
    pricePerUnit: number;
    currency: string;
  };
}

interface OrderConfirmedEvent extends DomainEvent {
  aggregateType: 'Order';
  eventType: 'OrderConfirmed';
  eventData: {
    confirmedBy: string;
    paymentMethod: string;
    totalAmount: number;
    currency: string;
  };
}

interface OrderCancelledEvent extends DomainEvent {
  aggregateType: 'Order';
  eventType: 'OrderCancelled';
  eventData: {
    reason: string;
    cancelledBy: string;
    refundAmount?: number;
  };
}
```

### Event Naming Conventions

```typescript
// ✅ GOOD: Past tense, describes what happened
// - OrderCreated (not CreateOrder)
// - MoneyDeposited (not DepositMoney)
// - UserEmailChanged (not ChangeUserEmail)
// - ProductPriceUpdated (not UpdateProductPrice)

// ❌ BAD: Present tense (sounds like commands)
// - CreateOrder
// - DepositMoney
// - ChangeEmail

// ✅ GOOD: Specific and domain-focused
interface OrderItemQuantityIncreasedEvent {
  eventData: {
    itemId: string;
    previousQuantity: number;
    newQuantity: number;
    increasedBy: number;
  };
}

// ❌ BAD: Generic and technical
interface OrderUpdatedEvent {
  eventData: {
    changes: Record<string, unknown>; // What changed? Who knows!
  };
}
```

### Event Granularity

```typescript
// TOO FINE-GRAINED ❌
interface OrderItemQuantityChangedEvent { /* ... */ }
interface OrderItemNameChangedEvent { /* ... */ }
interface OrderItemPriceChangedEvent { /* ... */ }
// 20 events for one operation - too chatty

// TOO COARSE-GRAINED ❌
interface OrderModifiedEvent {
  eventData: {
    changes: unknown; // Everything lumped together
  };
}
// Lost semantic meaning

// JUST RIGHT ✅
interface OrderItemAddedEvent { /* ... */ }
interface OrderItemRemovedEvent { /* ... */ }
interface OrderItemQuantityChangedEvent { /* ... */ }
// Each event represents one meaningful business action
```

## Event Store Schema (PostgreSQL)

### Table Design

```sql
-- Main events table (append-only)
CREATE TABLE events (
  -- Primary key
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Aggregate identification
  aggregate_id UUID NOT NULL,
  aggregate_type VARCHAR(100) NOT NULL,

  -- Event details
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB NOT NULL,

  -- Versioning (for optimistic concurrency)
  version INTEGER NOT NULL,

  -- Metadata
  occurred_at TIMESTAMP NOT NULL DEFAULT NOW(),
  user_id UUID,
  correlation_id UUID,
  causation_id UUID,

  -- Ensure one version per aggregate (optimistic locking)
  CONSTRAINT unique_aggregate_version UNIQUE (aggregate_id, version),

  -- Index for fast aggregate lookup
  INDEX idx_events_aggregate (aggregate_id, version),
  INDEX idx_events_type (event_type),
  INDEX idx_events_occurred_at (occurred_at)
);

-- Snapshots table (performance optimization)
CREATE TABLE snapshots (
  aggregate_id UUID PRIMARY KEY,
  aggregate_type VARCHAR(100) NOT NULL,
  version INTEGER NOT NULL,
  state JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  INDEX idx_snapshots_type (aggregate_type)
);

-- Event type registry (for documentation and validation)
CREATE TABLE event_types (
  event_type VARCHAR(100) PRIMARY KEY,
  aggregate_type VARCHAR(100) NOT NULL,
  schema_version INTEGER NOT NULL,
  json_schema JSONB, -- JSON Schema for validation
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### TypeScript Event Store Interface

```typescript
interface EventStore {
  // Append new events (idempotent)
  append(
    aggregateId: string,
    expectedVersion: number,
    events: DomainEvent[]
  ): Promise<void>;

  // Get all events for an aggregate
  getEvents(
    aggregateType: string,
    aggregateId: string,
    fromVersion?: number
  ): Promise<DomainEvent[]>;

  // Get snapshot (if exists)
  getSnapshot(
    aggregateType: string,
    aggregateId: string
  ): Promise<Snapshot | null>;

  // Save snapshot
  saveSnapshot(snapshot: Snapshot): Promise<void>;

  // Query events by type (for projections)
  getEventsByType(
    eventType: string,
    fromDate?: Date
  ): Promise<DomainEvent[]>;

  // Get all events (for rebuilding projections)
  getAllEvents(
    aggregateType: string,
    fromPosition?: number
  ): Promise<DomainEvent[]>;
}
```

## Implementing the Event Store

### PostgreSQL Implementation

```typescript
import { Pool } from 'pg';

class PostgresEventStore implements EventStore {
  constructor(private readonly pool: Pool) {}

  async append(
    aggregateId: string,
    expectedVersion: number,
    events: DomainEvent[]
  ): Promise<void> {
    if (events.length === 0) {
      return;
    }

    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Check current version (optimistic concurrency control)
      const result = await client.query(
        `SELECT COALESCE(MAX(version), 0) as current_version
         FROM events
         WHERE aggregate_id = $1`,
        [aggregateId]
      );

      const currentVersion = result.rows[0].current_version;

      if (currentVersion !== expectedVersion) {
        throw new ConcurrencyError(
          `Expected version ${expectedVersion}, but current is ${currentVersion}`
        );
      }

      // Append events
      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        const version = expectedVersion + i + 1;

        await client.query(
          `INSERT INTO events (
            event_id,
            aggregate_id,
            aggregate_type,
            event_type,
            event_data,
            version,
            occurred_at,
            user_id,
            correlation_id,
            causation_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            event.eventId,
            event.aggregateId,
            event.aggregateType,
            event.eventType,
            JSON.stringify(event.eventData),
            version,
            event.occurredAt,
            event.userId,
            event.correlationId,
            event.causationId
          ]
        );
      }

      await client.query('COMMIT');

      // Publish events to event bus (outside transaction)
      for (const event of events) {
        await this.eventBus.publish(event);
      }

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getEvents(
    aggregateType: string,
    aggregateId: string,
    fromVersion: number = 0
  ): Promise<DomainEvent[]> {
    const result = await this.pool.query(
      `SELECT
        event_id,
        aggregate_id,
        aggregate_type,
        event_type,
        event_data,
        version,
        occurred_at,
        user_id,
        correlation_id,
        causation_id
      FROM events
      WHERE aggregate_type = $1
        AND aggregate_id = $2
        AND version > $3
      ORDER BY version ASC`,
      [aggregateType, aggregateId, fromVersion]
    );

    return result.rows.map(row => ({
      eventId: row.event_id,
      aggregateId: row.aggregate_id,
      aggregateType: row.aggregate_type,
      eventType: row.event_type,
      eventData: row.event_data,
      version: row.version,
      occurredAt: row.occurred_at,
      userId: row.user_id,
      correlationId: row.correlation_id,
      causationId: row.causation_id
    }));
  }

  async getSnapshot(
    aggregateType: string,
    aggregateId: string
  ): Promise<Snapshot | null> {
    const result = await this.pool.query(
      `SELECT aggregate_id, aggregate_type, version, state, created_at
       FROM snapshots
       WHERE aggregate_type = $1 AND aggregate_id = $2`,
      [aggregateType, aggregateId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      aggregateId: row.aggregate_id,
      aggregateType: row.aggregate_type,
      version: row.version,
      state: row.state,
      createdAt: row.created_at
    };
  }

  async saveSnapshot(snapshot: Snapshot): Promise<void> {
    await this.pool.query(
      `INSERT INTO snapshots (aggregate_id, aggregate_type, version, state, created_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (aggregate_id)
       DO UPDATE SET
         version = EXCLUDED.version,
         state = EXCLUDED.state,
         created_at = EXCLUDED.created_at`,
      [
        snapshot.aggregateId,
        snapshot.aggregateType,
        snapshot.version,
        JSON.stringify(snapshot.state),
        snapshot.createdAt
      ]
    );
  }
}
```

### Optimistic Concurrency Control

```typescript
// Prevents lost updates when multiple processes modify same aggregate

class Order {
  private version: number = 0;
  private uncommittedEvents: DomainEvent[] = [];

  // Load order
  static async load(
    orderId: string,
    eventStore: EventStore
  ): Promise<Order> {
    // Try to load from snapshot first
    const snapshot = await eventStore.getSnapshot('Order', orderId);

    let order: Order;
    let fromVersion: number;

    if (snapshot) {
      // Restore from snapshot
      order = Order.fromSnapshot(snapshot);
      fromVersion = snapshot.version;
    } else {
      // Start from scratch
      order = new Order();
      fromVersion = 0;
    }

    // Load events after snapshot
    const events = await eventStore.getEvents('Order', orderId, fromVersion);

    for (const event of events) {
      order.apply(event);
      order.version = event.version;
    }

    return order;
  }

  // Save order
  async save(eventStore: EventStore): Promise<void> {
    if (this.uncommittedEvents.length === 0) {
      return;
    }

    try {
      // Pass expected version for optimistic locking
      await eventStore.append(
        this.id,
        this.version, // Current version
        this.uncommittedEvents
      );

      // Update version
      this.version += this.uncommittedEvents.length;
      this.uncommittedEvents = [];

    } catch (error) {
      if (error instanceof ConcurrencyError) {
        // Another process modified this order
        throw new Error(
          'Order was modified by another process. Please reload and try again.'
        );
      }
      throw error;
    }
  }

  // Command: Add item
  addItem(productId: string, quantity: number, price: number): void {
    // Business logic validation
    if (this.status !== 'draft') {
      throw new Error('Cannot add items to confirmed order');
    }

    // Create event
    const event: OrderItemAddedEvent = {
      eventId: crypto.randomUUID(),
      aggregateId: this.id,
      aggregateType: 'Order',
      eventType: 'OrderItemAdded',
      eventData: { productId, quantity, pricePerUnit: price },
      occurredAt: new Date(),
      version: this.version + this.uncommittedEvents.length + 1
    };

    // Apply event
    this.apply(event);

    // Track for persistence
    this.uncommittedEvents.push(event);
  }
}

// Usage
async function addItemToOrder(
  orderId: string,
  productId: string,
  quantity: number
): Promise<void> {
  // Load with version tracking
  const order = await Order.load(orderId, eventStore);

  // Execute command
  order.addItem(productId, quantity, 49.99);

  // Save with optimistic concurrency check
  await order.save(eventStore);
}
```

### Handling Concurrency Conflicts

```typescript
// Retry strategy for concurrency conflicts
async function addItemToOrderWithRetry(
  orderId: string,
  productId: string,
  quantity: number,
  maxRetries: number = 3
): Promise<void> {
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const order = await Order.load(orderId, eventStore);
      order.addItem(productId, quantity, 49.99);
      await order.save(eventStore);
      return; // Success!

    } catch (error) {
      if (error instanceof ConcurrencyError) {
        attempt++;
        if (attempt >= maxRetries) {
          throw new Error('Failed after max retries due to concurrent modifications');
        }
        // Wait with exponential backoff
        await sleep(100 * Math.pow(2, attempt));
        continue;
      }
      throw error; // Other errors
    }
  }
}
```

## Snapshots for Performance

### Why Snapshots?

```typescript
// Problem: Long event streams are slow to replay
const order = await Order.load(orderId, eventStore);
// With 10,000 events, this takes seconds!

// Solution: Periodically save snapshots
// Instead of replaying 10,000 events:
// 1. Load snapshot (state at event 9,900)
// 2. Replay only last 100 events
// Result: Much faster!
```

### Implementing Snapshots

```typescript
interface Snapshot {
  aggregateId: string;
  aggregateType: string;
  version: number; // Event version snapshot was taken at
  state: unknown; // Serialized aggregate state
  createdAt: Date;
}

class Order {
  // Create snapshot
  toSnapshot(): Snapshot {
    return {
      aggregateId: this.id,
      aggregateType: 'Order',
      version: this.version,
      state: {
        customerId: this.customerId,
        items: this.items,
        status: this.status,
        totalAmount: this.totalAmount,
        shippingAddress: this.shippingAddress
      },
      createdAt: new Date()
    };
  }

  // Restore from snapshot
  static fromSnapshot(snapshot: Snapshot): Order {
    const order = new Order();
    const state = snapshot.state as OrderState;

    order.id = snapshot.aggregateId;
    order.customerId = state.customerId;
    order.items = state.items;
    order.status = state.status;
    order.totalAmount = state.totalAmount;
    order.shippingAddress = state.shippingAddress;
    order.version = snapshot.version;

    return order;
  }

  // Save with snapshot strategy
  async save(eventStore: EventStore): Promise<void> {
    // Append events
    await eventStore.append(this.id, this.version, this.uncommittedEvents);

    this.version += this.uncommittedEvents.length;
    this.uncommittedEvents = [];

    // Create snapshot every N events
    if (this.version % 100 === 0) {
      await eventStore.saveSnapshot(this.toSnapshot());
    }
  }
}
```

### Snapshot Strategy

```typescript
class SnapshotStrategy {
  // Strategy 1: Every N events
  static readonly EVERY_N_EVENTS = 100;

  // Strategy 2: Time-based
  static readonly MAX_SNAPSHOT_AGE = 24 * 60 * 60 * 1000; // 24 hours

  // Strategy 3: Event count from last snapshot
  static shouldCreateSnapshot(
    currentVersion: number,
    lastSnapshotVersion: number,
    lastSnapshotDate: Date
  ): boolean {
    const eventsSinceSnapshot = currentVersion - lastSnapshotVersion;
    const timeSinceSnapshot = Date.now() - lastSnapshotDate.getTime();

    return (
      eventsSinceSnapshot >= this.EVERY_N_EVENTS ||
      timeSinceSnapshot >= this.MAX_SNAPSHOT_AGE
    );
  }
}
```

## Event Versioning

### The Challenge

```typescript
// V1: Initial version
interface OrderCreatedV1 {
  eventType: 'OrderCreated';
  eventData: {
    customerId: string;
    items: Array<{ productId: string; quantity: number }>;
  };
}

// V2: Need to add pricing (6 months later)
interface OrderCreatedV2 {
  eventType: 'OrderCreated';
  eventData: {
    customerId: string;
    items: Array<{
      productId: string;
      quantity: number;
      price: number; // NEW
      currency: string; // NEW
    }>;
  };
}

// Problem: Have 1 million V1 events in database
// Cannot delete or modify them (append-only!)
```

### Solution 1: Version in Event Data

```typescript
interface DomainEvent {
  eventType: string;
  schemaVersion: number; // Add version
  eventData: unknown;
}

// Handle both versions
function applyOrderCreated(event: DomainEvent): void {
  switch (event.schemaVersion) {
    case 1:
      return this.applyOrderCreatedV1(event.eventData as OrderCreatedV1Data);
    case 2:
      return this.applyOrderCreatedV2(event.eventData as OrderCreatedV2Data);
    default:
      throw new Error(`Unknown schema version: ${event.schemaVersion}`);
  }
}

private applyOrderCreatedV1(data: OrderCreatedV1Data): void {
  this.customerId = data.customerId;
  this.items = data.items.map(item => ({
    ...item,
    price: 0, // Default for V1
    currency: 'USD' // Default for V1
  }));
}

private applyOrderCreatedV2(data: OrderCreatedV2Data): void {
  this.customerId = data.customerId;
  this.items = data.items; // Has all fields
}
```

### Solution 2: Upcasting

```typescript
// Transform old events to new format when reading
class EventUpcastingStore implements EventStore {
  constructor(
    private readonly innerStore: EventStore,
    private readonly upcasters: EventUpcaster[]
  ) {}

  async getEvents(
    aggregateType: string,
    aggregateId: string
  ): Promise<DomainEvent[]> {
    const events = await this.innerStore.getEvents(aggregateType, aggregateId);

    // Upcast each event to latest version
    return events.map(event => this.upcast(event));
  }

  private upcast(event: DomainEvent): DomainEvent {
    let currentEvent = event;

    for (const upcaster of this.upcasters) {
      if (upcaster.canUpcast(currentEvent)) {
        currentEvent = upcaster.upcast(currentEvent);
      }
    }

    return currentEvent;
  }
}

// Define upcasters
class OrderCreatedV1ToV2Upcaster implements EventUpcaster {
  canUpcast(event: DomainEvent): boolean {
    return event.eventType === 'OrderCreated' &&
           (!event.schemaVersion || event.schemaVersion === 1);
  }

  upcast(event: DomainEvent): DomainEvent {
    const oldData = event.eventData as OrderCreatedV1Data;

    return {
      ...event,
      schemaVersion: 2,
      eventData: {
        customerId: oldData.customerId,
        items: oldData.items.map(item => ({
          ...item,
          price: 0, // Default for migrated events
          currency: 'USD'
        }))
      }
    };
  }
}
```

### Solution 3: Multiple Event Handlers

```typescript
// Keep old handler, add new handler
class Order {
  private apply(event: DomainEvent): void {
    switch (event.eventType) {
      case 'OrderCreated':
        // Handle both versions
        return this.applyOrderCreated(event);
      case 'OrderCreatedV2':
        // New event type
        return this.applyOrderCreatedV2(event);
      // ...
    }
  }

  private applyOrderCreated(event: DomainEvent): void {
    // V1 handler - never changes
    const data = event.eventData as OrderCreatedV1Data;
    // ... apply V1 logic
  }

  private applyOrderCreatedV2(event: DomainEvent): void {
    // V2 handler
    const data = event.eventData as OrderCreatedV2Data;
    // ... apply V2 logic
  }
}

// New code creates V2 events
// Old events (V1) still handled correctly
```

## Best Practices

### 1. Event Immutability

```typescript
// ❌ NEVER modify events
await db.events.update(
  { eventId },
  { eventData: newData }
);

// ✅ Create compensating event
const correctionEvent = new OrderCorrectedEvent({
  originalEventId: incorrectEventId,
  correction: 'Price should be 99.99, not 999.99'
});
```

### 2. Event Enrichment

```typescript
// Add context when creating events
interface OrderConfirmedEvent {
  eventData: {
    orderId: string;
    // Enrich with context
    confirmedBy: string; // User who confirmed
    confirmedAt: Date;
    ipAddress: string; // Where it happened
    userAgent: string;
    // Snapshot data
    customerEmail: string; // Current email at confirmation time
    totalAmount: number; // Amount at confirmation time
  };
}
```

### 3. Event Ordering

```typescript
// Use version numbers for ordering
CREATE TABLE events (
  -- ...
  version INTEGER NOT NULL,
  occurred_at TIMESTAMP NOT NULL,

  -- Version is canonical order
  -- occurred_at is for humans and time-based queries
  INDEX idx_events_aggregate (aggregate_id, version)
);

// Load events by version, not timestamp
SELECT * FROM events
WHERE aggregate_id = $1
ORDER BY version ASC; -- Not occurred_at!
```

## Key Takeaways

1. **Events are immutable** - Never update or delete
2. **Append-only log** - Only insert new events
3. **Optimistic concurrency** - Use version numbers
4. **Snapshots for performance** - Don't replay thousands of events
5. **Event versioning** - Handle schema evolution carefully
6. **Strong typing** - Use TypeScript interfaces for events
7. **Transactions** - Append events atomically

## Common Pitfalls

❌ **Modifying past events** - Breaks history integrity
❌ **Missing version check** - Lost updates
❌ **No snapshots** - Poor performance with long streams
❌ **Generic events** - Lost semantic meaning
❌ **Synchronous projections** - Couples write and read models
❌ **No event versioning strategy** - Cannot evolve schema

## Next Steps

In the next lesson, we'll build **Projections and Read Models** from our event stream, showing how to create multiple queryable views from the same events.

## Exercise

**Build a Simple Event Store:**

1. **Create database schema:**
   ```sql
   CREATE TABLE events (...);
   CREATE TABLE snapshots (...);
   ```

2. **Implement basic operations:**
   ```typescript
   class MyEventStore {
     async append(aggregateId: string, events: DomainEvent[]): Promise<void> {
       // Implement with optimistic locking
     }

     async getEvents(aggregateId: string): Promise<DomainEvent[]> {
       // Implement
     }
   }
   ```

3. **Create an event-sourced aggregate:**
   ```typescript
   class BankAccount {
     static async load(accountId: string): Promise<BankAccount> {
       // Load from event store
     }

     async save(): Promise<void> {
       // Save uncommitted events
     }

     deposit(amount: number): void {
       // Create MoneyDepositedEvent
     }
   }
   ```

4. **Test concurrency:**
   - Try modifying same aggregate from two processes
   - Should get ConcurrencyError

5. **Add snapshot:**
   - Save snapshot every 10 events
   - Load from snapshot + recent events

---

**Time to complete:** 60 minutes
**Difficulty:** Advanced

Share your implementation in the course forum!
