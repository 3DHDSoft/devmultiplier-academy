# Repositories and Persistence

**Duration:** 17 minutes
**Learning Objectives:**
- Understand the repository pattern for aggregate persistence
- Implement repositories with Prisma ORM in TypeScript
- Design query methods and specifications
- Use the Unit of Work pattern for transactions
- Create in-memory repositories for testing
- Handle aggregate reconstitution from database
- Manage transactions and consistency boundaries

---

## Introduction

Repositories are the bridge between your domain model and data persistence. They provide the illusion of an in-memory collection of aggregates while hiding the complexity of database operations. A well-designed repository preserves the aggregate boundary, maintains encapsulation, and keeps your domain logic clean.

## The Repository Pattern

### What is a Repository?

**Definition:** A repository mediates between the domain and data mapping layers, acting like an in-memory collection of aggregates.

**Key Characteristics:**
- Operates on aggregates (not individual entities)
- Collection-oriented interface
- Encapsulates persistence details
- Maintains aggregate boundaries
- Returns domain objects (not database records)

```typescript
// ✅ Good: Repository interface
interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: OrderId): Promise<Order | null>;
  findByCustomer(customerId: CustomerId): Promise<Order[]>;
  delete(id: OrderId): Promise<void>;
}

// ❌ Bad: Not collection-oriented
interface OrderRepository {
  insert(order: Order): Promise<void>;
  update(order: Order): Promise<void>;
  selectById(id: string): Promise<OrderDTO>;
  deleteFromDatabase(id: string): Promise<void>;
}
```

### Repository vs DAO (Data Access Object)

```typescript
// DAO: Database-centric
class OrderDAO {
  async insertOrder(data: OrderDTO): Promise<void> {
    await db.query('INSERT INTO orders...');
  }

  async updateOrderStatus(id: string, status: string): Promise<void> {
    await db.query('UPDATE orders SET status = ?...');
  }

  // Exposes database operations
  // Works with DTOs
  // Multiple methods for updates
}

// Repository: Domain-centric
class OrderRepository {
  async save(order: Order): Promise<void> {
    // Insert or update based on existence
    // Works with aggregates
    // Hides persistence details
  }

  async findById(id: OrderId): Promise<Order | null> {
    // Returns domain object
    // Reconstructs full aggregate
  }

  // Collection-oriented interface
  // Works with domain models
  // Single save method
}
```

## Repository Interface Design

### Basic Repository Interface

```typescript
// Base repository for all aggregates
interface Repository<T, ID> {
  save(aggregate: T): Promise<void>;
  findById(id: ID): Promise<T | null>;
  delete(id: ID): Promise<void>;
}

// Specific repository with domain-specific queries
interface OrderRepository extends Repository<Order, OrderId> {
  findByCustomer(customerId: CustomerId): Promise<Order[]>;
  findByStatus(status: OrderStatus): Promise<Order[]>;
  findPendingOrders(): Promise<Order[]>;
  findByDateRange(start: Date, end: Date): Promise<Order[]>;
}

// Repository with pagination
interface CustomerRepository extends Repository<Customer, CustomerId> {
  findAll(page: number, limit: number): Promise<{
    items: Customer[];
    total: number;
    page: number;
    totalPages: number;
  }>;
  findByEmail(email: Email): Promise<Customer | null>;
  existsByEmail(email: Email): Promise<boolean>;
}
```

### Specification Pattern for Complex Queries

