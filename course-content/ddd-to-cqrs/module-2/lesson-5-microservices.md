# Strategic Design in Microservices

**Duration:** 17 minutes
**Learning Objectives:**
- Align bounded contexts with microservice boundaries
- Design inter-service communication patterns
- Handle distributed data and transactions
- Understand when NOT to use microservices

---

## Introduction

Bounded Contexts and microservices are natural allies—each bounded context can become a microservice. However, the relationship isn't always one-to-one, and microservices introduce significant complexity. This lesson shows you how to apply DDD strategic design to microservices architecture.

## Bounded Context = Microservice?

### The Ideal Alignment

```typescript
/*
┌──────────────────────────────────────────────────────────┐
│                   E-Commerce System                      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐       │
│  │  Catalog   │  │   Sales    │  │ Fulfillment│       │
│  │  Service   │  │  Service   │  │  Service   │       │
│  │            │  │            │  │            │       │
│  │ - Products │  │ - Orders   │  │ - Shipments│       │
│  │ - Categories│  │ - Carts    │  │ - Inventory│       │
│  └────────────┘  └────────────┘  └────────────┘       │
│        │               │                │               │
│        └───────────────┴────────────────┘               │
│                Event Bus / API Gateway                   │
└──────────────────────────────────────────────────────────┘

One Bounded Context = One Microservice
*/
```

### Implementation

```typescript
// CATALOG MICROSERVICE
// Owns: Product, Category, ProductImage
export namespace CatalogService {
  // API
  @Controller('/api/catalog')
  export class CatalogController {
    @Get('/products/:id')
    async getProduct(@Param('id') id: string): Promise<ProductDTO> {
      return await this.catalogService.getProduct(id);
    }

    @Get('/products')
    async searchProducts(
      @Query('q') query: string
    ): Promise<ProductDTO[]> {
      return await this.catalogService.search(query);
    }
  }

  // Domain
  export class Product {
    constructor(
      private readonly id: ProductId,
      private readonly name: string,
      private readonly category: Category
    ) {}
  }

  // Infrastructure (own database)
  export class ProductRepository {
    constructor(private readonly db: CatalogDatabase) {}
    // Catalog has its own database
  }
}

// SALES MICROSERVICE
// Owns: Order, Cart, Customer
export namespace SalesService {
  @Controller('/api/sales')
  export class OrderController {
    constructor(
      private readonly catalogClient: CatalogServiceClient // Calls Catalog service
    ) {}

    @Post('/orders')
    async placeOrder(@Body() dto: PlaceOrderDTO): Promise<OrderDTO> {
      // Call Catalog service for product info
      const products = await this.catalogClient.getProducts(dto.productIds);

      // Create order in Sales context
      const order = await this.orderService.createOrder(products, dto);

      return this.toDTO(order);
    }
  }

  // Domain
  export class Order {
    // Sales' model of Order
  }

  // Infrastructure (own database)
  export class OrderRepository {
    constructor(private readonly db: SalesDatabase) {}
    // Sales has its own database
  }
}

// FULFILLMENT MICROSERVICE
// Owns: Shipment, Inventory
export namespace FulfillmentService {
  // Listens to Sales events
  @EventHandler('sales.OrderPlaced')
  export class CreateShipmentHandler {
    async handle(event: OrderPlacedEvent): Promise<void> {
      const shipment = await this.shipmentService.createFromOrder(event);
      // Fulfillment creates shipment based on Sales event
    }
  }

  // Domain
  export class Shipment {
    // Fulfillment's model of Shipment
  }

  // Infrastructure (own database)
  export class ShipmentRepository {
    constructor(private readonly db: FulfillmentDatabase) {}
    // Fulfillment has its own database
  }
}
```

## Service Boundaries

### Rule: High Cohesion, Low Coupling

