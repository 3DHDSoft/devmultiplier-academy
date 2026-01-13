# Module 3, Lesson 4: Domain Services and Factories

**Duration:** 17 minutes
**Learning Objectives:**
- Understand when to use domain services
- Distinguish domain services from application services
- Implement factory patterns for complex object creation
- Recognize the difference between creation and reconstitution
- Apply these patterns appropriately in your domain model

---

## Introduction

Not all business logic belongs in entities or value objects. Sometimes operations involve multiple domain objects, require external dependencies, or simply don't fit naturally into any single entity. This is where domain services come in. Similarly, complex object creation logic often deserves its own abstraction—factories.

## Domain Services

### What is a Domain Service?

**Definition:** A stateless operation that fulfills a domain-specific task which doesn't naturally belong to an entity or value object.

### When to Use Domain Services

```typescript
// ❌ Problem: Behavior doesn't belong in entity
class BankAccount {
  constructor(
    private balance: Money,
    // ... other fields
  ) {}

  // This feels wrong - transfer involves TWO accounts
  transferTo(otherAccount: BankAccount, amount: Money): void {
    this.balance = this.balance.subtract(amount);
    otherAccount.balance = otherAccount.balance.add(amount);
    // Directly modifying other account's state!
    // What if transfer fails halfway?
  }
}

// ✅ Solution: Use domain service
class MoneyTransferService {
  transfer(
    fromAccount: BankAccount,
    toAccount: BankAccount,
    amount: Money
  ): TransferResult {
    // Operation involves multiple entities
    // Coordinated through service

    fromAccount.withdraw(amount);
    toAccount.deposit(amount);

    return TransferResult.success(amount);
  }
}
```

### Characteristics of Domain Services

1. **Stateless** - No instance variables
2. **Domain logic** - Contains business rules
3. **Involves multiple domain objects** - Coordinates operations
4. **Named with ubiquitous language** - Uses domain terminology

```typescript
// ✅ Good domain service
class PricingService {
  calculatePrice(
    product: Product,
    customer: Customer,
    quantity: number
  ): Money {
    let basePrice = product.getPrice().multiply(quantity);

    // Volume discount
    if (quantity >= 10) {
      const discount = Percentage.of(10);
      basePrice = basePrice.subtract(discount.applyToMoney(basePrice));
    }

    // Customer tier discount
    if (customer.isPremium()) {
      const tierDiscount = Percentage.of(5);
      basePrice = basePrice.subtract(tierDiscount.applyToMoney(basePrice));
    }

    return basePrice;
  }
}

// Stateless - no instance variables
// Domain logic - pricing rules
// Involves multiple entities - product and customer
// Domain language - "pricing", not "price calculator service"
```

## Domain Service vs Application Service

### Domain Service (Domain Layer)

```typescript
// Domain service: Contains business logic
class LoanApprovalService {
  canApprove(
    loan: Loan,
    applicant: Applicant,
    creditScore: CreditScore
  ): LoanApprovalDecision {
    // Business rules here
    if (creditScore.value < 650) {
      return LoanApprovalDecision.rejected('Credit score too low');
    }

    const debtToIncomeRatio = applicant.calculateDebtToIncomeRatio();
    if (debtToIncomeRatio.isGreaterThan(Percentage.of(43))) {
      return LoanApprovalDecision.rejected('Debt-to-income ratio too high');
    }

    const loanToValueRatio = loan.calculateLoanToValueRatio();
    if (loanToValueRatio.isGreaterThan(Percentage.of(80))) {
      return LoanApprovalDecision.requiresPMI('LTV exceeds 80%');
    }

    return LoanApprovalDecision.approved();
  }
}
```

### Application Service (Application Layer)

