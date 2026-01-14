# Separating Reads and Writes

**Duration:** 22 minutes
**Learning Objectives:**
- Understand command model (write side) and query model (read side)
- Implement architectural patterns for separation
- Compare simple CQRS (same database) vs full CQRS (separate databases)
- Handle eventual consistency considerations
- Implement CQRS with TypeScript examples

---

## Introduction

CQRS separates the responsibility for handling commands (writes) from handling queries (reads). This separation can range from simple logical separation in the same codebase to complete physical separation with different databases and technologies. Understanding the spectrum of CQRS implementations is crucial for choosing the right approach.

## The CQRS Spectrum

### Level 0: Traditional Architecture (No CQRS)

```typescript
// Single model serves both reads and writes
class OrderService {
  async createOrder(data: CreateOrderInput): Promise<Order> {
    // Write operation
    const order = await this.orderRepo.create(data);
    return order;
  }

  async getOrder(id: string): Promise<Order> {
    // Read operation - same model
    return this.orderRepo.findById(id);
  }

  async getOrderList(userId: string): Promise<Order[]> {
    // Complex read - same model, performance suffers
    return this.orderRepo.findByUser(userId);
  }
}
```

### Level 1: Logical Separation (Simple CQRS)

```typescript
// Separate write and read logic, same database
namespace Commands {
  export class CreateOrder {
    constructor(
      public readonly customerId: string,
      public readonly items: OrderItemInput[]
    ) {}
  }

  export class CreateOrderHandler {
    async handle(command: CreateOrder): Promise<OrderId> {
      // Write model with business logic
      const order = Order.create(command.customerId, command.items);
      await this.orderRepo.save(order);
      return order.id;
    }
  }
}

namespace Queries {
  export class GetOrderList {
    constructor(
      public readonly userId: string,
      public readonly page: number
    ) {}
  }

  export class GetOrderListHandler {
    async handle(query: GetOrderList): Promise<OrderListItem[]> {
      // Read model optimized for display
      return this.readRepo.findOrderList(query.userId, query.page);
    }
  }
}

// Same database, different access patterns
```

### Level 2: Physical Separation (Full CQRS)

```typescript
// Separate databases optimized for different purposes

// Write side: PostgreSQL with normalized schema
class OrderWriteRepository {
  async save(order: Order): Promise<void> {
    await this.postgres.transaction(async (tx) => {
      await tx.orders.create({ data: order });
      await tx.orderItems.createMany({ data: order.items });
    });
  }
}

// Read side: Denormalized views, possibly different database
class OrderReadRepository {
  async findOrderList(userId: string): Promise<OrderListItem[]> {
    // Could be PostgreSQL materialized view
    // Or Redis cache
    // Or Elasticsearch for search
    return this.readDb.orderListView.findMany({
      where: { userId },
    });
  }
}

// Synchronization via events or CDC (Change Data Capture)
```

## The Command Model (Write Side)

### Purpose and Characteristics

**Purpose:** Express user intent and enforce business rules

**Characteristics:**
- Strong consistency
- Transactional integrity
- Business logic and validation
- Normalized data structure
- Optimized for writes

### Command Structure

```typescript
// Commands represent user intent
interface Command {
  readonly _type: string; // For serialization
}

class PlaceOrderCommand implements Command {
  readonly _type = 'PlaceOrder';

  constructor(
    public readonly customerId: string,
    public readonly items: OrderItemInput[],
    public readonly shippingAddress: Address,
    public readonly paymentMethod: PaymentMethodInput
  ) {}
}

class CancelOrderCommand implements Command {
  readonly _type = 'CancelOrder';

  constructor(
    public readonly orderId: string,
    public readonly reason: string,
    public readonly requestedBy: string
  ) {}
}

class UpdateShippingAddressCommand implements Command {
  readonly _type = 'UpdateShippingAddress';

  constructor(
    public readonly orderId: string,
    public readonly newAddress: Address
  ) {}
}
```

### Command Handlers (Business Logic)

