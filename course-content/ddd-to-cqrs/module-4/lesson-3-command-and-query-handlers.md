# Command and Query Handlers

**Duration:** 23 minutes
**Learning Objectives:**
- Implement the command pattern for writes
- Build command handlers with validation and business logic
- Create the query pattern for reads
- Design query handlers for efficient data retrieval
- Use Mediatr-style patterns for clean architecture
- Write comprehensive tests for commands and queries

---

## Introduction

Command and query handlers are the workhorses of CQRS. Commands express user intent and trigger business logic, while queries retrieve data optimized for specific views. Implementing these patterns correctly creates a clean, testable, and maintainable architecture.

## The Command Pattern

### What is a Command?

A command is an **imperative instruction** that represents user intent to change system state.

**Characteristics:**
- Represents intent (not data structures)
- Immutable (readonly properties)
- Self-validating or validated by handler
- Can fail (returns result)
- May produce side effects (events, external API calls)

### Command Structure

```typescript
// Base command interface
interface Command {
  readonly _type: string; // Discriminator for serialization
}

// Specific commands
class PlaceOrderCommand implements Command {
  readonly _type = 'PlaceOrder';

  constructor(
    public readonly customerId: string,
    public readonly items: Array<{
      productId: string;
      quantity: number;
      price: number;
    }>,
    public readonly shippingAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    },
    public readonly paymentMethod: {
      type: 'credit_card' | 'paypal';
      token: string;
    }
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

class UpdateOrderShippingCommand implements Command {
  readonly _type = 'UpdateOrderShipping';

  constructor(
    public readonly orderId: string,
    public readonly newAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    }
  ) {}
}
```

### Command Naming Conventions

```typescript
// ✅ Good: Imperative, action-oriented
class PlaceOrder {}
class CancelOrder {}
class UpdateShippingAddress {}
class ApproveRefund {}

// ❌ Bad: Passive or ambiguous
class Order {} // Is this create, update, or query?
class OrderPlacement {} // Not a command, sounds like a noun
class DoOrderStuff {} // Not specific
```

## Command Validation

### Input Validation with Zod

```typescript
import { z } from 'zod';

// Schema for validation
const PlaceOrderCommandSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID'),
  items: z
    .array(
      z.object({
        productId: z.string().uuid('Invalid product ID'),
        quantity: z.number().int().min(1, 'Quantity must be at least 1'),
        price: z.number().positive('Price must be positive'),
      })
    )
    .min(1, 'Order must have at least one item'),
  shippingAddress: z.object({
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().length(2, 'State must be 2 letters'),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
    country: z.string().length(2, 'Country must be 2-letter code'),
  }),
  paymentMethod: z.object({
    type: z.enum(['credit_card', 'paypal']),
    token: z.string().min(1, 'Payment token is required'),
  }),
});

// Factory function with validation
function createPlaceOrderCommand(
  input: unknown
): Result<PlaceOrderCommand, ValidationError> {
  const result = PlaceOrderCommandSchema.safeParse(input);

  if (!result.success) {
    return err(
      new ValidationError('Invalid PlaceOrder command', result.error.errors)
    );
  }

  return ok(
    new PlaceOrderCommand(
      result.data.customerId,
      result.data.items,
      result.data.shippingAddress,
      result.data.paymentMethod
    )
  );
}
```

### Business Rule Validation

```typescript
// Validation that requires domain knowledge
class PlaceOrderCommandValidator {
  constructor(
    private readonly customerRepo: CustomerRepository,
    private readonly inventoryService: InventoryService,
    private readonly paymentService: PaymentService
  ) {}

  async validate(command: PlaceOrderCommand): Promise<Result<void, DomainError>> {
    // 1. Customer validation
    const customer = await this.customerRepo.findById(command.customerId);

    if (!customer) {
      return err(new CustomerNotFoundError(command.customerId));
    }

    if (!customer.isActive()) {
      return err(new InactiveCustomerError(command.customerId));
    }

    if (customer.isSuspended()) {
      return err(new CustomerSuspendedError(command.customerId));
    }

    // 2. Inventory validation
    const total = command.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    if (total < 1) {
      return err(new MinimumOrderValueError(total));
    }

    const inventoryCheck = await this.inventoryService.checkAvailability(
      command.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }))
    );

    if (!inventoryCheck.allAvailable) {
      return err(
        new InsufficientInventoryError(inventoryCheck.unavailableItems)
      );
    }

    // 3. Payment method validation
    const paymentValid = await this.paymentService.validatePaymentMethod(
      command.customerId,
      command.paymentMethod
    );

    if (!paymentValid) {
      return err(new InvalidPaymentMethodError());
    }

    return ok(undefined);
  }
}
```

