# AI for Boilerplate and Pattern Implementation

**Duration:** 30 minutes
**Learning Objectives:**
- Use AI to generate DDD boilerplate code efficiently
- Write effective prompts for tactical pattern implementation
- Generate CQRS commands, queries, and event sourcing code
- Understand what AI does well vs poorly in DDD contexts
- Review and refine AI-generated code for production use

---

## Introduction

AI-powered coding assistants have transformed how we implement repetitive patterns. In DDD/CQRS systems, much code follows established patterns—entities, value objects, repositories, commands, queries. AI excels at generating this boilerplate, freeing you to focus on domain modeling and business logic.

This lesson teaches you how to leverage AI effectively while avoiding its pitfalls.

## What AI Does Well in DDD

### Strengths

```typescript
/*
┌─────────────────────────────────────────────────────────────┐
│ AI Excels At:                                               │
├─────────────────────────────────────────────────────────────┤
│ ✅ Pattern implementation (entities, VOs, repositories)     │
│ ✅ Boilerplate generation (constructors, getters, builders) │
│ ✅ Code structure and organization                          │
│ ✅ Type definitions and interfaces                          │
│ ✅ Converting examples to similar patterns                  │
│ ✅ Test scaffolding and data generation                     │
│ ✅ Documentation from code                                   │
│                                                             │
│ AI Struggles With:                                          │
├─────────────────────────────────────────────────────────────┤
│ ❌ Domain modeling decisions                                │
│ ❌ Business rule validation                                 │
│ ❌ Aggregate boundary definition                            │
│ ❌ Choosing event granularity                               │
│ ❌ Performance optimization strategies                      │
│ ❌ Understanding business context                           │
└─────────────────────────────────────────────────────────────┘
*/
```

## Generating DDD Entities and Value Objects

### Effective Prompts for Entities

**Prompt Template:**
```
Create a DDD aggregate root for [DOMAIN CONCEPT] with the following:
- Properties: [LIST]
- Business rules: [RULES]
- Domain events: [EVENTS]
- Include: private constructor, factory method, validation, invariant protection
- Use TypeScript with strict typing
```

**Example:**

```typescript
// PROMPT:
// "Create a DDD aggregate root for Order in an e-commerce system.
// Properties: orderId (UUID), customerId, items array, status (enum),
// totalAmount, createdAt, updatedAt.
// Business rules:
// - Order must have at least one item
// - Can only add items when status is Draft
// - Total is auto-calculated from items
// - Status can only transition Draft -> Placed -> Confirmed
// Domain events: OrderPlaced, OrderConfirmed
// Include validation and domain event raising"

// AI GENERATED (with your review):
type OrderStatus = 'Draft' | 'Placed' | 'Confirmed' | 'Cancelled';

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: Money;
}

class Order {
  private domainEvents: DomainEvent[] = [];

  private constructor(
    private readonly id: OrderId,
    private readonly customerId: CustomerId,
    private items: OrderItem[],
    private status: OrderStatus,
    private totalAmount: Money,
    private readonly createdAt: Date,
    private updatedAt: Date
  ) {}

  static create(customerId: CustomerId, items: OrderItem[]): Order {
    if (items.length === 0) {
      throw new DomainError('Order must have at least one item');
    }

    const total = this.calculateTotal(items);
    const order = new Order(
      OrderId.generate(),
      customerId,
      items,
      'Draft',
      total,
      new Date(),
      new Date()
    );

    return order;
  }

  addItem(item: OrderItem): void {
    if (this.status !== 'Draft') {
      throw new DomainError('Cannot add items to a placed order');
    }

    this.items.push(item);
    this.totalAmount = Order.calculateTotal(this.items);
    this.updatedAt = new Date();
  }

  place(): void {
    if (this.status !== 'Draft') {
      throw new DomainError('Only draft orders can be placed');
    }

    if (this.items.length === 0) {
      throw new DomainError('Cannot place an empty order');
    }

    this.status = 'Placed';
    this.updatedAt = new Date();

    this.addDomainEvent(
      new OrderPlaced(
        this.id.value,
        this.customerId.value,
        this.items,
        this.totalAmount
      )
    );
  }

  confirm(): void {
    if (this.status !== 'Placed') {
      throw new DomainError('Only placed orders can be confirmed');
    }

    this.status = 'Confirmed';
    this.updatedAt = new Date();

    this.addDomainEvent(
      new OrderConfirmed(this.id.value, this.customerId.value)
    );
  }

  private static calculateTotal(items: OrderItem[]): Money {
    const sum = items.reduce(
      (total, item) => total + item.price.amount * item.quantity,
      0
    );

    return new Money(sum, items[0]?.price.currency || 'USD');
  }

  private addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  getDomainEvents(): DomainEvent[] {
    return [...this.domainEvents];
  }

  clearDomainEvents(): void {
    this.domainEvents = [];
  }

  // Getters
  getId(): OrderId {
    return this.id;
  }

  getStatus(): OrderStatus {
    return this.status;
  }

  getItems(): readonly OrderItem[] {
    return Object.freeze([...this.items]);
  }

  getTotal(): Money {
    return this.totalAmount;
  }
}
```

