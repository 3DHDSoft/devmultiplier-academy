# Aggregates and Consistency Boundaries

**Duration:** 20 minutes
**Learning Objectives:**
- Understand what aggregates are and why they matter
- Identify aggregate roots and their responsibilities
- Define consistency boundaries correctly
- Recognize proper aggregate sizing
- Understand transactional boundaries

---

## Introduction

Aggregates are one of the most important—and most misunderstood—patterns in DDD. They define consistency boundaries in your domain, determine transaction scopes, and shape how your system scales. Get aggregates wrong, and you'll face either data inconsistencies or performance bottlenecks. Get them right, and your system will be both consistent and scalable.

## What is an Aggregate?

**Definition:** A cluster of domain objects (entities and value objects) that can be treated as a single unit for data changes. Each aggregate has a root entity (the aggregate root) that serves as the sole entry point for modifications.

### The Problem Without Aggregates

```typescript
// ❌ No aggregate boundaries - chaos
class Order {
  constructor(
    public id: string,
    public customerId: string,
    public items: OrderItem[]
  ) {}
}

class OrderItem {
  constructor(
    public id: string,
    public orderId: string,
    public productId: string,
    public quantity: number,
    public price: number
  ) {}
}

// Code scattered everywhere
async function addItemToOrder(orderId: string, productId: string) {
  const order = await orderRepo.findById(orderId);
  const product = await productRepo.findById(productId);

  // Direct access to items - no validation!
  const item = new OrderItem(
    randomUUID(),
    orderId,
    productId,
    1,
    product.price
  );

  await orderItemRepo.save(item); // Saved separately!

  // Order might be in invalid state
  // What if order is already submitted?
  // What if product is out of stock?
  // No invariant enforcement!
}

// Another place in the code
async function updateItemQuantity(itemId: string, quantity: number) {
  const item = await orderItemRepo.findById(itemId);
  item.quantity = quantity; // Direct modification!
  await orderItemRepo.save(item);

  // Order total not recalculated
  // No validation of order status
  // Consistency broken!
}
```

### The Solution: Aggregates

```typescript
// ✅ Order aggregate with clear boundaries
class Order {
  private constructor(
    private readonly id: OrderId,
    private readonly customerId: CustomerId,
    private items: OrderItem[], // Part of aggregate
    private status: OrderStatus
  ) {}

  // Aggregate root enforces all rules
  addItem(product: Product, quantity: number): void {
    this.ensureCanModify();

    const existingItem = this.findItemByProduct(product.getId());
    if (existingItem) {
      existingItem.increaseQuantity(quantity);
    } else {
      this.items.push(OrderItem.create(product, quantity));
    }

    // Invariants maintained by aggregate
  }

  removeItem(productId: ProductId): void {
    this.ensureCanModify();
    this.items = this.items.filter(
      item => !item.getProductId().equals(productId)
    );

    if (this.items.length === 0) {
      throw new DomainError('Order must have at least one item');
    }
  }

  submit(): OrderSubmitted {
    this.ensureHasItems();
    this.status = OrderStatus.Submitted;
    return new OrderSubmitted(this.id, this.calculateTotal());
  }

  private ensureCanModify(): void {
    if (this.status !== OrderStatus.Draft) {
      throw new DomainError('Cannot modify submitted orders');
    }
  }

  private ensureHasItems(): void {
    if (this.items.length === 0) {
      throw new DomainError('Cannot submit empty order');
    }
  }
}

// OrderItem is NOT directly accessible from outside
class OrderItem {
  private constructor(
    private readonly productId: ProductId,
    private readonly productName: string,
    private readonly price: Money,
    private quantity: number
  ) {}

  static create(product: Product, quantity: number): OrderItem {
    if (quantity <= 0) {
      throw new DomainError('Quantity must be positive');
    }
    return new OrderItem(
      product.getId(),
      product.getName(),
      product.getPrice(),
      quantity
    );
  }

  increaseQuantity(amount: number): void {
    this.quantity += amount;
  }

  getProductId(): ProductId {
    return this.productId;
  }

  calculateSubtotal(): Money {
    return this.price.multiply(this.quantity);
  }
}

// Repository only for aggregate root
interface OrderRepository {
  save(order: Order): Promise<void>; // Saves entire aggregate
  findById(id: OrderId): Promise<Order | null>;
}

// No OrderItemRepository!
// Items are always saved/loaded with their Order
```

