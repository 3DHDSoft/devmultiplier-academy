# Ubiquitous Language & Domain Modeling

**Duration:** 25 minutes
**Learning Objectives:**
- Establish and maintain ubiquitous language in your team
- Identify language inconsistencies that lead to bugs
- Translate domain concepts into code effectively

---

## Introduction

Ubiquitous Language is perhaps the most powerful yet underutilized concept in DDD. It's the shared vocabulary between developers and domain experts that permeates code, documentation, and conversations. When done right, it eliminates translation errors and makes your codebase readable to business stakeholders.

## The Cost of Language Mismatch

### Real-World Bug Example

```typescript
// Business Expert: "A reservation is confirmed when payment is received"
// Developer heard: "A booking is complete when status is set to paid"

// Database schema
table bookings {
  status: 'pending' | 'paid' | 'complete' | 'confirmed'
  // What's the difference between 'confirmed' and 'complete'?
}

// Code
class BookingService {
  async completeBooking(bookingId: string) {
    await db.bookings.update({
      where: { id: bookingId },
      data: { status: 'complete' }
    });
  }

  async confirmBooking(bookingId: string) {
    // What should this do?
    await db.bookings.update({
      where: { id: bookingId },
      data: { status: 'confirmed' }
    });
  }
}

// Bug: Payment received but booking not confirmed
// Because developer used "complete" instead of "confirmed"
```

### The Same System with Ubiquitous Language

```typescript
// Everyone agrees: "A Reservation is confirmed when Payment is received"

enum ReservationStatus {
  Draft = 'draft',
  AwaitingPayment = 'awaiting_payment',
  Confirmed = 'confirmed',
  Cancelled = 'cancelled'
}

class Reservation {
  private status: ReservationStatus;

  confirmPayment(payment: Payment): ReservationConfirmed {
    if (this.status !== ReservationStatus.AwaitingPayment) {
      throw new DomainError('Can only confirm reservations awaiting payment');
    }

    if (!payment.isSuccessful()) {
      throw new DomainError('Cannot confirm reservation with failed payment');
    }

    this.status = ReservationStatus.Confirmed;
    return new ReservationConfirmed(this.id, payment.id);
  }
}

// Usage matches business language
const payment = await paymentGateway.process(paymentDetails);
const event = reservation.confirmPayment(payment);
```

## Building Your Ubiquitous Language

### Step 1: Domain Expert Interviews

Run structured discovery sessions:

**Sample Interview Questions:**

```
For E-Commerce Domain:

1. "Walk me through what happens when a customer wants to buy something"
   - Listen for: verbs (actions), nouns (entities), rules (invariants)

2. "What can go wrong during that process?"
   - Reveals edge cases and business rules

3. "What terms do you use when talking about this?"
   - Captures actual language, not what developers assume

4. "Are there different types of [entity]?"
   - Uncovers hierarchies and categorizations

5. "When is a [entity] considered [state]?"
   - Defines state transitions and rules
```

### Step 2: Document the Language

Create a living glossary:

```markdown
# E-Commerce Ubiquitous Language

## Core Entities

### Order
An Order represents a customer's intent to purchase products. An Order goes
through these states:
- **Draft**: Customer is still adding items
- **Placed**: Customer has confirmed and paid
- **Fulfilled**: Items have been shipped
- **Cancelled**: Order was cancelled before fulfillment

**Key Rules:**
- Cannot place an Order without at least one item
- Cannot modify a Placed order
- Can only cancel orders in Draft or Placed status

### Cart vs Order
⚠️ Important distinction:
- **Cart**: Temporary collection of items, can be abandoned
- **Order**: Committed purchase, creates financial obligation

## Domain Events

### OrderPlaced
Triggered when customer completes checkout. Includes:
- Order ID
- Customer ID
- Items with prices (snapshot at purchase time)
- Total amount
- Shipping address

### OrderFulfilled
Triggered when all items have shipped. Includes:
- Order ID
- Fulfillment date
- Tracking numbers

## Domain Services

### PricingCalculator
Calculates total order price including:
- Product prices
- Applicable discounts
- Shipping costs
- Taxes

Cannot modify orders, only calculates prices.
```

### Step 3: Code Matches Language

```typescript
// ❌ Bad: Code doesn't match business language
class OrderManager {
  async finalize(orderId: string): Promise<void> {
    const order = await this.repo.get(orderId);
    order.state = 2; // What does 2 mean?
    await this.repo.save(order);
    await this.notifier.send(order.userId, 'done');
  }
}

// ✅ Good: Code uses ubiquitous language
class Order {
  place(): OrderPlaced {
    this.ensureStatusIs(OrderStatus.Draft);
    this.ensureHasItems();
    this.ensurePaymentReceived();

    this.status = OrderStatus.Placed;
    this.placedAt = new Date();

    return new OrderPlaced(
      this.id,
      this.customerId,
      this.items,
      this.total,
      this.shippingAddress
    );
  }
}

// Application service uses same language
class PlaceOrderCommandHandler {
  async handle(command: PlaceOrderCommand): Promise<void> {
    const order = await this.orderRepository.findById(command.orderId);
    const event = order.place();

    await this.orderRepository.save(order);
    await this.eventBus.publish(event);
  }
}
```

