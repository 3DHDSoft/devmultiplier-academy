# Module 5, Lesson 3: Projections and Read Models

**Duration:** 20 minutes
**Learning Objectives:**
- Understand projections and read models in event sourcing
- Build event handlers to create projections
- Implement materialized views for efficient queries
- Handle eventual consistency in read models
- Rebuild projections from event history
- Create multiple projections from the same events

---

## Introduction

In event sourcing, the event store is optimized for writes (appending events) but not for reads (queries). You can't efficiently query "show me all active orders" or "list users by email" from the event stream.

**Solution:** Projections (also called Read Models) are derived views built from events. They're optimized for specific queries and updated asynchronously as events occur.

## The Problem with Querying Events

### Why You Can't Query Event Streams Directly

```typescript
// ❌ Trying to query events directly
async function getActiveOrders(): Promise<Order[]> {
  // Get all OrderCreated events
  const createEvents = await eventStore.getEventsByType('OrderCreated');

  // Get all OrderCompleted events
  const completeEvents = await eventStore.getEventsByType('OrderCompleted');

  // Reconstruct every order
  // Filter to only active ones
  // This is SLOW and inefficient!

  const activeOrderIds = new Set(
    createEvents.map(e => e.aggregateId)
  );

  for (const event of completeEvents) {
    activeOrderIds.delete(event.aggregateId);
  }

  // Now reconstruct each order from events
  const orders = await Promise.all(
    Array.from(activeOrderIds).map(id =>
      Order.load(id, eventStore)
    )
  );

  return orders;
}

// Problems:
// 1. Loads ALL events (millions of records)
// 2. Reconstructs EVERY order
// 3. Takes minutes to complete
// 4. No pagination, sorting, filtering
```

## What Are Projections?

**Projection:** A read model built by processing events and storing the results in a query-optimized format.

### Key Characteristics

1. **Derived from events** - Event stream is source of truth
2. **Eventually consistent** - May lag slightly behind writes
3. **Optimized for queries** - Denormalized, indexed for specific use cases
4. **Rebuildable** - Can be deleted and rebuilt from events
5. **Multiple per domain** - Different projections for different queries

### Conceptual Model

```
┌─────────────┐
│ Command     │
│ (Write)     │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Domain Model    │
│ (Aggregate)     │
└──────┬──────────┘
       │
       │ produces
       ▼
┌─────────────────┐
│ Events          │ ◄──── Source of Truth
└──────┬──────────┘
       │
       │ consumed by
       ▼
┌─────────────────┐
│ Event Handlers  │
│ (Projectors)    │
└──────┬──────────┘
       │
       │ updates
       ▼
┌─────────────────┐
│ Read Models     │ ◄──── Optimized for Queries
│ (Projections)   │
└─────────────────┘
       │
       │ queried by
       ▼
┌─────────────────┐
│ Queries         │
│ (Read)          │
└─────────────────┘
```

## Building Your First Projection

### Scenario: Order Summary Projection

```typescript
// Read model schema (PostgreSQL)
CREATE TABLE order_summaries (
  order_id UUID PRIMARY KEY,
  customer_id UUID NOT NULL,
  customer_name VARCHAR(200),
  status VARCHAR(50) NOT NULL,
  item_count INTEGER NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,

  INDEX idx_customer (customer_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

// Now queries are fast!
SELECT * FROM order_summaries
WHERE status = 'active'
ORDER BY created_at DESC
LIMIT 20; -- Instant!
```

### Event Handler (Projector)

