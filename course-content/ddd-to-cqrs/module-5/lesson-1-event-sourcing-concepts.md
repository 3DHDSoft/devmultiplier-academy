# Module 5, Lesson 1: Event Sourcing Concepts

**Duration:** 20 minutes
**Learning Objectives:**
- Understand what event sourcing is and why it's valuable
- Learn how events become the source of truth
- Compare event sourcing with traditional CRUD approaches
- Identify when event sourcing is appropriate
- Recognize the benefits and trade-offs

---

## Introduction

Event Sourcing is a pattern where you store all changes to application state as a sequence of events, rather than storing just the current state. Instead of updating records in place, you append new events to an immutable log. The current state is derived by replaying these events.

This fundamental shift in how we persist data unlocks powerful capabilities—from perfect audit trails to time travel debugging—but also introduces new complexity that must be carefully managed.

## The Traditional Problem

### CRUD: Current State Only

```typescript
// ❌ Traditional CRUD approach
interface BankAccount {
  id: string;
  accountNumber: string;
  balance: number;
  status: 'active' | 'suspended' | 'closed';
  lastModified: Date;
}

// Update in place - history is lost
class BankAccountService {
  async withdraw(accountId: string, amount: number): Promise<void> {
    const account = await this.db.bankAccounts.findOne({ id: accountId });

    // Previous balance is lost forever
    account.balance -= amount;
    account.lastModified = new Date();

    await this.db.bankAccounts.update(accountId, account);
  }
}

// Questions we CANNOT answer:
// - What was the balance yesterday at 3pm?
// - Who made this withdrawal?
// - Was this the 3rd withdrawal today or the 30th?
// - How did we get to this balance?
```

**Problems with CRUD:**
1. **History lost** - Can only see current state, not how we got there
2. **No audit trail** - Can't prove what happened
3. **Limited debugging** - Can't replay to find bugs
4. **Concurrent updates** - Lost update problem
5. **Compliance issues** - Regulations often require immutable history

### The Real-World Analogy: Bank Statements

```typescript
// 💡 Banks don't update your balance in place
// They record every transaction

// Traditional CRUD would be like:
// January 1: Balance = $1000
// January 2: Balance = $1200  // How did this happen? We don't know!

// Event Sourcing is like real bank statements:
// January 1: Deposited $1000
// January 2: Withdrew $50
// January 2: Deposited $250
// Current balance = sum of all transactions = $1200
```

## What is Event Sourcing?

**Definition:** Event Sourcing ensures that all changes to application state are stored as a sequence of events. Rather than storing just the current state, we store the events that led to that state.

### Core Concepts

```typescript
// ✅ Event Sourcing approach

// 1. Events are immutable facts
interface DomainEvent {
  eventId: string;
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  occurredAt: Date;
  version: number; // For optimistic concurrency
  data: unknown;
}

// 2. Specific event types
interface AccountOpenedEvent extends DomainEvent {
  eventType: 'AccountOpened';
  data: {
    accountNumber: string;
    customerId: string;
    initialBalance: number;
  };
}

interface MoneyDepositedEvent extends DomainEvent {
  eventType: 'MoneyDeposited';
  data: {
    amount: number;
    transactionId: string;
  };
}

interface MoneyWithdrawnEvent extends DomainEvent {
  eventType: 'MoneyWithdrawn';
  data: {
    amount: number;
    transactionId: string;
  };
}

// 3. Aggregate reconstructed from events
class BankAccount {
  private id: string;
  private accountNumber: string;
  private balance: number;
  private status: string;
  private version: number = 0; // Optimistic concurrency

  // Events that occurred but not yet persisted
  private uncommittedEvents: DomainEvent[] = [];

  // Reconstruct from event history
  static fromEvents(events: DomainEvent[]): BankAccount {
    const account = new BankAccount();

    for (const event of events) {
      account.apply(event);
      account.version++;
    }

    return account;
  }

  // Apply event to update state
  private apply(event: DomainEvent): void {
    switch (event.eventType) {
      case 'AccountOpened':
        this.applyAccountOpened(event as AccountOpenedEvent);
        break;
      case 'MoneyDeposited':
        this.applyMoneyDeposited(event as MoneyDepositedEvent);
        break;
      case 'MoneyWithdrawn':
        this.applyMoneyWithdrawn(event as MoneyWithdrawnEvent);
        break;
    }
  }

  private applyAccountOpened(event: AccountOpenedEvent): void {
    this.id = event.aggregateId;
    this.accountNumber = event.data.accountNumber;
    this.balance = event.data.initialBalance;
    this.status = 'active';
  }

  private applyMoneyDeposited(event: MoneyDepositedEvent): void {
    this.balance += event.data.amount;
  }

  private applyMoneyWithdrawn(event: MoneyWithdrawnEvent): void {
    this.balance -= event.data.amount;
  }

  // Command: Withdraw money
  withdraw(amount: number, transactionId: string): void {
    if (this.status !== 'active') {
      throw new Error('Account is not active');
    }

    if (this.balance < amount) {
      throw new Error('Insufficient funds');
    }

    // Create event
    const event: MoneyWithdrawnEvent = {
      eventId: crypto.randomUUID(),
      aggregateId: this.id,
      aggregateType: 'BankAccount',
      eventType: 'MoneyWithdrawn',
      occurredAt: new Date(),
      version: this.version + 1,
      data: { amount, transactionId }
    };

    // Apply to current state
    this.apply(event);

    // Track for persistence
    this.uncommittedEvents.push(event);
    this.version++;
  }

  getUncommittedEvents(): DomainEvent[] {
    return this.uncommittedEvents;
  }

  markEventsAsCommitted(): void {
    this.uncommittedEvents = [];
  }
}
```

