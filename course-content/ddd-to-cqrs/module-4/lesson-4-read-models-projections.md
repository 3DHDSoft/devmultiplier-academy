# Read Models and Projections

**Duration:** 20 minutes **Learning Objectives:**

- Design efficient read models optimized for queries
- Build denormalized views for specific use cases
- Create projections from domain events
- Use materialized views in PostgreSQL
- Keep read models synchronized with write model
- Implement caching strategies for read models
- Build multiple projections from the same events
- Use Prisma for read model queries

---

## Introduction

In CQRS, the read side is completely separate from the write side. Read models are denormalized, optimized views
designed for specific queries. They don't enforce business rules—they exist purely to serve data efficiently to the UI.
Understanding how to design, build, and maintain read models is critical for CQRS success.

## Read Model Fundamentals

### What is a Read Model?

**Definition:** A denormalized data structure optimized for a specific query or view, updated from write model events.

**Characteristics:**

- Query-optimized (not normalized)
- No business logic
- Eventually consistent
- Multiple read models from same write model
- Deletable and rebuildable

```typescript
// Write model (aggregate)
class Order {
  private constructor(
    private readonly id: OrderId,
    private readonly customerId: CustomerId,
    private items: OrderItem[],
    private status: OrderStatus
  ) {}

  // Business logic methods
  place(): void {}
  confirm(): void {}
  cancel(): void {}
}

// Read model (denormalized view)
interface OrderListItemReadModel {
  // Optimized for order list display
  orderId: string;
  orderNumber: string;
  customerName: string; // Denormalized from Customer
  customerEmail: string; // Denormalized
  status: string;
  statusLabel: string; // Pre-computed
  total: number;
  totalFormatted: string; // Pre-formatted
  itemCount: number; // Pre-computed
  itemsPreview: string; // "Product A, Product B, +2 more"
  canCancel: boolean; // Pre-computed business rule
  placedAt: string; // ISO format
  estimatedDelivery: string | null;
}

// Different read model for different view
interface OrderDetailsReadModel {
  // Optimized for order details page
  orderId: string;
  orderNumber: string;

  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    tier: string;
  };

  items: Array<{
    productId: string;
    productName: string;
    productImage: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;

  pricing: {
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
  };

  shipping: {
    carrier: string;
    trackingNumber: string;
    trackingUrl: string;
    estimatedDelivery: Date;
  };

  timeline: Array<{
    status: string;
    timestamp: Date;
    note: string;
  }>;

  actions: {
    canCancel: boolean;
    canRequestRefund: boolean;
    canDownloadInvoice: boolean;
  };
}
```

### Write Model vs Read Model

```typescript
// Write model: Normalized, enforces invariants
interface OrderWriteModel {
  id: string;
  customerId: string; // Reference only
  status: string;
  items: Array<{
    productId: string; // Reference only
    quantity: number;
    price: number;
  }>;
}

// Read model: Denormalized, pre-joined
interface OrderReadModel {
  id: string;

  // Customer data denormalized
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerTier: string;

  status: string;

  // Product data denormalized
  items: Array<{
    productId: string;
    productName: string;
    productCategory: string;
    productImage: string;
    quantity: number;
    price: number;
  }>;

  // Pre-computed values
  totalItems: number;
  subtotal: number;
  total: number;
}
```

## Designing Read Models

### Start from UI Requirements

**UI Wireframe: Order List Page**

> **My Orders**
>
> ---
>
> | **Order #1234**             | 🟢 Shipped |
> | :-------------------------- | ---------: |
> | Placed: Jan 15, 2024        |            |
> | 3 items · **$127.50**       |            |
> | `[Cancel]` `[View Details]` |            |
>
> ---
>
> | **Order #1235**             | 🟡 Pending |
> | :-------------------------- | ---------: |
> | Placed: Jan 18, 2024        |            |
> | 1 item · **$49.99**         |            |
> | `[Cancel]` `[View Details]` |            |

**Or ASCII format**

```typescript
// UI wireframe: Order list page
/*
┌──────────────────────────────────────────────────────┐
│ My Orders                                             │
├──────────────────────────────────────────────────────┤
│ Order #1234                          Status: Shipped │
│ Placed: Jan 15, 2024                                 │
│ 3 items - $127.50                                    │
│ [Cancel] [View Details]                              │
├──────────────────────────────────────────────────────┤
│ Order #1235                          Status: Pending │
│ Placed: Jan 18, 2024                                 │
│ 1 item - $49.99                                      │
│ [Cancel] [View Details]                              │
└──────────────────────────────────────────────────────┘
*/
```

