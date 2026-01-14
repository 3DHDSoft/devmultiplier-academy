# AI-Assisted Testing and Validation

**Duration:** 30 minutes **Learning Objectives:**

- Generate comprehensive unit tests for domain models with AI
- Create realistic test data using AI
- Implement property-based testing with AI assistance
- Generate test scenarios from business rules
- Use AI for code review and validation
- Detect domain model smells and anti-patterns
- Ensure business rules are properly tested

---

## Introduction

Testing DDD/CQRS systems is crucial but time-consuming. You need tests for domain logic, invariants, state transitions,
command handlers, query handlers, and event handlers. AI can accelerate test creation while maintaining quality—if you
know how to use it effectively.

This lesson teaches you how to leverage AI for comprehensive testing strategies.

## Generating Unit Tests for Domain Models

### Testing Aggregates with AI

**Prompt Template:**

```
Generate comprehensive unit tests for [AGGREGATE] using [TEST FRAMEWORK].
Include tests for:
- Factory methods and validation
- Business rule enforcement
- State transitions
- Invariant protection
- Domain event generation
- Edge cases and error conditions
Use Arrange-Act-Assert pattern with descriptive test names
```

**Example:**

```typescript
// PROMPT:
// "Generate comprehensive unit tests for the Order aggregate using Vitest.
// Include tests for: creating orders, adding items, placing orders,
// status transitions, validation errors, and domain events.
// Order can only add items in Draft status, must have at least one item to place."

// AI GENERATED:
import { describe, it, expect, beforeEach } from 'vitest';
import { Order, OrderStatus } from '../Order';
import { OrderItem } from '../OrderItem';
import { Money } from '../Money';
import { CustomerId } from '../CustomerId';
import { DomainError } from '../errors';

describe('Order Aggregate', () => {
  describe('Factory Method - create()', () => {
    it('should create an order with valid items', () => {
      // Arrange
      const customerId = CustomerId.generate();
      const items = [createOrderItem('product-1', 2, 10.0), createOrderItem('product-2', 1, 20.0)];

      // Act
      const order = Order.create(customerId, items);

      // Assert
      expect(order.getId()).toBeDefined();
      expect(order.getCustomerId()).toEqual(customerId);
      expect(order.getStatus()).toBe('Draft');
      expect(order.getItems()).toHaveLength(2);
      expect(order.getTotal().amount).toBe(40.0); // (2 * 10) + (1 * 20)
    });

    it('should throw error when creating order with no items', () => {
      // Arrange
      const customerId = CustomerId.generate();
      const items: OrderItem[] = [];

      // Act & Assert
      expect(() => Order.create(customerId, items)).toThrow('Order must have at least one item');
    });

    it('should calculate total correctly with multiple items', () => {
      // Arrange
      const customerId = CustomerId.generate();
      const items = [
        createOrderItem('product-1', 3, 15.5),
        createOrderItem('product-2', 2, 22.0),
        createOrderItem('product-3', 1, 5.5),
      ];

      // Act
      const order = Order.create(customerId, items);

      // Assert
      expect(order.getTotal().amount).toBe(96.0); // (3*15.5) + (2*22) + (1*5.5)
    });
  });

  describe('Business Rule - addItem()', () => {
    it('should add item to draft order', () => {
      // Arrange
      const order = createDraftOrder();
      const newItem = createOrderItem('product-new', 1, 15.0);
      const initialTotal = order.getTotal().amount;

      // Act
      order.addItem(newItem);

      // Assert
      expect(order.getItems()).toHaveLength(2);
      expect(order.getTotal().amount).toBe(initialTotal + 15.0);
    });

    it('should throw error when adding item to placed order', () => {
      // Arrange
      const order = createDraftOrder();
      order.place();
      const newItem = createOrderItem('product-new', 1, 15.0);

      // Act & Assert
      expect(() => order.addItem(newItem)).toThrow('Cannot add items to a placed order');
    });

    it('should throw error when adding item to confirmed order', () => {
      // Arrange
      const order = createDraftOrder();
      order.place();
      order.confirm();
      const newItem = createOrderItem('product-new', 1, 15.0);

      // Act & Assert
      expect(() => order.addItem(newItem)).toThrow('Cannot add items to a placed order');
    });

    it('should recalculate total after adding item', () => {
      // Arrange
      const order = createDraftOrder();
      const initialTotal = order.getTotal().amount;

      // Act
      order.addItem(createOrderItem('product-2', 2, 25.0));

      // Assert
      expect(order.getTotal().amount).toBe(initialTotal + 50.0);
    });
  });

  describe('State Transition - place()', () => {
    it('should transition from Draft to Placed', () => {
      // Arrange
      const order = createDraftOrder();

      // Act
      order.place();

      // Assert
      expect(order.getStatus()).toBe('Placed');
    });

    it('should throw error when placing already placed order', () => {
      // Arrange
      const order = createDraftOrder();
      order.place();

      // Act & Assert
      expect(() => order.place()).toThrow('Only draft orders can be placed');
    });

    it('should throw error when placing empty order', () => {
      // Arrange
      const customerId = CustomerId.generate();
      const items = [createOrderItem('product-1', 1, 10.0)];
      const order = Order.create(customerId, items);
      // Remove all items through some method (implementation dependent)

      // Act & Assert
      expect(() => order.place()).toThrow('Cannot place an empty order');
    });

    it('should raise OrderPlaced domain event when placing order', () => {
      // Arrange
      const order = createDraftOrder();

      // Act
      order.place();

      // Assert
      const events = order.getDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0].constructor.name).toBe('OrderPlaced');
      expect(events[0].orderId).toBe(order.getId().value);
    });
  });

  describe('State Transition - confirm()', () => {
    it('should transition from Placed to Confirmed', () => {
      // Arrange
      const order = createDraftOrder();
      order.place();

      // Act
      order.confirm();

      // Assert
      expect(order.getStatus()).toBe('Confirmed');
    });

    it('should throw error when confirming draft order', () => {
      // Arrange
      const order = createDraftOrder();

      // Act & Assert
      expect(() => order.confirm()).toThrow('Only placed orders can be confirmed');
    });

    it('should throw error when confirming already confirmed order', () => {
      // Arrange
      const order = createDraftOrder();
      order.place();
      order.confirm();

      // Act & Assert
      expect(() => order.confirm()).toThrow('Only placed orders can be confirmed');
    });

    it('should raise OrderConfirmed domain event', () => {
      // Arrange
      const order = createDraftOrder();
      order.place();
      order.clearDomainEvents(); // Clear previous events

      // Act
      order.confirm();

      // Assert
      const events = order.getDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0].constructor.name).toBe('OrderConfirmed');
    });
  });

  describe('Invariant Protection', () => {
    it('should not allow direct modification of items array', () => {
      // Arrange
      const order = createDraftOrder();
      const items = order.getItems();

      // Act
      const attemptModification = () => {
        (items as any).push(createOrderItem('hack', 1, 100));
      };

      // Assert
      expect(attemptModification).toThrow(); // Array should be frozen
      expect(order.getItems()).toHaveLength(1); // Original unchanged
    });

    it('should maintain total consistency after multiple operations', () => {
      // Arrange
      const order = createDraftOrder(); // 1 item, 10.0

      // Act
      order.addItem(createOrderItem('p2', 2, 15.0)); // +30.0
      order.addItem(createOrderItem('p3', 1, 5.0)); // +5.0

      // Assert
      expect(order.getTotal().amount).toBe(45.0);
      expect(order.getItems()).toHaveLength(3);
    });
  });

  describe('Domain Events', () => {
    it('should accumulate multiple domain events', () => {
      // Arrange
      const order = createDraftOrder();

      // Act
      order.place();
      order.confirm();

      // Assert
      const events = order.getDomainEvents();
      expect(events).toHaveLength(2);
      expect(events[0].constructor.name).toBe('OrderPlaced');
      expect(events[1].constructor.name).toBe('OrderConfirmed');
    });

    it('should clear domain events', () => {
      // Arrange
      const order = createDraftOrder();
      order.place();

      // Act
      order.clearDomainEvents();

      // Assert
      expect(order.getDomainEvents()).toHaveLength(0);
    });
  });
});

// Test Helper Functions
function createDraftOrder(): Order {
  const customerId = CustomerId.generate();
  const items = [createOrderItem('product-1', 1, 10.0)];
  return Order.create(customerId, items);
}

function createOrderItem(productId: string, quantity: number, price: number): OrderItem {
  return {
    productId,
    productName: `Product ${productId}`,
    quantity,
    price: new Money(price, 'USD'),
  };
}
```