```typescript
// Specification interface
interface Specification<T> {
  isSatisfiedBy(item: T): boolean;
  toPrismaWhere(): any; // For database queries
}

// Concrete specifications
class OrderByCustomerSpec implements Specification<Order> {
  constructor(private readonly customerId: CustomerId) {}

  isSatisfiedBy(order: Order): boolean {
    return order.getCustomerId().equals(this.customerId);
  }

  toPrismaWhere(): any {
    return { customerId: this.customerId.value };
  }
}

class OrderByStatusSpec implements Specification<Order> {
  constructor(private readonly status: OrderStatus) {}

  isSatisfiedBy(order: Order): boolean {
    return order.getStatus() === this.status;
  }

  toPrismaWhere(): any {
    return { status: this.status };
  }
}

class OrderByDateRangeSpec implements Specification<Order> {
  constructor(
    private readonly startDate: Date,
    private readonly endDate: Date
  ) {}

  isSatisfiedBy(order: Order): boolean {
    const orderDate = order.getCreatedAt();
    return orderDate >= this.startDate && orderDate <= this.endDate;
  }

  toPrismaWhere(): any {
    return {
      createdAt: {
        gte: this.startDate,
        lte: this.endDate,
      },
    };
  }
}

// Composite specifications
class AndSpecification<T> implements Specification<T> {
  constructor(
    private readonly left: Specification<T>,
    private readonly right: Specification<T>
  ) {}

  isSatisfiedBy(item: T): boolean {
    return this.left.isSatisfiedBy(item) && this.right.isSatisfiedBy(item);
  }

  toPrismaWhere(): any {
    return {
      AND: [this.left.toPrismaWhere(), this.right.toPrismaWhere()],
    };
  }
}

// Repository using specifications
interface OrderRepository {
  findBySpecification(spec: Specification<Order>): Promise<Order[]>;
}

// Usage
const spec = new AndSpecification(
  new OrderByCustomerSpec(customerId),
  new OrderByStatusSpec('Pending')
);

const orders = await orderRepo.findBySpecification(spec);
```

## Prisma Implementation

### Basic Repository with Prisma

```typescript
import { PrismaClient } from '@/generated/prisma/client';
import type { Order, OrderId, CustomerId, OrderStatus } from '@/domain/order';

class PrismaOrderRepository implements OrderRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(order: Order): Promise<void> {
    const data = this.toPersistence(order);

    await this.prisma.orders.upsert({
      where: { id: order.getId().value },
      create: {
        id: data.id,
        customerId: data.customerId,
        status: data.status,
        total: data.total,
        createdAt: data.createdAt,
        updatedAt: new Date(),
        items: {
          create: data.items,
        },
      },
      update: {
        status: data.status,
        total: data.total,
        updatedAt: new Date(),
        items: {
          deleteMany: {}, // Delete existing items
          create: data.items, // Recreate all items
        },
      },
    });
  }

  async findById(id: OrderId): Promise<Order | null> {
    const orderData = await this.prisma.orders.findUnique({
      where: { id: id.value },
      include: {
        items: true,
      },
    });

    if (!orderData) {
      return null;
    }

    return this.toDomain(orderData);
  }

  async findByCustomer(customerId: CustomerId): Promise<Order[]> {
    const ordersData = await this.prisma.orders.findMany({
      where: { customerId: customerId.value },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return ordersData.map((data) => this.toDomain(data));
  }

  async findByStatus(status: OrderStatus): Promise<Order[]> {
    const ordersData = await this.prisma.orders.findMany({
      where: { status },
      include: {
        items: true,
      },
    });

    return ordersData.map((data) => this.toDomain(data));
  }

  async delete(id: OrderId): Promise<void> {
    await this.prisma.orders.delete({
      where: { id: id.value },
    });
  }

  // Persistence mapping
  private toPersistence(order: Order): any {
    return {
      id: order.getId().value,
      customerId: order.getCustomerId().value,
      status: order.getStatus(),
      total: order.getTotal().amount,
      createdAt: order.getCreatedAt(),
      items: order.getItems().map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price.amount,
        currency: item.price.currency,
      })),
    };
  }

  // Domain reconstruction
  private toDomain(data: any): Order {
    const items = data.items.map((item: any) =>
      OrderItem.reconstitute(
        item.productId,
        item.productName,
        item.quantity,
        Money.of(item.price, item.currency)
      )
    );

    return Order.reconstitute(
      OrderId.fromString(data.id),
      CustomerId.fromString(data.customerId),
      items,
      data.status as OrderStatus,
      Money.of(data.total, data.items[0]?.currency || 'USD'),
      data.createdAt,
      data.updatedAt
    );
  }
}
```

### Optimized Query Methods