## Aggregate Characteristics

### 1. Single Entry Point (Aggregate Root)

```typescript
// ✅ All modifications go through the aggregate root
class ShoppingCart {
  private constructor(
    private readonly id: CartId,
    private readonly customerId: CustomerId,
    private items: Map<ProductId, CartItem>
  ) {}

  // Public API of the aggregate
  addProduct(product: Product, quantity: number): void {
    const productId = product.getId();
    const existing = this.items.get(productId);

    if (existing) {
      existing.increaseQuantity(quantity);
    } else {
      this.items.set(
        productId,
        CartItem.create(product, quantity)
      );
    }
  }

  removeProduct(productId: ProductId): void {
    if (!this.items.has(productId)) {
      throw new DomainError('Product not in cart');
    }
    this.items.delete(productId);
  }

  updateQuantity(productId: ProductId, quantity: number): void {
    const item = this.items.get(productId);
    if (!item) {
      throw new DomainError('Product not in cart');
    }

    if (quantity <= 0) {
      this.items.delete(productId);
    } else {
      item.setQuantity(quantity);
    }
  }

  clear(): void {
    this.items.clear();
  }

  getTotal(): Money {
    return Array.from(this.items.values())
      .map(item => item.calculateSubtotal())
      .reduce((sum, subtotal) => sum.add(subtotal), Money.dollars(0));
  }

  // Internal entities not exposed
  // ❌ Don't expose: getItems(): CartItem[]
  // ✅ Expose only what's needed
  hasItems(): boolean {
    return this.items.size > 0;
  }
}

// CartItem is internal to the aggregate
class CartItem {
  private constructor(
    private readonly productId: ProductId,
    private readonly productName: string,
    private readonly price: Money,
    private quantity: number
  ) {}

  // Package-private (only Cart can call these)
  increaseQuantity(amount: number): void {
    this.quantity += amount;
  }

  setQuantity(quantity: number): void {
    this.quantity = quantity;
  }

  calculateSubtotal(): Money {
    return this.price.multiply(this.quantity);
  }
}
```

### 2. Consistency Boundary

```typescript
// ✅ All invariants enforced within aggregate
class BankAccount {
  private constructor(
    private readonly id: AccountId,
    private readonly accountNumber: AccountNumber,
    private balance: Money,
    private status: AccountStatus,
    private overdraftLimit: Money
  ) {}

  // Invariant: Balance can't go below negative overdraft limit
  withdraw(amount: Money): AccountWithdrawn {
    this.ensureActive();
    this.ensureSameCurrency(amount);

    const newBalance = this.balance.subtract(amount);
    const minimumBalance = Money.zero(this.balance.currency).subtract(
      this.overdraftLimit
    );

    if (newBalance.isLessThan(minimumBalance)) {
      throw new DomainError('Insufficient funds including overdraft');
    }

    this.balance = newBalance;
    return new AccountWithdrawn(this.id, amount, this.balance);
  }

  // Invariant: Can't close account with non-zero balance
  close(): AccountClosed {
    if (!this.balance.isZero()) {
      throw new DomainError('Cannot close account with non-zero balance');
    }

    this.status = AccountStatus.Closed;
    return new AccountClosed(this.id);
  }

  private ensureActive(): void {
    if (this.status !== AccountStatus.Active) {
      throw new DomainError('Account is not active');
    }
  }
}
```

### 3. Transactional Boundary