```typescript
// Application service: Orchestrates use case
class LoanApplicationService {
  constructor(
    private readonly loanRepo: LoanRepository,
    private readonly applicantRepo: ApplicantRepository,
    private readonly creditCheckService: CreditCheckService,
    private readonly approvalService: LoanApprovalService, // Domain service
    private readonly emailService: EmailService
  ) {}

  async submitLoanApplication(
    command: SubmitLoanApplicationCommand
  ): Promise<LoanApplicationId> {
    // 1. Load domain objects
    const applicant = await this.applicantRepo.findById(command.applicantId);
    const loan = Loan.create(command.amount, command.term, applicant.getId());

    // 2. Call external service
    const creditScore = await this.creditCheckService.getCreditScore(
      applicant.getSSN()
    );

    // 3. Use domain service
    const decision = this.approvalService.canApprove(loan, applicant, creditScore);

    // 4. Apply decision to aggregate
    if (decision.isApproved()) {
      loan.approve();
    } else {
      loan.reject(decision.getReason());
    }

    // 5. Save
    await this.loanRepo.save(loan);

    // 6. Send notification
    await this.emailService.send(
      applicant.getEmail(),
      decision.isApproved() ? 'Loan Approved' : 'Loan Rejected'
    );

    return loan.getId();
  }
}

// Application service:
// - Orchestrates workflow
// - Manages transactions
// - Calls infrastructure services
// - Thin, no business logic

// Domain service:
// - Contains business rules
// - Pure domain logic
// - No infrastructure dependencies
```

### Key Differences

| Aspect | Domain Service | Application Service |
|--------|---------------|-------------------|
| **Location** | Domain layer | Application layer |
| **Purpose** | Business logic | Orchestration |
| **Dependencies** | Domain objects only | Repositories, infrastructure |
| **State** | Stateless | Stateless |
| **Testability** | Pure unit tests | Integration tests |
| **Example** | PricingService | CheckoutService |

## Common Domain Service Patterns

### Pattern 1: Multi-Entity Coordination

```typescript
// Coordinates operations across multiple entities
class InventoryAllocationService {
  allocate(order: Order, warehouses: Warehouse[]): AllocationResult {
    const allocations: Map<WarehouseId, OrderItem[]> = new Map();

    for (const item of order.getItems()) {
      const warehouse = this.findWarehouseWithStock(
        warehouses,
        item.getProductId(),
        item.getQuantity()
      );

      if (!warehouse) {
        return AllocationResult.failed(
          `Insufficient stock for ${item.getProductName()}`
        );
      }

      const existing = allocations.get(warehouse.getId()) ?? [];
      existing.push(item);
      allocations.set(warehouse.getId(), existing);

      warehouse.reserve(item.getProductId(), item.getQuantity());
    }

    return AllocationResult.success(allocations);
  }

  private findWarehouseWithStock(
    warehouses: Warehouse[],
    productId: ProductId,
    quantity: number
  ): Warehouse | null {
    return warehouses.find(w => w.hasAvailable(productId, quantity)) ?? null;
  }
}
```

### Pattern 2: Complex Calculation

```typescript
// Contains complex calculation logic
class ShippingCostCalculator {
  calculate(
    order: Order,
    origin: Address,
    destination: Address,
    shippingMethod: ShippingMethod
  ): Money {
    const distance = this.calculateDistance(origin, destination);
    const weight = this.calculateTotalWeight(order);
    const volume = this.calculateTotalVolume(order);

    let baseCost = shippingMethod.getBaseCost();

    // Distance-based pricing
    if (distance.isGreaterThan(Distance.miles(500))) {
      baseCost = baseCost.multiply(1.5);
    }

    // Weight surcharge
    if (weight.isGreaterThan(Weight.pounds(50))) {
      const extraWeight = weight.subtract(Weight.pounds(50));
      const surcharge = Money.dollars(0.50).multiply(extraWeight.toPounds());
      baseCost = baseCost.add(surcharge);
    }

    // Oversized surcharge
    if (volume.isGreaterThan(Volume.cubicFeet(10))) {
      baseCost = baseCost.add(Money.dollars(25));
    }

    return baseCost;
  }

  private calculateDistance(from: Address, to: Address): Distance {
    // Distance calculation logic
    return Distance.miles(100); // Simplified
  }

  private calculateTotalWeight(order: Order): Weight {
    return order.getItems()
      .map(item => item.getWeight().multiply(item.getQuantity()))
      .reduce((sum, weight) => sum.add(weight), Weight.pounds(0));
  }

  private calculateTotalVolume(order: Order): Volume {
    return order.getItems()
      .map(item => item.getVolume().multiply(item.getQuantity()))
      .reduce((sum, volume) => sum.add(volume), Volume.cubicFeet(0));
  }
}
```