```typescript
class PrismaOrderRepository implements OrderRepository {
  // Efficient existence check
  async exists(id: OrderId): Promise<boolean> {
    const count = await this.prisma.orders.count({
      where: { id: id.value },
    });
    return count > 0;
  }

  // Projection for list views (don't load full aggregate)
  async findOrderSummaries(customerId: CustomerId): Promise<OrderSummary[]> {
    const orders = await this.prisma.orders.findMany({
      where: { customerId: customerId.value },
      select: {
        id: true,
        status: true,
        total: true,
        createdAt: true,
        _count: {
          select: { items: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((order) => ({
      id: order.id,
      status: order.status,
      total: order.total,
      itemCount: order._count.items,
      createdAt: order.createdAt,
    }));
  }

  // Batch loading
  async findByIds(ids: OrderId[]): Promise<Order[]> {
    const orderIds = ids.map((id) => id.value);

    const ordersData = await this.prisma.orders.findMany({
      where: {
        id: { in: orderIds },
      },
      include: {
        items: true,
      },
    });

    return ordersData.map((data) => this.toDomain(data));
  }

  // Count without loading data
  async countByCustomer(customerId: CustomerId): Promise<number> {
    return this.prisma.orders.count({
      where: { customerId: customerId.value },
    });
  }

  // Paginated query
  async findPaginated(
    customerId: CustomerId,
    page: number,
    limit: number
  ): Promise<{ orders: Order[]; total: number }> {
    const [ordersData, total] = await Promise.all([
      this.prisma.orders.findMany({
        where: { customerId: customerId.value },
        include: { items: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.orders.count({
        where: { customerId: customerId.value },
      }),
    ]);

    return {
      orders: ordersData.map((data) => this.toDomain(data)),
      total,
    };
  }
}
```

### Handling Nested Aggregates

```typescript
// Complex aggregate with nested entities
class PrismaCartRepository implements CartRepository {
  async save(cart: Cart): Promise<void> {
    const data = this.toPersistence(cart);

    await this.prisma.$transaction(async (tx) => {
      // Upsert cart
      await tx.carts.upsert({
        where: { id: cart.getId().value },
        create: {
          id: data.id,
          customerId: data.customerId,
          status: data.status,
          createdAt: data.createdAt,
          updatedAt: new Date(),
        },
        update: {
          status: data.status,
          updatedAt: new Date(),
        },
      });

      // Delete existing items
      await tx.cartItems.deleteMany({
        where: { cartId: cart.getId().value },
      });

      // Create current items
      if (data.items.length > 0) {
        await tx.cartItems.createMany({
          data: data.items.map((item) => ({
            ...item,
            cartId: cart.getId().value,
          })),
        });
      }
    });
  }

  async findById(id: CartId): Promise<Cart | null> {
    const cartData = await this.prisma.carts.findUnique({
      where: { id: id.value },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
      },
    });

    if (!cartData) {
      return null;
    }

    return this.toDomain(cartData);
  }

  private toPersistence(cart: Cart): any {
    return {
      id: cart.getId().value,
      customerId: cart.getCustomerId().value,
      status: cart.getStatus(),
      createdAt: cart.getCreatedAt(),
      items: cart.getItems().map((item) => ({
        id: item.getId().value,
        productId: item.getProductId().value,
        quantity: item.getQuantity(),
        addedAt: item.getAddedAt(),
      })),
    };
  }

  private toDomain(data: any): Cart {
    const items = data.items.map((item: any) =>
      CartItem.reconstitute(
        CartItemId.fromString(item.id),
        ProductId.fromString(item.productId),
        item.product.name,
        Money.of(item.product.price, 'USD'),
        item.quantity,
        item.addedAt
      )
    );

    return Cart.reconstitute(
      CartId.fromString(data.id),
      CustomerId.fromString(data.customerId),
      items,
      data.status,
      data.createdAt,
      data.updatedAt
    );
  }
}
```

## Unit of Work Pattern

### Transaction Coordination