**What to Review:**
1. **Business rules** - Verify all constraints are correct
2. **State transitions** - Check status flow makes sense
3. **Invariants** - Ensure invalid states are impossible
4. **Events** - Confirm event data includes what downstream needs
5. **Immutability** - Check that getters don't expose internals

### Value Object Generation

**Prompt:**
```
Create a DDD value object for Email with:
- Validation: format, length, domain restrictions
- Immutability
- Equality by value
- TypeScript implementation
```

```typescript
// AI GENERATED:
class Email {
  private readonly value: string;

  private constructor(email: string) {
    this.value = email;
  }

  static create(email: string): Email {
    if (!email) {
      throw new DomainError('Email cannot be empty');
    }

    const trimmed = email.trim().toLowerCase();

    if (trimmed.length > 255) {
      throw new DomainError('Email cannot exceed 255 characters');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      throw new DomainError('Invalid email format');
    }

    // Optional: Domain restrictions
    const allowedDomains = ['company.com', 'partner.com'];
    const domain = trimmed.split('@')[1];
    if (allowedDomains.length > 0 && !allowedDomains.includes(domain)) {
      throw new DomainError(`Email domain must be one of: ${allowedDomains.join(', ')}`);
    }

    return new Email(trimmed);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

// Usage
const email = Email.create('user@example.com');
const email2 = Email.create('USER@EXAMPLE.COM'); // Same value after normalization
console.log(email.equals(email2)); // true
```

## Generating CQRS Commands and Queries

### Command Generation

**Prompt:**
```
Generate a CQRS command handler for "PlaceOrder" with:
- Command: customerId, items, shippingAddress, paymentMethod
- Handler: validate, create order aggregate, publish domain events
- Include: type definitions, validation, error handling
- Use Result pattern for errors
```

```typescript
// AI GENERATED:

// Command
interface PlaceOrderCommand {
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: {
    type: 'credit_card' | 'paypal';
    token: string;
  };
}

// Command Handler
class PlaceOrderHandler {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository,
    private readonly eventBus: EventBus
  ) {}

  async handle(command: PlaceOrderCommand): Promise<Result<OrderId, Error>> {
    try {
      // Validate customer
      const customerId = CustomerId.create(command.customerId);

      // Load products and validate
      const productResults = await Promise.all(
        command.items.map(item =>
          this.productRepository.findById(ProductId.create(item.productId))
        )
      );

      const products = productResults.filter(p => p !== null);
      if (products.length !== command.items.length) {
        return err(new DomainError('Some products not found'));
      }

      // Create order items
      const orderItems: OrderItem[] = command.items.map((item, index) => {
        const product = products[index];
        return {
          productId: item.productId,
          productName: product.getName(),
          quantity: item.quantity,
          price: product.getPrice(),
        };
      });

      // Create order aggregate
      const order = Order.create(customerId, orderItems);

      // Add shipping address
      const shippingAddress = Address.create(command.shippingAddress);
      order.setShippingAddress(shippingAddress);

      // Place order
      order.place();

      // Persist
      await this.orderRepository.save(order);

      // Publish domain events
      const events = order.getDomainEvents();
      for (const event of events) {
        await this.eventBus.publish(event);
      }

      order.clearDomainEvents();

      return ok(order.getId());
    } catch (error) {
      if (error instanceof DomainError) {
        return err(error);
      }
      return err(new Error('Failed to place order'));
    }
  }
}
```