### Pattern 3: Domain Policy

```typescript
// Encapsulates complex business policy
class DiscountPolicyService {
  calculateDiscount(
    customer: Customer,
    order: Order,
    promotionCode?: PromotionCode
  ): Money {
    let discount = Money.zero('USD');

    // Customer tier discount
    const tierDiscount = this.applyTierDiscount(customer, order);
    discount = discount.add(tierDiscount);

    // Volume discount
    const volumeDiscount = this.applyVolumeDiscount(order);
    discount = discount.add(volumeDiscount);

    // Promotion code discount
    if (promotionCode && promotionCode.isValid()) {
      const promoDiscount = this.applyPromotionDiscount(
        order,
        promotionCode
      );
      discount = discount.add(promoDiscount);
    }

    // First-time customer bonus
    if (customer.isFirstTimeCustomer()) {
      const firstTimeDiscount = order
        .getTotal()
        .multiply(0.1); // 10% off
      discount = discount.add(firstTimeDiscount);
    }

    // Cap discount at 50% of order total
    const maxDiscount = order.getTotal().multiply(0.5);
    if (discount.isGreaterThan(maxDiscount)) {
      discount = maxDiscount;
    }

    return discount;
  }

  private applyTierDiscount(customer: Customer, order: Order): Money {
    const tier = customer.getTier();
    const percentage = tier.getDiscountPercentage();
    return percentage.applyToMoney(order.getTotal());
  }

  private applyVolumeDiscount(order: Order): Money {
    const itemCount = order.getTotalItemCount();

    if (itemCount >= 20) {
      return order.getTotal().multiply(0.15); // 15% off
    } else if (itemCount >= 10) {
      return order.getTotal().multiply(0.10); // 10% off
    }

    return Money.zero('USD');
  }

  private applyPromotionDiscount(
    order: Order,
    code: PromotionCode
  ): Money {
    return code.calculateDiscount(order.getTotal());
  }
}
```

### Pattern 4: Validation Service

```typescript
// Contains complex validation logic
class OrderValidationService {
  validate(order: Order, customer: Customer): ValidationResult {
    const errors: string[] = [];

    // Validate customer can place order
    if (!customer.canPlaceOrders()) {
      errors.push('Customer account is suspended');
    }

    // Validate credit limit
    const creditCheck = this.validateCreditLimit(customer, order);
    if (!creditCheck.isValid()) {
      errors.push(creditCheck.getError());
    }

    // Validate shipping address
    if (!this.isValidShippingAddress(order.getShippingAddress())) {
      errors.push('Invalid shipping address');
    }

    // Validate items
    for (const item of order.getItems()) {
      if (item.getQuantity() > 100) {
        errors.push(`Quantity exceeds maximum for ${item.getProductName()}`);
      }
    }

    return errors.length > 0
      ? ValidationResult.invalid(errors)
      : ValidationResult.valid();
  }

  private validateCreditLimit(customer: Customer, order: Order): ValidationResult {
    const creditLimit = customer.getCreditLimit();
    const currentCredit = customer.getCurrentCreditUsage();
    const orderTotal = order.getTotal();

    const availableCredit = creditLimit.subtract(currentCredit);

    if (orderTotal.isGreaterThan(availableCredit)) {
      return ValidationResult.invalid([
        `Order total ${orderTotal} exceeds available credit ${availableCredit}`
      ]);
    }

    return ValidationResult.valid();
  }

  private isValidShippingAddress(address: Address): boolean {
    // Complex address validation
    // - PO Box restrictions
    // - International shipping rules
    // - Restricted locations
    return true; // Simplified
  }
}
```