```typescript
// ✅ One transaction per aggregate
class OrderService {
  async placeOrder(command: PlaceOrderCommand): Promise<OrderId> {
    return await this.unitOfWork.execute(async () => {
      // Load aggregate
      const order = await this.orderRepo.findById(command.orderId);

      // Modify aggregate
      const event = order.submit();

      // Save aggregate (atomic)
      await this.orderRepo.save(order);

      // Publish events (after commit)
      await this.eventBus.publish(event);

      return order.getId();
    });
    // Everything in one transaction
  }
}

// ❌ Don't modify multiple aggregates in one transaction
class BadOrderService {
  async placeOrder(command: PlaceOrderCommand): Promise<void> {
    // Anti-pattern: Modifying multiple aggregates
    const order = await this.orderRepo.findById(command.orderId);
    const customer = await this.customerRepo.findById(order.getCustomerId());
    const inventory = await this.inventoryRepo.findByProduct(
      order.getProductId()
    );

    // Multiple aggregates modified together
    order.submit();
    customer.recordPurchase(order.getTotal());
    inventory.reserve(order.getQuantity());

    // Large transaction, locks multiple aggregates
    await this.orderRepo.save(order);
    await this.customerRepo.save(customer);
    await this.inventoryRepo.save(inventory);
  }
}

// ✅ Use eventual consistency between aggregates
class GoodOrderService {
  async placeOrder(command: PlaceOrderCommand): Promise<void> {
    // Modify only Order aggregate
    const order = await this.orderRepo.findById(command.orderId);
    const event = order.submit();
    await this.orderRepo.save(order);

    // Publish event for other aggregates
    await this.eventBus.publish(event);
  }
}

// Separate handlers for other aggregates
class OrderSubmittedHandler {
  async handle(event: OrderSubmitted): Promise<void> {
    // Update Customer aggregate in separate transaction
    const customer = await this.customerRepo.findById(event.customerId);
    customer.recordPurchase(event.total);
    await this.customerRepo.save(customer);
  }
}

class InventoryHandler {
  async handle(event: OrderSubmitted): Promise<void> {
    // Update Inventory aggregate in separate transaction
    for (const item of event.items) {
      const inventory = await this.inventoryRepo.findByProduct(item.productId);
      inventory.reserve(item.quantity);
      await this.inventoryRepo.save(inventory);
    }
  }
}
```

## Identifying Aggregates

### Question 1: What Needs to Be Consistent?

```typescript
// Example: Order and OrderItems must be consistent
// They form one aggregate

class Order {
  private items: OrderItem[] = [];

  // Items must be consistent with order status
  addItem(item: OrderItem): void {
    if (this.status !== OrderStatus.Draft) {
      throw new DomainError('Cannot modify submitted orders');
    }
    this.items.push(item);
  }

  // Order total must match sum of items
  calculateTotal(): Money {
    return this.items
      .map(i => i.calculateSubtotal())
      .reduce((sum, subtotal) => sum.add(subtotal), Money.dollars(0));
  }

  // Submitting order validates all items
  submit(): void {
    if (this.items.length === 0) {
      throw new DomainError('Cannot submit empty order');
    }
    this.status = OrderStatus.Submitted;
  }
}
```

### Question 2: What Has an Independent Lifecycle?

```typescript
// Product and Inventory are separate aggregates
// They have independent lifecycles

class Product {
  // Product can exist without inventory
  constructor(
    private readonly id: ProductId,
    private name: string,
    private description: string,
    private price: Money
  ) {}

  updatePrice(newPrice: Money): void {
    this.price = newPrice;
    // Doesn't affect inventory
  }
}

class InventoryItem {
  // Inventory can be tracked separately
  constructor(
    private readonly productId: ProductId,
    private quantityOnHand: number,
    private reorderPoint: number
  ) {}

  adjustQuantity(delta: number): void {
    this.quantityOnHand += delta;
    // Doesn't affect product details
  }
}

// Separate repositories
interface ProductRepository {
  save(product: Product): Promise<void>;
}

interface InventoryRepository {
  save(inventory: InventoryItem): Promise<void>;
}
```

### Question 3: What Can Change Independently?

```typescript
// Author and Book are separate aggregates
// They can change independently

class Author {
  constructor(
    private readonly id: AuthorId,
    private name: string,
    private bio: string
  ) {}

  updateBio(newBio: string): void {
    this.bio = newBio;
    // Doesn't affect existing books
  }
}

class Book {
  constructor(
    private readonly id: BookId,
    private title: string,
    private authorId: AuthorId, // Reference by ID
    private isbn: ISBN,
    private publishedDate: Date
  ) {}

  updateTitle(newTitle: string): void {
    this.title = newTitle;
    // Doesn't affect author
  }
}

// Reference by ID, not by entity
// Load separately when needed
```

## Aggregate Sizing

### Too Large: The God Aggregate