### Query Generation

**Prompt:**
```
Generate a CQRS query for "GetOrderDetails" with:
- Query: orderId, userId (for authorization)
- Query handler: fetch order with items, customer info, shipping details
- Return DTO optimized for read
- Include error handling for not found
```

```typescript
// AI GENERATED:

// Query
interface GetOrderDetailsQuery {
  orderId: string;
  userId: string;
}

// Read Model DTO
interface OrderDetailsDTO {
  orderId: string;
  status: OrderStatus;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: {
      amount: number;
      currency: string;
    };
    subtotal: number;
  }>;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  placedAt: Date;
  estimatedDelivery?: Date;
}

// Query Handler
class GetOrderDetailsHandler {
  constructor(
    private readonly orderReadRepository: OrderReadRepository
  ) {}

  async handle(
    query: GetOrderDetailsQuery
  ): Promise<Result<OrderDetailsDTO, Error>> {
    // Fetch from read model (optimized for queries)
    const order = await this.orderReadRepository.findByIdWithDetails(
      query.orderId
    );

    if (!order) {
      return err(new NotFoundError('Order not found'));
    }

    // Authorization check
    if (order.customerId !== query.userId) {
      return err(new UnauthorizedError('Not authorized to view this order'));
    }

    // Map to DTO
    const dto: OrderDetailsDTO = {
      orderId: order.id,
      status: order.status,
      items: order.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: {
          amount: item.price,
          currency: item.currency,
        },
        subtotal: item.price * item.quantity,
      })),
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shippingCost,
      total: order.total,
      customer: {
        id: order.customerId,
        name: order.customerName,
        email: order.customerEmail,
      },
      shippingAddress: order.shippingAddress,
      placedAt: order.placedAt,
      estimatedDelivery: order.estimatedDelivery,
    };

    return ok(dto);
  }
}
```

## Event Sourcing Boilerplate

### Event Store Implementation

**Prompt:**
```
Generate an Event Store implementation for event sourcing with:
- Append events to stream
- Load events for aggregate
- Snapshot support
- Optimistic concurrency (version checking)
- TypeScript with proper types
```