```typescript
class PlaceOrderCommandHandler {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly customerRepo: CustomerRepository,
    private readonly inventoryService: InventoryService,
    private readonly eventBus: EventBus
  ) {}

  async handle(command: PlaceOrderCommand): Promise<Result<OrderId, Error>> {
    // 1. Load necessary aggregates
    const customerResult = await this.customerRepo.findById(command.customerId);
    if (!customerResult.success) {
      return err(new CustomerNotFoundError(command.customerId));
    }
    const customer = customerResult.data;

    // 2. Validate business rules
    if (!customer.canPlaceOrder()) {
      return err(new CustomerNotEligibleError());
    }

    // 3. Check inventory availability
    const inventoryCheck = await this.inventoryService.checkAvailability(
      command.items
    );
    if (!inventoryCheck.allAvailable) {
      return err(new InsufficientInventoryError(inventoryCheck.unavailableItems));
    }

    // 4. Create aggregate with domain logic
    const orderResult = Order.create({
      customerId: command.customerId,
      items: command.items,
      shippingAddress: command.shippingAddress,
      paymentMethod: command.paymentMethod,
    });

    if (!orderResult.success) {
      return err(orderResult.error);
    }
    const order = orderResult.data;

    // 5. Persist the aggregate
    await this.orderRepo.save(order);

    // 6. Publish domain events
    await this.eventBus.publish(
      new OrderPlacedEvent({
        orderId: order.id,
        customerId: order.customerId,
        items: order.items,
        total: order.total,
        placedAt: order.createdAt,
      })
    );

    return ok(order.id);
  }
}
```

### Write Model Aggregate

```typescript
class Order {
  private constructor(
    private readonly id: OrderId,
    private readonly customerId: CustomerId,
    private items: OrderItem[],
    private status: OrderStatus,
    private shippingAddress: Address,
    private total: Money,
    private readonly createdAt: Date,
    private updatedAt: Date
  ) {}

  static create(input: CreateOrderInput): Result<Order, Error> {
    // Validation
    if (input.items.length === 0) {
      return err(new EmptyOrderError());
    }

    // Business logic
    const items = input.items.map((item) =>
      OrderItem.create(item.productId, item.quantity, item.price)
    );

    const total = Order.calculateTotal(items);

    if (total.isLessThan(Money.fromDollars(1))) {
      return err(new MinimumOrderValueError());
    }

    return ok(
      new Order(
        OrderId.generate(),
        CustomerId.from(input.customerId),
        items,
        OrderStatus.Pending,
        input.shippingAddress,
        total,
        new Date(),
        new Date()
      )
    );
  }

  cancel(reason: string): Result<void, Error> {
    // Business rule: Can only cancel pending orders
    if (this.status !== OrderStatus.Pending) {
      return err(new CannotCancelOrderError(this.status));
    }

    this.status = OrderStatus.Cancelled;
    this.updatedAt = new Date();

    return ok(undefined);
  }

  private static calculateTotal(items: OrderItem[]): Money {
    return items.reduce(
      (sum, item) => sum.add(item.price.multiply(item.quantity)),
      Money.zero('USD')
    );
  }

  // Getters only - no public setters
  getId(): OrderId {
    return this.id;
  }

  getStatus(): OrderStatus {
    return this.status;
  }
}
```

## The Query Model (Read Side)

### Purpose and Characteristics

**Purpose:** Provide optimized data for display and reporting

**Characteristics:**
- Eventually consistent (acceptable lag)
- Denormalized data
- Optimized for specific views
- No business logic
- Fast reads

### Query Structure

```typescript
// Queries request specific data shapes
interface Query<TResult> {
  readonly _type: string;
}

class GetOrderListQuery implements Query<OrderListItem[]> {
  readonly _type = 'GetOrderList';

  constructor(
    public readonly userId: string,
    public readonly page: number,
    public readonly limit: number,
    public readonly status?: OrderStatus
  ) {}
}

class GetOrderDetailsQuery implements Query<OrderDetails> {
  readonly _type = 'GetOrderDetails';

  constructor(public readonly orderId: string) {}
}

class GetOrderSummaryQuery implements Query<OrderSummary> {
  readonly _type = 'GetOrderSummary';

  constructor(
    public readonly startDate: Date,
    public readonly endDate: Date
  ) {}
}
```