```typescript
// ❌ Too large - includes everything
class Customer {
  private orders: Order[] = []; // All orders!
  private addresses: Address[] = [];
  private paymentMethods: PaymentMethod[] = [];
  private preferences: CustomerPreferences;
  private loyaltyPoints: LoyaltyProgram;
  private supportTickets: Ticket[] = []; // All tickets!
  private reviewsWritten: Review[] = []; // All reviews!

  // Problems:
  // 1. Loading customer loads everything
  // 2. Updating preferences locks all orders
  // 3. Can't process orders concurrently (same aggregate)
  // 4. Transaction grows huge
  // 5. Performance nightmare
}
```

### Too Small: Anemic Aggregates

```typescript
// ❌ Too small - every entity is an aggregate
class Order {
  // Just a container, no behavior
  constructor(
    public orderId: OrderId,
    public customerId: CustomerId,
    public status: OrderStatus
  ) {}
}

class OrderItem {
  // Separate aggregate for item
  constructor(
    public itemId: ItemId,
    public orderId: OrderId, // FK
    public productId: ProductId,
    public quantity: number
  ) {}
}

// Problems:
// 1. No consistency between order and items
// 2. Can modify items after order submitted
// 3. Order total can be wrong
// 4. Complex coordination code
```

### Just Right: Cohesive Aggregates

```typescript
// ✅ Right size - order and its items
class Order {
  private constructor(
    private readonly id: OrderId,
    private readonly customerId: CustomerId,
    private items: OrderItem[], // Part of aggregate
    private status: OrderStatus
  ) {}

  // Clear boundaries
  // Enforced invariants
  // One transaction
  // Reasonable size
}

// ✅ Customer is separate aggregate
class Customer {
  private constructor(
    private readonly id: CustomerId,
    private name: string,
    private email: Email,
    private creditLimit: Money
  ) {}

  // Customer doesn't include orders
  // Orders reference customer by ID
}

// ✅ Product is separate aggregate
class Product {
  private constructor(
    private readonly id: ProductId,
    private name: string,
    private price: Money
  ) {}

  // Product doesn't include orders
  // Orders reference product by ID
}
```

## Rules for Aggregate Design

### Rule 1: Design Small Aggregates

```typescript
// ✅ Prefer smaller aggregates
class Reservation {
  private constructor(
    private readonly id: ReservationId,
    private readonly flightId: FlightId, // Reference by ID
    private readonly passengerId: PassengerId, // Reference by ID
    private seatNumber: SeatNumber,
    private status: ReservationStatus
  ) {}
}

// Don't include Flight and Passenger entities
// Reference them by ID
```

### Rule 2: Reference Other Aggregates by ID

```typescript
// ✅ Reference by ID
class Order {
  constructor(
    private readonly customerId: CustomerId, // ID only
    private readonly items: OrderItem[]
  ) {}
}

// ❌ Don't embed other aggregates
class Order {
  constructor(
    private readonly customer: Customer, // Full entity
    private readonly items: OrderItem[]
  ) {}
  // Now Order includes entire Customer aggregate
  // Modifying customer locks order
}
```

### Rule 3: Use Eventual Consistency Between Aggregates

```typescript
// ✅ Eventual consistency via events
class OrderService {
  async submitOrder(orderId: OrderId): Promise<void> {
    // Update Order aggregate
    const order = await this.orderRepo.findById(orderId);
    const event = order.submit();
    await this.orderRepo.save(order);

    // Publish event for other aggregates
    await this.eventBus.publish(event);
  }
}

class InventoryService {
  async handleOrderSubmitted(event: OrderSubmitted): Promise<void> {
    // Update Inventory aggregate eventually
    for (const item of event.items) {
      const inventory = await this.inventoryRepo.findByProduct(item.productId);
      inventory.reserve(item.quantity);
      await this.inventoryRepo.save(inventory);
    }
  }
}

// Order and Inventory are eventually consistent
// Not updated in same transaction
```

### Rule 4: Protect Invariants Within Boundaries