```typescript
// AI GENERATED:

interface EventData {
  eventId: string;
  eventType: string;
  aggregateId: string;
  aggregateType: string;
  version: number;
  payload: Record<string, unknown>;
  metadata: {
    timestamp: Date;
    userId?: string;
    correlationId?: string;
  };
}

interface AppendResult {
  success: boolean;
  currentVersion: number;
}

interface EventStream {
  aggregateId: string;
  aggregateType: string;
  version: number;
  events: EventData[];
}

class EventStore {
  constructor(private readonly db: Database) {}

  async appendEvents(
    aggregateId: string,
    aggregateType: string,
    events: DomainEvent[],
    expectedVersion: number
  ): Promise<AppendResult> {
    return await this.db.transaction(async (tx) => {
      // Get current version
      const stream = await tx.eventStreams.findUnique({
        where: {
          aggregateId_aggregateType: { aggregateId, aggregateType },
        },
      });

      const currentVersion = stream?.version ?? 0;

      // Optimistic concurrency check
      if (currentVersion !== expectedVersion) {
        throw new ConcurrencyError(
          `Expected version ${expectedVersion}, but current version is ${currentVersion}`
        );
      }

      // Append events
      const eventRecords = events.map((event, index) => ({
        eventId: generateId(),
        eventType: event.constructor.name,
        aggregateId,
        aggregateType,
        version: currentVersion + index + 1,
        payload: event.toJSON(),
        metadata: {
          timestamp: new Date(),
          userId: event.metadata?.userId,
          correlationId: event.metadata?.correlationId,
        },
      }));

      await tx.events.createMany({ data: eventRecords });

      // Update stream version
      const newVersion = currentVersion + events.length;
      if (stream) {
        await tx.eventStreams.update({
          where: { id: stream.id },
          data: { version: newVersion },
        });
      } else {
        await tx.eventStreams.create({
          data: { aggregateId, aggregateType, version: newVersion },
        });
      }

      return { success: true, currentVersion: newVersion };
    });
  }

  async loadEvents(
    aggregateId: string,
    aggregateType: string,
    fromVersion = 0
  ): Promise<EventStream> {
    const events = await this.db.events.findMany({
      where: {
        aggregateId,
        aggregateType,
        version: { gte: fromVersion },
      },
      orderBy: { version: 'asc' },
    });

    const stream = await this.db.eventStreams.findUnique({
      where: {
        aggregateId_aggregateType: { aggregateId, aggregateType },
      },
    });

    return {
      aggregateId,
      aggregateType,
      version: stream?.version ?? 0,
      events: events.map(e => ({
        eventId: e.eventId,
        eventType: e.eventType,
        aggregateId: e.aggregateId,
        aggregateType: e.aggregateType,
        version: e.version,
        payload: e.payload,
        metadata: e.metadata,
      })),
    };
  }

  async loadSnapshot<T>(
    aggregateId: string,
    aggregateType: string
  ): Promise<{ snapshot: T; version: number } | null> {
    const snapshot = await this.db.snapshots.findFirst({
      where: { aggregateId, aggregateType },
      orderBy: { version: 'desc' },
    });

    if (!snapshot) {
      return null;
    }

    return {
      snapshot: snapshot.data as T,
      version: snapshot.version,
    };
  }

  async saveSnapshot(
    aggregateId: string,
    aggregateType: string,
    version: number,
    snapshot: Record<string, unknown>
  ): Promise<void> {
    await this.db.snapshots.create({
      data: {
        aggregateId,
        aggregateType,
        version,
        data: snapshot,
        createdAt: new Date(),
      },
    });
  }
}

// Usage
class OrderRepository {
  constructor(private readonly eventStore: EventStore) {}

  async save(order: Order): Promise<void> {
    const events = order.getDomainEvents();
    const expectedVersion = order.getVersion();

    await this.eventStore.appendEvents(
      order.getId().value,
      'Order',
      events,
      expectedVersion
    );

    order.clearDomainEvents();
    order.incrementVersion(events.length);
  }

  async findById(orderId: OrderId): Promise<Order | null> {
    // Try loading from snapshot first
    const snapshot = await this.eventStore.loadSnapshot<OrderSnapshot>(
      orderId.value,
      'Order'
    );

    let order: Order;
    let fromVersion = 0;

    if (snapshot) {
      order = Order.fromSnapshot(snapshot.snapshot);
      fromVersion = snapshot.version + 1;
    }

    // Load events since snapshot (or all events if no snapshot)
    const stream = await this.eventStore.loadEvents(
      orderId.value,
      'Order',
      fromVersion
    );

    if (stream.events.length === 0 && !snapshot) {
      return null;
    }

    if (!snapshot) {
      order = Order.reconstituteFromEvents(stream.events);
    } else {
      order.applyEvents(stream.events);
    }

    return order;
  }
}
```

## Repository Pattern Generation

**Prompt:**
```
Generate a repository interface and implementation for Order aggregate with:
- Interface: save, findById, findByCustomerId with pagination
- Implementation: Prisma ORM, domain event publishing, error handling
- Include mapper between domain and persistence models
```