```typescript
interface ProjectionHandler {
  handle(event: DomainEvent): Promise<void>;
}

class OrderSummaryProjection implements ProjectionHandler {
  constructor(private readonly db: Database) {}

  async handle(event: DomainEvent): Promise<void> {
    switch (event.eventType) {
      case 'OrderCreated':
        return this.handleOrderCreated(event as OrderCreatedEvent);
      case 'OrderItemAdded':
        return this.handleOrderItemAdded(event as OrderItemAddedEvent);
      case 'OrderConfirmed':
        return this.handleOrderConfirmed(event as OrderConfirmedEvent);
      case 'OrderCancelled':
        return this.handleOrderCancelled(event as OrderCancelledEvent);
    }
  }

  private async handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
    const { customerId, items } = event.eventData;

    // Calculate initial totals
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce(
      (sum, item) => sum + item.quantity * item.pricePerUnit,
      0
    );

    // Insert into read model
    await this.db.query(
      `INSERT INTO order_summaries (
        order_id,
        customer_id,
        customer_name,
        status,
        item_count,
        total_amount,
        currency,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        event.aggregateId,
        customerId,
        await this.getCustomerName(customerId), // Enrich from other source
        'draft',
        itemCount,
        totalAmount,
        items[0].currency,
        event.occurredAt,
        event.occurredAt
      ]
    );
  }

  private async handleOrderItemAdded(
    event: OrderItemAddedEvent
  ): Promise<void> {
    const { quantity, pricePerUnit } = event.eventData;

    await this.db.query(
      `UPDATE order_summaries
       SET
         item_count = item_count + $1,
         total_amount = total_amount + $2,
         updated_at = $3
       WHERE order_id = $4`,
      [
        quantity,
        quantity * pricePerUnit,
        event.occurredAt,
        event.aggregateId
      ]
    );
  }

  private async handleOrderConfirmed(
    event: OrderConfirmedEvent
  ): Promise<void> {
    await this.db.query(
      `UPDATE order_summaries
       SET status = 'confirmed', updated_at = $1
       WHERE order_id = $2`,
      [event.occurredAt, event.aggregateId]
    );
  }

  private async handleOrderCancelled(
    event: OrderCancelledEvent
  ): Promise<void> {
    await this.db.query(
      `UPDATE order_summaries
       SET status = 'cancelled', updated_at = $1
       WHERE order_id = $2`,
      [event.occurredAt, event.aggregateId]
    );
  }
}
```

### Wiring Up Event Handlers

```typescript
class EventBus {
  private handlers: Map<string, ProjectionHandler[]> = new Map();

  subscribe(eventType: string, handler: ProjectionHandler): void {
    const handlers = this.handlers.get(eventType) || [];
    handlers.push(handler);
    this.handlers.set(eventType, handlers);
  }

  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventType) || [];

    // Process handlers asynchronously
    await Promise.all(
      handlers.map(handler =>
        handler.handle(event).catch(error => {
          console.error(`Projection failed for ${event.eventType}:`, error);
          // Dead letter queue, retry, etc.
        })
      )
    );
  }
}

// Setup
const eventBus = new EventBus();
const orderSummaryProjection = new OrderSummaryProjection(db);

eventBus.subscribe('OrderCreated', orderSummaryProjection);
eventBus.subscribe('OrderItemAdded', orderSummaryProjection);
eventBus.subscribe('OrderConfirmed', orderSummaryProjection);
eventBus.subscribe('OrderCancelled', orderSummaryProjection);
```

## Multiple Projections from Same Events

### Example: Different Read Models for Different Queries

```typescript
// PROJECTION 1: Order Summary (for listing orders)
class OrderSummaryProjection {
  // Optimized for: List orders, filter by status, sort by date
}

// PROJECTION 2: Customer Order History (for customer dashboard)
class CustomerOrderHistoryProjection {
  async handle(event: DomainEvent): Promise<void> {
    if (event.eventType === 'OrderCreated') {
      await this.db.query(
        `INSERT INTO customer_order_history (
          customer_id,
          order_id,
          order_date,
          total_amount
        ) VALUES ($1, $2, $3, $4)`,
        [
          event.eventData.customerId,
          event.aggregateId,
          event.occurredAt,
          this.calculateTotal(event.eventData.items)
        ]
      );
    }
  }
}

// PROJECTION 3: Product Sales Analytics (for business intelligence)
class ProductSalesProjection {
  async handle(event: DomainEvent): Promise<void> {
    if (event.eventType === 'OrderItemAdded') {
      const { productId, quantity, pricePerUnit } = event.eventData;

      await this.db.query(
        `INSERT INTO product_sales (
          product_id,
          sale_date,
          quantity_sold,
          revenue
        ) VALUES ($1, $2, $3, $4)
        ON CONFLICT (product_id, sale_date)
        DO UPDATE SET
          quantity_sold = product_sales.quantity_sold + EXCLUDED.quantity_sold,
          revenue = product_sales.revenue + EXCLUDED.revenue`,
        [
          productId,
          event.occurredAt.toISOString().split('T')[0], // Date only
          quantity,
          quantity * pricePerUnit
        ]
      );
    }
  }
}

// All three projections listen to same events!
// Each optimized for different queries
```

### Schema for Multiple Projections

```sql
-- Projection 1: Order summaries
CREATE TABLE order_summaries (
  order_id UUID PRIMARY KEY,
  customer_id UUID,
  status VARCHAR(50),
  total_amount DECIMAL(10, 2),
  created_at TIMESTAMP,
  INDEX idx_status (status)
);