## Event Sourcing vs Traditional CRUD

### Side-by-Side Comparison

```typescript
// TRADITIONAL CRUD
class CRUDOrderService {
  async updateOrderStatus(orderId: string, newStatus: string): Promise<void> {
    await db.query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2',
      [newStatus, orderId]
    );
    // Old status is lost forever
  }
}

// EVENT SOURCING
class EventSourcedOrderAggregate {
  async confirmOrder(orderId: string): Promise<void> {
    // Load events
    const events = await eventStore.getEvents('Order', orderId);
    const order = Order.fromEvents(events);

    // Execute business logic
    order.confirm(); // Creates OrderConfirmedEvent

    // Append new events
    await eventStore.append(order.getUncommittedEvents());

    // All history preserved in event stream
  }
}
```

### Data Storage Comparison

```sql
-- CRUD: Current state table
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  customer_id UUID,
  status VARCHAR(20),
  total DECIMAL(10, 2),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Lost information: Who changed status? When? Why? Previous status?

-- EVENT SOURCING: Event stream
CREATE TABLE events (
  event_id UUID PRIMARY KEY,
  aggregate_type VARCHAR(50),
  aggregate_id UUID,
  event_type VARCHAR(100),
  event_data JSONB,
  occurred_at TIMESTAMP,
  version INTEGER,
  UNIQUE(aggregate_id, version)
);

-- Complete history:
-- OrderCreated -> OrderItemAdded -> OrderItemAdded -> OrderConfirmed -> OrderShipped
```

## Benefits of Event Sourcing

### 1. Complete Audit Trail

```typescript
// Every change is recorded with context
interface OrderConfirmedEvent {
  eventType: 'OrderConfirmed';
  data: {
    orderId: string;
    confirmedBy: string; // Who
    confirmedAt: Date;   // When
    reason: string;      // Why
    previousStatus: string;
  };
}

// Can answer: Who confirmed order #123 and when?
async function getOrderConfirmationDetails(orderId: string) {
  const events = await eventStore.getEvents('Order', orderId);
  const confirmEvent = events.find(e => e.eventType === 'OrderConfirmed');

  return {
    confirmedBy: confirmEvent.data.confirmedBy,
    confirmedAt: confirmEvent.data.confirmedAt,
    reason: confirmEvent.data.reason
  };
}
```

### 2. Time Travel / Temporal Queries

```typescript
// Reconstruct state at any point in time
async function getAccountBalanceAt(
  accountId: string,
  pointInTime: Date
): Promise<number> {
  const events = await eventStore.getEvents('BankAccount', accountId);

  // Only replay events up to the point in time
  const relevantEvents = events.filter(e => e.occurredAt <= pointInTime);

  const account = BankAccount.fromEvents(relevantEvents);
  return account.getBalance();
}

// Real-world use cases:
// - "What was inventory level yesterday?"
// - "Show me the order status at 3pm"
// - "What did the pricing look like last month?"
```

### 3. Event Replay for Debugging

```typescript
// Reproduce bugs by replaying events
async function debugOrderIssue(orderId: string): Promise<void> {
  const events = await eventStore.getEvents('Order', orderId);

  console.log('Replaying order events:');
  const order = new Order();

  for (const event of events) {
    console.log(`Event ${event.version}: ${event.eventType}`, event.data);
    order.apply(event);
    console.log('State after:', order.getCurrentState());
  }

  // Can see exactly where/when bug occurred
}
```