```typescript
// ✅ Good: Each service is self-contained
namespace CatalogService {
  // Everything Catalog needs is in Catalog
  class Product { }
  class Category { }
  class ProductImage { }
  class PriceCalculator { } // Catalog-specific pricing logic
  class ProductRepository { }
  class CategoryRepository { }
}

// ❌ Bad: Service depends heavily on others
namespace BadOrderService {
  class Order {
    async calculateTotal(): Promise<Money> {
      // Calls 3 different services
      const product = await this.catalogService.getProduct(this.productId);
      const discount = await this.promotionService.getDiscount(this.customerId);
      const tax = await this.taxService.calculateTax(product.price);

      // Too many network calls = fragile and slow
      return product.price.subtract(discount).add(tax);
    }
  }
}

// ✅ Good: Service stores what it needs
namespace GoodOrderService {
  class Order {
    constructor(
      private readonly items: OrderItem[] // Snapshot of product info
    ) {}

    calculateTotal(): Money {
      // All data local, no network calls
      return this.items.reduce(
        (sum, item) => sum.add(item.subtotal),
        Money.zero()
      );
    }
  }

  class OrderItem {
    constructor(
      public readonly productId: string,
      public readonly name: string,
      public readonly priceSnapshot: Money, // Captured at order time
      public readonly quantity: number
    ) {}

    get subtotal(): Money {
      return this.priceSnapshot.multiply(this.quantity);
    }
  }
}
```

## Data Ownership

### Each Service Owns Its Data

```typescript
// SALES SERVICE (owns orders)
class OrdersDatabase {
  tables: {
    orders: {
      id: string;
      customer_id: string;
      status: string;
      total: number;
      created_at: Date;
    };
    order_items: {
      id: string;
      order_id: string;
      product_id: string; // Reference to Catalog, not join
      product_name: string; // Denormalized snapshot
      price_snapshot: number; // Price at time of order
      quantity: number;
    };
  };
}

// CATALOG SERVICE (owns products)
class CatalogDatabase {
  tables: {
    products: {
      id: string;
      name: string;
      current_price: number;
      category_id: string;
    };
  };
}

// ❌ ANTI-PATTERN: Shared database
class SharedDatabase {
  tables: {
    products: { };  // Both Catalog and Sales access
    orders: { };    // Tight coupling
    order_items: {  // Foreign keys across services
      product_id: string; // REFERENCES products(id)
    };
  };
  // Problem: Can't deploy services independently
  // Schema changes require coordination
  // Can't scale services separately
}
```

### Data Duplication is OK

```typescript
// SALES SERVICE - Denormalized product data
interface OrderItem {
  productId: string;
  productName: string;        // Duplicated from Catalog
  priceAtPurchase: number;    // Duplicated from Catalog (snapshot)
  quantity: number;
}

// FULFILLMENT SERVICE - Different view of same product
interface ShipmentItem {
  productId: string;
  productSKU: string;         // Different data from Catalog
  weight: number;             // Fulfillment-specific
  dimensions: Dimensions;     // Fulfillment-specific
  warehouseLocation: string;  // Fulfillment-specific
}

// RECOMMENDATION SERVICE - Another view
interface ProductAnalytics {
  productId: string;
  categoryName: string;       // Duplicated from Catalog
  purchaseCount: number;      // Recommendation-specific
  averageRating: number;      // Recommendation-specific
  viewCount: number;          // Recommendation-specific
}

// Each service stores what it needs
// Data is synchronized via events
```

## Inter-Service Communication

### Pattern 1: Synchronous (REST)

