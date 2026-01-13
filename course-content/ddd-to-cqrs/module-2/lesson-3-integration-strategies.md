# Module 2, Lesson 3: Integration Strategies

**Duration:** 18 minutes
**Learning Objectives:**
- Compare synchronous vs asynchronous integration approaches
- Implement REST API integration between contexts
- Design event-driven integration patterns
- Choose appropriate integration strategies for different scenarios

---

## Introduction

Once you've defined your bounded contexts and mapped their relationships, you need to decide HOW they'll integrate. This lesson covers the technical mechanisms for cross-context communication, from traditional REST APIs to modern event-driven architectures.

## Integration Strategy Overview

```typescript
/*
┌─────────────────────────────────────────────────────────────┐
│ Integration Strategies                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ SYNCHRONOUS:                                                │
│ - REST API (HTTP)                                           │
│ - gRPC                                                      │
│ - GraphQL                                                   │
│                                                             │
│ ASYNCHRONOUS:                                               │
│ - Domain Events (Event Bus)                                │
│ - Message Queues (RabbitMQ, SQS)                          │
│ - Event Streaming (Kafka)                                  │
│                                                             │
│ ANTI-PATTERNS:                                              │
│ - Shared Database                                           │
│ - Direct Object References                                  │
└─────────────────────────────────────────────────────────────┘
*/
```

## Strategy 1: REST API Integration

**Best For:** Query operations, real-time data needs, customer-supplier relationships

### Implementation

```typescript
// UPSTREAM: Catalog Context exposes REST API
export class CatalogAPI {
  constructor(
    private readonly catalogService: CatalogService
  ) {}

  @Get('/api/v1/products/:id')
  async getProduct(
    @Param('id') id: string
  ): Promise<ProductResponse> {
    const product = await this.catalogService.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      id: product.id.value,
      name: product.name,
      description: product.description,
      price: {
        amount: product.price.amount,
        currency: product.price.currency,
      },
      stock: product.stockQuantity,
    };
  }

  @Get('/api/v1/products')
  async searchProducts(
    @Query('q') query: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20
  ): Promise<ProductListResponse> {
    const products = await this.catalogService.search(query, {
      page,
      limit,
    });

    return {
      data: products.map(p => this.toResponse(p)),
      pagination: {
        page,
        limit,
        total: products.total,
      },
    };
  }
}

// DOWNSTREAM: Sales Context consumes Catalog API
export class CatalogClient {
  constructor(private readonly httpClient: HttpClient) {}

  async getProduct(productId: string): Promise<ProductDTO> {
    const response = await this.httpClient.get<ProductResponse>(
      `/api/v1/products/${productId}`
    );

    return {
      id: response.id,
      name: response.name,
      price: Money.of(response.price.amount, response.price.currency),
      isAvailable: response.stock > 0,
    };
  }

  async searchProducts(query: string): Promise<ProductDTO[]> {
    const response = await this.httpClient.get<ProductListResponse>(
      '/api/v1/products',
      { params: { q: query, limit: 50 } }
    );

    return response.data.map(p => ({
      id: p.id,
      name: p.name,
      price: Money.of(p.price.amount, p.price.currency),
      isAvailable: p.stock > 0,
    }));
  }
}

// Usage in Sales Context
export class OrderService {
  constructor(private readonly catalogClient: CatalogClient) {}

  async addProductToCart(
    cartId: string,
    productId: string,
    quantity: number
  ): Promise<void> {
    // Synchronous call to Catalog
    const product = await this.catalogClient.getProduct(productId);

    if (!product.isAvailable) {
      throw new ProductUnavailableError(productId);
    }

    const cart = await this.cartRepository.findById(cartId);
    cart.addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
    });

    await this.cartRepository.save(cart);
  }
}
```

### REST Integration Patterns

```typescript
// Pattern 1: Direct HTTP calls
class DirectHTTPIntegration {
  async getCustomer(id: string): Promise<Customer> {
    const response = await fetch(`https://api.example.com/customers/${id}`);
    const data = await response.json();
    return this.adapter.toDomain(data);
  }
}

// Pattern 2: SDK/Client Library
class SDKIntegration {
  constructor(private readonly client: StripeClient) {}

  async processPayment(amount: Money): Promise<PaymentResult> {
    const intent = await this.client.paymentIntents.create({
      amount: amount.cents,
      currency: amount.currency.toLowerCase(),
    });

    return PaymentResult.from(intent);
  }
}