## Recognizing Language Smells

### Smell 1: CRUD Language

```typescript
// ❌ Generic CRUD verbs
orderService.update(order, { status: 'confirmed' });
customerService.delete(customerId);

// ✅ Domain-specific verbs
order.confirm();
customer.deactivate(); // Customers are rarely truly "deleted"
```

### Smell 2: Vague Terms

```typescript
// ❌ What does "process" mean?
orderService.process(order);

// ✅ Specific action
order.fulfill(); // Ship the items
// OR
order.settle(); // Complete payment processing
// OR
order.validate(); // Check business rules
```

### Smell 3: Technical Terms in Domain

```typescript
// ❌ Technical leak
class Order {
  private readonly entities: Entity[];
  serialize(): JSON { ... }
  persist(): void { ... }
}

// ✅ Domain-focused
class Order {
  private readonly items: OrderItem[];
  toSnapshot(): OrderSnapshot { ... }
  // Persistence is infrastructure concern, not domain
}
```

### Smell 4: Acronyms Without Definition

```typescript
// ❌ What's a SKU? What's an ASN?
class SKU { ... }
class ASN { ... }

// ✅ Use full names or document
class ProductCode { ... } // Formerly SKU (Stock Keeping Unit)
class ShipmentNotice { ... } // Formerly ASN (Advanced Shipment Notice)

// Or keep acronym if universally known in domain
class ISBN { ... } // ISBN is standard in publishing
```

## Modeling Exercises

### Exercise 1: Translate Business Rules

**Business Expert Says:**
"A customer can return an item within 30 days if it's unopened and they have the receipt. Digital products can't be returned. Promotional items can only be returned for store credit, not refund."

**Bad Translation:**
```typescript
function canReturn(item: Item, order: Order): boolean {
  const daysSince = Date.now() - order.date.getTime();
  if (daysSince > 30 * 24 * 60 * 60 * 1000) return false;
  if (item.opened) return false;
  if (!order.hasReceipt) return false;
  if (item.digital) return false;
  return true;
}
```

**Good Translation:**
```typescript
class OrderItem {
  canBeReturned(): boolean {
    if (this.isDigital()) {
      return false;
    }

    if (this.isOpened()) {
      return false;
    }

    return this.order.isWithinReturnWindow();
  }

  getReturnType(): ReturnType {
    if (!this.canBeReturned()) {
      throw new DomainError('Item cannot be returned');
    }

    if (this.isPromotional()) {
      return ReturnType.StoreCredit;
    }

    return ReturnType.Refund;
  }
}

class Order {
  private static readonly RETURN_WINDOW_DAYS = 30;

  isWithinReturnWindow(): boolean {
    const daysSincePurchase = this.placedAt.daysUntil(new Date());
    return daysSincePurchase <= Order.RETURN_WINDOW_DAYS;
  }

  hasReceipt(): boolean {
    return this.receiptNumber !== null;
  }
}
```

### Exercise 2: Event Storming Results to Code

**Event Storm Output:**
```
Event: OrderPlaced
Event: PaymentProcessed
Event: OrderFulfilled
Event: OrderDelivered
Event: OrderReturned

Commands:
- PlaceOrder
- ProcessPayment
- FulfillOrder
- DeliverOrder
- ReturnOrder

Aggregates:
- Order
- Payment
- Shipment
```

**Code Structure:**
```typescript
// Domain Events
class OrderPlaced extends DomainEvent {
  constructor(
    public readonly orderId: OrderId,
    public readonly customerId: CustomerId,
    public readonly items: OrderItem[],
    public readonly total: Money
  ) {
    super();
  }
}

class PaymentProcessed extends DomainEvent {
  constructor(
    public readonly paymentId: PaymentId,
    public readonly orderId: OrderId,
    public readonly amount: Money,
    public readonly method: PaymentMethod
  ) {
    super();
  }
}

// Aggregates
class Order {
  place(): OrderPlaced {
    // Business rules for placing order
    this.status = OrderStatus.Placed;
    return new OrderPlaced(this.id, this.customerId, this.items, this.total);
  }
}

class Payment {
  process(): PaymentProcessed {
    // Payment processing logic
    this.status = PaymentStatus.Processed;
    return new PaymentProcessed(this.id, this.orderId, this.amount, this.method);
  }
}

class Shipment {
  fulfill(order: Order): OrderFulfilled {
    // Fulfillment logic
    return new OrderFulfilled(this.id, order.id, this.trackingNumber);
  }
}

// Commands (handled by application services)
interface PlaceOrderCommand {
  customerId: string;
  items: { productId: string; quantity: number }[];
  shippingAddress: Address;
}

interface ProcessPaymentCommand {
  orderId: string;
  paymentMethod: PaymentMethod;
  amount: number;
}
```

