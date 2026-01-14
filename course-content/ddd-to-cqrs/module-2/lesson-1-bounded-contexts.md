# Understanding Bounded Contexts

**Duration:** 18 minutes
**Learning Objectives:**
- Understand what bounded contexts are and why they matter
- Identify natural boundaries in complex systems
- Apply the bounded context pattern to decompose domains

---

## Introduction

Bounded Contexts are one of the most powerful and misunderstood concepts in DDD. They're the linguistic and semantic boundaries within which a particular domain model is valid. Without bounded contexts, large systems become unmaintainable tangles of conflicting concepts.

## The Problem: Ambiguous Terms

### Example: "Customer" Means Different Things

```typescript
// ❌ One "Customer" model trying to serve all contexts
interface Customer {
  // Sales needs
  id: string;
  name: string;
  email: string;
  creditLimit: number;

  // Support needs
  ticketCount: number;
  preferredLanguage: string;
  satisfactionScore: number;

  // Shipping needs
  defaultShippingAddress: Address;
  deliveryInstructions: string;

  // Marketing needs
  segment: string;
  campaignPreferences: string[];
  lastEmailOpenedAt: Date;

  // Billing needs
  paymentMethod: PaymentMethod;
  outstandingInvoices: Invoice[];
  creditHistory: CreditEvent[];
}

// Problems:
// 1. Every change affects all contexts
// 2. Unclear which fields matter where
// 3. Different teams stepping on each other
// 4. Impossible to understand what "Customer" really means
```

### Solution: Bounded Contexts

```typescript
// ✅ Each context has its own model

// SALES CONTEXT
namespace Sales {
  export class Customer {
    constructor(
      private readonly id: CustomerId,
      private readonly name: CustomerName,
      private readonly email: Email,
      private creditLimit: Money
    ) {}

    canPlaceOrder(orderTotal: Money): boolean {
      return orderTotal.isLessThanOrEqual(this.creditLimit);
    }

    increaseCreditLimit(amount: Money): void {
      this.creditLimit = this.creditLimit.add(amount);
    }
  }
}

// SUPPORT CONTEXT
namespace Support {
  export class Customer {
    constructor(
      private readonly id: CustomerId,
      private readonly preferredLanguage: Language,
      private tickets: Ticket[]
    ) {}

    openTicket(issue: Issue): Ticket {
      const ticket = Ticket.create(this.id, issue, this.preferredLanguage);
      this.tickets.push(ticket);
      return ticket;
    }

    getSatisfactionScore(): number {
      return this.tickets
        .filter(t => t.hasRating())
        .reduce((sum, t) => sum + t.rating, 0) / this.tickets.length;
    }
  }
}

// SHIPPING CONTEXT
namespace Shipping {
  export class Recipient {
    // Notice: Not even called "Customer" here
    constructor(
      private readonly id: RecipientId,
      private readonly name: string,
      private readonly defaultAddress: ShippingAddress,
      private readonly deliveryInstructions: string
    ) {}

    getDeliveryAddress(override?: ShippingAddress): ShippingAddress {
      return override ?? this.defaultAddress;
    }
  }
}

// Each context models "customer" differently based on its needs
```

## What is a Bounded Context?

**Definition:** A boundary within which a particular ubiquitous language and domain model are valid and consistent.

### Key Characteristics

1. **Explicit Boundary**
   - Clear "in" and "out"
   - Well-defined interfaces for crossing boundary

2. **Internal Consistency**
   - Model makes sense within the boundary
   - Ubiquitous language is clear and unambiguous

3. **Independence**
   - Can evolve without coordinating with other contexts
   - Different technology choices possible

4. **Ownership**
   - One team owns the context
   - Clear accountability

## Identifying Bounded Contexts

### Signal 1: Linguistic Boundaries

```typescript
// Different meanings of "Product"

// CATALOG CONTEXT - Product is searchable item
namespace Catalog {
  export class Product {
    constructor(
      public readonly id: ProductId,
      public readonly name: string,
      public readonly description: string,
      public readonly searchKeywords: string[],
      public readonly images: ImageUrl[],
      public readonly variants: ProductVariant[]
    ) {}

    matches(searchQuery: string): boolean {
      // Rich search logic
    }
  }
}

// PRICING CONTEXT - Product is priceable entity
namespace Pricing {
  export class Product {
    constructor(
      public readonly id: ProductId,
      public readonly baseCost: Money,
      public readonly category: ProductCategory,
      public readonly pricingStrategy: PricingStrategy
    ) {}

    calculatePrice(context: PricingContext): Money {
      return this.pricingStrategy.calculate(this.baseCost, context);
    }
  }
}

// INVENTORY CONTEXT - Product is tracked stock item
namespace Inventory {
  export class InventoryItem {
    // Different name! Shows different perspective
    constructor(
      public readonly sku: SKU,
      public readonly quantityOnHand: number,
      public readonly reorderPoint: number,
      public readonly warehouseLocation: Location
    ) {}

    needsReorder(): boolean {
      return this.quantityOnHand <= this.reorderPoint;
    }
  }
}
```

### Signal 2: Different Rules Apply