```typescript
// Unit of Work interface
interface UnitOfWork {
  registerNew<T>(aggregate: T): void;
  registerDirty<T>(aggregate: T): void;
  registerDeleted<T>(aggregate: T): void;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

// Implementation with Prisma
class PrismaUnitOfWork implements UnitOfWork {
  private newAggregates: Map<string, any> = new Map();
  private dirtyAggregates: Map<string, any> = new Map();
  private deletedIds: Map<string, string> = new Map();

  constructor(private readonly prisma: PrismaClient) {}

  registerNew<T>(aggregate: T): void {
    const id = (aggregate as any).getId().value;
    this.newAggregates.set(id, aggregate);
  }

  registerDirty<T>(aggregate: T): void {
    const id = (aggregate as any).getId().value;
    this.dirtyAggregates.set(id, aggregate);
  }

  registerDeleted<T>(aggregate: T): void {
    const id = (aggregate as any).getId().value;
    const type = aggregate.constructor.name;
    this.deletedIds.set(id, type);
  }

  async commit(): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Process deletions
      for (const [id, type] of this.deletedIds.entries()) {
        if (type === 'Order') {
          await tx.orders.delete({ where: { id } });
        }
        // Add other aggregate types
      }

      // Process new aggregates
      for (const aggregate of this.newAggregates.values()) {
        if (aggregate instanceof Order) {
          const data = this.orderToPersistence(aggregate);
          await tx.orders.create({ data });
        }
        // Add other aggregate types
      }

      // Process dirty aggregates
      for (const aggregate of this.dirtyAggregates.values()) {
        if (aggregate instanceof Order) {
          const data = this.orderToPersistence(aggregate);
          await tx.orders.update({
            where: { id: data.id },
            data,
          });
        }
        // Add other aggregate types
      }
    });

    // Clear tracking
    this.clear();
  }

  async rollback(): Promise<void> {
    this.clear();
  }

  private clear(): void {
    this.newAggregates.clear();
    this.dirtyAggregates.clear();
    this.deletedIds.clear();
  }

  private orderToPersistence(order: Order): any {
    // Mapping logic
    return {
      id: order.getId().value,
      customerId: order.getCustomerId().value,
      // ... other fields
    };
  }
}

// Usage in application service
class PlaceOrderService {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly inventoryRepo: InventoryRepository,
    private readonly uow: UnitOfWork
  ) {}

  async execute(command: PlaceOrderCommand): Promise<void> {
    // Load aggregates
    const order = await this.orderRepo.findById(command.orderId);
    const inventory = await this.inventoryRepo.findByProduct(
      command.productId
    );

    // Execute domain logic
    order.place();
    inventory.reserve(command.quantity);

    // Register with unit of work
    this.uow.registerDirty(order);
    this.uow.registerDirty(inventory);

    // Commit all changes atomically
    await this.uow.commit();
  }
}
```

### Simpler Transaction Pattern

```typescript
// Repository with transaction support
class PrismaOrderRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // Execute multiple operations in transaction
  async transaction<T>(
    fn: (repo: PrismaOrderRepository) => Promise<T>
  ): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      const transactionalRepo = new PrismaOrderRepository(
        tx as PrismaClient
      );
      return fn(transactionalRepo);
    });
  }

  // Regular repository methods
  async save(order: Order): Promise<void> {
    // ... implementation
  }

  async findById(id: OrderId): Promise<Order | null> {
    // ... implementation
  }
}

// Usage
await orderRepo.transaction(async (repo) => {
  const order = await repo.findById(orderId);
  order.place();
  await repo.save(order);

  // Can use other repositories in same transaction
  // if they use the same tx context
});
```

## In-Memory Repository for Testing