// Pattern 3: Backend-for-Frontend (BFF)
class BFFAggregator {
  constructor(
    private readonly catalogAPI: CatalogClient,
    private readonly reviewsAPI: ReviewsClient,
    private readonly inventoryAPI: InventoryClient
  ) {}

  async getProductDetail(productId: string): Promise<ProductDetailView> {
    // Aggregate multiple upstream calls
    const [product, reviews, inventory] = await Promise.all([
      this.catalogAPI.getProduct(productId),
      this.reviewsAPI.getReviews(productId),
      this.inventoryAPI.getStock(productId),
    ]);

    return {
      ...product,
      averageRating: reviews.averageRating,
      reviewCount: reviews.count,
      stockLevel: inventory.quantity,
      estimatedDelivery: inventory.estimatedShipping,
    };
  }
}
```

### Handling Failures

```typescript
export class ResilientCatalogClient {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly cache: Cache,
    private readonly circuitBreaker: CircuitBreaker
  ) {}

  async getProduct(productId: string): Promise<ProductDTO> {
    // Check cache first
    const cached = await this.cache.get(`product:${productId}`);
    if (cached) {
      return cached;
    }

    try {
      // Use circuit breaker to prevent cascading failures
      const product = await this.circuitBreaker.execute(() =>
        this.fetchProduct(productId)
      );

      // Cache successful response
      await this.cache.set(`product:${productId}`, product, { ttl: 300 });

      return product;
    } catch (error) {
      // Fallback strategy
      if (error instanceof CircuitBreakerOpenError) {
        // Return stale cache if available
        const stale = await this.cache.get(`product:${productId}`, {
          allowStale: true,
        });
        if (stale) {
          return stale;
        }
      }

      throw new ProductServiceUnavailableError(productId, error);
    }
  }

  private async fetchProduct(productId: string): Promise<ProductDTO> {
    const response = await this.httpClient.get(`/products/${productId}`, {
      timeout: 3000,
      retry: { count: 2, delay: 100 },
    });

    return response.data;
  }
}
```

## Strategy 2: Event-Driven Integration

**Best For:** Eventual consistency, decoupling, notification of state changes

### Domain Events

```typescript
// Sales Context publishes events
export namespace Sales {
  export class OrderPlaced extends DomainEvent {
    constructor(
      public readonly orderId: string,
      public readonly customerId: string,
      public readonly items: Array<{
        productId: string;
        quantity: number;
        price: { amount: number; currency: string };
      }>,
      public readonly total: { amount: number; currency: string },
      public readonly shippingAddress: Address
    ) {
      super();
    }
  }

  export class Order {
    place(): void {
      // Business logic
      this.status = OrderStatus.Placed;

      // Raise domain event
      this.addDomainEvent(
        new OrderPlaced(
          this.id.value,
          this.customerId.value,
          this.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: {
              amount: item.price.amount,
              currency: item.price.currency,
            },
          })),
          { amount: this.total.amount, currency: this.total.currency },
          this.shippingAddress
        )
      );
    }
  }
}

// Event Bus publishes events
export class EventBus {
  constructor(
    private readonly publishers: Map<string, EventPublisher>
  ) {}

  async publish(event: DomainEvent): Promise<void> {
    const publisher = this.publishers.get(event.constructor.name);

    if (!publisher) {
      throw new Error(`No publisher for ${event.constructor.name}`);
    }

    await publisher.publish({
      eventType: event.constructor.name,
      eventId: generateId(),
      occurredAt: new Date().toISOString(),
      payload: event,
    });
  }
}

// Fulfillment Context subscribes
export namespace Fulfillment {
  @EventHandler('Sales.OrderPlaced')
  export class CreateShipmentOnOrderPlaced {
    constructor(
      private readonly shipmentRepository: ShipmentRepository
    ) {}

    async handle(event: Sales.OrderPlaced): Promise<void> {
      const shipment = Shipment.createFromOrder({
        orderId: event.orderId,
        items: event.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        destination: event.shippingAddress,
      });

      await this.shipmentRepository.save(shipment);
    }
  }
}

// Billing Context also subscribes
export namespace Billing {
  @EventHandler('Sales.OrderPlaced')
  export class CreateInvoiceOnOrderPlaced {
    constructor(
      private readonly invoiceRepository: InvoiceRepository
    ) {}