```typescript
// ORDER CONTEXT - Order can be modified until placed
namespace Orders {
  export class Order {
    addItem(item: OrderItem): void {
      if (this.status !== OrderStatus.Draft) {
        throw new Error('Cannot modify placed orders');
      }
      this.items.push(item);
    }
  }
}

// FULFILLMENT CONTEXT - Order is immutable instruction
namespace Fulfillment {
  export class FulfillmentOrder {
    // Completely different rules!
    // Order items cannot change, but can be split across shipments

    splitIntoShipments(): Shipment[] {
      // Items never change, but fulfillment can be split
    }
  }
}
```

### Signal 3: Different Team Ownership

```typescript
// Different teams, different contexts

// E-COMMERCE TEAM owns Sales Context
namespace Sales {
  // Shopping cart, checkout, order placement
}

// OPERATIONS TEAM owns Fulfillment Context
namespace Fulfillment {
  // Warehouse, picking, shipping
}

// FINANCE TEAM owns Billing Context
namespace Billing {
  // Invoices, payments, accounting
}

// Each team can deploy independently
// Each team has different release cycles
// Each team uses different technology if needed
```

## Context Size: How Big Should They Be?

### Too Large

```typescript
// ❌ "Commerce" context is too big
namespace Commerce {
  // 50+ aggregates
  // Product catalog + pricing + inventory + orders + shipping + returns + reviews
  // Multiple teams all touching same code
  // Impossible to understand
  // Deploy everything together
}
```

### Too Small

```typescript
// ❌ Over-fragmented
namespace ProductName { ... }
namespace ProductDescription { ... }
namespace ProductImage { ... }

// Too fine-grained
// No business benefit to separation
// Integration complexity outweighs benefits
```

### Just Right

```typescript
// ✅ Cohesive business capability
namespace Catalog {
  // Product search and browsing
  // 5-10 aggregates
  // One team can understand and own it
  // Clear business purpose
  class Product { ... }
  class Category { ... }
  class SearchIndex { ... }
}

namespace Pricing {
  // Pricing and promotions
  // Separate because rules are complex
  // Different release cycle than catalog
  class PricingEngine { ... }
  class Promotion { ... }
  class Discount { ... }
}
```

**Rule of Thumb:** A bounded context should:
- Fit in one team's head
- Have 3-15 aggregates
- Represent a cohesive business capability
- Be independently deployable

## Bounded Contexts in Code

### Directory Structure

```
📦 src/
└── 📁 contexts/
    ├── 📁 sales/                        # Sales bounded context
    │   ├── 📁 domain/
    │   │   ├── 📄 Order.ts              # Order aggregate
    │   │   ├── 📄 Customer.ts           # Customer entity
    │   │   └── 📁 events/               # Domain events
    │   ├── 📁 application/
    │   │   └── 📄 PlaceOrderHandler.ts  # Command handler
    │   ├── 📁 infrastructure/
    │   │   └── 📄 OrderRepository.ts    # Persistence
    │   └── 📁 api/
    │       └── 📄 routes.ts             # HTTP endpoints
    │
    ├── 📁 fulfillment/                  # Fulfillment bounded context
    │   ├── 📁 domain/
    │   │   ├── 📄 Shipment.ts           # Shipment aggregate
    │   │   └── 📄 Inventory.ts          # Inventory aggregate
    │   ├── 📁 application/
    │   └── 📁 infrastructure/
    │
    └── 📁 billing/                      # Billing bounded context
        ├── 📁 domain/
        │   ├── 📄 Invoice.ts            # Invoice aggregate
        │   └── 📄 Payment.ts            # Payment entity
        └── 📁 application/
```

**Legend:**
- 📦 Project root
- 📁 Directory
- 📄 File

### Namespace Isolation

```typescript
// Each context in its own namespace

export namespace Sales {
  export class Order { ... }
  export class Customer { ... }

  // Internal to Sales, not exported
  class OrderValidator { ... }
}

export namespace Fulfillment {
  export class Shipment { ... }

  // Can have class with same name!
  export class Order { ... } // Fulfillment's view of Order
}

// Usage requires explicit context
import { Sales } from '@/contexts/sales';
import { Fulfillment } from '@/contexts/fulfillment';

const salesOrder = new Sales.Order(...);
const fulfillmentOrder = new Fulfillment.Order(...);
```

## Cross-Context Communication

### Problem: Direct Dependencies

```typescript
// ❌ Sales directly depends on Fulfillment internals
import { Inventory } from '@/contexts/fulfillment/domain/Inventory';

class OrderService {
  async placeOrder(order: Order): Promise<void> {
    // Sales knows too much about Fulfillment
    const inventory = await this.inventoryRepo.find(order.productId);
    if (inventory.quantityOnHand < order.quantity) {
      throw new Error('Out of stock');
    }
  }
}
```

### Solution: Well-Defined Interfaces