```typescript
// In-memory implementation for unit tests
class InMemoryOrderRepository implements OrderRepository {
  private orders: Map<string, Order> = new Map();

  async save(order: Order): Promise<void> {
    // Clone to prevent reference issues
    const clone = this.clone(order);
    this.orders.set(order.getId().value, clone);
  }

  async findById(id: OrderId): Promise<Order | null> {
    const order = this.orders.get(id.value);
    return order ? this.clone(order) : null;
  }

  async findByCustomer(customerId: CustomerId): Promise<Order[]> {
    const orders: Order[] = [];

    for (const order of this.orders.values()) {
      if (order.getCustomerId().equals(customerId)) {
        orders.push(this.clone(order));
      }
    }

    return orders.sort(
      (a, b) => b.getCreatedAt().getTime() - a.getCreatedAt().getTime()
    );
  }

  async findByStatus(status: OrderStatus): Promise<Order[]> {
    const orders: Order[] = [];

    for (const order of this.orders.values()) {
      if (order.getStatus() === status) {
        orders.push(this.clone(order));
      }
    }

    return orders;
  }

  async delete(id: OrderId): Promise<void> {
    this.orders.delete(id.value);
  }

  async exists(id: OrderId): Promise<boolean> {
    return this.orders.has(id.value);
  }

  // Test helper methods
  clear(): void {
    this.orders.clear();
  }

  count(): number {
    return this.orders.size;
  }

  // Deep clone to prevent test pollution
  private clone(order: Order): Order {
    return Order.reconstitute(
      order.getId(),
      order.getCustomerId(),
      order.getItems().map((item) => ({ ...item })),
      order.getStatus(),
      order.getTotal(),
      order.getCreatedAt(),
      order.getUpdatedAt()
    );
  }
}

// Usage in tests
describe('PlaceOrderService', () => {
  let orderRepo: InMemoryOrderRepository;
  let service: PlaceOrderService;

  beforeEach(() => {
    orderRepo = new InMemoryOrderRepository();
    service = new PlaceOrderService(orderRepo);
  });

  it('should place order', async () => {
    // Arrange
    const order = Order.create(customerId, items);
    await orderRepo.save(order);

    // Act
    await service.placeOrder(order.getId());

    // Assert
    const updated = await orderRepo.findById(order.getId());
    expect(updated?.getStatus()).toBe('Placed');
  });
});
```

### In-Memory with Specifications

```typescript
class InMemoryOrderRepository implements OrderRepository {
  private orders: Map<string, Order> = new Map();

  async findBySpecification(spec: Specification<Order>): Promise<Order[]> {
    const orders: Order[] = [];

    for (const order of this.orders.values()) {
      if (spec.isSatisfiedBy(order)) {
        orders.push(this.clone(order));
      }
    }

    return orders;
  }

  // Other methods...
}
```

## Common Patterns and Best Practices

### Pattern 1: Lazy Loading Prevention

```typescript
// ❌ Problem: Lazy loading breaks aggregate boundary
class Order {
  async getCustomer(): Promise<Customer> {
    // Don't do this - loads related aggregate
    return this.customerRepo.findById(this.customerId);
  }
}

// ✅ Solution: Load what you need upfront
class OrderService {
  async processOrder(orderId: OrderId): Promise<void> {
    const order = await this.orderRepo.findById(orderId);
    const customer = await this.customerRepo.findById(order.getCustomerId());

    // Both aggregates available
    // No lazy loading
  }
}
```

### Pattern 2: Optimistic Locking

```typescript
// Add version field to aggregate
class Order {
  constructor(
    private readonly id: OrderId,
    private version: number,
    // ... other fields
  ) {}

  getVersion(): number {
    return this.version;
  }

  incrementVersion(): void {
    this.version++;
  }
}

// Repository checks version on update
class PrismaOrderRepository {
  async save(order: Order): Promise<void> {
    const currentVersion = order.getVersion();
    const nextVersion = currentVersion + 1;

    const result = await this.prisma.orders.updateMany({
      where: {
        id: order.getId().value,
        version: currentVersion, // Only update if version matches
      },
      data: {
        status: order.getStatus(),
        total: order.getTotal().amount,
        version: nextVersion,
        updatedAt: new Date(),
      },
    });

    if (result.count === 0) {
      throw new ConcurrencyError(
        `Order ${order.getId().value} was modified by another process`
      );
    }

    order.incrementVersion();
  }
}
```

### Pattern 3: Event Sourcing Integration

```typescript
class EventSourcedOrderRepository implements OrderRepository {
  constructor(
    private readonly eventStore: EventStore,
    private readonly snapshotRepo: SnapshotRepository
  ) {}

  async save(order: Order): Promise<void> {
    const events = order.getUncommittedEvents();

    // Save events
    await this.eventStore.append(order.getId().value, events);

    // Clear events from aggregate
    order.markEventsAsCommitted();

    // Optional: Save snapshot every N events
    const eventCount = await this.eventStore.countEvents(
      order.getId().value
    );
    if (eventCount % 50 === 0) {
      await this.snapshotRepo.save(order);
    }
  }

  async findById(id: OrderId): Promise<Order | null> {
    // Try snapshot first
    const snapshot = await this.snapshotRepo.findLatest(id.value);
    const events = await this.eventStore.getEvents(
      id.value,
      snapshot?.version ?? 0
    );

    if (events.length === 0 && !snapshot) {
      return null;
    }

    // Reconstitute from snapshot + events
    const order = snapshot
      ? Order.fromSnapshot(snapshot)
      : Order.createEmpty(id);

    for (const event of events) {
      order.applyEvent(event);
    }

    return order;
  }
}
```