## Command Handlers

### Handler Structure

```typescript
// Handler interface
interface CommandHandler<TCommand extends Command, TResult> {
  handle(command: TCommand): Promise<Result<TResult, Error>>;
}

// Concrete handler implementation
class PlaceOrderCommandHandler
  implements CommandHandler<PlaceOrderCommand, OrderId>
{
  constructor(
    private readonly validator: PlaceOrderCommandValidator,
    private readonly orderRepo: OrderRepository,
    private readonly customerRepo: CustomerRepository,
    private readonly eventBus: EventBus,
    private readonly logger: Logger
  ) {}

  async handle(command: PlaceOrderCommand): Promise<Result<OrderId, Error>> {
    this.logger.info({ command }, 'Handling PlaceOrder command');

    // 1. Validate command
    const validationResult = await this.validator.validate(command);
    if (!validationResult.success) {
      this.logger.warn({ error: validationResult.error }, 'Validation failed');
      return err(validationResult.error);
    }

    // 2. Load necessary aggregates
    const customerResult = await this.customerRepo.findById(command.customerId);
    if (!customerResult.success) {
      return err(customerResult.error);
    }
    const customer = customerResult.data;

    // 3. Execute domain logic
    const orderResult = Order.create({
      customerId: customer.id,
      items: command.items.map((item) =>
        OrderItem.create(item.productId, item.quantity, Money.fromCents(item.price))
      ),
      shippingAddress: Address.create(command.shippingAddress),
      paymentMethod: PaymentMethod.create(command.paymentMethod),
    });

    if (!orderResult.success) {
      this.logger.error({ error: orderResult.error }, 'Failed to create order');
      return err(orderResult.error);
    }

    const order = orderResult.data;

    // 4. Persist changes
    try {
      await this.orderRepo.save(order);
    } catch (error) {
      this.logger.error({ error }, 'Failed to save order');
      return err(new OrderPersistenceError(error));
    }

    // 5. Publish domain events
    const events = order.getUncommittedEvents();
    for (const event of events) {
      await this.eventBus.publish(event);
    }
    order.markEventsAsCommitted();

    this.logger.info({ orderId: order.id }, 'Order placed successfully');

    return ok(order.id);
  }
}
```

### Handler with Transaction

```typescript
class PlaceOrderCommandHandler {
  constructor(
    private readonly db: Database,
    private readonly eventBus: EventBus
  ) {}

  async handle(command: PlaceOrderCommand): Promise<Result<OrderId, Error>> {
    // Use transaction for atomicity
    return this.db.transaction(async (tx) => {
      // 1. Create order
      const order = Order.create(command);
      await tx.orders.create({ data: order });

      // 2. Reserve inventory
      for (const item of command.items) {
        await tx.inventory.update({
          where: { productId: item.productId },
          data: {
            quantityAvailable: {
              decrement: item.quantity,
            },
            quantityReserved: {
              increment: item.quantity,
            },
          },
        });
      }

      // 3. Create payment intent
      await tx.payments.create({
        data: {
          orderId: order.id,
          amount: order.total,
          method: command.paymentMethod,
          status: 'pending',
        },
      });

      // Transaction commits here
      return ok(order.id);
    });

    // After transaction: Publish events
    // Events published outside transaction to avoid rollback issues
    await this.eventBus.publish(
      new OrderPlacedEvent({
        orderId: order.id,
        customerId: command.customerId,
        total: order.total,
      })
    );
  }
}
```

### Handler with Compensation