### Query Handlers (Data Retrieval)

```typescript
class GetOrderListQueryHandler {
  constructor(private readonly readDb: ReadDatabase) {}

  async handle(query: GetOrderListQuery): Promise<OrderListItem[]> {
    // No business logic - just data retrieval
    // Data is pre-computed and denormalized
    return this.readDb.orderListView.findMany({
      where: {
        userId: query.userId,
        ...(query.status && { status: query.status }),
      },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: { placedAt: 'desc' },
    });
  }
}

class GetOrderDetailsQueryHandler {
  constructor(private readonly readDb: ReadDatabase) {}

  async handle(query: GetOrderDetailsQuery): Promise<OrderDetails | null> {
    // Single optimized query - all data pre-joined
    const order = await this.readDb.orderDetailsView.findUnique({
      where: { orderId: query.orderId },
    });

    return order;
  }
}

class GetOrderSummaryQueryHandler {
  constructor(private readonly readDb: ReadDatabase) {}

  async handle(query: GetOrderSummaryQuery): Promise<OrderSummary> {
    // Aggregated data from materialized view
    const summary = await this.readDb.orderSummaryView.findFirst({
      where: {
        date: {
          gte: query.startDate,
          lte: query.endDate,
        },
      },
    });

    return summary || OrderSummary.empty();
  }
}
```

### Read Models (Denormalized Views)

```typescript
// Read model 1: Order list for customer dashboard
interface OrderListItem {
  orderId: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  statusLabel: string; // Pre-computed display label

  // Denormalized customer data
  customerName: string;
  customerEmail: string;

  // Denormalized item data
  itemCount: number;
  itemPreview: string[]; // First 3 product names

  // Financial data
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;

  // Calculated fields
  estimatedDelivery: Date | null;
  canCancel: boolean; // Pre-computed business rule

  // Timestamps
  placedAt: Date;
  updatedAt: Date;
}

// Read model 2: Order details for admin view
interface OrderDetails {
  orderId: string;
  orderNumber: string;
  status: string;

  // Full customer information
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    loyaltyTier: string;
  };

  // Complete item details
  items: {
    productId: string;
    productName: string;
    productSku: string;
    productImage: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    discounts: {
      code: string;
      amount: number;
    }[];
  }[];

  // Shipping information
  shipping: {
    address: Address;
    method: string;
    carrier: string;
    trackingNumber: string | null;
    estimatedDelivery: Date;
  };

  // Payment information
  payment: {
    method: string;
    lastFour: string;
    status: string;
    transactions: PaymentTransaction[];
  };

  // Audit information
  timeline: {
    timestamp: Date;
    event: string;
    user: string;
  }[];

  placedAt: Date;
  updatedAt: Date;
}

// Read model 3: Analytics summary
interface OrderSummary {
  date: Date;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: Record<OrderStatus, number>;
  topProducts: {
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
  }[];
  customerSegments: {
    segment: string;
    orders: number;
    revenue: number;
  }[];
}
```

## Simple CQRS (Same Database)

### Pattern 1: Separate Methods

```typescript
// Simple separation in same repository
class OrderRepository {
  // Write methods: Work with domain aggregates
  async save(order: Order): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.orders.upsert({
        where: { id: order.getId().value },
        create: this.toOrderEntity(order),
        update: this.toOrderEntity(order),
      });

      // Save related entities in normalized form
      await tx.orderItems.deleteMany({ where: { orderId: order.getId().value } });
      await tx.orderItems.createMany({
        data: order.getItems().map((item) => this.toOrderItemEntity(item)),
      });
    });
  }

  // Read methods: Work with DTOs optimized for queries
  async findOrderList(userId: string, page: number): Promise<OrderListItem[]> {
    // Denormalized query for performance
    return this.db.orders.findMany({
      where: { customerId: userId },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        placedAt: true,
        customer: {
          select: { name: true, email: true },
        },
        _count: {
          select: { items: true },
        },
      },
      skip: (page - 1) * 20,
      take: 20,
      orderBy: { placedAt: 'desc' },
    });
  }
}
```