## Factories

### What is a Factory?

**Definition:** An object or method responsible for creating complex domain objects while ensuring all invariants are met.

### When to Use Factories

✅ **Complex creation logic**
```typescript
// Factory handles complexity
class OrderFactory {
  createFromCart(cart: ShoppingCart, customer: Customer): Order {
    // Convert cart items to order items
    const orderItems = cart.getItems().map(cartItem =>
      OrderItem.create(
        cartItem.getProduct(),
        cartItem.getQuantity()
      )
    );

    // Use default addresses
    const shippingAddress = customer.getDefaultShippingAddress();
    const billingAddress = customer.getDefaultBillingAddress();

    // Create order
    return Order.create(
      customer.getId(),
      orderItems,
      shippingAddress,
      billingAddress
    );
  }
}
```

✅ **Multiple ways to create**
```typescript
class UserFactory {
  // Create from registration
  createFromRegistration(
    email: Email,
    password: string,
    name: string
  ): User {
    return User.create(
      email,
      this.hashPassword(password),
      UserProfile.create(name),
      UserRole.Customer
    );
  }

  // Create from OAuth
  createFromOAuth(
    provider: OAuthProvider,
    providerId: string,
    email: Email,
    name: string
  ): User {
    return User.createOAuthUser(
      email,
      UserProfile.create(name),
      provider,
      providerId
    );
  }

  // Create admin user
  createAdmin(email: Email, password: string): User {
    return User.create(
      email,
      this.hashPassword(password),
      UserProfile.create('Admin'),
      UserRole.Admin
    );
  }

  private hashPassword(password: string): string {
    return bcrypt.hashSync(password, 10);
  }
}
```

✅ **Reconstitution from database**
```typescript
class OrderFactory {
  // Creating new order
  create(
    customerId: CustomerId,
    items: OrderItem[],
    shippingAddress: Address
  ): Order {
    // Validation happens here
    return Order.create(customerId, items, shippingAddress);
  }

  // Reconstituting from database
  reconstitute(data: OrderData): Order {
    // No validation - trust database state
    return Order.reconstitute(
      OrderId.fromString(data.id),
      CustomerId.fromString(data.customerId),
      data.items.map(i => this.reconstituteItem(i)),
      OrderStatus.fromString(data.status),
      data.createdAt,
      data.updatedAt
    );
  }

  private reconstituteItem(data: OrderItemData): OrderItem {
    return OrderItem.reconstitute(
      ProductId.fromString(data.productId),
      data.productName,
      Money.of(data.price, data.currency),
      data.quantity
    );
  }
}
```

### Creation vs Reconstitution

```typescript
class Order {
  private constructor(
    private readonly id: OrderId,
    private readonly customerId: CustomerId,
    private items: OrderItem[],
    private status: OrderStatus,
    private readonly createdAt: Date,
    private updatedAt: Date
  ) {}

  // Creation: New order with validation
  static create(
    customerId: CustomerId,
    items: OrderItem[],
    shippingAddress: Address
  ): Order {
    // Validate
    if (items.length === 0) {
      throw new DomainError('Order must have items');
    }

    // Set initial state
    return new Order(
      OrderId.generate(),
      customerId,
      items,
      OrderStatus.Draft,
      new Date(),
      new Date()
    );
  }

  // Reconstitution: Load from database
  static reconstitute(
    id: OrderId,
    customerId: CustomerId,
    items: OrderItem[],
    status: OrderStatus,
    createdAt: Date,
    updatedAt: Date
  ): Order {
    // No validation - trust persisted state
    // All parameters provided
    return new Order(
      id,
      customerId,
      items,
      status,
      createdAt,
      updatedAt
    );
  }
}
```

