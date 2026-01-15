# What is Domain-Driven Design?

**Duration:** 20 minutes
**Learning Objectives:**
- Understand the core philosophy of Domain-Driven Design
- Recognize when DDD is appropriate for a project
- Identify the key benefits and challenges of DDD

---

## Introduction

Domain-Driven Design (DDD) is not just a set of patterns or a framework—it's a philosophy for tackling complexity in software systems by focusing deeply on the business domain. Introduced by Eric Evans in his seminal 2003 book, DDD has become essential for building maintainable, scalable enterprise applications.

## What Problem Does DDD Solve?

### The Traditional Approach Problem

Traditional software development often suffers from:

```typescript
// Traditional anemic domain model
interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  status: string;
  total: number;
}

// Business logic scattered in service layer
class OrderService {
  calculateTotal(order: Order): number {
    return order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  validateOrder(order: Order): boolean {
    // Validation logic here
  }

  processPayment(order: Order): void {
    // Payment logic here
  }
}
```

**Problems:**
1. **Domain knowledge scattered** - Business rules live in service layers, far from the data
2. **Poor encapsulation** - Anyone can modify order properties directly
3. **Loss of domain language** - Code doesn't reflect how business experts think
4. **Hard to maintain** - Changes require hunting through multiple service classes

### The DDD Approach

```typescript
// Rich domain model
class Order {
  private constructor(
    private readonly id: OrderId,
    private readonly customerId: CustomerId,
    private items: OrderItem[],
    private status: OrderStatus,
    private total: Money
  ) {}

  static create(customerId: CustomerId, items: OrderItem[]): Order {
    if (items.length === 0) {
      throw new DomainError('Order must have at least one item');
    }

    const total = Order.calculateTotal(items);
    return new Order(
      OrderId.generate(),
      customerId,
      items,
      OrderStatus.Draft,
      total
    );
  }

  addItem(item: OrderItem): void {
    if (this.status !== OrderStatus.Draft) {
      throw new DomainError('Cannot modify submitted orders');
    }
    this.items.push(item);
    this.total = Order.calculateTotal(this.items);
  }

  submit(): void {
    if (this.items.length === 0) {
      throw new DomainError('Cannot submit empty order');
    }
    this.status = OrderStatus.Submitted;
  }

  private static calculateTotal(items: OrderItem[]): Money {
    const sum = items.reduce(
      (total, item) => total + item.price.amount * item.quantity,
      0
    );
    return new Money(sum, items[0].price.currency);
  }
}
```

**Benefits:**
1. **Business logic in the domain** - Rules live where they belong
2. **Enforced invariants** - Invalid states are impossible
3. **Clear domain language** - `order.submit()` vs `orderService.updateStatus(order, 'submitted')`
4. **Maintainable** - Changes happen in one place

## Core Principles of DDD

### 1. Focus on the Core Domain

Not all parts of your system deserve equal attention. DDD helps you identify and invest in what matters most to your business.

**Example:**
In an e-commerce platform:
- **Core Domain:** Product recommendations, pricing strategies (competitive advantage)
- **Supporting Domain:** Inventory management, order processing (important but standard)
- **Generic Domain:** User authentication, email notifications (buy or use libraries)

### 2. Model-Driven Design

The domain model should:
- Reflect how business experts think and talk
- Be the foundation for implementation
- Evolve as understanding deepens

```typescript
// Business language: "A customer places an order for products"
class Customer {
  placeOrder(products: Product[]): Order {
    const items = products.map(p => OrderItem.fromProduct(p));
    return Order.create(this.id, items);
  }
}

// NOT: orderService.createOrderForCustomer(customerId, productIds)
```

### 3. Ubiquitous Language

Everyone—developers, domain experts, managers—uses the same terms.

**Bad:**
- Developer: "We need to update the cart status to confirmed"
- Business: "The customer completes their order"
- Database: "Set order_state = 3"

**Good (Ubiquitous Language):**
- Everyone: "The customer places an order"
- Code: `customer.placeOrder()`
- Database: `order_status = 'placed'`

### 4. Continuous Learning

DDD emphasizes ongoing collaboration between developers and domain experts. Your model should evolve as you learn more about the domain.

## When to Use DDD

### Good Fit for DDD

✅ **Complex business domains**
- Banking, insurance, healthcare
- E-commerce with custom pricing rules
- Logistics and supply chain management

✅ **Long-lived applications**
- Systems expected to evolve over years
- Applications with growing complexity

✅ **Domain expert availability**
- Access to business stakeholders
- Complex rules that need clarification

✅ **Strategic importance**
- Core business differentiators
- Systems that directly impact revenue

### Poor Fit for DDD

❌ **Simple CRUD applications**
```typescript
// Too simple for DDD
interface BlogPost {
  id: string;
  title: string;
  content: string;
  publishedAt: Date;
}
```

❌ **Data transformation pipelines**
- ETL processes
- Report generators

❌ **Tight deadlines without domain access**
- Can't spend time modeling
- No domain expert availability

❌ **Highly technical domains**
- Compilers, low-level systems
- Pure algorithmic problems