```typescript
// ✅ Sales uses Fulfillment through interface

// Fulfillment exposes public API
export namespace Fulfillment {
  export interface StockChecker {
    isAvailable(productId: string, quantity: number): Promise<boolean>;
  }

  export class FulfillmentService implements StockChecker {
    async isAvailable(productId: string, quantity: number): Promise<boolean> {
      // Implementation details hidden
      const inventory = await this.inventoryRepo.find(productId);
      return inventory.quantityOnHand >= quantity;
    }
  }
}

// Sales depends on interface, not implementation
import { Fulfillment } from '@/contexts/fulfillment';

class OrderService {
  constructor(
    private readonly stockChecker: Fulfillment.StockChecker
  ) {}

  async placeOrder(order: Order): Promise<void> {
    const available = await this.stockChecker.isAvailable(
      order.productId,
      order.quantity
    );

    if (!available) {
      throw new OutOfStockError(order.productId);
    }
  }
}
```

## Real-World Example: E-Commerce Platform

```typescript
// Complete bounded context setup

// 1. CATALOG CONTEXT - Product discovery
export namespace Catalog {
  export class Product {
    constructor(
      public readonly id: ProductId,
      public readonly name: string,
      public readonly category: Category,
      public readonly images: ImageUrl[]
    ) {}
  }

  export interface ProductCatalog {
    search(query: string): Promise<Product[]>;
    getById(id: ProductId): Promise<Product | null>;
  }
}

// 2. SALES CONTEXT - Order processing
export namespace Sales {
  export class Order {
    private constructor(
      private readonly id: OrderId,
      private readonly customerId: CustomerId,
      private items: OrderItem[],
      private status: OrderStatus
    ) {}

    static create(customerId: CustomerId, items: OrderItem[]): Order {
      return new Order(
        OrderId.generate(),
        customerId,
        items,
        OrderStatus.Draft
      );
    }

    place(): OrderPlaced {
      this.ensureCanBePlaced();
      this.status = OrderStatus.Placed;
      return new OrderPlaced(this.id, this.customerId, this.items);
    }
  }

  // Sales' view of Product (different from Catalog's!)
  export interface ProductSnapshot {
    id: string;
    name: string;
    price: number; // Snapshot price at time of order
  }
}

// 3. FULFILLMENT CONTEXT - Shipping
export namespace Fulfillment {
  export class Shipment {
    constructor(
      private readonly id: ShipmentId,
      private readonly orderId: string, // Reference to Sales.Order
      private readonly items: ShipmentItem[],
      private status: ShipmentStatus
    ) {}

    ship(carrier: Carrier): ShipmentDispatched {
      this.status = ShipmentStatus.Shipped;
      return new ShipmentDispatched(this.id, carrier.trackingNumber);
    }
  }
}

// 4. BILLING CONTEXT - Payment and invoicing
export namespace Billing {
  export class Invoice {
    constructor(
      private readonly id: InvoiceId,
      private readonly orderId: string, // Reference to Sales.Order
      private readonly amount: Money,
      private status: InvoiceStatus
    ) {}

    markPaid(payment: Payment): InvoicePaid {
      this.status = InvoiceStatus.Paid;
      return new InvoicePaid(this.id, payment.id);
    }
  }
}

// Integration via events
class OrderPlacedHandler {
  async handle(event: Sales.OrderPlaced): Promise<void> {
    // Fulfillment creates shipment
    const shipment = Fulfillment.Shipment.createFromOrder(event.orderId);
    await this.shipmentRepo.save(shipment);

    // Billing creates invoice
    const invoice = Billing.Invoice.createFromOrder(
      event.orderId,
      event.totalAmount
    );
    await this.invoiceRepo.save(invoice);
  }
}
```

## Key Takeaways

1. **Bounded contexts prevent model pollution** - Each context has its own consistent model
2. **Same word, different meaning** - "Customer" in Sales ≠ "Customer" in Support
3. **Size matters** - Not too big (unmaintainable), not too small (over-fragmented)
4. **Clear boundaries** - Explicit interfaces for cross-context communication
5. **Team alignment** - One team per context when possible
6. **Independent deployment** - Contexts can evolve separately

## Common Mistakes

❌ **Shared database between contexts** - Couples contexts at data level
❌ **Leaking domain objects across boundaries** - Use DTOs or events
❌ **One context per entity** - Too fine-grained
❌ **No context boundaries** - Everything in one big ball of mud
❌ **Premature splitting** - Start with one context, split when needed

## Next Steps

In the next lesson, we'll explore **Context Mapping Patterns**—the different ways bounded contexts can relate to and integrate with each other.

## Hands-On Exercise

**Identify Contexts:**

For a system you're working on:

1. **List major areas** (e.g., user management, orders, inventory, billing)

2. **Find linguistic clues:**
   - What terms have different meanings in different areas?
   - What rules apply in one area but not others?

3. **Draw initial context map:**
   ```
   [Context A] ←→ [Context B]

   Example:
   [Sales] ←→ [Fulfillment] ←→ [Inventory]
      ↓
   [Billing]
   ```

4. **Define one context's model:**
   ```typescript
   export namespace YourContext {
     export class YourAggregate {
       // Define key aggregate
     }
   }
   ```

5. **Identify integration points:**
   - How does Context A learn about Context B's changes?
   - What data crosses the boundary?

---

**Time to complete:** 45 minutes
**Difficulty:** Intermediate

Share your context map in the course forum!