```typescript
// ✅ Aggregate protects its invariants
class ShoppingCart {
  private items: Map<ProductId, CartItem>;
  private readonly maxItems = 50; // Invariant

  addProduct(product: Product, quantity: number): void {
    const currentItemCount = this.items.size;

    if (currentItemCount >= this.maxItems) {
      throw new DomainError('Cart cannot exceed 50 items');
    }

    // Invariant protected
    this.items.set(product.getId(), CartItem.create(product, quantity));
  }
}

// ❌ Don't protect invariants across aggregates
class ShoppingCart {
  addProduct(product: Product, quantity: number): void {
    // Checking inventory here creates coupling
    const inventory = await this.inventoryRepo.find(product.getId());
    if (inventory.quantityOnHand < quantity) {
      throw new Error('Out of stock'); // Bad!
    }
  }
}

// ✅ Check inventory constraints in application service
class CartService {
  async addProductToCart(
    cartId: CartId,
    product: Product,
    quantity: number
  ): Promise<void> {
    // Check inventory first (separate aggregate)
    const inventory = await this.inventoryRepo.find(product.getId());
    if (!inventory.hasAvailable(quantity)) {
      throw new ApplicationError('Product out of stock');
    }

    // Then modify cart aggregate
    const cart = await this.cartRepo.findById(cartId);
    cart.addProduct(product, quantity);
    await this.cartRepo.save(cart);
  }
}
```

## Real-World Examples

### Example 1: Order Aggregate

```typescript
class Order {
  private constructor(
    private readonly id: OrderId,
    private readonly customerId: CustomerId, // Reference by ID
    private items: OrderItem[], // Part of aggregate
    private shippingAddress: Address, // Value object
    private status: OrderStatus,
    private placedAt: Date | null
  ) {}

  static create(
    customerId: CustomerId,
    items: OrderItem[],
    shippingAddress: Address
  ): Order {
    if (items.length === 0) {
      throw new DomainError('Order must have items');
    }

    return new Order(
      OrderId.generate(),
      customerId,
      items,
      shippingAddress,
      OrderStatus.Draft,
      null
    );
  }

  addItem(product: Product, quantity: number): void {
    this.ensureStatus(OrderStatus.Draft);

    const existing = this.findItemByProduct(product.getId());
    if (existing) {
      existing.increaseQuantity(quantity);
    } else {
      this.items.push(OrderItem.create(product, quantity));
    }
  }

  removeItem(productId: ProductId): void {
    this.ensureStatus(OrderStatus.Draft);
    this.items = this.items.filter(
      item => !item.getProductId().equals(productId)
    );

    if (this.items.length === 0) {
      throw new DomainError('Order must have items');
    }
  }

  updateShippingAddress(address: Address): void {
    this.ensureStatus(OrderStatus.Draft);
    this.shippingAddress = address;
  }

  place(): OrderPlaced {
    this.ensureStatus(OrderStatus.Draft);
    this.ensureHasItems();

    this.status = OrderStatus.Placed;
    this.placedAt = new Date();

    return new OrderPlaced(
      this.id,
      this.customerId,
      this.items.map(i => i.toSnapshot()),
      this.calculateTotal()
    );
  }

  cancel(): OrderCancelled {
    if (this.status === OrderStatus.Shipped) {
      throw new DomainError('Cannot cancel shipped order');
    }

    this.status = OrderStatus.Cancelled;
    return new OrderCancelled(this.id);
  }

  private calculateTotal(): Money {
    return this.items
      .map(i => i.calculateSubtotal())
      .reduce((sum, subtotal) => sum.add(subtotal), Money.dollars(0));
  }

  private ensureStatus(expected: OrderStatus): void {
    if (this.status !== expected) {
      throw new DomainError(`Expected status ${expected}, was ${this.status}`);
    }
  }

  private ensureHasItems(): void {
    if (this.items.length === 0) {
      throw new DomainError('Order must have items');
    }
  }
}

// Aggregate boundary: Order + OrderItems
// References by ID: CustomerId
// Value objects: Address, Money
// One repository: OrderRepository
```

### Example 2: Account Aggregate