-- Projection 2: Customer order history
CREATE TABLE customer_order_history (
  id SERIAL PRIMARY KEY,
  customer_id UUID NOT NULL,
  order_id UUID NOT NULL,
  order_date TIMESTAMP NOT NULL,
  total_amount DECIMAL(10, 2),
  INDEX idx_customer (customer_id),
  INDEX idx_order_date (order_date)
);

-- Projection 3: Product sales analytics
CREATE TABLE product_sales (
  product_id UUID NOT NULL,
  sale_date DATE NOT NULL,
  quantity_sold INTEGER NOT NULL,
  revenue DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (product_id, sale_date)
);

-- Each optimized for its specific queries!
```

## Eventual Consistency

### Understanding the Lag

```typescript
// Write side (synchronous)
async function placeOrder(customerId: string, items: OrderItem[]): Promise<string> {
  const order = Order.create(customerId, items);
  const events = order.getUncommittedEvents();

  // Events persisted to event store (milliseconds)
  await eventStore.append(order.getId(), 0, events);

  // Event published to bus (asynchronous)
  await eventBus.publish(events[0]); // Returns immediately

  return order.getId();
}

// Read side (asynchronous projection update)
class OrderSummaryProjection {
  async handle(event: OrderCreatedEvent): Promise<void> {
    // This happens AFTER placeOrder() returns
    // Usually milliseconds later, but could be longer
    await this.updateReadModel(event);
  }
}

// User's experience
const orderId = await placeOrder(customerId, items);
// Order created, event stored ✅

const order = await queryOrderSummary(orderId);
// Might not be in read model yet! ⚠️
// Could be undefined or show old data
```

### Handling Eventual Consistency in UI

```typescript
// Strategy 1: Optimistic UI update
async function placeOrderUI(customerId: string, items: OrderItem[]): Promise<void> {
  // Show optimistic state immediately
  ui.showMessage('Order placed successfully!');
  ui.showOrder({
    id: tempId,
    status: 'draft',
    items: items,
    // ... expected state
  });

  try {
    const orderId = await placeOrder(customerId, items);

    // Replace temp ID with real ID
    ui.updateOrderId(tempId, orderId);

    // Poll for read model to catch up
    await pollUntilAvailable(() => queryOrderSummary(orderId), 5000);

    // Refresh with real data
    const order = await queryOrderSummary(orderId);
    ui.updateOrder(order);

  } catch (error) {
    // Revert optimistic update
    ui.showError('Order failed');
    ui.removeOrder(tempId);
  }
}

// Strategy 2: Show loading state
async function placeOrderUI2(customerId: string, items: OrderItem[]): Promise<void> {
  const orderId = await placeOrder(customerId, items);

  ui.showLoading('Processing your order...');

  // Wait for projection
  const order = await pollUntilAvailable(() => queryOrderSummary(orderId), 5000);

  ui.hideLoading();
  ui.showOrder(order);
}

// Helper: Poll until data available
async function pollUntilAvailable<T>(
  query: () => Promise<T | null>,
  maxWaitMs: number = 5000
): Promise<T> {
  const startTime = Date.now();
  const pollInterval = 100; // Check every 100ms

  while (Date.now() - startTime < maxWaitMs) {
    const result = await query();
    if (result !== null) {
      return result;
    }
    await sleep(pollInterval);
  }

  throw new Error('Timeout waiting for data to be available');
}
```

### Version Numbers in Read Models

```typescript
// Track which events have been processed
CREATE TABLE order_summaries (
  order_id UUID PRIMARY KEY,
  -- ... other fields
  event_version INTEGER NOT NULL, -- Last processed event version
  updated_at TIMESTAMP NOT NULL
);

// Projection handler
class OrderSummaryProjection {
  private async handleOrderItemAdded(
    event: OrderItemAddedEvent
  ): Promise<void> {
    // Get current version in read model
    const current = await this.db.query(
      'SELECT event_version FROM order_summaries WHERE order_id = $1',
      [event.aggregateId]
    );

    const currentVersion = current.rows[0]?.event_version || 0;

    // Skip if already processed (idempotency)
    if (event.version <= currentVersion) {
      console.log(`Event ${event.version} already processed, skipping`);
      return;
    }

    // Process event
    await this.db.query(
      `UPDATE order_summaries
       SET
         item_count = item_count + $1,
         total_amount = total_amount + $2,
         event_version = $3,
         updated_at = $4
       WHERE order_id = $5`,
      [
        event.eventData.quantity,
        event.eventData.quantity * event.eventData.pricePerUnit,
        event.version, // Update processed version
        event.occurredAt,
        event.aggregateId
      ]
    );
  }
}
```

## Rebuilding Projections

### Why Rebuild?

```typescript
// Reasons to rebuild projections:

// 1. Add new projection for new feature
class NewFeatureProjection {
  async rebuild(): Promise<void> {
    // Process all historical events
    const allEvents = await eventStore.getAllEvents('Order');
    for (const event of allEvents) {
      await this.handle(event);
    }
  }
}

// 2. Fix bug in projection handler
class FixedOrderSummaryProjection {
  async rebuild(): Promise<void> {
    // Clear corrupted data
    await this.db.query('TRUNCATE order_summaries');

    // Replay all events with fixed logic
    const allEvents = await eventStore.getAllEvents('Order');
    for (const event of allEvents) {
      await this.handle(event); // Uses fixed logic
    }
  }
}

// 3. Schema change in read model
// Add new column, rebuild from events

// 4. Data corruption
// Something went wrong, rebuild from source of truth
```

### Implementing Rebuild

```typescript
class ProjectionRebuilder {
  constructor(
    private readonly eventStore: EventStore,
    private readonly projection: ProjectionHandler
  ) {}

  async rebuild(aggregateType: string): Promise<void> {
    console.log(`Starting rebuild of ${aggregateType} projection...`);

    // Clear existing data
    await this.projection.clear();

    // Get all events for aggregate type
    let position = 0;
    const batchSize = 1000;

    while (true) {
      const events = await this.eventStore.getAllEvents(
        aggregateType,
        position,
        batchSize
      );

      if (events.length === 0) {
        break;
      }

      // Process batch
      for (const event of events) {
        await this.projection.handle(event);
      }

      position += events.length;
      console.log(`Processed ${position} events...`);
    }

    console.log('Rebuild complete!');
  }
}

// Usage
const rebuilder = new ProjectionRebuilder(
  eventStore,
  orderSummaryProjection
);

await rebuilder.rebuild('Order');
```

### Zero-Downtime Rebuild

```typescript
// Build new projection alongside old one
class ProjectionManager {
  async rebuildWithoutDowntime(
    oldTableName: string,
    newTableName: string,
    projection: ProjectionHandler
  ): Promise<void> {
    // 1. Create new table with same schema
    await this.db.query(`
      CREATE TABLE ${newTableName} (LIKE ${oldTableName} INCLUDING ALL)
    `);

    // 2. Rebuild into new table
    const events = await this.eventStore.getAllEvents('Order');
    for (const event of events) {
      await projection.handle(event); // Writes to new table
    }

    // 3. Keep new table in sync while catching up
    // Subscribe to new events...

    // 4. Swap tables atomically
    await this.db.query('BEGIN');
    await this.db.query(`
      DROP TABLE ${oldTableName};
      ALTER TABLE ${newTableName} RENAME TO ${oldTableName};
    `);
    await this.db.query('COMMIT');

    // 5. Old queries now use new data, no downtime!
  }
}
```

## Materialized Views

### Using Database Materialized Views

```sql
-- PostgreSQL materialized view
CREATE MATERIALIZED VIEW order_statistics AS
SELECT
  DATE_TRUNC('day', created_at) as order_date,
  status,
  COUNT(*) as order_count,
  SUM(total_amount) as total_revenue,
  AVG(total_amount) as avg_order_value
FROM order_summaries
GROUP BY DATE_TRUNC('day', created_at), status;

-- Add indexes
CREATE INDEX idx_order_stats_date ON order_statistics (order_date);

-- Refresh periodically
REFRESH MATERIALIZED VIEW order_statistics;
```

### Application-Level Materialized Views

```typescript
// Computed projection updated on schedule
class OrderStatisticsProjection {
  // Doesn't listen to events directly
  // Instead, runs periodically

  async refresh(): Promise<void> {
    const stats = await this.db.query(`
      SELECT
        DATE(created_at) as order_date,
        status,
        COUNT(*) as order_count,
        SUM(total_amount) as total_revenue
      FROM order_summaries
      GROUP BY DATE(created_at), status
    `);

    // Store in cache or separate table
    await this.cache.set('order_statistics', stats.rows);
  }
}