## The Cost of DDD

Be honest about the investment required:

### Initial Costs
- **Steeper learning curve** - New patterns and concepts
- **More upfront design** - Time spent modeling before coding
- **Team alignment** - Everyone needs to understand the approach

### Ongoing Costs
- **Discipline required** - Easy to fall back to anemic models
- **More code** - Rich models are more verbose than CRUD
- **Maintenance** - Model must evolve with domain understanding

### When the Cost is Worth It

```typescript
// Without DDD: Simple now, nightmare later
function processOrder(orderId: string) {
  const order = await db.orders.findOne({ id: orderId });
  if (order.status === 'pending') {
    if (order.paymentStatus === 'paid') {
      if (order.items.every(item => item.inStock)) {
        // 50 lines of business logic mixed with infrastructure
        // Scattered validations, no domain language
        order.status = 'processing';
        await db.orders.update(order);
        await sendEmail(order.customerEmail, 'Order processing');
        // ... more infrastructure code
      }
    }
  }
}

// With DDD: More upfront work, but scales beautifully
class Order {
  process(): OrderProcessed {
    this.ensureStatusIs(OrderStatus.Pending);
    this.ensurePaymentReceived();
    this.ensureItemsInStock();

    this.status = OrderStatus.Processing;
    return new OrderProcessed(this.id, this.items);
  }
}

// In application service (thin orchestration layer)
async function processOrderCommand(orderId: OrderId): Promise<void> {
  const order = await orderRepository.findById(orderId);
  const event = order.process();

  await orderRepository.save(order);
  await eventBus.publish(event);
}
```

## Real-World Success Stories

### Case Study 1: E-commerce Pricing
**Problem:** Complex pricing rules (discounts, promotions, volume pricing, customer tiers)

**DDD Solution:**
- Modeled `PricingStrategy` as a first-class domain concept
- Created `PromotionRule` aggregate
- Used `PriceCalculator` domain service

**Result:** Added 50+ new pricing scenarios over 2 years without major refactoring

### Case Study 2: Healthcare Scheduling
**Problem:** Appointment booking with insurance, provider availability, room constraints

**DDD Solution:**
- `Appointment` aggregate with clear business rules
- `AvailabilityPolicy` for provider schedules
- `InsuranceVerification` domain service

**Result:** Reduced booking errors by 80%, faster feature delivery

## AI-Assisted DDD

Modern AI tools can accelerate DDD implementation:

```typescript
// AI Prompt Example:
// "Generate a DDD aggregate for an Order in an e-commerce system.
// Include: order items, status transitions, business rule validation,
// and domain events for status changes."

// AI can help with:
// 1. Boilerplate reduction (constructors, validation)
// 2. Pattern application (factory methods, value objects)
// 3. Test generation
// 4. Documentation

// BUT: AI cannot replace domain expertise
// - You must validate business rules with domain experts
// - AI may suggest technically correct but domain-inappropriate solutions
```

## Key Takeaways

1. **DDD is a philosophy**, not a framework - It's about how you think about problems
2. **Focus on complexity** - Use DDD where it provides value
3. **Ubiquitous language is foundational** - Communication drives good models
4. **Model-driven design** - Your domain model should be the heart of your application
5. **Continuous learning** - Models evolve as understanding deepens
6. **Cost vs benefit** - Don't use DDD for simple CRUD applications

## Common Misconceptions

❌ "DDD means using entities, repositories, and services"
✅ DDD is about modeling the domain; patterns are tools

❌ "DDD requires microservices"
✅ DDD works in monoliths and distributed systems

❌ "DDD is just for enterprise apps"
✅ DDD principles scale to appropriate complexity levels

❌ "You need to use all DDD patterns"
✅ Use patterns that solve your specific problems

## Next Steps

In the next lesson, we'll explore **Ubiquitous Language** in depth—how to establish it with your team and maintain it throughout your codebase.

## Exercise

**Identify Your Domain:**

For a project you're currently working on (or a familiar system):

1. Is this a good fit for DDD? Why or why not?
2. What would be the core domain?
3. What are 5 key terms that should be in your ubiquitous language?
4. What's one piece of business logic currently in a service class that could move to a domain model?

**Example Answer:**
1. **Project:** Online learning platform
2. **Good fit?** Yes - complex enrollment rules, course scheduling, progress tracking
3. **Core domain:** Course recommendations, adaptive learning paths
4. **Key terms:** Course, Enrollment, Module, Lesson, Progress, Completion
5. **Logic to move:** "Can student enroll in course?" currently in EnrollmentService → move to Course.allowsEnrollment()

---

**Time to complete:** 30 minutes
**Difficulty:** Beginner

Share your answers in the course forum to get feedback from instructors and peers!

---

## Navigation

| Previous | Up | Next |
|----------|-----|------|
| [Lesson 0: GenAI Landscape](lesson-0-genai-landscape.md) | [Course Overview](../00-course-overview.md) | [Lesson 2: Ubiquitous Language](lesson-2-ubiquitous-language.md) |