```typescript
// Complex handler with rollback logic
class PlaceOrderCommandHandler {
  async handle(command: PlaceOrderCommand): Promise<Result<OrderId, Error>> {
    let inventoryReserved = false;
    let paymentCaptured = false;
    let orderId: OrderId | null = null;

    try {
      // Step 1: Reserve inventory
      const reservationResult = await this.inventoryService.reserve(command.items);
      if (!reservationResult.success) {
        return err(reservationResult.error);
      }
      inventoryReserved = true;

      // Step 2: Capture payment
      const paymentResult = await this.paymentService.capture(
        command.paymentMethod,
        command.calculateTotal()
      );
      if (!paymentResult.success) {
        throw new PaymentFailedError(paymentResult.error);
      }
      paymentCaptured = true;

      // Step 3: Create order
      const order = Order.create(command);
      await this.orderRepo.save(order);
      orderId = order.id;

      return ok(order.id);
    } catch (error) {
      // Compensation logic: Undo successful steps
      this.logger.error({ error }, 'Order placement failed, compensating');

      if (paymentCaptured) {
        await this.paymentService.refund(command.paymentMethod).catch((err) => {
          this.logger.error({ err }, 'Failed to refund payment');
        });
      }

      if (inventoryReserved) {
        await this.inventoryService.release(command.items).catch((err) => {
          this.logger.error({ err }, 'Failed to release inventory');
        });
      }

      if (orderId) {
        await this.orderRepo.delete(orderId).catch((err) => {
          this.logger.error({ err }, 'Failed to delete order');
        });
      }

      return err(error);
    }
  }
}
```

## The Query Pattern

### What is a Query?

A query is a **request for data** optimized for a specific view or use case.

**Characteristics:**
- Read-only (no side effects)
- Returns DTOs (not domain entities)
- Optimized for specific use case
- Can be cached
- Does not fail for business reasons (404 is data, not error)

### Query Structure

```typescript
// Base query interface
interface Query<TResult> {
  readonly _type: string;
}

// Specific queries
class GetOrderListQuery implements Query<OrderListItem[]> {
  readonly _type = 'GetOrderList';

  constructor(
    public readonly userId: string,
    public readonly page: number = 1,
    public readonly limit: number = 20,
    public readonly status?: OrderStatus,
    public readonly sortBy: 'date' | 'total' = 'date',
    public readonly sortOrder: 'asc' | 'desc' = 'desc'
  ) {}
}

class GetOrderDetailsQuery implements Query<OrderDetails | null> {
  readonly _type = 'GetOrderDetails';

  constructor(public readonly orderId: string) {}
}

class SearchOrdersQuery implements Query<OrderSearchResult[]> {
  readonly _type = 'SearchOrders';

  constructor(
    public readonly searchTerm: string,
    public readonly userId?: string,
    public readonly dateRange?: { start: Date; end: Date }
  ) {}
}

class GetOrderSummaryQuery implements Query<OrderSummary> {
  readonly _type = 'GetOrderSummary';

  constructor(
    public readonly userId: string,
    public readonly startDate: Date,
    public readonly endDate: Date
  ) {}
}
```

### Query DTOs (Data Transfer Objects)

```typescript
// DTOs are optimized for specific views, not domain logic
interface OrderListItem {
  orderId: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  statusLabel: string;
  total: number;
  totalFormatted: string; // Pre-formatted for display
  itemCount: number;
  itemPreview: string; // "Product A, Product B, +2 more"
  canCancel: boolean;
  canViewInvoice: boolean;
  placedAt: string; // ISO format
  estimatedDelivery: string | null;
}

interface OrderDetails {
  orderId: string;
  orderNumber: string;
  status: string;
  statusLabel: string;
  statusTimeline: Array<{
    status: string;
    timestamp: string;
    note?: string;
  }>;

  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };

  items: Array<{
    productId: string;
    productName: string;
    productImage: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    unitPriceFormatted: string;
    subtotal: number;
    subtotalFormatted: string;
  }>;

  pricing: {
    subtotal: number;
    subtotalFormatted: string;
    tax: number;
    taxFormatted: string;
    shipping: number;
    shippingFormatted: string;
    discount: number;
    discountFormatted: string;
    total: number;
    totalFormatted: string;
  };

  shipping: {
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    method: string;
    carrier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    estimatedDelivery?: string;
  };

  actions: {
    canCancel: boolean;
    canRequestRefund: boolean;
    canDownloadInvoice: boolean;
    canTrackShipment: boolean;
  };

  placedAt: string;
  updatedAt: string;
}
```