```typescript
// For queries that need immediate response
export class OrderService {
  constructor(
    private readonly catalogClient: CatalogServiceClient
  ) {}

  async validateOrder(dto: CreateOrderDTO): Promise<void> {
    // Synchronous call to Catalog
    const product = await this.catalogClient.getProduct(dto.productId);

    if (!product) {
      throw new ProductNotFoundError(dto.productId);
    }

    if (!product.isAvailable) {
      throw new ProductUnavailableError(dto.productId);
    }

    // Validation complete
  }
}

// Client with resilience
export class CatalogServiceClient {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly circuitBreaker: CircuitBreaker,
    private readonly cache: Cache
  ) {}

  async getProduct(id: string): Promise<ProductDTO | null> {
    // Check cache
    const cached = await this.cache.get(`product:${id}`);
    if (cached) return cached;

    try {
      // Call with circuit breaker
      const product = await this.circuitBreaker.execute(() =>
        this.httpClient.get(`/api/catalog/products/${id}`)
      );

      // Cache result
      await this.cache.set(`product:${id}`, product, { ttl: 300 });

      return product;
    } catch (error) {
      // Handle failure
      if (error instanceof CircuitBreakerOpenError) {
        // Return stale cache if available
        return await this.cache.get(`product:${id}`, { allowStale: true });
      }

      throw error;
    }
  }
}
```

### Pattern 2: Asynchronous (Events)

```typescript
// For notifications and eventual consistency
export class Order {
  place(): void {
    this.status = OrderStatus.Placed;

    // Publish event (async)
    this.addDomainEvent(
      new OrderPlaced(
        this.id,
        this.customerId,
        this.items,
        this.total,
        this.shippingAddress
      )
    );
  }
}

// Event published to message bus
export class EventPublisher {
  async publish(event: DomainEvent): Promise<void> {
    await this.messageBus.publish({
      topic: 'sales-events',
      event: {
        type: event.constructor.name,
        aggregateId: event.aggregateId,
        occurredAt: new Date().toISOString(),
        payload: event,
      },
    });
  }
}

// Fulfillment service subscribes
@Subscribe('sales-events')
export class FulfillmentEventHandler {
  @Handle('OrderPlaced')
  async onOrderPlaced(event: OrderPlaced): Promise<void> {
    // Create shipment asynchronously
    const shipment = await this.shipmentService.createFromOrder({
      orderId: event.orderId,
      items: event.items,
      destination: event.shippingAddress,
    });

    // No response expected
  }
}

// Inventory service also subscribes
@Subscribe('sales-events')
export class InventoryEventHandler {
  @Handle('OrderPlaced')
  async onOrderPlaced(event: OrderPlaced): Promise<void> {
    // Reserve inventory asynchronously
    for (const item of event.items) {
      await this.inventoryService.reserve(item.productId, item.quantity);
    }
  }
}
```

## Distributed Transactions: Saga Pattern

```typescript
// Problem: Order requires coordinating multiple services
// - Sales (create order)
// - Payment (process payment)
// - Inventory (reserve stock)
// - Fulfillment (create shipment)

// Solution: Saga (Orchestration)
export class OrderProcessingSaga {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly paymentService: PaymentServiceClient,
    private readonly inventoryService: InventoryServiceClient,
    private readonly fulfillmentService: FulfillmentServiceClient
  ) {}

  async execute(command: PlaceOrderCommand): Promise<OrderId> {
    const saga = new SagaExecution();

    try {
      // Step 1: Create order
      const order = Order.create(command);
      await this.orderRepo.save(order);
      saga.addCompensation(() => this.orderRepo.delete(order.id));

      // Step 2: Process payment
      const payment = await this.paymentService.process({
        orderId: order.id,
        amount: order.total,
      });
      saga.addCompensation(() => this.paymentService.refund(payment.id));

      // Step 3: Reserve inventory
      await this.inventoryService.reserve({
        orderId: order.id,
        items: order.items,
      });
      saga.addCompensation(() => this.inventoryService.release(order.id));

      // Step 4: Create shipment
      await this.fulfillmentService.createShipment({
        orderId: order.id,
        items: order.items,
        address: command.shippingAddress,
      });
      saga.addCompensation(() => this.fulfillmentService.cancel(order.id));

      // Success!
      order.confirm();
      await this.orderRepo.save(order);

      return order.id;
    } catch (error) {
      // Rollback
      await saga.compensate();
      throw error;
    }
  }
}

class SagaExecution {
  private compensations: Array<() => Promise<void>> = [];

  addCompensation(fn: () => Promise<void>): void {
    this.compensations.unshift(fn); // Reverse order
  }

  async compensate(): Promise<void> {
    for (const compensation of this.compensations) {
      try {
        await compensation();
      } catch (error) {
        // Log but continue compensating
        console.error('Compensation failed:', error);
      }
    }
  }
}
```