    async handle(event: Sales.OrderPlaced): Promise<void> {
      const invoice = Invoice.create({
        orderId: event.orderId,
        customerId: event.customerId,
        amount: Money.of(event.total.amount, event.total.currency),
        items: event.items,
      });

      await this.invoiceRepository.save(invoice);
    }
  }
}
```

### Message Queue Integration

```typescript
// Using RabbitMQ or AWS SQS
export class MessageQueuePublisher implements EventPublisher {
  constructor(
    private readonly channel: Channel,
    private readonly exchange: string
  ) {}

  async publish(event: EventEnvelope): Promise<void> {
    const message = JSON.stringify(event);

    await this.channel.publish(
      this.exchange,
      event.eventType, // Routing key
      Buffer.from(message),
      {
        persistent: true,
        contentType: 'application/json',
        timestamp: Date.now(),
      }
    );
  }
}

export class MessageQueueSubscriber {
  constructor(
    private readonly channel: Channel,
    private readonly queue: string,
    private readonly handlers: Map<string, EventHandler>
  ) {}

  async start(): Promise<void> {
    await this.channel.consume(this.queue, async (msg) => {
      if (!msg) return;

      try {
        const event = JSON.parse(msg.content.toString());
        const handler = this.handlers.get(event.eventType);

        if (handler) {
          await handler.handle(event.payload);
          this.channel.ack(msg);
        } else {
          // No handler, acknowledge anyway or move to DLQ
          this.channel.ack(msg);
        }
      } catch (error) {
        // Retry logic
        if (msg.fields.redelivered) {
          // Move to dead letter queue
          this.channel.nack(msg, false, false);
        } else {
          // Retry once
          this.channel.nack(msg, false, true);
        }
      }
    });
  }
}
```

### Event Streaming (Kafka)

```typescript
// Producer (Sales Context)
export class KafkaEventPublisher {
  constructor(private readonly producer: Producer) {}

  async publish(event: DomainEvent): Promise<void> {
    await this.producer.send({
      topic: 'sales-events',
      messages: [
        {
          key: event.aggregateId, // For partitioning
          value: JSON.stringify({
            eventType: event.constructor.name,
            eventId: generateId(),
            occurredAt: new Date().toISOString(),
            payload: event,
          }),
          headers: {
            'event-type': event.constructor.name,
            'event-version': '1',
          },
        },
      ],
    });
  }
}

// Consumer (Fulfillment Context)
export class KafkaEventConsumer {
  constructor(
    private readonly consumer: Consumer,
    private readonly handlers: Map<string, EventHandler>
  ) {}

  async start(): Promise<void> {
    await this.consumer.subscribe({ topic: 'sales-events' });

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const eventType = message.headers?.['event-type']?.toString();
        const event = JSON.parse(message.value.toString());

        const handler = this.handlers.get(eventType);
        if (handler) {
          await handler.handle(event.payload);
        }
      },
    });
  }
}
```

## Strategy 3: Saga Pattern (Distributed Transactions)

**Best For:** Coordinating multi-step processes across contexts

```typescript
// Orchestration Saga
export class OrderProcessingSaga {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly paymentService: PaymentService,
    private readonly inventoryService: InventoryService,
    private readonly shippingService: ShippingService
  ) {}

  async execute(command: PlaceOrderCommand): Promise<OrderId> {
    const order = Order.create(command);
    await this.orderRepository.save(order);

    try {
      // Step 1: Process payment
      const payment = await this.paymentService.process({
        orderId: order.id,
        amount: order.total,
        paymentMethod: command.paymentMethod,
      });

      // Step 2: Reserve inventory
      await this.inventoryService.reserve({
        orderId: order.id,
        items: order.items,
      });

      // Step 3: Schedule shipment
      await this.shippingService.schedule({
        orderId: order.id,
        items: order.items,
        address: command.shippingAddress,
      });

      // All steps successful
      order.confirm();
      await this.orderRepository.save(order);

      return order.id;
    } catch (error) {
      // Compensating transactions
      await this.compensate(order, error);
      throw error;
    }
  }

  private async compensate(order: Order, error: Error): Promise<void> {
    // Rollback in reverse order
    try {
      await this.shippingService.cancel(order.id);
    } catch {}

    try {
      await this.inventoryService.release(order.id);
    } catch {}

    try {
      await this.paymentService.refund(order.id);
    } catch {}

    order.cancel();
    await this.orderRepository.save(order);
  }
}