```typescript
// Read model designed from UI needs
interface OrderListReadModel {
  orderId: string;
  orderNumber: string; // "1234"
  status: string; // "Shipped"
  statusLabel: string; // Localized display
  placedAt: Date;
  placedAtFormatted: string; // "Jan 15, 2024"
  itemCount: number; // 3
  total: number; // 127.50
  totalFormatted: string; // "$127.50"
  canCancel: boolean; // Show/hide cancel button
  canViewDetails: boolean; // Show/hide view button
}

// Query interface
interface OrderListQuery {
  getOrders(
    customerId: string,
    page: number,
    limit: number
  ): Promise<{
    items: OrderListReadModel[];
    total: number;
    page: number;
    totalPages: number;
  }>;
}
```

### Multiple Read Models for Different Views

```typescript
// Dashboard summary
interface OrderSummaryReadModel {
  totalOrders: number;
  pendingOrders: number;
  shippedOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    orderCount: number;
  }>;
}

// Admin search results
interface OrderSearchReadModel {
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  status: string;
  total: number;
  placedAt: Date;
  lastUpdatedAt: Date;
}

// Analytics/reporting
interface OrderAnalyticsReadModel {
  orderId: string;
  customerId: string;
  customerSegment: string;
  productCategories: string[];
  total: number;
  profit: number;
  placedAt: Date;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  timeToShip: number | null; // in hours
  timeToDeliver: number | null; // in hours
}
```

## Building Projections

### Projection from Domain Events

```typescript
// Domain events from write side
class OrderPlacedEvent {
  constructor(
    public readonly orderId: string,
    public readonly customerId: string,
    public readonly items: Array<{
      productId: string;
      quantity: number;
      price: number;
    }>,
    public readonly total: number,
    public readonly placedAt: Date
  ) {}
}

class OrderShippedEvent {
  constructor(
    public readonly orderId: string,
    public readonly carrier: string,
    public readonly trackingNumber: string,
    public readonly shippedAt: Date
  ) {}
}

class OrderDeliveredEvent {
  constructor(
    public readonly orderId: string,
    public readonly deliveredAt: Date
  ) {}
}

// Projection handler
class OrderListProjection {
  constructor(private readonly prisma: PrismaClient) {}

  async onOrderPlaced(event: OrderPlacedEvent): Promise<void> {
    // Fetch customer data (denormalize)
    const customer = await this.prisma.customers.findUnique({
      where: { id: event.customerId },
      select: { name: true, email: true },
    });

    // Fetch product data (denormalize)
    const productIds = event.items.map((item) => item.productId);
    const products = await this.prisma.products.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, imageUrl: true },
    });

    // Create read model
    await this.prisma.orderListView.create({
      data: {
        orderId: event.orderId,
        orderNumber: `ORD-${event.orderId.slice(-6).toUpperCase()}`,
        customerId: event.customerId,
        customerName: customer?.name || 'Unknown',
        customerEmail: customer?.email || '',
        status: 'Pending',
        statusLabel: 'Pending Payment',
        itemCount: event.items.reduce((sum, item) => sum + item.quantity, 0),
        itemsPreview: this.buildItemsPreview(event.items, products),
        total: event.total,
        totalFormatted: this.formatCurrency(event.total),
        canCancel: true,
        placedAt: event.placedAt,
        placedAtFormatted: this.formatDate(event.placedAt),
        estimatedDelivery: this.calculateEstimatedDelivery(event.placedAt),
      },
    });
  }

  async onOrderShipped(event: OrderShippedEvent): Promise<void> {
    await this.prisma.orderListView.update({
      where: { orderId: event.orderId },
      data: {
        status: 'Shipped',
        statusLabel: 'Shipped',
        canCancel: false,
        shippedAt: event.shippedAt,
      },
    });
  }

  async onOrderDelivered(event: OrderDeliveredEvent): Promise<void> {
    await this.prisma.orderListView.update({
      where: { orderId: event.orderId },
      data: {
        status: 'Delivered',
        statusLabel: 'Delivered',
        deliveredAt: event.deliveredAt,
      },
    });
  }

  private buildItemsPreview(items: any[], products: any[]): string {
    const productMap = new Map(products.map((p) => [p.id, p.name]));
    const names = items.map((item) => productMap.get(item.productId) || 'Unknown');

    if (names.length <= 2) {
      return names.join(', ');
    }

    return `${names[0]}, ${names[1]}, +${names.length - 2} more`;
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  }

  private calculateEstimatedDelivery(placedAt: Date): Date {
    const estimated = new Date(placedAt);
    estimated.setDate(estimated.getDate() + 5); // 5 business days
    return estimated;
  }
}
```