**What AI Did Well:**

- Comprehensive coverage of all methods
- Proper AAA pattern
- Descriptive test names
- Helper functions for test data

**What to Review:**

- Business rule accuracy
- Edge cases specific to your domain
- Test helper realism

## Test Data Generation

### Builders Pattern with AI

**Prompt:**

```
Generate a test data builder for Order aggregate with:
- Fluent interface
- Sensible defaults
- Ability to override any property
- Method to create multiple instances with variations
```

```typescript
// AI GENERATED:

class OrderTestBuilder {
  private customerId: CustomerId = CustomerId.generate();
  private items: OrderItem[] = [
    {
      productId: 'default-product',
      productName: 'Test Product',
      quantity: 1,
      price: new Money(10.0, 'USD'),
    },
  ];
  private status: OrderStatus = 'Draft';

  withCustomerId(customerId: CustomerId): this {
    this.customerId = customerId;
    return this;
  }

  withItems(items: OrderItem[]): this {
    this.items = items;
    return this;
  }

  withSingleItem(productId: string, quantity: number, price: number): this {
    this.items = [
      {
        productId,
        productName: `Product ${productId}`,
        quantity,
        price: new Money(price, 'USD'),
      },
    ];
    return this;
  }

  withMultipleItems(count: number): this {
    this.items = Array.from({ length: count }, (_, i) => ({
      productId: `product-${i + 1}`,
      productName: `Product ${i + 1}`,
      quantity: i + 1,
      price: new Money((i + 1) * 10, 'USD'),
    }));
    return this;
  }

  asPlaced(): this {
    this.status = 'Placed';
    return this;
  }

  asConfirmed(): this {
    this.status = 'Confirmed';
    return this;
  }

  build(): Order {
    const order = Order.create(this.customerId, this.items);

    // Apply status transitions
    if (this.status === 'Placed' || this.status === 'Confirmed') {
      order.place();
    }
    if (this.status === 'Confirmed') {
      order.confirm();
    }

    order.clearDomainEvents(); // Clean state for testing
    return order;
  }

  buildMany(count: number, customizer?: (builder: OrderTestBuilder, index: number) => void): Order[] {
    return Array.from({ length: count }, (_, i) => {
      const builder = new OrderTestBuilder();
      customizer?.(builder, i);
      return builder.build();
    });
  }
}

// Usage in tests
describe('Order Tests with Builder', () => {
  it('should create order with defaults', () => {
    const order = new OrderTestBuilder().build();
    expect(order.getStatus()).toBe('Draft');
  });

  it('should create order with custom items', () => {
    const order = new OrderTestBuilder().withSingleItem('special-product', 5, 25.0).build();

    expect(order.getItems()).toHaveLength(1);
    expect(order.getTotal().amount).toBe(125.0);
  });

  it('should create placed order', () => {
    const order = new OrderTestBuilder().asPlaced().build();
    expect(order.getStatus()).toBe('Placed');
  });

  it('should create multiple orders with variations', () => {
    const orders = new OrderTestBuilder().buildMany(3, (builder, i) => {
      builder.withSingleItem(`product-${i}`, i + 1, (i + 1) * 10);
    });

    expect(orders).toHaveLength(3);
    expect(orders[0].getTotal().amount).toBe(10.0);
    expect(orders[1].getTotal().amount).toBe(40.0);
    expect(orders[2].getTotal().amount).toBe(90.0);
  });
});
```