// Scheduled task
setInterval(async () => {
  await orderStatsProjection.refresh();
}, 60000); // Every minute
```

## Handling Event Replay

### Idempotent Event Handlers

```typescript
// ✅ Idempotent: Safe to replay
class IdempotentProjection {
  async handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
    // Use INSERT ... ON CONFLICT
    await this.db.query(
      `INSERT INTO order_summaries (order_id, customer_id, ...)
       VALUES ($1, $2, ...)
       ON CONFLICT (order_id) DO NOTHING`, // Skip if exists
      [event.aggregateId, event.eventData.customerId, ...]
    );
  }

  async handleOrderItemAdded(event: OrderItemAddedEvent): Promise<void> {
    // Check if event already processed
    const exists = await this.db.query(
      `SELECT 1 FROM processed_events WHERE event_id = $1`,
      [event.eventId]
    );

    if (exists.rows.length > 0) {
      return; // Already processed
    }

    // Process event
    await this.db.query('BEGIN');

    await this.db.query(
      `UPDATE order_summaries
       SET item_count = item_count + $1, ...
       WHERE order_id = $2`,
      [event.eventData.quantity, event.aggregateId]
    );

    // Mark as processed
    await this.db.query(
      `INSERT INTO processed_events (event_id, processed_at)
       VALUES ($1, NOW())`,
      [event.eventId]
    );

    await this.db.query('COMMIT');
  }
}

// Tracking table
CREATE TABLE processed_events (
  event_id UUID PRIMARY KEY,
  processed_at TIMESTAMP NOT NULL
);
```

## Advanced: Cross-Aggregate Projections

### Joining Data from Multiple Aggregates

```typescript
// Projection combines Order and Customer data
class CustomerOrderSummaryProjection {
  async handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
    const customerId = event.eventData.customerId;

    // Get customer data from another projection/service
    const customer = await this.customerService.getCustomer(customerId);

    await this.db.query(
      `INSERT INTO customer_order_summaries (
        order_id,
        customer_id,
        customer_name,
        customer_tier, -- From customer aggregate
        order_total
      ) VALUES ($1, $2, $3, $4, $5)`,
      [
        event.aggregateId,
        customerId,
        customer.name,
        customer.tier, // Enriched from different aggregate
        this.calculateTotal(event.eventData.items)
      ]
    );
  }

  async handleCustomerTierChanged(event: CustomerTierChangedEvent): Promise<void> {
    // Update all orders for this customer
    await this.db.query(
      `UPDATE customer_order_summaries
       SET customer_tier = $1
       WHERE customer_id = $2`,
      [event.eventData.newTier, event.aggregateId]
    );
  }
}
```

## Key Takeaways

1. **Projections separate reads from writes** - Optimized for different purposes
2. **Eventually consistent** - Read models lag slightly behind events
3. **Multiple projections possible** - Different views from same events
4. **Rebuildable** - Can recreate from event history
5. **Idempotent handlers** - Safe to replay events
6. **Denormalized** - Duplicate data for query performance
7. **Event handlers are simple** - One event, one update

## Common Pitfalls

❌ **Synchronous projections** - Makes writes slow, couples write/read
❌ **Not handling replay** - Non-idempotent handlers corrupt data
❌ **Missing indexes** - Defeats purpose of projections
❌ **Too many projections** - Maintenance burden
❌ **Complex projection logic** - Keep handlers simple
❌ **No rebuild strategy** - Can't recover from bugs

## Best Practices

✅ **Start with one projection** - Add more as needed
✅ **Make handlers idempotent** - Always safe to replay
✅ **Track processed version** - Know what's been processed
✅ **Monitor lag** - Alert if read model falls too far behind
✅ **Test rebuilds** - Verify projection logic is correct
✅ **Document each projection** - What queries it supports

## Next Steps

You now understand the complete event sourcing cycle: events → event store → projections → queries. In the next module, we'll combine event sourcing with CQRS to build scalable, maintainable systems.

## Exercise

**Build a Complete Projection:**

1. **Create read model schema:**
   ```sql
   CREATE TABLE product_inventory_summary (
     product_id UUID PRIMARY KEY,
     product_name VARCHAR(200),
     quantity_on_hand INTEGER,
     quantity_reserved INTEGER,
     quantity_available INTEGER,
     last_updated TIMESTAMP
   );
   ```

2. **Define events:**
   ```typescript
   interface InventoryReceivedEvent { /* ... */ }
   interface InventoryReservedEvent { /* ... */ }
   interface InventoryReleasedEvent { /* ... */ }
   ```

3. **Implement projection handler:**
   ```typescript
   class InventorySummaryProjection {
     async handleInventoryReceived(event: InventoryReceivedEvent) {
       // Increase quantity_on_hand
     }

     async handleInventoryReserved(event: InventoryReservedEvent) {
       // Increase quantity_reserved
       // Decrease quantity_available
     }
   }
   ```

4. **Test with events:**
   - Create sample events
   - Process through projection
   - Verify read model state

5. **Implement rebuild:**
   - Clear read model
   - Replay all events
   - Verify same final state

6. **Add second projection:**
   - Create "low stock alerts" projection
   - Uses same events, different purpose

---

**Time to complete:** 60 minutes
**Difficulty:** Advanced

Share your projection implementation in the course forum!