### Event Handler Registration

```typescript
// Event bus with projection handlers
class EventBus {
  private handlers: Map<string, Array<(event: any) => Promise<void>>> = new Map();

  register(eventType: string, handler: (event: any) => Promise<void>): void {
    const handlers = this.handlers.get(eventType) || [];
    handlers.push(handler);
    this.handlers.set(eventType, handlers);
  }

  async publish(event: DomainEvent): Promise<void> {
    const eventType = event.constructor.name;
    const handlers = this.handlers.get(eventType) || [];

    // Execute all handlers in parallel
    await Promise.all(handlers.map((handler) => handler(event)));
  }
}

// Setup projections
const eventBus = new EventBus();
const orderListProjection = new OrderListProjection(prisma);
const orderDetailsProjection = new OrderDetailsProjection(prisma);
const orderAnalyticsProjection = new OrderAnalyticsProjection(prisma);

// Register handlers
eventBus.register('OrderPlacedEvent', (e) => orderListProjection.onOrderPlaced(e));
eventBus.register('OrderPlacedEvent', (e) => orderDetailsProjection.onOrderPlaced(e));
eventBus.register('OrderPlacedEvent', (e) => orderAnalyticsProjection.onOrderPlaced(e));

eventBus.register('OrderShippedEvent', (e) => orderListProjection.onOrderShipped(e));
eventBus.register('OrderShippedEvent', (e) => orderDetailsProjection.onOrderShipped(e));

// Multiple projections updated from same events
```

### Projection with Complex Logic

```typescript
class ProductPopularityProjection {
  constructor(private readonly prisma: PrismaClient) {}

  async onOrderPlaced(event: OrderPlacedEvent): Promise<void> {
    // Update product popularity scores
    for (const item of event.items) {
      await this.prisma.productPopularity.upsert({
        where: { productId: item.productId },
        create: {
          productId: item.productId,
          orderCount: 1,
          totalQuantitySold: item.quantity,
          totalRevenue: item.price * item.quantity,
          lastOrderedAt: event.placedAt,
        },
        update: {
          orderCount: { increment: 1 },
          totalQuantitySold: { increment: item.quantity },
          totalRevenue: { increment: item.price * item.quantity },
          lastOrderedAt: event.placedAt,
        },
      });

      // Update rolling 30-day popularity
      await this.updateRollingPopularity(item.productId, event.placedAt);
    }
  }

  async onOrderCancelled(event: OrderCancelledEvent): Promise<void> {
    // Reverse the popularity updates
    for (const item of event.items) {
      await this.prisma.productPopularity.update({
        where: { productId: item.productId },
        data: {
          orderCount: { decrement: 1 },
          totalQuantitySold: { decrement: item.quantity },
          totalRevenue: { decrement: item.price * item.quantity },
        },
      });
    }
  }

  private async updateRollingPopularity(productId: string, date: Date): Promise<void> {
    const thirtyDaysAgo = new Date(date);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentOrders = await this.prisma.orders.aggregate({
      where: {
        items: {
          some: { productId },
        },
        placedAt: { gte: thirtyDaysAgo },
        status: { not: 'Cancelled' },
      },
      _count: true,
      _sum: {
        total: true,
      },
    });

    await this.prisma.productPopularity.update({
      where: { productId },
      data: {
        rolling30DayOrders: recentOrders._count,
        rolling30DayRevenue: recentOrders._sum.total || 0,
      },
    });
  }
}
```

## Materialized Views in PostgreSQL

### Creating Materialized Views