### Realistic Test Data with AI

**Prompt:**

```
Generate realistic test data for e-commerce domain including:
- Customer names, emails, addresses
- Product names, descriptions, prices
- Order data with multiple items
- Use variety and realistic values
```

```typescript
// AI GENERATED:

export const TestData = {
  customers: [
    {
      id: 'cust-001',
      name: 'Alice Johnson',
      email: 'alice.johnson@example.com',
      address: {
        street: '123 Main St',
        city: 'San Francisco',
        postalCode: '94102',
        country: 'USA',
      },
    },
    {
      id: 'cust-002',
      name: 'Bob Smith',
      email: 'bob.smith@example.com',
      address: {
        street: '456 Oak Avenue',
        city: 'New York',
        postalCode: '10001',
        country: 'USA',
      },
    },
    {
      id: 'cust-003',
      name: 'Carol Williams',
      email: 'carol.w@example.com',
      address: {
        street: '789 Elm Street',
        city: 'Austin',
        postalCode: '73301',
        country: 'USA',
      },
    },
  ],

  products: [
    {
      id: 'prod-001',
      name: 'Wireless Headphones',
      description: 'Premium noise-cancelling wireless headphones',
      price: 199.99,
      category: 'Electronics',
    },
    {
      id: 'prod-002',
      name: 'Running Shoes',
      description: 'Comfortable athletic shoes for daily running',
      price: 89.99,
      category: 'Sportswear',
    },
    {
      id: 'prod-003',
      name: 'Coffee Maker',
      description: 'Programmable drip coffee maker with thermal carafe',
      price: 79.99,
      category: 'Home Appliances',
    },
    {
      id: 'prod-004',
      name: 'Yoga Mat',
      description: 'Non-slip exercise mat for yoga and fitness',
      price: 24.99,
      category: 'Sportswear',
    },
  ],

  orders: {
    smallOrder: {
      customerId: 'cust-001',
      items: [{ productId: 'prod-004', quantity: 1 }],
      total: 24.99,
    },
    mediumOrder: {
      customerId: 'cust-002',
      items: [
        { productId: 'prod-002', quantity: 2 },
        { productId: 'prod-004', quantity: 1 },
      ],
      total: 204.97, // (89.99 * 2) + 24.99
    },
    largeOrder: {
      customerId: 'cust-003',
      items: [
        { productId: 'prod-001', quantity: 2 },
        { productId: 'prod-002', quantity: 1 },
        { productId: 'prod-003', quantity: 1 },
        { productId: 'prod-004', quantity: 3 },
      ],
      total: 644.93, // (199.99*2) + 89.99 + 79.99 + (24.99*3)
    },
  },
};

// Usage
describe('Order with realistic data', () => {
  it('should process small order', () => {
    const customer = TestData.customers[0];
    const orderData = TestData.orders.smallOrder;

    const order = Order.create(CustomerId.create(customer.id), [createItemFromTestData(orderData.items[0])]);

    expect(order.getTotal().amount).toBeCloseTo(orderData.total);
  });
});

function createItemFromTestData(item: { productId: string; quantity: number }): OrderItem {
  const product = TestData.products.find((p) => p.id === item.productId)!;
  return {
    productId: product.id,
    productName: product.name,
    quantity: item.quantity,
    price: new Money(product.price, 'USD'),
  };
}
```