// Choreography Saga (Event-driven)
export class OrderPlacedHandler {
  @EventHandler('Sales.OrderPlaced')
  async handle(event: OrderPlaced): Promise<void> {
    // Each handler publishes next event
    const payment = await this.processPayment(event.orderId);

    if (payment.isSuccessful()) {
      await this.eventBus.publish(
        new PaymentProcessed(event.orderId, payment.id)
      );
    } else {
      await this.eventBus.publish(
        new PaymentFailed(event.orderId, payment.error)
      );
    }
  }
}

export class PaymentProcessedHandler {
  @EventHandler('Payment.PaymentProcessed')
  async handle(event: PaymentProcessed): Promise<void> {
    const reservation = await this.reserveInventory(event.orderId);

    if (reservation.isSuccessful()) {
      await this.eventBus.publish(
        new InventoryReserved(event.orderId, reservation.id)
      );
    } else {
      // Compensate
      await this.refundPayment(event.orderId);
      await this.eventBus.publish(
        new InventoryReservationFailed(event.orderId)
      );
    }
  }
}
```

## Anti-Pattern: Shared Database

```typescript
// ❌ ANTI-PATTERN: Multiple contexts accessing same database
namespace Sales {
  // Sales directly queries products table
  class OrderService {
    async createOrder(customerId: string, productIds: string[]): Promise<void> {
      // Directly accessing Catalog's database!
      const products = await db.products.findMany({
        where: { id: { in: productIds } },
      });

      // Problems:
      // 1. Couples Sales to Catalog's schema
      // 2. No abstraction of Catalog's domain logic
      // 3. Schema changes in Catalog break Sales
      // 4. Can't deploy contexts independently
      // 5. Bypasses Catalog's business rules
    }
  }
}

// ✅ CORRECT: Use APIs or events
namespace Sales {
  class OrderService {
    constructor(
      private readonly catalogAPI: CatalogAPI // Proper abstraction
    ) {}

    async createOrder(customerId: string, productIds: string[]): Promise<void> {
      // Use Catalog's public API
      const products = await this.catalogAPI.getProducts(productIds);
      // Catalog's business rules are enforced
    }
  }
}
```

## Choosing the Right Strategy

```typescript
/*
┌──────────────────────┬──────────────┬──────────────┬─────────────┐
│ Strategy             │ Use When     │ Pros         │ Cons        │
├──────────────────────┼──────────────┼──────────────┼─────────────┤
│ REST API             │ Need data    │ Simple       │ Coupling    │
│                      │ immediately  │ Familiar     │ Availability│
│                      │              │              │             │
│ Domain Events        │ Notification │ Decoupled    │ Eventual    │
│                      │ of changes   │ Scalable     │ consistency │
│                      │              │              │             │
│ Message Queue        │ Guaranteed   │ Reliable     │ Complexity  │
│                      │ delivery     │ Async        │             │
│                      │              │              │             │
│ Event Streaming      │ Event        │ Replay       │ Operational │
│                      │ sourcing     │ History      │ overhead    │
│                      │              │              │             │
│ Saga                 │ Multi-step   │ Consistency  │ Complexity  │
│                      │ transactions │              │             │
└──────────────────────┴──────────────┴──────────────┴─────────────┘
*/
```

## Key Takeaways

1. **Synchronous for queries** - REST when you need data immediately
2. **Asynchronous for commands** - Events for state change notifications
3. **Never share databases** - Always use APIs or events
4. **Design for failure** - Implement retries, circuit breakers, fallbacks
5. **Saga for coordination** - Orchestration or choreography for multi-step processes
6. **Choose based on needs** - Different strategies for different scenarios

## Next Steps

In the next lesson, we'll dive deep into **Anti-Corruption Layers**—how to protect your domain model from poor upstream models.

## Hands-On Exercise

**Implement Integration:**

Choose one integration point in your system:

1. **REST Integration:**
   ```typescript
   class UpstreamClient {
     async getData(id: string): Promise<DTO> {
       // Implement with error handling
     }
   }
   ```

2. **Event Integration:**
   ```typescript
   class DomainEventHandler {
     @EventHandler('Context.EventName')
     async handle(event: DomainEvent): Promise<void> {
       // Implement event handler
     }
   }
   ```

3. **Compare both approaches:**
   - When would you use REST?
   - When would you use events?
   - What are the tradeoffs?

---

**Time to complete:** 45 minutes
**Difficulty:** Intermediate