```typescript
class Account {
  private constructor(
    private readonly id: AccountId,
    private readonly accountNumber: AccountNumber,
    private balance: Money,
    private transactions: Transaction[], // Part of aggregate
    private status: AccountStatus
  ) {}

  static open(accountNumber: AccountNumber, initialDeposit: Money): Account {
    if (initialDeposit.isNegative()) {
      throw new DomainError('Initial deposit cannot be negative');
    }

    const account = new Account(
      AccountId.generate(),
      accountNumber,
      initialDeposit,
      [],
      AccountStatus.Active
    );

    account.transactions.push(
      Transaction.createDeposit(initialDeposit, 'Initial deposit')
    );

    return account;
  }

  deposit(amount: Money, description: string): AccountDeposited {
    this.ensureActive();
    this.ensureSameCurrency(amount);

    if (amount.isNegativeOrZero()) {
      throw new DomainError('Deposit amount must be positive');
    }

    this.balance = this.balance.add(amount);
    this.transactions.push(Transaction.createDeposit(amount, description));

    return new AccountDeposited(this.id, amount, this.balance);
  }

  withdraw(amount: Money, description: string): AccountWithdrawn {
    this.ensureActive();
    this.ensureSameCurrency(amount);

    if (amount.isNegativeOrZero()) {
      throw new DomainError('Withdrawal amount must be positive');
    }

    if (this.balance.isLessThan(amount)) {
      throw new DomainError('Insufficient funds');
    }

    this.balance = this.balance.subtract(amount);
    this.transactions.push(Transaction.createWithdrawal(amount, description));

    return new AccountWithdrawn(this.id, amount, this.balance);
  }

  close(): AccountClosed {
    if (!this.balance.isZero()) {
      throw new DomainError('Cannot close account with non-zero balance');
    }

    this.status = AccountStatus.Closed;
    return new AccountClosed(this.id);
  }

  private ensureActive(): void {
    if (this.status !== AccountStatus.Active) {
      throw new DomainError('Account is not active');
    }
  }
}

class Transaction {
  private constructor(
    private readonly type: TransactionType,
    private readonly amount: Money,
    private readonly description: string,
    private readonly timestamp: Date
  ) {}

  static createDeposit(amount: Money, description: string): Transaction {
    return new Transaction(TransactionType.Deposit, amount, description, new Date());
  }

  static createWithdrawal(amount: Money, description: string): Transaction {
    return new Transaction(TransactionType.Withdrawal, amount, description, new Date());
  }
}

// Aggregate boundary: Account + Transactions
// One repository: AccountRepository
// Keep recent transactions in aggregate (e.g., last 10)
// Archive old transactions separately if needed
```

## AI Integration Guidance

**Good Prompt:**
```
Design a DDD aggregate for a Ticket in a customer support system. Include:
- TicketId as aggregate root
- Comments as entities within aggregate
- Status (Open, InProgress, Resolved, Closed)
- Methods: addComment, assign, resolve, reopen, close
- Invariants:
  - Cannot add comments to closed tickets
  - Cannot reopen resolved tickets without reason
  - Must have at least one comment
- Domain events for all state changes
- TypeScript with strict types
```

**AI Can Help:**
- Generating aggregate structure
- Creating invariant validation
- Implementing state transitions
- Writing domain events

**AI Cannot Replace:**
- Identifying aggregate boundaries
- Deciding what belongs in aggregate
- Understanding consistency requirements
- Determining transaction boundaries

## Common Pitfalls

### 1. Too Large Aggregates

```typescript
// ❌ Customer includes everything
class Customer {
  private orders: Order[] = []; // Bad!
  private reviews: Review[] = []; // Bad!
  private supportTickets: Ticket[] = []; // Bad!
}

// ✅ Customer is focused
class Customer {
  private readonly id: CustomerId;
  private name: string;
  private email: Email;
  // Orders, reviews, tickets are separate aggregates
}
```

### 2. Modifying Multiple Aggregates in One Transaction

```typescript
// ❌ Locking multiple aggregates
async function transferFunds(
  fromAccountId: AccountId,
  toAccountId: AccountId,
  amount: Money
): Promise<void> {
  const fromAccount = await accountRepo.findById(fromAccountId);
  const toAccount = await accountRepo.findById(toAccountId);

  fromAccount.withdraw(amount);
  toAccount.deposit(amount);

  // Both locked in one transaction
  await accountRepo.save(fromAccount);
  await accountRepo.save(toAccount);
}

// ✅ Use saga or eventual consistency
async function transferFunds(
  fromAccountId: AccountId,
  toAccountId: AccountId,
  amount: Money
): Promise<void> {
  const transfer = Transfer.initiate(fromAccountId, toAccountId, amount);
  await transferRepo.save(transfer);

  // Transfer saga coordinates two separate transactions
}
```