## Property-Based Testing with AI

**Prompt:**

```
Generate property-based tests for Order aggregate using fast-check library.
Test properties:
- Adding items always increases or maintains total
- Status transitions are always valid
- Total always equals sum of items
- Order is never in invalid state
```

```typescript
// AI GENERATED:
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

describe('Order - Property-Based Tests', () => {
  it('total should always equal sum of item prices', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            productId: fc.uuid(),
            productName: fc.string({ minLength: 1, maxLength: 50 }),
            quantity: fc.integer({ min: 1, max: 100 }),
            price: fc.double({ min: 0.01, max: 10000, noNaN: true }),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (items) => {
          // Arrange
          const customerId = CustomerId.generate();
          const orderItems = items.map((item) => ({
            ...item,
            price: new Money(item.price, 'USD'),
          }));

          // Act
          const order = Order.create(customerId, orderItems);

          // Assert
          const expectedTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
          expect(order.getTotal().amount).toBeCloseTo(expectedTotal, 2);
        }
      )
    );
  });

  it('adding item should always increase or maintain total', () => {
    fc.assert(
      fc.property(
        fc.record({
          initialItems: fc.array(
            fc.record({
              productId: fc.uuid(),
              productName: fc.string({ minLength: 1 }),
              quantity: fc.integer({ min: 1, max: 10 }),
              price: fc.double({ min: 0.01, max: 100 }),
            }),
            { minLength: 1, maxLength: 5 }
          ),
          newItem: fc.record({
            productId: fc.uuid(),
            productName: fc.string({ minLength: 1 }),
            quantity: fc.integer({ min: 1, max: 10 }),
            price: fc.double({ min: 0.01, max: 100 }),
          }),
        }),
        ({ initialItems, newItem }) => {
          // Arrange
          const customerId = CustomerId.generate();
          const orderItems = initialItems.map((item) => ({
            ...item,
            price: new Money(item.price, 'USD'),
          }));
          const order = Order.create(customerId, orderItems);
          const initialTotal = order.getTotal().amount;

          // Act
          const newOrderItem = {
            ...newItem,
            price: new Money(newItem.price, 'USD'),
          };
          order.addItem(newOrderItem);

          // Assert
          const newTotal = order.getTotal().amount;
          expect(newTotal).toBeGreaterThanOrEqual(initialTotal);
        }
      )
    );
  });

  it('order should never be in invalid state after operations', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            productId: fc.uuid(),
            productName: fc.string({ minLength: 1 }),
            quantity: fc.integer({ min: 1, max: 10 }),
            price: fc.double({ min: 0.01, max: 100 }),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        (items) => {
          // Arrange
          const customerId = CustomerId.generate();
          const orderItems = items.map((item) => ({
            ...item,
            price: new Money(item.price, 'USD'),
          }));

          // Act
          const order = Order.create(customerId, orderItems);

          // Assert invariants
          expect(order.getId()).toBeDefined();
          expect(order.getCustomerId()).toBeDefined();
          expect(order.getItems().length).toBeGreaterThan(0);
          expect(order.getTotal().amount).toBeGreaterThan(0);
          expect(['Draft', 'Placed', 'Confirmed', 'Cancelled']).toContain(order.getStatus());
        }
      )
    );
  });

  it('status transitions should always follow valid state machine', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            productId: fc.uuid(),
            productName: fc.string({ minLength: 1 }),
            quantity: fc.integer({ min: 1, max: 10 }),
            price: fc.double({ min: 0.01, max: 100 }),
          }),
          { minLength: 1, maxLength: 3 }
        ),
        (items) => {
          // Arrange
          const customerId = CustomerId.generate();
          const orderItems = items.map((item) => ({
            ...item,
            price: new Money(item.price, 'USD'),
          }));
          const order = Order.create(customerId, orderItems);

          // Act & Assert
          expect(order.getStatus()).toBe('Draft');

          order.place();
          expect(order.getStatus()).toBe('Placed');

          order.confirm();
          expect(order.getStatus()).toBe('Confirmed');

          // Should not be able to go backwards
          expect(() => order.place()).toThrow();
        }
      )
    );
  });
});
```