```sql
-- Materialized view for order summaries
CREATE MATERIALIZED VIEW order_summaries AS
SELECT
  o.id AS order_id,
  o.order_number,
  o.status,
  c.id AS customer_id,
  c.name AS customer_name,
  c.email AS customer_email,
  c.tier AS customer_tier,
  COUNT(oi.id) AS item_count,
  SUM(oi.quantity) AS total_quantity,
  SUM(oi.price * oi.quantity) AS total,
  o.placed_at,
  o.shipped_at,
  o.delivered_at
FROM orders o
JOIN customers c ON o.customer_id = c.id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, c.id;

-- Create index for fast lookups
CREATE INDEX idx_order_summaries_customer_id ON order_summaries(customer_id);
CREATE INDEX idx_order_summaries_status ON order_summaries(status);
CREATE INDEX idx_order_summaries_placed_at ON order_summaries(placed_at);
```

### Refreshing Materialized Views

```typescript
// Scheduled refresh
class MaterializedViewRefreshService {
  constructor(private readonly prisma: PrismaClient) {}

  async refreshOrderSummaries(): Promise<void> {
    await this.prisma.$executeRaw`
      REFRESH MATERIALIZED VIEW CONCURRENTLY order_summaries
    `;
  }

  // Scheduled job (e.g., every 5 minutes)
  startScheduledRefresh(): void {
    setInterval(
      async () => {
        try {
          await this.refreshOrderSummaries();
        } catch (error) {
          console.error('Failed to refresh materialized view', error);
        }
      },
      5 * 60 * 1000
    ); // 5 minutes
  }
}

// Event-driven refresh
class OrderProjection {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly refreshService: MaterializedViewRefreshService
  ) {}

  async onOrderPlaced(event: OrderPlacedEvent): Promise<void> {
    // Update write model
    // ...

    // Trigger materialized view refresh
    await this.refreshService.refreshOrderSummaries();
  }
}
```

### Querying Materialized Views with Prisma

```typescript
// Define Prisma model for materialized view
// prisma/schema.prisma
model OrderSummary {
  orderId       String   @id @map("order_id")
  orderNumber   String   @map("order_number")
  status        String
  customerId    String   @map("customer_id")
  customerName  String   @map("customer_name")
  customerEmail String   @map("customer_email")
  customerTier  String   @map("customer_tier")
  itemCount     Int      @map("item_count")
  totalQuantity Int      @map("total_quantity")
  total         Decimal
  placedAt      DateTime @map("placed_at")
  shippedAt     DateTime? @map("shipped_at")
  deliveredAt   DateTime? @map("delivered_at")

  @@map("order_summaries")
}

// Query handler
class GetOrderSummariesQueryHandler {
  constructor(private readonly prisma: PrismaClient) {}

  async handle(query: GetOrderSummariesQuery): Promise<OrderSummary[]> {
    return this.prisma.orderSummary.findMany({
      where: {
        customerId: query.customerId,
        ...(query.status && { status: query.status }),
      },
      orderBy: {
        placedAt: 'desc',
      },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });
  }
}
```

## Keeping Read Models Synchronized

### Eventual Consistency Patterns

```typescript
// Pattern 1: Synchronous update in same transaction
class PlaceOrderCommandHandler {
  async handle(command: PlaceOrderCommand): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Update write model
      const order = Order.create(command);
      await tx.orders.create({ data: this.toPersistence(order) });

      // Update read model synchronously
      const customer = await tx.customers.findUnique({
        where: { id: command.customerId },
      });

      await tx.orderListView.create({
        data: {
          orderId: order.getId().value,
          customerName: customer?.name || '',
          // ... other fields
        },
      });
    });
  }
}

// Pattern 2: Asynchronous event-driven update
class PlaceOrderCommandHandler {
  async handle(command: PlaceOrderCommand): Promise<void> {
    // Update write model
    const order = Order.create(command);
    await this.orderRepo.save(order);

    // Publish event (async)
    const event = new OrderPlacedEvent(/* ... */);
    await this.eventBus.publish(event);
    // Read model updated by event handler
  }
}

// Pattern 3: Polling/Change Data Capture
class ReadModelSyncService {
  async syncOrderListView(): Promise<void> {
    // Find orders modified since last sync
    const lastSync = await this.getLastSyncTimestamp();
    const modifiedOrders = await this.prisma.orders.findMany({
      where: {
        updatedAt: { gt: lastSync },
      },
      include: {
        customer: true,
        items: true,
      },
    });

    // Update read models
    for (const order of modifiedOrders) {
      await this.updateReadModel(order);
    }

    await this.setLastSyncTimestamp(new Date());
  }
}
```