## Maintaining Language Over Time

### Regular Language Reviews

```typescript
// Old language (discovered through team discussion)
class Subscription {
  pause() { ... }  // Business says "freeze"
  resume() { ... } // Business says "reactivate"
}

// Updated to match business
class Subscription {
  freeze() { ... }
  reactivate() { ... }
}
```

### Glossary as Living Document

Keep your glossary in version control:

```markdown
# CHANGELOG

## 2024-01-15
- Renamed "pause" to "freeze" for subscriptions
- Clarified difference between "cancelled" and "deactivated"
- Added "grace period" concept for payment failures

## 2024-01-10
- Split "Order" into "Cart" and "Order" after domain expert feedback
- "Cart" is pre-checkout, "Order" is post-checkout
```

### Code Reviews for Language

```typescript
// PR Review Comment:
// ❌ "I see you used 'activate' but we agreed on 'enable' in the domain"
customer.activate();

// ✅ Updated
customer.enable();

// Document the distinction
// GLOSSARY.md:
// **Enable**: Turn on a customer account (business term)
// **Activate**: Not used in this domain, use "enable" instead
```

## AI-Assisted Language Discovery

```typescript
// AI Prompt for Language Extraction:
/*
Analyze this conversation with a domain expert and extract:
1. Key entities (nouns)
2. Actions/Commands (verbs)
3. Business rules (constraints)
4. State transitions
5. Domain events

Conversation:
"When a customer places an order, we need to verify their payment method.
If the payment goes through, we mark the order as confirmed and notify
the warehouse. The warehouse then picks the items and ships them. Once
shipped, we send a tracking number to the customer."
*/

// AI can help identify:
// Entities: Customer, Order, PaymentMethod, Warehouse, Shipment
// Commands: PlaceOrder, VerifyPayment, ConfirmOrder, PickItems, Ship
// Events: OrderPlaced, PaymentVerified, OrderConfirmed, ItemsPicked, OrderShipped
// Rules: Payment must be verified before confirmation

// BUT: Always validate with domain expert
// AI might miss nuances or suggest technically sound but domain-inappropriate terms
```

## Common Pitfalls

### Pitfall 1: Technical Bias

```typescript
// ❌ Developer thinking
class OrderDTO {
  serialize(): JSON { ... }
  hydrate(data: JSON): void { ... }
}

// ✅ Domain thinking
class Order {
  toSnapshot(): OrderSnapshot { ... }
  static fromSnapshot(snapshot: OrderSnapshot): Order { ... }
}
```

### Pitfall 2: Multiple Contexts, Same Word

```typescript
// "Product" means different things in different contexts

// In Catalog Context
class Product {
  name: string;
  description: string;
  images: string[];
  variants: ProductVariant[];
}

// In Order Context
class OrderProduct {
  productId: string;
  snapshotPrice: Money; // Price at time of purchase
  quantity: number;
}

// In Inventory Context
class InventoryItem {
  sku: string;
  quantityOnHand: number;
  reorderPoint: number;
}
```

## Key Takeaways

1. **Language is code** - Your ubiquitous language should be visible in every class, method, and variable name
2. **No translation layer** - Business terms should map directly to code, no "translation" needed
3. **Living glossary** - Document and evolve your language
4. **Team-wide commitment** - Everyone uses the same terms
5. **Code reviews enforce language** - Call out deviations from agreed-upon terms
6. **Domain events capture language** - Events are stated in past tense using business terms

## Next Steps

In the next lesson, we'll explore **Core Domain Identification**—how to focus your DDD efforts on what matters most to your business.

## Hands-On Exercise

**Language Audit:**

Take a feature from your current codebase:

1. **Extract terms:**
   - List all class names, method names, and key variables
   - Identify which are technical vs domain terms

2. **Interview stakeholder:**
   - Pick one feature area
   - Ask: "How do you describe [this process]?"
   - Note exact words used

3. **Compare:**
   - Where does code language diverge from business language?
   - What would you rename?

4. **Refactor one example:**
   - Pick one class/method
   - Rename to match business language
   - Update tests to use new language

**Example:**

```typescript
// Current code
class UserAccountManager {
  deactivateUser(userId: string) { ... }
}

// After interview: Business says "suspend" not "deactivate"
class Customer {
  suspend(reason: SuspensionReason) { ... }
  reactivate() { ... }
}
```

---

**Time to complete:** 45 minutes
**Difficulty:** Intermediate

Share your before/after refactoring in the course forum!