## Query Handlers

### Basic Query Handler

```typescript
interface QueryHandler<TQuery extends Query<TResult>, TResult> {
  handle(query: TQuery): Promise<TResult>;
}

class GetOrderListQueryHandler
  implements QueryHandler<GetOrderListQuery, OrderListItem[]>
{
  constructor(
    private readonly readDb: ReadDatabase,
    private readonly cache: CacheService,
    private readonly logger: Logger
  ) {}

  async handle(query: GetOrderListQuery): Promise<OrderListItem[]> {
    this.logger.debug({ query }, 'Handling GetOrderList query');

    // Try cache first
    const cacheKey = `orders:list:${query.userId}:${query.page}:${query.status}`;
    const cached = await this.cache.get<OrderListItem[]>(cacheKey);

    if (cached) {
      this.logger.debug('Returning cached order list');
      return cached;
    }

    // Query read database
    const orders = await this.readDb.orderListView.findMany({
      where: {
        userId: query.userId,
        ...(query.status && { status: query.status }),
      },
      orderBy: {
        [query.sortBy === 'date' ? 'placedAt' : 'total']: query.sortOrder,
      },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });

    // Cache for 5 minutes
    await this.cache.set(cacheKey, orders, 300);

    return orders;
  }
}
```

### Query Handler with Joins

```typescript
class GetOrderDetailsQueryHandler
  implements QueryHandler<GetOrderDetailsQuery, OrderDetails | null>
{
  constructor(private readonly readDb: ReadDatabase) {}

  async handle(query: GetOrderDetailsQuery): Promise<OrderDetails | null> {
    // Single optimized query with all necessary data
    const order = await this.readDb.orders.findUnique({
      where: { id: query.orderId },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                sku: true,
              },
            },
          },
        },
        shipping: true,
        statusHistory: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (!order) {
      return null;
    }

    // Transform to DTO
    return this.toOrderDetails(order);
  }

  private toOrderDetails(order: any): OrderDetails {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    });

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      statusLabel: this.getStatusLabel(order.status),
      statusTimeline: order.statusHistory.map((h) => ({
        status: h.status,
        timestamp: h.timestamp.toISOString(),
        note: h.note,
      })),

      customer: {
        id: order.customer.id,
        name: order.customer.name,
        email: order.customer.email,
        phone: order.customer.phone,
      },

      items: order.items.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        productImage: item.product.imageUrl,
        sku: item.product.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        unitPriceFormatted: formatter.format(item.unitPrice),
        subtotal: item.quantity * item.unitPrice,
        subtotalFormatted: formatter.format(item.quantity * item.unitPrice),
      })),

      pricing: {
        subtotal: order.subtotal,
        subtotalFormatted: formatter.format(order.subtotal),
        tax: order.tax,
        taxFormatted: formatter.format(order.tax),
        shipping: order.shippingCost,
        shippingFormatted: formatter.format(order.shippingCost),
        discount: order.discount,
        discountFormatted: formatter.format(order.discount),
        total: order.total,
        totalFormatted: formatter.format(order.total),
      },

      shipping: {
        address: order.shipping.address,
        method: order.shipping.method,
        carrier: order.shipping.carrier,
        trackingNumber: order.shipping.trackingNumber,
        trackingUrl: order.shipping.trackingUrl,
        estimatedDelivery: order.shipping.estimatedDelivery?.toISOString(),
      },

      actions: {
        canCancel: order.status === 'pending' || order.status === 'processing',
        canRequestRefund: order.status === 'delivered',
        canDownloadInvoice: order.status !== 'cancelled',
        canTrackShipment: !!order.shipping.trackingNumber,
      },

      placedAt: order.placedAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }

  private getStatusLabel(status: string): string {
    const labels = {
      pending: 'Pending Payment',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    return labels[status] || status;
  }
}
```

### Query Handler with Aggregation