## AI Integration Guidance

**Good Prompt for Repository:**
```
Create a Prisma repository for the Order aggregate with TypeScript. Include:
- save() method using upsert (insert or update)
- findById() returning Order domain object or null
- findByCustomer() with pagination
- findByStatus() query method
- Proper mapping: toPersistence() and toDomain()
- Handle nested OrderItem entities
- Transaction support for complex operations
- Optimistic locking with version field
```

**Good Prompt for In-Memory Repository:**
```
Create an in-memory repository for testing the Order aggregate. Include:
- Map-based storage
- Deep cloning to prevent test pollution
- findBySpecification() using Specification pattern
- Test helper methods: clear(), count()
- Same interface as production repository
- TypeScript with proper types
```

## Common Pitfalls

### 1. Breaking Aggregate Boundaries

```typescript
// ❌ Wrong: Saving nested aggregates
class OrderRepository {
  async save(order: Order): Promise<void> {
    await this.orderRepo.save(order);

    // Don't save customer here - it's a separate aggregate
    await this.customerRepo.save(order.customer);
  }
}

// ✅ Correct: Only save the Order aggregate
class OrderRepository {
  async save(order: Order): Promise<void> {
    // Save order and its entities (OrderItems)
    // Don't touch other aggregates
  }
}
```

### 2. Query Methods in Aggregate

```typescript
// ❌ Wrong: Repository in aggregate
class Order {
  constructor(private readonly orderRepo: OrderRepository) {}

  async getRelatedOrders(): Promise<Order[]> {
    return this.orderRepo.findByCustomer(this.customerId);
  }
}

// ✅ Correct: Queries in application service
class OrderService {
  async getRelatedOrders(orderId: OrderId): Promise<Order[]> {
    const order = await this.orderRepo.findById(orderId);
    return this.orderRepo.findByCustomer(order.getCustomerId());
  }
}
```

### 3. Generic Repository Anti-Pattern

```typescript
// ❌ Wrong: One repository for everything
class GenericRepository<T> {
  async save(entity: T): Promise<void> {
    // Can't handle aggregate-specific logic
  }

  async findById(id: string): Promise<T | null> {
    // Can't handle different ID types
  }
}

// ✅ Correct: Specific repositories
class OrderRepository {
  async save(order: Order): Promise<void> {
    // Order-specific persistence
  }

  async findById(id: OrderId): Promise<Order | null> {
    // Type-safe ID
  }
}
```

## Key Takeaways

1. **Collection-oriented interface** - save(), findById(), not insert()/update()
2. **Operate on aggregates** - Save entire aggregate, not individual entities
3. **Encapsulate persistence** - Domain doesn't know about database
4. **Maintain boundaries** - One repository per aggregate root
5. **Reconstitute properly** - Use reconstitute() factory method, not create()
6. **Use specifications** - Flexible query composition
7. **In-memory for tests** - Fast, isolated unit tests
8. **Transaction support** - Unit of Work or repository-level transactions

## Next Steps

In Module 4, we'll transition to **CQRS patterns**, where we separate read and write models. Repositories primarily serve the write side, while read models use optimized queries.

## Hands-On Exercise

**Implement a Complete Repository:**

1. **Create OrderRepository Interface:**
   - save(), findById(), findByCustomer()
   - findByStatus(), findByDateRange()
   - Pagination support

2. **Implement with Prisma:**
   - Proper persistence mapping
   - Aggregate reconstitution
   - Transaction support
   - Optimistic locking

3. **Create In-Memory Version:**
   - For unit testing
   - Deep cloning
   - Specification support

4. **Write Tests:**
   - Test both implementations against same interface
   - Verify aggregate boundaries preserved
   - Test transaction rollback

Try implementing yourself first!

---

**Time to complete:** 45 minutes
**Difficulty:** Intermediate

Share your implementation in the course forum!