### 3. Exposing Internal Entities

```typescript
// ❌ Exposing internal entities
class Order {
  getItems(): OrderItem[] {
    return this.items; // Mutable reference!
  }
}

// Caller can bypass aggregate
order.getItems().push(new OrderItem(...)); // Bad!

// ✅ Proper encapsulation
class Order {
  addItem(product: Product, quantity: number): void {
    // Controlled access through aggregate root
  }

  getItemCount(): number {
    return this.items.length;
  }

  calculateTotal(): Money {
    return this.items
      .map(i => i.calculateSubtotal())
      .reduce((sum, st) => sum.add(st), Money.dollars(0));
  }
}
```

## Key Takeaways

1. **Aggregates define consistency boundaries** - What must be consistent together
2. **One aggregate per transaction** - Don't modify multiple aggregates together
3. **Reference other aggregates by ID** - Don't embed other aggregates
4. **Design small aggregates** - Minimize what needs to be consistent
5. **Use eventual consistency between aggregates** - Coordinate via events
6. **Aggregate root controls all access** - No direct access to internal entities
7. **One repository per aggregate** - Save/load as a unit

## Next Steps

In the next lesson, we'll explore **Domain Services and Factories**—when to extract logic from aggregates and how to create complex domain objects.

## Hands-On Exercise

**Design an Aggregate:**

Design a `Course` aggregate for an online learning platform:

Requirements:
- Course has modules (ordered)
- Each module has lessons (ordered)
- Students can enroll in course
- Track completion progress per student
- Cannot modify published courses

Questions to answer:
1. What is the aggregate root?
2. What entities/value objects are part of the aggregate?
3. What should be referenced by ID?
4. What are the key invariants?
5. What methods should the aggregate root expose?

Try designing it yourself first, then check the solution below.

**Solution:**

```typescript
// Aggregate root
class Course {
  private constructor(
    private readonly id: CourseId,
    private title: string,
    private modules: CourseModule[], // Part of aggregate
    private status: CourseStatus
  ) {}

  static create(title: string, modules: CourseModule[]): Course {
    if (!title?.trim()) {
      throw new DomainError('Course title required');
    }
    if (modules.length === 0) {
      throw new DomainError('Course must have modules');
    }

    return new Course(
      CourseId.generate(),
      title,
      modules,
      CourseStatus.Draft
    );
  }

  addModule(module: CourseModule): void {
    this.ensureStatus(CourseStatus.Draft);
    this.modules.push(module);
  }

  reorderModules(moduleOrder: ModuleId[]): void {
    this.ensureStatus(CourseStatus.Draft);
    // Reordering logic
  }

  publish(): CoursePublished {
    this.ensureStatus(CourseStatus.Draft);
    this.ensureHasContent();

    this.status = CourseStatus.Published;
    return new CoursePublished(this.id, this.title);
  }

  private ensureHasContent(): void {
    if (this.modules.length === 0) {
      throw new DomainError('Cannot publish empty course');
    }
    if (this.modules.some(m => m.getLessonCount() === 0)) {
      throw new DomainError('All modules must have lessons');
    }
  }
}

class CourseModule {
  constructor(
    private readonly id: ModuleId,
    private title: string,
    private lessons: Lesson[], // Part of aggregate
    private order: number
  ) {}

  getLessonCount(): number {
    return this.lessons.length;
  }
}

class Lesson {
  constructor(
    private readonly id: LessonId,
    private title: string,
    private content: string,
    private order: number
  ) {}
}

// Separate aggregate for enrollment/progress
class Enrollment {
  private constructor(
    private readonly id: EnrollmentId,
    private readonly courseId: CourseId, // Reference by ID
    private readonly studentId: StudentId, // Reference by ID
    private progress: Map<LessonId, LessonProgress>
  ) {}

  markLessonComplete(lessonId: LessonId): void {
    const progress = this.progress.get(lessonId) ?? LessonProgress.notStarted();
    progress.markComplete();
    this.progress.set(lessonId, progress);
  }
}

// Two aggregates:
// 1. Course (with modules and lessons)
// 2. Enrollment (with progress)
//
// They reference each other by ID
// Updated in separate transactions
```

---

**Time to complete:** 60 minutes
**Difficulty:** Advanced

Share your design in the course forum!