### Pattern 2: Separate Tables/Views

```typescript
// Prisma schema with materialized views
model Order {
  id         String   @id @default(uuid())
  customerId String
  status     String
  total      Decimal
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  customer Customer @relation(fields: [customerId], references: [id])
  items    OrderItem[]

  @@index([customerId])
}

// Materialized view for reads (updated via triggers or scheduled job)
model OrderListView {
  orderId       String   @id
  orderNumber   String
  status        String
  customerName  String
  customerEmail String
  itemCount     Int
  total         Decimal
  placedAt      DateTime
  canCancel     Boolean

  @@index([customerId])
  @@map("order_list_view")
}
```

### Benefits and Limitations

**Benefits:**
- Simple to implement
- No synchronization complexity
- Strong consistency (same database)
- Incremental adoption path

**Limitations:**
- Still shares database resources
- Cannot scale reads and writes independently
- Limited technology choices (same database type)
- Some query optimization limitations

## Full CQRS (Separate Databases)

### Architecture Overview

```typescript
// Write side: PostgreSQL (transactional integrity)
class OrderWriteService {
  constructor(
    private readonly writeDb: PostgresDatabase,
    private readonly eventBus: EventBus
  ) {}

  async placeOrder(command: PlaceOrderCommand): Promise<OrderId> {
    const order = Order.create(command);

    await this.writeDb.transaction(async (tx) => {
      await tx.orders.create({ data: order });
    });

    // Publish event to sync read side
    await this.eventBus.publish(
      new OrderPlacedEvent({
        orderId: order.id,
        customerId: order.customerId,
        items: order.items,
        total: order.total,
      })
    );

    return order.id;
  }
}

// Read side: Multiple optimized stores
class OrderReadService {
  constructor(
    private readonly listCache: Redis, // For order lists
    private readonly searchIndex: Elasticsearch, // For search
    private readonly analytics: TimescaleDB // For time-series analytics
  ) {}

  async getOrderList(userId: string): Promise<OrderListItem[]> {
    // Try cache first
    const cached = await this.listCache.get(`user:${userId}:orders`);
    if (cached) return JSON.parse(cached);

    // Fallback to search index
    return this.searchIndex.search({
      index: 'orders',
      query: { match: { customerId: userId } },
    });
  }

  async searchOrders(query: string): Promise<OrderSearchResult[]> {
    return this.searchIndex.search({
      index: 'orders',
      query: { multi_match: { query, fields: ['orderNumber', 'customerName', 'items'] } },
    });
  }

  async getOrderAnalytics(range: DateRange): Promise<OrderAnalytics> {
    return this.analytics.query(`
      SELECT
        time_bucket('1 hour', placed_at) AS hour,
        COUNT(*) as order_count,
        SUM(total) as revenue
      FROM order_analytics
      WHERE placed_at BETWEEN $1 AND $2
      GROUP BY hour
      ORDER BY hour
    `, [range.start, range.end]);
  }
}
```

### Synchronization via Events