### Factory Method vs Factory Class

```typescript
// ✅ Factory method (simple cases)
class User {
  private constructor(
    private readonly id: UserId,
    private email: Email,
    private passwordHash: string
  ) {}

  static create(email: Email, password: string): User {
    // Simple creation logic in static method
    return new User(
      UserId.generate(),
      email,
      bcrypt.hashSync(password, 10)
    );
  }
}

// ✅ Factory class (complex cases)
class ReservationFactory {
  constructor(
    private readonly pricingService: PricingService,
    private readonly availabilityChecker: AvailabilityChecker
  ) {}

  async createReservation(
    customerId: CustomerId,
    room: Room,
    checkIn: Date,
    checkOut: Date
  ): Promise<Reservation> {
    // Complex logic with dependencies

    // Check availability
    const isAvailable = await this.availabilityChecker.isAvailable(
      room.getId(),
      checkIn,
      checkOut
    );

    if (!isAvailable) {
      throw new DomainError('Room not available for selected dates');
    }

    // Calculate price
    const dateRange = DateRange.create(checkIn, checkOut);
    const price = this.pricingService.calculatePrice(room, dateRange);

    // Create reservation
    return Reservation.create(
      customerId,
      room.getId(),
      dateRange,
      price
    );
  }
}
```

## Real-World Examples

### Example 1: Exchange Rate Service

```typescript
class ExchangeRateService {
  constructor(
    private readonly rateProvider: ExchangeRateProvider
  ) {}

  async convert(
    amount: Money,
    targetCurrency: string
  ): Promise<Money> {
    if (amount.currency === targetCurrency) {
      return amount; // No conversion needed
    }

    const rate = await this.rateProvider.getRate(
      amount.currency,
      targetCurrency
    );

    const convertedAmount = amount.amount * rate;
    return Money.of(convertedAmount, targetCurrency);
  }

  async calculateBestExchangeOption(
    amount: Money,
    targetCurrency: string
  ): Promise<ExchangeOption> {
    const directRate = await this.rateProvider.getRate(
      amount.currency,
      targetCurrency
    );

    // Check if converting through USD is better
    if (amount.currency !== 'USD' && targetCurrency !== 'USD') {
      const toUSDRate = await this.rateProvider.getRate(
        amount.currency,
        'USD'
      );
      const fromUSDRate = await this.rateProvider.getRate(
        'USD',
        targetCurrency
      );
      const indirectRate = toUSDRate * fromUSDRate;

      if (indirectRate > directRate) {
        return ExchangeOption.indirect('USD', indirectRate);
      }
    }

    return ExchangeOption.direct(directRate);
  }
}
```

### Example 2: Product Factory

```typescript
class ProductFactory {
  constructor(
    private readonly categoryRepo: CategoryRepository,
    private readonly brandRepo: BrandRepository
  ) {}

  async createPhysicalProduct(
    name: string,
    sku: ProductSKU,
    price: Money,
    categoryId: CategoryId,
    brandId: BrandId,
    weight: Weight,
    dimensions: Dimensions
  ): Promise<Product> {
    // Validate category exists
    const category = await this.categoryRepo.findById(categoryId);
    if (!category) {
      throw new DomainError('Category not found');
    }

    // Validate brand exists
    const brand = await this.brandRepo.findById(brandId);
    if (!brand) {
      throw new DomainError('Brand not found');
    }

    // Create product
    return Product.createPhysical(
      name,
      sku,
      price,
      categoryId,
      brandId,
      weight,
      dimensions
    );
  }

  createDigitalProduct(
    name: string,
    sku: ProductSKU,
    price: Money,
    categoryId: CategoryId,
    downloadUrl: URL
  ): Product {
    // Digital products don't need weight/dimensions
    return Product.createDigital(
      name,
      sku,
      price,
      categoryId,
      downloadUrl
    );
  }

  createSubscriptionProduct(
    name: string,
    sku: ProductSKU,
    price: Money,
    categoryId: CategoryId,
    billingPeriod: BillingPeriod
  ): Product {
    return Product.createSubscription(
      name,
      sku,
      price,
      categoryId,
      billingPeriod
    );
  }
}
```