```typescript
class GetOrderSummaryQueryHandler
  implements QueryHandler<GetOrderSummaryQuery, OrderSummary>
{
  constructor(private readonly readDb: ReadDatabase) {}

  async handle(query: GetOrderSummaryQuery): Promise<OrderSummary> {
    // Use database aggregation for performance
    const summary = await this.readDb.$queryRaw<OrderSummary[]>`
      SELECT
        COUNT(*)::int as "totalOrders",
        COALESCE(SUM(total), 0)::decimal as "totalRevenue",
        COALESCE(AVG(total), 0)::decimal as "averageOrderValue",
        COUNT(CASE WHEN status = 'pending' THEN 1 END)::int as "pendingOrders",
        COUNT(CASE WHEN status = 'processing' THEN 1 END)::int as "processingOrders",
        COUNT(CASE WHEN status = 'shipped' THEN 1 END)::int as "shippedOrders",
        COUNT(CASE WHEN status = 'delivered' THEN 1 END)::int as "deliveredOrders",
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END)::int as "cancelledOrders"
      FROM orders
      WHERE
        user_id = ${query.userId}
        AND placed_at BETWEEN ${query.startDate} AND ${query.endDate}
    `;

    const result = summary[0];

    return {
      totalOrders: result.totalOrders,
      totalRevenue: Number(result.totalRevenue),
      averageOrderValue: Number(result.averageOrderValue),
      ordersByStatus: {
        pending: result.pendingOrders,
        processing: result.processingOrders,
        shipped: result.shippedOrders,
        delivered: result.deliveredOrders,
        cancelled: result.cancelledOrders,
      },
    };
  }
}
```

## Mediatr-Style Pattern

### Command/Query Bus

```typescript
// Mediator interface
interface Mediator {
  send<TResult>(command: Command): Promise<Result<TResult, Error>>;
  query<TResult>(query: Query<TResult>): Promise<TResult>;
}

// Implementation
class CommandQueryMediator implements Mediator {
  private commandHandlers = new Map<string, CommandHandler<any, any>>();
  private queryHandlers = new Map<string, QueryHandler<any, any>>();

  registerCommandHandler<TCommand extends Command, TResult>(
    commandType: string,
    handler: CommandHandler<TCommand, TResult>
  ): void {
    this.commandHandlers.set(commandType, handler);
  }

  registerQueryHandler<TQuery extends Query<TResult>, TResult>(
    queryType: string,
    handler: QueryHandler<TQuery, TResult>
  ): void {
    this.queryHandlers.set(queryType, handler);
  }

  async send<TResult>(command: Command): Promise<Result<TResult, Error>> {
    const handler = this.commandHandlers.get(command._type);

    if (!handler) {
      return err(new Error(`No handler registered for command: ${command._type}`));
    }

    return handler.handle(command);
  }

  async query<TResult>(query: Query<TResult>): Promise<TResult> {
    const handler = this.queryHandlers.get(query._type);

    if (!handler) {
      throw new Error(`No handler registered for query: ${query._type}`);
    }

    return handler.handle(query);
  }
}

// Registration
const mediator = new CommandQueryMediator();

mediator.registerCommandHandler(
  'PlaceOrder',
  new PlaceOrderCommandHandler(/* dependencies */)
);

mediator.registerQueryHandler(
  'GetOrderList',
  new GetOrderListQueryHandler(/* dependencies */)
);

// Usage in API route
export async function POST(request: NextRequest) {
  const input = await request.json();

  // Validate and create command
  const commandResult = createPlaceOrderCommand(input);
  if (!commandResult.success) {
    return NextResponse.json({ error: commandResult.error }, { status: 400 });
  }

  // Send through mediator
  const result = await mediator.send(commandResult.data);

  if (!result.success) {
    return NextResponse.json({ error: result.error.message }, { status: 400 });
  }

  return NextResponse.json({ orderId: result.data }, { status: 201 });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  const query = new GetOrderListQuery(userId, 1, 20);
  const orders = await mediator.query(query);

  return NextResponse.json({ data: orders });
}
```

### With Middleware Pipeline