## Generating Test Scenarios from Business Rules

**Prompt:**

```
Generate test scenarios for the business rule:
"A subscription can be cancelled only if it's active and not within the minimum commitment period (3 months from start date)."

Include: happy path, edge cases, boundary conditions, error cases
```

```typescript
// AI GENERATED:

describe('Subscription Cancellation Business Rule', () => {
  describe('Happy Path', () => {
    it('should cancel active subscription after commitment period', () => {
      // Arrange
      const startDate = new Date('2024-01-01');
      const currentDate = new Date('2024-04-02'); // 3 months + 1 day
      const subscription = new SubscriptionTestBuilder().withStartDate(startDate).asActive().build();

      // Act
      subscription.cancel(currentDate);

      // Assert
      expect(subscription.getStatus()).toBe('Cancelled');
      expect(subscription.getCancelledAt()).toEqual(currentDate);
    });
  });

  describe('Edge Cases', () => {
    it('should allow cancellation exactly 3 months after start', () => {
      // Arrange
      const startDate = new Date('2024-01-01');
      const currentDate = new Date('2024-04-01'); // Exactly 3 months
      const subscription = new SubscriptionTestBuilder().withStartDate(startDate).asActive().build();

      // Act & Assert
      expect(() => subscription.cancel(currentDate)).not.toThrow();
      expect(subscription.getStatus()).toBe('Cancelled');
    });

    it('should reject cancellation one day before commitment period ends', () => {
      // Arrange
      const startDate = new Date('2024-01-01');
      const currentDate = new Date('2024-03-31'); // 2 months 30 days
      const subscription = new SubscriptionTestBuilder().withStartDate(startDate).asActive().build();

      // Act & Assert
      expect(() => subscription.cancel(currentDate)).toThrow(
        'Cannot cancel subscription within minimum commitment period'
      );
    });
  });

  describe('Boundary Conditions', () => {
    it('should handle month-end dates correctly', () => {
      // Arrange
      const startDate = new Date('2024-01-31');
      const currentDate = new Date('2024-04-30'); // ~3 months later
      const subscription = new SubscriptionTestBuilder().withStartDate(startDate).asActive().build();

      // Act & Assert
      expect(() => subscription.cancel(currentDate)).not.toThrow();
    });

    it('should handle leap year correctly', () => {
      // Arrange
      const startDate = new Date('2024-01-31'); // Leap year
      const currentDate = new Date('2024-04-30');
      const subscription = new SubscriptionTestBuilder().withStartDate(startDate).asActive().build();

      // Act & Assert
      expect(() => subscription.cancel(currentDate)).not.toThrow();
    });
  });

  describe('Error Cases', () => {
    it('should reject cancellation of inactive subscription', () => {
      // Arrange
      const startDate = new Date('2024-01-01');
      const currentDate = new Date('2024-06-01');
      const subscription = new SubscriptionTestBuilder().withStartDate(startDate).asInactive().build();

      // Act & Assert
      expect(() => subscription.cancel(currentDate)).toThrow('Only active subscriptions can be cancelled');
    });

    it('should reject cancellation of already cancelled subscription', () => {
      // Arrange
      const startDate = new Date('2024-01-01');
      const cancelDate = new Date('2024-04-01');
      const secondCancelDate = new Date('2024-05-01');
      const subscription = new SubscriptionTestBuilder().withStartDate(startDate).asActive().build();
      subscription.cancel(cancelDate);

      // Act & Assert
      expect(() => subscription.cancel(secondCancelDate)).toThrow('Only active subscriptions can be cancelled');
    });

    it('should reject cancellation with past date', () => {
      // Arrange
      const startDate = new Date('2024-01-01');
      const currentDate = new Date('2023-12-01'); // Before start
      const subscription = new SubscriptionTestBuilder().withStartDate(startDate).asActive().build();

      // Act & Assert
      expect(() => subscription.cancel(currentDate)).toThrow(
        'Cancellation date cannot be before subscription start date'
      );
    });
  });

  describe('Multiple Scenarios', () => {
    it('should handle various commitment periods correctly', () => {
      const scenarios = [
        { months: 2, days: 29, shouldSucceed: false },
        { months: 3, days: 0, shouldSucceed: true },
        { months: 3, days: 1, shouldSucceed: true },
        { months: 6, days: 0, shouldSucceed: true },
      ];

      scenarios.forEach(({ months, days, shouldSucceed }) => {
        const startDate = new Date('2024-01-01');
        const cancelDate = new Date(startDate);
        cancelDate.setMonth(cancelDate.getMonth() + months);
        cancelDate.setDate(cancelDate.getDate() + days);

        const subscription = new SubscriptionTestBuilder().withStartDate(startDate).asActive().build();

        if (shouldSucceed) {
          expect(() => subscription.cancel(cancelDate)).not.toThrow();
          expect(subscription.getStatus()).toBe('Cancelled');
        } else {
          expect(() => subscription.cancel(cancelDate)).toThrow();
        }
      });
    });
  });
});
```