### 4. New Projections from Historical Data

```typescript
// Build new read models from existing events
// Example: Add "customer loyalty score" feature

class LoyaltyScoreProjection {
  async rebuild(): Promise<void> {
    // Replay ALL historical order events
    const allOrderEvents = await eventStore.getAllEvents('Order');

    for (const event of allOrderEvents) {
      if (event.eventType === 'OrderPlaced') {
        await this.updateLoyaltyScore(event.data.customerId, 10);
      }
      if (event.eventType === 'OrderReturned') {
        await this.updateLoyaltyScore(event.data.customerId, -5);
      }
    }
  }
}

// No data migration needed - events are already there!
```

### 5. Business Intelligence & Analytics

```typescript
// Events are gold for analytics
async function analyzeWithdrawalPatterns(): Promise<WithdrawalStats> {
  const withdrawalEvents = await eventStore.getEventsByType('MoneyWithdrawn');

  return {
    averageAmount: calculateAverage(withdrawalEvents),
    peakHours: identifyPeakHours(withdrawalEvents),
    frequentTransfers: findPatterns(withdrawalEvents),
    // All historical data available for analysis
  };
}
```

## Drawbacks and Challenges

### 1. Increased Complexity

```typescript
// ❌ Simple CRUD
async function updateUsername(userId: string, newName: string) {
  await db.users.update({ id: userId }, { name: newName });
}

// 🤔 Event Sourced (more code)
async function changeUsername(userId: string, newName: string) {
  const events = await eventStore.getEvents('User', userId);
  const user = User.fromEvents(events);

  user.changeName(newName); // Creates UsernameChangedEvent

  await eventStore.append(user.getUncommittedEvents());
}

// Trade-off: More code for simple operations
```

### 2. Eventual Consistency

```typescript
// Events written to event store (source of truth)
await eventStore.append(orderConfirmedEvent);

// Read models updated asynchronously
eventBus.publish(orderConfirmedEvent);
// ... time passes ...
// Eventually, read model is updated

// User might see stale data briefly
const order = await readModel.getOrder(orderId);
// Might still show old status for a few milliseconds
```

### 3. Event Schema Evolution

```typescript
// Version 1: Simple event
interface OrderPlacedV1 {
  orderId: string;
  customerId: string;
  total: number;
}

// Version 2: Need currency
interface OrderPlacedV2 {
  orderId: string;
  customerId: string;
  total: number;
  currency: string; // New field!
}

// Must handle both versions when replaying
function applyOrderPlaced(event: OrderPlacedV1 | OrderPlacedV2): void {
  const currency = 'currency' in event ? event.currency : 'USD'; // Default for V1
  // ...
}
```

### 4. Storage Growth

```typescript
// Events accumulate forever
// 1 million orders × 10 events each = 10 million event records

// Mitigation: Snapshots (covered in next lesson)
interface Snapshot {
  aggregateId: string;
  aggregateType: string;
  version: number;
  state: unknown;
  createdAt: Date;
}

// Replay from snapshot + recent events
// Instead of replaying 1000 events, replay snapshot + 50 recent events
```

### 5. Queries Are Harder

```typescript
// ❌ Easy with CRUD
const activeOrders = await db.orders.find({ status: 'active' });

// 🤔 Harder with Event Sourcing
// Need to build a read model (projection)
class ActiveOrdersProjection {
  async handle(event: DomainEvent): Promise<void> {
    if (event.eventType === 'OrderCreated') {
      await this.readDb.activeOrders.insert({...});
    }
    if (event.eventType === 'OrderCompleted') {
      await this.readDb.activeOrders.delete(event.aggregateId);
    }
  }
}
```

## When to Use Event Sourcing

### Good Fit ✅

1. **Audit requirements**
   - Financial systems (banking, payments)
   - Healthcare records
   - Legal/compliance systems

2. **Collaborative editing**
   - Google Docs-style applications
   - Conflict resolution needed

3. **Complex business processes**
   - Order fulfillment with many steps
   - Workflow engines
   - State machines with history

4. **Analytics-heavy domains**
   - User behavior tracking
   - Business intelligence
   - ML/AI training data

5. **Temporal queries needed**
   - "Show me the state last Tuesday"
   - Historical reporting
   - Time-travel debugging

### Poor Fit ❌

1. **Simple CRUD apps**
   - Basic blog, CMS
   - Small internal tools

2. **Performance-critical reads**
   - High-frequency queries
   - Real-time dashboards (unless you have projections)

3. **No audit requirements**
   - Throwaway prototypes
   - Internal tools