```typescript
// Event handler updates read models
class OrderPlacedEventHandler {
  constructor(
    private readonly listCache: Redis,
    private readonly searchIndex: Elasticsearch,
    private readonly analytics: TimescaleDB
  ) {}

  async handle(event: OrderPlacedEvent): Promise<void> {
    // Update all read models in parallel
    await Promise.all([
      this.updateListCache(event),
      this.updateSearchIndex(event),
      this.updateAnalytics(event),
    ]);
  }

  private async updateListCache(event: OrderPlacedEvent): Promise<void> {
    const listItem: OrderListItem = {
      orderId: event.orderId,
      orderNumber: event.orderNumber,
      status: 'pending',
      customerName: event.customerName,
      customerEmail: event.customerEmail,
      itemCount: event.items.length,
      total: event.total,
      placedAt: event.placedAt,
      canCancel: true,
    };

    // Update user's order list in cache
    const key = `user:${event.customerId}:orders`;
    const list = await this.listCache.get(key);
    const orders = list ? JSON.parse(list) : [];
    orders.unshift(listItem);

    await this.listCache.set(key, JSON.stringify(orders), 'EX', 3600);
  }

  private async updateSearchIndex(event: OrderPlacedEvent): Promise<void> {
    await this.searchIndex.index({
      index: 'orders',
      id: event.orderId,
      document: {
        orderId: event.orderId,
        orderNumber: event.orderNumber,
        customerId: event.customerId,
        customerName: event.customerName,
        items: event.items.map((item) => item.productName),
        total: event.total,
        placedAt: event.placedAt,
      },
    });
  }

  private async updateAnalytics(event: OrderPlacedEvent): Promise<void> {
    await this.analytics.query(
      `
      INSERT INTO order_analytics (order_id, customer_id, total, placed_at)
      VALUES ($1, $2, $3, $4)
    `,
      [event.orderId, event.customerId, event.total, event.placedAt]
    );
  }
}
```

### Benefits and Limitations