## AI for Code Review and Validation

### Detecting Domain Model Smells

**Prompt:**

```
Review this Order class for DDD anti-patterns and code smells.
Check for: anemic domain model, missing encapsulation, poor invariant protection,
missing validation, incorrect aggregate boundaries, missing domain events.
Provide specific issues and fixes.
```

**Code to review:**

```typescript
class Order {
  public id: string;
  public customerId: string;
  public items: OrderItem[] = [];
  public status: string = 'draft';
  public total: number = 0;

  constructor(id: string, customerId: string) {
    this.id = id;
    this.customerId = customerId;
  }

  calculateTotal(): number {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
}
```

**AI analysis:**

**Issues Found:**

1. **Public Mutable Properties**
   - All fields are public and mutable
   - Anyone can break invariants by directly modifying
   - *Fix:* Make fields private/readonly, use methods for changes

2. **Primitive Obsession**
   - Using `string` for id, customerId, status
   - Using `number` for total (no currency)
   - *Fix:* Use value objects (`OrderId`, `CustomerId`, `OrderStatus`, `Money`)

3. **No Validation**
   - Constructor doesn't validate inputs
   - No business rule enforcement
   - *Fix:* Add validation in factory method

4. **Anemic Domain Model**
   - `calculateTotal()` is a query, not behavior
   - No business operations (place, confirm, cancel)
   - *Fix:* Add domain methods that enforce business rules