4. **Small team without experience**
   - Learning curve is steep
   - More things to manage

## Event Sourcing in Real Systems

### Case Study 1: Stripe (Payments)

```typescript
// Stripe uses event sourcing for payment processing
// Events:
// - PaymentIntentCreated
// - PaymentMethodAttached
// - PaymentIntentConfirmed
// - ChargeSucceeded / ChargeFailed
// - RefundIssued

// Benefits:
// - Complete audit trail for compliance
// - Can replay to debug payment issues
// - Build fraud detection from historical events
// - Handle disputes with full event history
```

### Case Study 2: GitHub (Source Control)

```typescript
// Git is event sourcing!
// Each commit is an event
// Current state = replay all commits

// Benefits:
// - Time travel (checkout any commit)
// - Complete history (git log)
// - Branches = different projections
// - Can rebuild repo from commit history
```

## AI-Assisted Event Sourcing

```typescript
// AI can help with:

// 1. Generate event definitions
// Prompt: "Create events for an order management system with
// create, modify items, apply discount, confirm, and cancel"

// 2. Generate apply methods
// Prompt: "Generate apply methods for these events: [paste events]"

// 3. Suggest event schema
// Prompt: "What events should I capture for a meeting room booking system?"

// 4. Version migration strategies
// Prompt: "How should I migrate from OrderPlacedV1 to OrderPlacedV2?"

// BUT: AI cannot design your domain model
// - Events must reflect your business domain
// - Event granularity requires domain knowledge
// - You must validate event completeness with domain experts
```

## Key Takeaways

1. **Events as source of truth** - Store what happened, derive current state
2. **Immutable append-only log** - Events never change, only append new ones
3. **Complete audit trail** - Know exactly what happened and when
4. **Time travel possible** - Reconstruct state at any point
5. **Eventual consistency** - Read models lag behind events
6. **More complexity** - Trade-off for powerful capabilities
7. **Not for everything** - Use where benefits justify costs

## Common Misconceptions

❌ "Event sourcing requires microservices"
✅ Works in monoliths and distributed systems

❌ "Must use event sourcing everywhere"
✅ Can use selectively for specific aggregates

❌ "Events = event-driven architecture"
✅ Related but different - ES is about persistence, EDA is about integration

❌ "Can't query event sourced data"
✅ Build projections/read models for queries

❌ "Event store must be special database"
✅ Can use PostgreSQL, any database with transactions

## Next Steps

In the next lesson, we'll implement a complete **Event Store** with TypeScript, covering event schemas, versioning, appending events, optimistic concurrency, and snapshotting.

## Exercise

**Design Your First Event-Sourced Aggregate:**

For a shopping cart system:

1. **Identify events:** What are the key things that happen to a cart?
   - Example: CartCreated, ItemAdded, ItemRemoved, DiscountApplied, CartCheckedOut

2. **Define event interfaces:**
   ```typescript
   interface ItemAddedEvent {
     eventType: 'ItemAdded';
     data: {
       productId: string;
       quantity: number;
       priceAtTimeOfAdd: number;
     };
   }
   ```

3. **List commands (methods that create events):**
   - addItem(), removeItem(), applyDiscount(), checkout()

4. **Write apply methods:**
   ```typescript
   private applyItemAdded(event: ItemAddedEvent): void {
     // Update cart state based on event
   }
   ```

5. **Consider edge cases:**
   - What if item already in cart?
   - What if cart already checked out?
   - How to handle quantity changes vs remove?

**Example Solution Outline:**
```typescript
class ShoppingCart {
  private items: Map<string, CartItem> = new Map();
  private status: 'active' | 'checked_out' | 'abandoned';
  private totalAmount: number = 0;

  static fromEvents(events: DomainEvent[]): ShoppingCart {
    const cart = new ShoppingCart();
    events.forEach(e => cart.apply(e));
    return cart;
  }

  addItem(productId: string, quantity: number, price: number): void {
    if (this.status !== 'active') {
      throw new Error('Cannot modify inactive cart');
    }

    const event: ItemAddedEvent = {
      eventType: 'ItemAdded',
      data: { productId, quantity, priceAtTimeOfAdd: price }
    };

    this.apply(event);
    this.uncommittedEvents.push(event);
  }

  private apply(event: DomainEvent): void {
    switch (event.eventType) {
      case 'ItemAdded':
        this.applyItemAdded(event as ItemAddedEvent);
        break;
      // ...
    }
  }
}
```

---

**Time to complete:** 45 minutes
**Difficulty:** Intermediate

Share your event-sourced aggregate design in the course forum!