```typescript
// Middleware interface
interface Middleware<TRequest, TResponse> {
  handle(
    request: TRequest,
    next: (request: TRequest) => Promise<TResponse>
  ): Promise<TResponse>;
}

// Logging middleware
class LoggingMiddleware implements Middleware<Command, Result<any, Error>> {
  constructor(private readonly logger: Logger) {}

  async handle(
    command: Command,
    next: (command: Command) => Promise<Result<any, Error>>
  ): Promise<Result<any, Error>> {
    this.logger.info({ commandType: command._type }, 'Executing command');
    const startTime = Date.now();

    const result = await next(command);

    const duration = Date.now() - startTime;
    this.logger.info(
      { commandType: command._type, duration, success: result.success },
      'Command completed'
    );

    return result;
  }
}

// Validation middleware
class ValidationMiddleware implements Middleware<Command, Result<any, Error>> {
  async handle(
    command: Command,
    next: (command: Command) => Promise<Result<any, Error>>
  ): Promise<Result<any, Error>> {
    // Perform cross-cutting validation
    // (command-specific validation happens in handler)

    if (!command._type) {
      return err(new Error('Command type is required'));
    }

    return next(command);
  }
}

// Mediator with middleware
class MediatorWithMiddleware implements Mediator {
  private middlewares: Middleware<Command, Result<any, Error>>[] = [];

  use(middleware: Middleware<Command, Result<any, Error>>): void {
    this.middlewares.push(middleware);
  }

  async send<TResult>(command: Command): Promise<Result<TResult, Error>> {
    // Build middleware pipeline
    const execute = this.middlewares.reduceRight(
      (next, middleware) => (cmd: Command) => middleware.handle(cmd, next),
      (cmd: Command) => this.executeHandler(cmd)
    );

    return execute(command);
  }

  private async executeHandler<TResult>(
    command: Command
  ): Promise<Result<TResult, Error>> {
    const handler = this.commandHandlers.get(command._type);

    if (!handler) {
      return err(new Error(`No handler registered for: ${command._type}`));
    }

    return handler.handle(command);
  }
}
```

## Testing Commands and Queries