**Benefits:**
- Independent scaling (scale reads without affecting writes)
- Technology optimization (PostgreSQL for writes, Elasticsearch for search)
- Performance isolation (slow queries don't block writes)
- Flexibility (multiple read models for different use cases)

**Limitations:**
- Increased complexity (multiple databases to manage)
- Eventual consistency (reads lag behind writes)
- Synchronization challenges (what if event handler fails?)
- Operational overhead (more infrastructure to monitor)

## Eventual Consistency Considerations

### Understanding the Lag

```typescript
// Write completes
await commandHandler.handle(new PlaceOrderCommand(...));
// Order is in write database

// UI redirects to order confirmation page
// Read database might not have the order yet!

// Problem: User sees "Order not found" immediately after placing order
```

### Strategy 1: Return Data with Command Response

```typescript
class PlaceOrderCommandHandler {
  async handle(command: PlaceOrderCommand): Promise<PlaceOrderResult> {
    const order = Order.create(command);
    await this.orderRepo.save(order);

    // Return data needed for UI immediately
    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      total: order.total,
      // UI can display this without querying read model
    };
  }
}

// UI component
async function placeOrder(command: PlaceOrderCommand) {
  const result = await orderService.placeOrder(command);

  // Display confirmation using returned data
  // No need to query read model immediately
  navigate(`/orders/${result.orderId}/confirmation`, {
    state: { order: result },
  });
}
```

### Strategy 2: Optimistic UI Updates

```typescript
// UI updates immediately, syncs in background
class OrderStore {
  private orders: OrderListItem[] = [];

  async placeOrder(command: PlaceOrderCommand): Promise<void> {
    // Optimistically add to local state
    const optimisticOrder: OrderListItem = {
      orderId: 'temp-' + Date.now(),
      status: 'pending',
      total: command.calculateTotal(),
      placedAt: new Date(),
      // ... other fields
    };

    this.orders.unshift(optimisticOrder);

    try {
      // Send command
      const result = await this.api.placeOrder(command);

      // Replace optimistic order with real one
      this.orders = this.orders.map((o) =>
        o.orderId === optimisticOrder.orderId
          ? { ...o, orderId: result.orderId, orderNumber: result.orderNumber }
          : o
      );
    } catch (error) {
      // Rollback optimistic update
      this.orders = this.orders.filter((o) => o.orderId !== optimisticOrder.orderId);
      throw error;
    }
  }
}
```

### Strategy 3: Polling with Timeout

```typescript
async function getOrderWithRetry(
  orderId: string,
  maxAttempts = 10
): Promise<OrderDetails> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const order = await orderQuery.getOrderDetails(orderId);

    if (order) {
      return order;
    }

    // Wait with exponential backoff
    await sleep(100 * Math.pow(2, attempt));
  }

  throw new OrderNotFoundError(orderId);
}

// Usage
const orderId = await commandHandler.handle(placeOrderCommand);
const order = await getOrderWithRetry(orderId);
```

### Strategy 4: Version Tracking

```typescript
// Track version in write model
class Order {
  private version: number = 0;

  place(): void {
    this.status = OrderStatus.Placed;
    this.version++;
  }
}

// Read model stores version
interface OrderListItem {
  orderId: string;
  version: number; // Synced from write model
  // ... other fields
}

// UI can detect staleness
async function getOrderDetails(orderId: string, expectedVersion?: number) {
  const order = await query.getOrderDetails(orderId);

  if (expectedVersion && order.version < expectedVersion) {
    // Read model is behind, retry or show loading state
    throw new StaleReadError(orderId, expectedVersion, order.version);
  }

  return order;
}
```

## Choosing Your CQRS Level

### Decision Matrix

| Factor                    | Simple CQRS           | Full CQRS             |
| ------------------------- | --------------------- | --------------------- |
| **Complexity**            | Low                   | High                  |
| **Read/Write Ratio**      | <100:1                | >100:1                |
| **Query Diversity**       | Similar queries       | Varied (search, analytics) |
| **Consistency Needs**     | Strong consistency OK | Eventual OK           |
| **Team Size**             | Small                 | Large                 |
| **Operational Overhead**  | Low                   | High                  |
| **Scaling Independence**  | No                    | Yes                   |

### Migration Path

```typescript
// Step 1: Start with traditional CRUD
class OrderService {
  async create(data: CreateOrderInput): Promise<Order> {
    return this.repo.create(data);
  }

  async findById(id: string): Promise<Order> {
    return this.repo.findById(id);
  }
}

// Step 2: Introduce commands and queries (simple CQRS)
class CreateOrderCommandHandler {
  async handle(command: CreateOrderCommand): Promise<OrderId> {
    // ...
  }
}

class GetOrderQueryHandler {
  async handle(query: GetOrderQuery): Promise<Order> {
    // ...
  }
}

// Step 3: Add read-optimized views (still same DB)
// Create materialized views for common queries

// Step 4: Introduce eventual consistency (separate DB)
// Add event publishing and read model synchronization

// Migrate incrementally - don't rewrite everything at once
```

## Key Takeaways

1. **CQRS is a spectrum** - Choose the level that matches your needs
2. **Command model = business logic** - Focus on consistency and correctness
3. **Query model = optimized data** - Focus on performance and usability
4. **Simple CQRS is often enough** - Start simple, evolve as needed
5. **Eventual consistency requires strategy** - Plan for read lag
6. **Migration path exists** - Can adopt CQRS incrementally

## Common Pitfalls

❌ **Over-engineering early** - Starting with full CQRS for simple CRUD
❌ **Ignoring consistency lag** - Not handling eventual consistency in UI
❌ **Shared database with separate apps** - Defeating the purpose
❌ **Inconsistent synchronization** - Read models getting out of sync
❌ **Too many read models** - Creating maintenance burden

## Next Steps

In the next lesson, we'll explore **Command and Query Handlers**—detailed implementation patterns for commands, queries, validation, and testing.

## Exercise

**Implement Simple CQRS:**

Create a command and query for a blog post system:

1. **Define command:**
   ```typescript
   class PublishBlogPostCommand {
     constructor(
       public readonly title: string,
       public readonly content: string,
       public readonly authorId: string
     ) {}
   }
   ```

2. **Implement command handler:**
   - Validate input
   - Create BlogPost aggregate
   - Save to repository
   - Publish BlogPostPublishedEvent

3. **Define query:**
   ```typescript
   class GetBlogPostListQuery {
     constructor(
       public readonly page: number,
       public readonly authorId?: string
     ) {}
   }
   ```

4. **Implement query handler:**
   - Fetch denormalized list view
   - Include author name (denormalized)
   - Include comment count (pre-computed)

5. **Consider eventual consistency:**
   - How would you handle a user publishing a post and immediately viewing the list?

---

**Time to complete:** 45 minutes
**Difficulty:** Intermediate

Share your implementation in the course forum for feedback!