### Handling Denormalization Updates

```typescript
// When customer name changes, update all order read models
class CustomerNameChangedProjection {
  constructor(private readonly prisma: PrismaClient) {}

  async onCustomerNameChanged(event: CustomerNameChangedEvent): Promise<void> {
    // Update all read models with this customer's name
    await this.prisma.orderListView.updateMany({
      where: { customerId: event.customerId },
      data: { customerName: event.newName },
    });

    await this.prisma.orderDetailsView.updateMany({
      where: { customerId: event.customerId },
      data: { 'customer.name': event.newName },
    });
  }
}

// When product name changes, update all order read models
class ProductNameChangedProjection {
  constructor(private readonly prisma: PrismaClient) {}

  async onProductNameChanged(event: ProductNameChangedEvent): Promise<void> {
    // Update denormalized product names in order items
    await this.prisma.$executeRaw`
      UPDATE order_items_view
      SET product_name = ${event.newName}
      WHERE product_id = ${event.productId}
    `;
  }
}
```

## Caching Strategies

### Multi-Layer Caching

```typescript
class OrderListQueryHandler {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly redis: Redis
  ) {}

  async handle(query: GetOrderListQuery): Promise<OrderListItem[]> {
    const cacheKey = `orders:list:${query.customerId}:${query.page}:${query.status}`;

    // Layer 1: Redis cache
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Layer 2: Database (materialized view or table)
    const orders = await this.prisma.orderListView.findMany({
      where: {
        customerId: query.customerId,
        ...(query.status && { status: query.status }),
      },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: { placedAt: 'desc' },
    });

    // Cache for 5 minutes
    await this.redis.setex(cacheKey, 300, JSON.stringify(orders));

    return orders;
  }
}
```

### Cache Invalidation

```typescript
class OrderProjectionWithCacheInvalidation {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly redis: Redis
  ) {}

  async onOrderPlaced(event: OrderPlacedEvent): Promise<void> {
    // Update read model
    await this.prisma.orderListView.create({
      data: {
        /* ... */
      },
    });

    // Invalidate cache for this customer
    await this.invalidateCustomerOrdersCache(event.customerId);
  }

  async onOrderStatusChanged(event: OrderStatusChangedEvent): Promise<void> {
    // Update read model
    await this.prisma.orderListView.update({
      where: { orderId: event.orderId },
      data: { status: event.newStatus },
    });

    // Invalidate cache
    const order = await this.prisma.orderListView.findUnique({
      where: { orderId: event.orderId },
      select: { customerId: true },
    });

    if (order) {
      await this.invalidateCustomerOrdersCache(order.customerId);
    }
  }

  private async invalidateCustomerOrdersCache(customerId: string): Promise<void> {
    // Delete all cache keys for this customer
    const keys = await this.redis.keys(`orders:list:${customerId}:*`);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
```

### Cache-Aside Pattern

```typescript
class CachedOrderQueryService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly cache: CacheService
  ) {}

  async getOrder(orderId: string): Promise<OrderDetailsReadModel | null> {
    const cacheKey = `order:${orderId}`;

    // Try cache first
    const cached = await this.cache.get<OrderDetailsReadModel>(cacheKey);
    if (cached) {
      return cached;
    }

    // Cache miss - load from database
    const order = await this.loadOrderFromDatabase(orderId);

    if (order) {
      // Store in cache
      await this.cache.set(cacheKey, order, 3600); // 1 hour TTL
    }

    return order;
  }

  private async loadOrderFromDatabase(orderId: string): Promise<OrderDetailsReadModel | null> {
    return this.prisma.orderDetailsView.findUnique({
      where: { orderId },
    });
  }
}
```

## Rebuilding Projections

### Full Rebuild from Events