### Testing Command Handlers

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('PlaceOrderCommandHandler', () => {
  let handler: PlaceOrderCommandHandler;
  let mockValidator: PlaceOrderCommandValidator;
  let mockOrderRepo: OrderRepository;
  let mockEventBus: EventBus;

  beforeEach(() => {
    mockValidator = {
      validate: vi.fn(),
    };

    mockOrderRepo = {
      save: vi.fn(),
    };

    mockEventBus = {
      publish: vi.fn(),
    };

    handler = new PlaceOrderCommandHandler(
      mockValidator,
      mockOrderRepo,
      mockEventBus
    );
  });

  it('should place order successfully', async () => {
    // Arrange
    const command = new PlaceOrderCommand(
      'customer-123',
      [{ productId: 'product-1', quantity: 2, price: 1000 }],
      { street: '123 Main St', city: 'Boston', state: 'MA', zipCode: '02101', country: 'US' },
      { type: 'credit_card', token: 'tok_123' }
    );

    vi.mocked(mockValidator.validate).mockResolvedValue(ok(undefined));

    // Act
    const result = await handler.handle(command);

    // Assert
    expect(result.success).toBe(true);
    expect(mockValidator.validate).toHaveBeenCalledWith(command);
    expect(mockOrderRepo.save).toHaveBeenCalled();
    expect(mockEventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        _type: 'OrderPlaced',
      })
    );
  });

  it('should fail when validation fails', async () => {
    // Arrange
    const command = new PlaceOrderCommand(/* invalid data */);
    vi.mocked(mockValidator.validate).mockResolvedValue(
      err(new ValidationError('Invalid customer'))
    );

    // Act
    const result = await handler.handle(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBeInstanceOf(ValidationError);
    expect(mockOrderRepo.save).not.toHaveBeenCalled();
    expect(mockEventBus.publish).not.toHaveBeenCalled();
  });

  it('should handle repository errors', async () => {
    // Arrange
    const command = new PlaceOrderCommand(/* valid data */);
    vi.mocked(mockValidator.validate).mockResolvedValue(ok(undefined));
    vi.mocked(mockOrderRepo.save).mockRejectedValue(
      new Error('Database connection failed')
    );

    // Act
    const result = await handler.handle(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.error.message).toContain('Database');
  });
});
```

### Testing Query Handlers

```typescript
describe('GetOrderListQueryHandler', () => {
  let handler: GetOrderListQueryHandler;
  let mockReadDb: ReadDatabase;
  let mockCache: CacheService;

  beforeEach(() => {
    mockReadDb = {
      orderListView: {
        findMany: vi.fn(),
      },
    };

    mockCache = {
      get: vi.fn(),
      set: vi.fn(),
    };

    handler = new GetOrderListQueryHandler(mockReadDb, mockCache);
  });

  it('should return orders from cache when available', async () => {
    // Arrange
    const query = new GetOrderListQuery('user-123', 1, 20);
    const cachedOrders = [
      { orderId: '1', orderNumber: 'ORD-001', status: 'pending', total: 100 },
    ];

    vi.mocked(mockCache.get).mockResolvedValue(cachedOrders);

    // Act
    const result = await handler.handle(query);

    // Assert
    expect(result).toEqual(cachedOrders);
    expect(mockReadDb.orderListView.findMany).not.toHaveBeenCalled();
  });

  it('should query database and cache results when not cached', async () => {
    // Arrange
    const query = new GetOrderListQuery('user-123', 1, 20);
    const orders = [
      { orderId: '1', orderNumber: 'ORD-001', status: 'pending', total: 100 },
    ];

    vi.mocked(mockCache.get).mockResolvedValue(null);
    vi.mocked(mockReadDb.orderListView.findMany).mockResolvedValue(orders);

    // Act
    const result = await handler.handle(query);

    // Assert
    expect(result).toEqual(orders);
    expect(mockReadDb.orderListView.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-123' },
      orderBy: { placedAt: 'desc' },
      skip: 0,
      take: 20,
    });
    expect(mockCache.set).toHaveBeenCalledWith(expect.any(String), orders, 300);
  });

  it('should filter by status when provided', async () => {
    // Arrange
    const query = new GetOrderListQuery('user-123', 1, 20, 'pending');
    vi.mocked(mockCache.get).mockResolvedValue(null);
    vi.mocked(mockReadDb.orderListView.findMany).mockResolvedValue([]);

    // Act
    await handler.handle(query);

    // Assert
    expect(mockReadDb.orderListView.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-123', status: 'pending' },
      })
    );
  });
});
```

## Key Takeaways

1. **Commands express intent** - Imperative, action-oriented names
2. **Validate early** - Input validation with Zod, business validation in handler
3. **Handlers orchestrate** - Load aggregates, execute logic, persist, publish events
4. **Queries are read-only** - No side effects, return optimized DTOs
5. **Query handlers optimize** - Denormalized data, caching, minimal joins
6. **Mediatr pattern** - Clean abstraction, middleware support
7. **Test thoroughly** - Unit test handlers with mocks, integration test end-to-end

## Common Pitfalls

❌ **Commands with getters** - Commands should not retrieve data
❌ **Queries with side effects** - Queries must not change state
❌ **Business logic in queries** - Keep queries simple, logic belongs in command handlers
❌ **Anemic command handlers** - Don't just pass data to repository, execute business logic
❌ **Over-abstraction** - Don't create handler for every trivial operation

## Next Steps

In the next lesson, we'll explore **Read Models and Projections**—how to build efficient, denormalized read models and keep them synchronized with the write model.

## Exercise

**Implement Command and Query Handlers:**

Create handlers for a blog post system:

1. **Command: PublishBlogPost**
   - Validate title (not empty, max 200 chars)
   - Validate content (not empty, max 50,000 chars)
   - Check author exists and can publish
   - Create BlogPost aggregate
   - Save and publish BlogPostPublishedEvent

2. **Query: GetBlogPostList**
   - Fetch denormalized list
   - Include author name (denormalized)
   - Include comment count (pre-computed)
   - Support pagination and filtering by tag

3. **Test both handlers**
   - Test happy path
   - Test validation failures
   - Test repository errors

---

**Time to complete:** 60 minutes
**Difficulty:** Advanced

Share your implementation in the course forum for feedback!