5. **No Encapsulation**
   - Direct array access allows external modification
   - Total can be set independently of items
   - *Fix:* Return frozen copies, recalculate total automatically

6. **Missing Domain Events**
   - No events for state changes
   - Can't notify other contexts
   - *Fix:* Add domain events for key operations

7. **Weak Status Type**
   - String status allows invalid values
   - No state machine
   - *Fix:* Use enum and enforce valid transitions

**Refactored version:**

```typescript
type OrderStatus = 'Draft' | 'Placed' | 'Confirmed' | 'Cancelled';

class Order {
  private domainEvents: DomainEvent[] = [];

  private constructor(
    private readonly id: OrderId,
    private readonly customerId: CustomerId,
    private items: OrderItem[],
    private status: OrderStatus,
    private total: Money,
    private readonly createdAt: Date
  ) {}

  static create(customerId: CustomerId, items: OrderItem[]): Order {
    if (!items || items.length === 0) {
      throw new DomainError('Order must have at least one item');
    }

    const total = this.calculateTotal(items);

    return new Order(OrderId.generate(), customerId, items, 'Draft', total, new Date());
  }

  addItem(item: OrderItem): void {
    if (this.status !== 'Draft') {
      throw new DomainError('Cannot modify placed order');
    }

    this.items.push(item);
    this.total = Order.calculateTotal(this.items);
  }

  place(): void {
    if (this.status !== 'Draft') {
      throw new DomainError('Only draft orders can be placed');
    }

    this.status = 'Placed';
    this.addDomainEvent(new OrderPlaced(this.id.value, this.customerId.value));
  }

  private static calculateTotal(items: OrderItem[]): Money {
    const sum = items.reduce((total, item) => total + item.price.amount * item.quantity, 0);
    return new Money(sum, items[0].price.currency);
  }

  // Getters with proper encapsulation
  getId(): OrderId {
    return this.id;
  }

  getItems(): readonly OrderItem[] {
    return Object.freeze([...this.items]);
  }

  getTotal(): Money {
    return this.total;
  }

  getStatus(): OrderStatus {
    return this.status;
  }

  getDomainEvents(): DomainEvent[] {
    return [...this.domainEvents];
  }

  private addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }
}
```

## Key Takeaways

1. **AI accelerates test creation** - Use for comprehensive test coverage
2. **Test builders save time** - AI generates fluent builder patterns well
3. **Property-based testing** - AI helps generate property tests for invariants
4. **Business rule scenarios** - AI can expand one rule into many test cases
5. **Code review with AI** - Detect DDD anti-patterns and smells
6. **Always validate** - Review AI-generated tests for domain accuracy
7. **Test data realism** - AI creates realistic test data quickly

## Next Steps

In the next lesson, we'll explore **Building Production-Ready Systems with AI**—complete workflows, best practices, and
quality considerations for shipping DDD/CQRS systems with AI assistance.

## Hands-On Exercise

**Generate Comprehensive Tests:**

1. **Unit Tests:**
   - Choose an aggregate from your domain
   - Generate full test suite with AI
   - Review for domain accuracy
   - Add missing edge cases

2. **Test Builders:**
   - Create test data builders for your entities
   - Generate realistic test data
   - Use builders in your tests

3. **Property-Based Tests:**
   - Identify 2-3 invariants in your domain
   - Generate property-based tests
   - Run with various inputs to find edge cases

4. **Code Review:**
   - Submit a domain class for AI review
   - Analyze the feedback
   - Refactor based on suggestions

**Reflection:**

- How much time did AI save?
- What domain issues did AI miss?
- What did you learn about your domain from writing tests?

---

**Time to complete:** 60 minutes **Difficulty:** Intermediate

Share your test coverage improvements in the course forum!