```typescript
class ProjectionRebuildService {
  constructor(
    private readonly eventStore: EventStore,
    private readonly prisma: PrismaClient
  ) {}

  async rebuildOrderListProjection(): Promise<void> {
    console.log('Starting projection rebuild...');

    // Clear existing read model
    await this.prisma.orderListView.deleteMany({});

    // Replay all events
    const events = await this.eventStore.getAllEvents();
    const projection = new OrderListProjection(this.prisma);

    let processedCount = 0;
    for (const event of events) {
      if (event instanceof OrderPlacedEvent) {
        await projection.onOrderPlaced(event);
      } else if (event instanceof OrderShippedEvent) {
        await projection.onOrderShipped(event);
      } else if (event instanceof OrderDeliveredEvent) {
        await projection.onOrderDelivered(event);
      }

      processedCount++;
      if (processedCount % 1000 === 0) {
        console.log(`Processed ${processedCount} events...`);
      }
    }

    console.log(`Rebuild complete. Processed ${processedCount} events.`);
  }
}

// Usage: One-time script or admin endpoint
await projectionRebuildService.rebuildOrderListProjection();
```

### Incremental Rebuild

```typescript
class IncrementalProjectionRebuildService {
  constructor(
    private readonly eventStore: EventStore,
    private readonly prisma: PrismaClient
  ) {}

  async rebuildFromCheckpoint(checkpointEventId?: string): Promise<void> {
    // Get events since checkpoint
    const events = await this.eventStore.getEventsSince(checkpointEventId);

    const projection = new OrderListProjection(this.prisma);

    for (const event of events) {
      await projection.handle(event);

      // Save checkpoint periodically
      await this.saveCheckpoint(event.id);
    }
  }

  private async saveCheckpoint(eventId: string): Promise<void> {
    await this.prisma.projectionCheckpoints.upsert({
      where: { projectionName: 'OrderListProjection' },
      create: { projectionName: 'OrderListProjection', lastEventId: eventId },
      update: { lastEventId: eventId },
    });
  }
}
```

## Common Pitfalls

### 1. Normalizing Read Models

```typescript
// ❌ Wrong: Normalized read model
interface OrderReadModel {
  orderId: string;
  customerId: string; // Reference - requires join
  items: Array<{
    productId: string; // Reference - requires join
    quantity: number;
  }>;
}

// ✅ Correct: Denormalized read model
interface OrderReadModel {
  orderId: string;
  customerId: string;
  customerName: string; // Denormalized
  customerEmail: string; // Denormalized
  items: Array<{
    productId: string;
    productName: string; // Denormalized
    productImage: string; // Denormalized
    quantity: number;
  }>;
}
```

### 2. Business Logic in Read Models

```typescript
// ❌ Wrong: Validation in read model
class OrderListView {
  canCancel(): boolean {
    // Don't put business logic here
    return this.status === 'Pending' && this.daysSincePlaced <= 30;
  }
}

// ✅ Correct: Pre-compute in projection
class OrderListProjection {
  async onOrderPlaced(event: OrderPlacedEvent): Promise<void> {
    const canCancel = this.calculateCanCancel(event);

    await this.prisma.orderListView.create({
      data: {
        // ... other fields
        canCancel, // Pre-computed
      },
    });
  }

  private calculateCanCancel(event: OrderPlacedEvent): boolean {
    // Business logic in projection, result stored in read model
    return true; // Simplified
  }
}
```

## Key Takeaways

1. **Design from UI needs** - Read models match UI requirements exactly
2. **Denormalize liberally** - No joins at query time
3. **Pre-compute everything** - Formatting, calculations, business rules
4. **Multiple read models** - One per view/query, not one per aggregate
5. **Eventually consistent** - Read models lag behind write model
6. **Rebuildable** - Can always rebuild from events or write model
7. **Cache aggressively** - Use multi-layer caching with invalidation

## Next Steps

In Module 5, we'll explore **Event Sourcing**, where the event stream becomes the primary source of truth, and read
models are projections from the event store.

## Hands-On Exercise

**Build Complete Read Model System:**

1. **Design Read Models:**
   - Order list view (customer-facing)
   - Order search view (admin)
   - Order analytics view (reporting)

2. **Create Projections:**
   - Handle OrderPlaced, OrderShipped, OrderDelivered
   - Denormalize customer and product data
   - Pre-compute all display values

3. **Add Caching:**
   - Redis cache for frequently accessed data
   - Cache invalidation on events

4. **Implement Rebuild:**
   - Script to rebuild all projections
   - Checkpoint-based incremental rebuild

5. **Write Queries:**
   - Query handlers using Prisma
   - Pagination and filtering support

Try implementing yourself first!

---

**Time to complete:** 60 minutes **Difficulty:** Advanced

Share your read model design in the course forum!