## When NOT to Use Microservices

### Start with a Monolith

```typescript
// ✅ Good: Start as modular monolith
export class ECommerceMonolith {
  // Still use bounded contexts
  private readonly catalog: CatalogModule;
  private readonly sales: SalesModule;
  private readonly fulfillment: FulfillmentModule;

  constructor() {
    // All in one process
    this.catalog = new CatalogModule(sharedDB);
    this.sales = new SalesModule(sharedDB);
    this.fulfillment = new FulfillmentModule(sharedDB);

    // Clear boundaries even in monolith
    this.sales.setCatalogAPI(this.catalog.getPublicAPI());
  }

  // Can extract to microservices later when needed
}

// When to split:
// - Team size grows (>8-10 people)
// - Different scaling needs (Catalog needs more instances than Fulfillment)
// - Different deployment cycles (Sales changes frequently, Fulfillment stable)
// - Technology diversity needed (Fulfillment needs Python for ML)
```

### Microservices are NOT Free

```typescript
/*
Costs of Microservices:
┌────────────────────────────────────────────────────────┐
│ 1. Operational Complexity                             │
│    - Multiple deployments                              │
│    - Service discovery                                 │
│    - Load balancing                                    │
│    - Monitoring distributed systems                    │
│                                                        │
│ 2. Data Consistency Challenges                        │
│    - No ACID transactions across services              │
│    - Eventual consistency                              │
│    - Saga pattern complexity                           │
│                                                        │
│ 3. Testing Complexity                                  │
│    - Integration testing across services               │
│    - Contract testing                                  │
│    - End-to-end testing                                │
│                                                        │
│ 4. Performance Overhead                                │
│    - Network latency                                   │
│    - Serialization/deserialization                     │
│    - Multiple network calls                            │
│                                                        │
│ 5. Development Overhead                                │
│    - Shared libraries                                  │
│    - API versioning                                    │
│    - Local development environment                     │
└────────────────────────────────────────────────────────┘
*/
```

## Key Takeaways

1. **Bounded context ≈ microservice** - Natural alignment but not mandatory
2. **Each service owns its data** - No shared databases
3. **Data duplication is OK** - Each service stores what it needs
4. **Sync for queries, async for commands** - REST for reads, events for writes
5. **Sagas for distributed transactions** - Orchestration or choreography
6. **Start with monolith** - Extract services when benefits outweigh costs

## Common Mistakes

❌ **Shared database** - Couples services at data layer
❌ **Too many sync calls** - Network becomes bottleneck
❌ **Microservices too early** - Premature optimization
❌ **Wrong boundaries** - Services that need constant coordination
❌ **No clear ownership** - Multiple teams touching same service

## Next Steps

This concludes Module 2! In Module 3, we'll dive into **Aggregates & Tactical Patterns**—the building blocks of your domain model.

## Hands-On Exercise

**Design Microservices:**

For a system you know:

1. **Identify bounded contexts** (3-5 contexts)

2. **For each context, decide:**
   - Should it be a separate microservice?
   - What data does it own?
   - How does it integrate with others?

3. **Draw architecture:**
   ```
   [Service A] ──REST──> [Service B]
        │
        └──Events──> [Service C]
   ```

4. **Design one saga:**
   - Multi-step process across services
   - Compensation logic for each step

5. **Justify monolith vs microservices:**
   - What are the tradeoffs?
   - When would you split the monolith?

---

**Time to complete:** 60 minutes
**Difficulty:** Advanced