```typescript
// AI GENERATED:

// Repository Interface
interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(orderId: OrderId): Promise<Order | null>;
  findByCustomerId(
    customerId: CustomerId,
    pagination: { page: number; limit: number }
  ): Promise<{ orders: Order[]; total: number }>;
  delete(orderId: OrderId): Promise<void>;
}

// Persistence Model (Prisma-generated types)
interface OrderPersistenceModel {
  id: string;
  customerId: string;
  status: string;
  totalAmount: number;
  totalCurrency: string;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItemPersistence[];
}

// Domain to Persistence Mapper
class OrderMapper {
  static toPersistence(order: Order): OrderPersistenceModel {
    return {
      id: order.getId().value,
      customerId: order.getCustomerId().value,
      status: order.getStatus(),
      totalAmount: order.getTotal().amount,
      totalCurrency: order.getTotal().currency,
      createdAt: order.getCreatedAt(),
      updatedAt: order.getUpdatedAt(),
      items: order.getItems().map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        priceAmount: item.price.amount,
        priceCurrency: item.price.currency,
      })),
    };
  }

  static toDomain(persistence: OrderPersistenceModel): Order {
    const items: OrderItem[] = persistence.items.map(item => ({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      price: new Money(item.priceAmount, item.priceCurrency),
    }));

    return Order.reconstitute(
      OrderId.create(persistence.id),
      CustomerId.create(persistence.customerId),
      items,
      persistence.status as OrderStatus,
      new Money(persistence.totalAmount, persistence.totalCurrency),
      persistence.createdAt,
      persistence.updatedAt
    );
  }
}

// Repository Implementation
class PrismaOrderRepository implements OrderRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly eventBus: EventBus
  ) {}

  async save(order: Order): Promise<void> {
    const data = OrderMapper.toPersistence(order);

    await this.prisma.$transaction(async (tx) => {
      // Upsert order
      await tx.orders.upsert({
        where: { id: data.id },
        create: {
          ...data,
          items: {
            create: data.items,
          },
        },
        update: {
          status: data.status,
          totalAmount: data.totalAmount,
          totalCurrency: data.totalCurrency,
          updatedAt: data.updatedAt,
          items: {
            deleteMany: {},
            create: data.items,
          },
        },
      });
    });

    // Publish domain events
    const events = order.getDomainEvents();
    for (const event of events) {
      await this.eventBus.publish(event);
    }
    order.clearDomainEvents();
  }

  async findById(orderId: OrderId): Promise<Order | null> {
    const orderData = await this.prisma.orders.findUnique({
      where: { id: orderId.value },
      include: { items: true },
    });

    if (!orderData) {
      return null;
    }

    return OrderMapper.toDomain(orderData);
  }

  async findByCustomerId(
    customerId: CustomerId,
    pagination: { page: number; limit: number }
  ): Promise<{ orders: Order[]; total: number }> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [ordersData, total] = await Promise.all([
      this.prisma.orders.findMany({
        where: { customerId: customerId.value },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.orders.count({
        where: { customerId: customerId.value },
      }),
    ]);

    const orders = ordersData.map(OrderMapper.toDomain);

    return { orders, total };
  }

  async delete(orderId: OrderId): Promise<void> {
    await this.prisma.orders.delete({
      where: { id: orderId.value },
    });
  }
}
```

## AI Workflow for DDD Implementation

### Step-by-Step Process

```typescript
/*
1. DEFINE DOMAIN MODEL (Human-led)
   - Identify aggregates, entities, VOs
   - Define business rules
   - Map relationships

2. GENERATE BOILERPLATE (AI-assisted)
   - Use AI for entity structure
   - Generate value objects
   - Create repository interfaces

3. REVIEW & REFINE (Human-led)
   - Validate business rules
   - Check invariants
   - Ensure domain language

4. GENERATE TESTS (AI-assisted)
   - Generate test scaffolding
   - Create test data builders
   - Add edge case tests

5. IMPLEMENT INFRASTRUCTURE (AI-assisted)
   - Generate persistence code
   - Create API endpoints
   - Set up event handlers

6. FINAL REVIEW (Human-led)
   - Integration testing
   - Performance validation
   - Security review
*/
```