## AI Integration Guidance

**Good Prompt for Domain Service:**
```
Create a DDD domain service for FraudDetection in a payment system. Include:
- Method: checkTransaction(transaction, customer, merchant)
- Business rules:
  - Flag if amount > customer's usual transaction size by 5x
  - Flag if multiple transactions from different locations within 1 hour
  - Flag if merchant is on watchlist
  - Calculate risk score (0-100)
- Return FraudCheckResult with risk score and reasons
- TypeScript with strict types
```

**Good Prompt for Factory:**
```
Create a factory for creating Invoice aggregates from Order. Include:
- Convert order items to invoice line items
- Calculate taxes based on shipping address
- Apply payment terms based on customer type
- Generate invoice number
- Handle both creation and reconstitution
- TypeScript with proper validation
```

## Common Pitfalls

### 1. Anemic Domain Services

```typescript
// ❌ Wrong: Just data transformation
class OrderConverter {
  toDTO(order: Order): OrderDTO {
    return {
      id: order.id,
      total: order.total,
      // ... mapping
    };
  }
}

// This is not a domain service - no business logic
// This is infrastructure concern
```

### 2. God Services

```typescript
// ❌ Wrong: Too much responsibility
class OrderService {
  createOrder() { }
  validateOrder() { }
  calculateShipping() { }
  applyDiscount() { }
  processPayment() { }
  sendNotification() { }
  updateInventory() { }
  // ... 50 more methods
}

// ✅ Correct: Split into focused services
class OrderPricingService { }
class ShippingCalculator { }
class DiscountPolicyService { }
```

### 3. Domain Service with State

```typescript
// ❌ Wrong: Stateful domain service
class OrderProcessor {
  private currentOrder: Order; // State!

  setOrder(order: Order) {
    this.currentOrder = order;
  }

  process() {
    // Uses stored state
  }
}

// ✅ Correct: Stateless domain service
class OrderProcessor {
  process(order: Order): ProcessResult {
    // Takes order as parameter
    // No state
  }
}
```

## Key Takeaways

1. **Domain services for multi-entity operations** - Logic that doesn't belong to one entity
2. **Keep domain services stateless** - No instance variables
3. **Domain vs application services** - Business logic vs orchestration
4. **Factories for complex creation** - Encapsulate creation complexity
5. **Creation vs reconstitution** - New objects validate, loaded objects trust database
6. **Use ubiquitous language** - Name services from domain vocabulary
7. **Avoid anemic services** - Services should contain business logic

## Next Steps

In the next lesson, we'll explore **Repositories and Persistence**—how to save and retrieve aggregates, integrate with ORMs, and maintain the aggregate boundary during persistence.

## Hands-On Exercise

**Implement a Domain Service and Factory:**

1. **Domain Service: SeatAllocationService**
   - Allocate seats for a flight reservation
   - Rules:
     - Groups should sit together
     - Premium customers get premium seats
     - Families with children get front rows
   - Method: allocateSeats(reservation, flight, passengers)

2. **Factory: InvoiceFactory**
   - Create invoice from completed order
   - Calculate taxes based on address
   - Apply payment terms (Net 30, Net 60)
   - Generate invoice number (format: INV-YYYY-NNNNNN)

Try implementing yourself first!

---

**Time to complete:** 45 minutes
**Difficulty:** Intermediate

Share your implementation in the course forum!