## Common Pitfalls with AI-Generated Code

### Pitfall 1: Over-Generic Implementations

```typescript
// ❌ AI might generate overly generic code
class GenericEntity<T> {
  constructor(private data: T) {}

  update(data: Partial<T>): void {
    Object.assign(this.data, data); // No business rules!
  }
}

// ✅ Refine to domain-specific with business rules
class Order {
  updateStatus(newStatus: OrderStatus): void {
    // Validate state transition
    if (!this.canTransitionTo(newStatus)) {
      throw new DomainError(`Cannot transition from ${this.status} to ${newStatus}`);
    }
    this.status = newStatus;
  }

  private canTransitionTo(newStatus: OrderStatus): boolean {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      Draft: ['Placed', 'Cancelled'],
      Placed: ['Confirmed', 'Cancelled'],
      Confirmed: ['Shipped'],
      Shipped: ['Delivered'],
      Delivered: [],
      Cancelled: [],
    };
    return validTransitions[this.status].includes(newStatus);
  }
}
```

### Pitfall 2: Missing Domain Validation

```typescript
// ❌ AI might miss domain-specific validation
static create(email: string): Email {
  if (!email.match(/^.+@.+\..+$/)) {
    throw new Error('Invalid email');
  }
  return new Email(email);
}

// ✅ Add domain-specific rules
static create(email: string): Email {
  if (!email.match(/^.+@.+\..+$/)) {
    throw new DomainError('Invalid email format');
  }

  // Domain-specific: company email only
  if (!email.endsWith('@ourcompany.com')) {
    throw new DomainError('Only company emails allowed');
  }

  // Domain-specific: max length from business requirement
  if (email.length > 100) {
    throw new DomainError('Email exceeds maximum length of 100 characters');
  }

  return new Email(email.toLowerCase());
}
```

### Pitfall 3: Incorrect Event Granularity

```typescript
// ❌ AI might create too many fine-grained events
class Order {
  addItem(item: OrderItem): void {
    this.items.push(item);
    this.addEvent(new ItemAdded(item)); // Too granular
    this.totalAmount = this.calculateTotal();
    this.addEvent(new TotalRecalculated(this.totalAmount)); // Too granular
  }
}

// ✅ Refine to business-meaningful events
class Order {
  addItem(item: OrderItem): void {
    this.items.push(item);
    this.totalAmount = this.calculateTotal();
    // Single event with all relevant data
    this.addEvent(
      new OrderItemAdded(
        this.id.value,
        item,
        this.totalAmount,
        this.items.length
      )
    );
  }
}
```

## Key Takeaways

1. **AI accelerates boilerplate** - Use it for entities, VOs, repositories, commands/queries
2. **Always review business rules** - AI doesn't understand your domain
3. **Use clear, specific prompts** - Include business rules and constraints
4. **Iterate and refine** - AI generates starting point, you make it production-ready
5. **Test AI-generated code** - Especially business logic and edge cases
6. **Repository pattern** - AI handles structure, you validate domain integrity
7. **Events need context** - Review event granularity and data

## Next Steps

In the next lesson, we'll explore **AI-Assisted Testing and Validation**—generating comprehensive tests, test data, and using AI for code review.

## Hands-On Exercise

**Generate and Refine:**

1. **Use AI to generate an aggregate:**
   - Choose a domain concept (e.g., Invoice, Shipment, Subscription)
   - Write a detailed prompt including business rules
   - Generate the code
   - Review and refine for domain accuracy

2. **Generate a CQRS handler:**
   - Create a command handler for a business operation
   - Include validation and error handling
   - Test the generated code

3. **Create a repository:**
   - Generate repository interface and implementation
   - Add domain event publishing
   - Verify mapper correctness

**Reflection Questions:**
- What did AI generate well?
- What needed significant refinement?
- What business rules did AI miss?
- How would you improve your prompt next time?

---

**Time to complete:** 60 minutes
**Difficulty:** Intermediate

Share your experience using AI for DDD code generation in the course forum!
