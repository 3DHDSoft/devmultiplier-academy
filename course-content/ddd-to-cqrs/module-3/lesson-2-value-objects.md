# Module 3, Lesson 2: Value Objects

**Duration:** 18 minutes
**Learning Objectives:**
- Understand the characteristics of value objects
- Recognize when to use value objects vs primitives
- Implement common value object patterns
- Apply value object validation effectively

---

## Introduction

Value objects are the unsung heroes of domain modeling. While entities get most of the attention, value objects often make up the majority of your domain model. They represent descriptive aspects of your domain that have no conceptual identity—they're defined entirely by their attributes.

## What is a Value Object?

**Definition:** An object that represents a descriptive aspect of the domain with no conceptual identity. Two value objects are equal if their attributes are equal.

### The Problem with Primitives

```typescript
// ❌ Primitive Obsession - the anti-pattern
class Order {
  constructor(
    public customerId: string,
    public customerEmail: string, // What format? Validated?
    public totalAmount: number, // What currency? Can be negative?
    public shippingStreet: string,
    public shippingCity: string,
    public shippingZip: string, // These 3 should be grouped
    public billingStreet: string,
    public billingCity: string,
    public billingZip: string
  ) {}

  // Validation scattered everywhere
  setCustomerEmail(email: string) {
    if (!email.includes('@')) {
      throw new Error('Invalid email');
    }
    this.customerEmail = email;
  }
}

// Problems:
// 1. No type safety (can pass any string anywhere)
// 2. Validation duplicated across codebase
// 3. No domain meaning (what is "string"?)
// 4. Easy to make mistakes (swap street and city)
```

### The Value Object Solution

```typescript
// ✅ Rich domain model with value objects
class Order {
  constructor(
    private readonly customerId: CustomerId,
    private customerEmail: Email, // Self-validating
    private totalAmount: Money, // Currency-aware
    private shippingAddress: Address, // Cohesive concept
    private billingAddress: Address
  ) {}

  updateEmail(email: Email): void {
    // Email is already validated
    this.customerEmail = email;
  }

  updateShippingAddress(address: Address): void {
    // Address is already validated and complete
    this.shippingAddress = address;
  }
}

// Type safety prevents mistakes
const order = new Order(
  customerId,
  Email.fromString('user@example.com'), // Validates format
  Money.dollars(99.99), // Clear currency
  Address.create('123 Main St', 'Boston', '02101'),
  Address.create('456 Oak Ave', 'Cambridge', '02138')
);
```

## Characteristics of Value Objects

### 1. Immutability

```typescript
// ✅ Immutable value object
class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string
  ) {
    Object.freeze(this); // Enforce immutability
  }

  add(other: Money): Money {
    this.ensureSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  // No setters - create new instance instead
}

// Usage
const price1 = new Money(10, 'USD');
const price2 = new Money(5, 'USD');
const total = price1.add(price2); // Returns new Money(15, 'USD')
// price1 and price2 remain unchanged
```

### 2. Equality by Value

```typescript
// ✅ Value objects are equal if their attributes are equal
class Address {
  constructor(
    public readonly street: string,
    public readonly city: string,
    public readonly zipCode: string
  ) {}

  equals(other: Address): boolean {
    return (
      this.street === other.street &&
      this.city === other.city &&
      this.zipCode === other.zipCode
    );
  }
}

const addr1 = new Address('123 Main St', 'Boston', '02101');
const addr2 = new Address('123 Main St', 'Boston', '02101');
console.log(addr1.equals(addr2)); // true - same values

// Compare with entity
const customer1 = new Customer(CustomerId.fromString('1'), 'John');
const customer2 = new Customer(CustomerId.fromString('1'), 'Jane');
console.log(customer1.equals(customer2)); // true - same ID (name doesn't matter)
```

### 3. Self-Validation

```typescript
// ✅ Value objects validate themselves on construction
class Email {
  private constructor(private readonly value: string) {}

  static fromString(email: string): Email {
    const trimmed = email.trim().toLowerCase();

    if (!trimmed) {
      throw new ValidationError('Email cannot be empty');
    }

    if (!this.isValidFormat(trimmed)) {
      throw new ValidationError('Invalid email format');
    }

    return new Email(trimmed);
  }

  private static isValidFormat(email: string): boolean {
    // RFC 5322 compliant regex (simplified)
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  toString(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}

// Invalid email cannot exist
try {
  const email = Email.fromString('not-an-email'); // Throws
} catch (error) {
  // Handle validation error
}

// Once created, email is guaranteed valid
const email = Email.fromString('user@example.com'); // Safe
```

### 4. Replaceability

```typescript
// ✅ Replace entire value object, don't modify
class Customer {
  constructor(
    private readonly id: CustomerId,
    private email: Email
  ) {}

  // Don't modify the email - replace it
  updateEmail(newEmail: Email): void {
    this.email = newEmail; // Replace entire value object
  }
}

// Usage
const customer = new Customer(
  customerId,
  Email.fromString('old@example.com')
);

// Replace, don't modify
customer.updateEmail(Email.fromString('new@example.com'));
```

## Common Value Object Patterns

### 1. Money

```typescript
class Money {
  private constructor(
    public readonly amount: number,
    public readonly currency: string
  ) {
    if (amount < 0) {
      throw new ValidationError('Amount cannot be negative');
    }
    if (!this.isValidCurrency(currency)) {
      throw new ValidationError(`Invalid currency: ${currency}`);
    }
    Object.freeze(this);
  }

  static of(amount: number, currency: string): Money {
    return new Money(amount, currency);
  }

  static dollars(amount: number): Money {
    return new Money(amount, 'USD');
  }

  static euros(amount: number): Money {
    return new Money(amount, 'EUR');
  }

  static zero(currency: string): Money {
    return new Money(0, currency);
  }

  add(other: Money): Money {
    this.ensureSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    this.ensureSameCurrency(other);
    return new Money(this.amount - other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }

  divide(divisor: number): Money {
    if (divisor === 0) {
      throw new ValidationError('Cannot divide by zero');
    }
    return new Money(this.amount / divisor, this.currency);
  }

  isGreaterThan(other: Money): boolean {
    this.ensureSameCurrency(other);
    return this.amount > other.amount;
  }

  isLessThanOrEqual(other: Money): boolean {
    this.ensureSameCurrency(other);
    return this.amount <= other.amount;
  }

  isZero(): boolean {
    return this.amount === 0;
  }

  isNegative(): boolean {
    return this.amount < 0;
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  toString(): string {
    return `${this.amount} ${this.currency}`;
  }

  toJSON() {
    return { amount: this.amount, currency: this.currency };
  }

  private ensureSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new ValidationError(
        `Cannot operate on different currencies: ${this.currency} and ${other.currency}`
      );
    }
  }

  private isValidCurrency(currency: string): boolean {
    const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];
    return validCurrencies.includes(currency);
  }
}

// Usage
const price = Money.dollars(99.99);
const tax = Money.dollars(8.50);
const total = price.add(tax); // Money(108.49, 'USD')

const discounted = price.multiply(0.9); // 10% off
```

### 2. Email

```typescript
class Email {
  private constructor(private readonly value: string) {
    Object.freeze(this);
  }

  static fromString(email: string): Email {
    const normalized = email.trim().toLowerCase();

    if (!normalized) {
      throw new ValidationError('Email is required');
    }

    if (normalized.length > 254) {
      throw new ValidationError('Email is too long');
    }

    if (!this.isValidFormat(normalized)) {
      throw new ValidationError('Invalid email format');
    }

    return new Email(normalized);
  }

  private static isValidFormat(email: string): boolean {
    // Simple but practical email validation
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  getDomain(): string {
    return this.value.split('@')[1];
  }

  getLocalPart(): string {
    return this.value.split('@')[0];
  }

  isFromDomain(domain: string): boolean {
    return this.getDomain() === domain.toLowerCase();
  }

  toString(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}

// Usage
const email = Email.fromString('  USER@Example.COM  ');
console.log(email.toString()); // 'user@example.com'
console.log(email.getDomain()); // 'example.com'
console.log(email.isFromDomain('example.com')); // true
```

### 3. Address

```typescript
class Address {
  private constructor(
    public readonly street: string,
    public readonly city: string,
    public readonly state: string,
    public readonly zipCode: string,
    public readonly country: string
  ) {
    Object.freeze(this);
  }

  static create(
    street: string,
    city: string,
    state: string,
    zipCode: string,
    country: string = 'USA'
  ): Address {
    // Validation
    if (!street?.trim()) {
      throw new ValidationError('Street is required');
    }
    if (!city?.trim()) {
      throw new ValidationError('City is required');
    }
    if (!state?.trim()) {
      throw new ValidationError('State is required');
    }
    if (!zipCode?.trim()) {
      throw new ValidationError('ZIP code is required');
    }

    // US ZIP code validation
    if (country === 'USA' && !/^\d{5}(-\d{4})?$/.test(zipCode)) {
      throw new ValidationError('Invalid US ZIP code format');
    }

    return new Address(
      street.trim(),
      city.trim(),
      state.trim().toUpperCase(),
      zipCode.trim(),
      country
    );
  }

  toSingleLine(): string {
    return `${this.street}, ${this.city}, ${this.state} ${this.zipCode}`;
  }

  toMultiLine(): string {
    return `${this.street}\n${this.city}, ${this.state} ${this.zipCode}\n${this.country}`;
  }

  isSameCity(other: Address): boolean {
    return (
      this.city === other.city &&
      this.state === other.state &&
      this.country === other.country
    );
  }

  equals(other: Address): boolean {
    return (
      this.street === other.street &&
      this.city === other.city &&
      this.state === other.state &&
      this.zipCode === other.zipCode &&
      this.country === other.country
    );
  }
}

// Usage
const address = Address.create(
  '123 Main Street',
  'Boston',
  'ma', // Normalized to 'MA'
  '02101'
);
console.log(address.toSingleLine());
// '123 Main Street, Boston, MA 02101'
```

### 4. DateRange

```typescript
class DateRange {
  private constructor(
    public readonly start: Date,
    public readonly end: Date
  ) {
    Object.freeze(this);
  }

  static create(start: Date, end: Date): DateRange {
    if (start > end) {
      throw new ValidationError('Start date must be before end date');
    }
    return new DateRange(start, end);
  }

  static fromDays(startDate: Date, days: number): DateRange {
    if (days < 0) {
      throw new ValidationError('Days must be positive');
    }
    const end = new Date(startDate);
    end.setDate(end.getDate() + days);
    return new DateRange(startDate, end);
  }

  contains(date: Date): boolean {
    return date >= this.start && date <= this.end;
  }

  overlaps(other: DateRange): boolean {
    return this.start <= other.end && other.start <= this.end;
  }

  getDurationInDays(): number {
    const ms = this.end.getTime() - this.start.getTime();
    return Math.floor(ms / (1000 * 60 * 60 * 24));
  }

  equals(other: DateRange): boolean {
    return (
      this.start.getTime() === other.start.getTime() &&
      this.end.getTime() === other.end.getTime()
    );
  }

  toString(): string {
    return `${this.start.toISOString().split('T')[0]} to ${this.end.toISOString().split('T')[0]}`;
  }
}

// Usage
const range = DateRange.create(
  new Date('2024-01-01'),
  new Date('2024-01-31')
);

console.log(range.getDurationInDays()); // 30
console.log(range.contains(new Date('2024-01-15'))); // true

const vacation = DateRange.fromDays(new Date('2024-07-01'), 14);
```

### 5. PhoneNumber

```typescript
class PhoneNumber {
  private constructor(
    public readonly countryCode: string,
    public readonly number: string
  ) {
    Object.freeze(this);
  }

  static fromString(phone: string, defaultCountryCode: string = '+1'): PhoneNumber {
    // Remove all non-digit characters except leading +
    const cleaned = phone.replace(/[^\d+]/g, '');

    if (!cleaned) {
      throw new ValidationError('Phone number is required');
    }

    let countryCode = defaultCountryCode;
    let number = cleaned;

    // Extract country code if present
    if (cleaned.startsWith('+')) {
      const match = cleaned.match(/^(\+\d{1,3})(\d+)$/);
      if (match) {
        countryCode = match[1];
        number = match[2];
      }
    }

    // US phone number validation
    if (countryCode === '+1' && number.length !== 10) {
      throw new ValidationError('US phone number must be 10 digits');
    }

    return new PhoneNumber(countryCode, number);
  }

  toInternationalFormat(): string {
    // Format US numbers as +1 (XXX) XXX-XXXX
    if (this.countryCode === '+1' && this.number.length === 10) {
      return `${this.countryCode} (${this.number.substring(0, 3)}) ${this.number.substring(3, 6)}-${this.number.substring(6)}`;
    }
    return `${this.countryCode} ${this.number}`;
  }

  toNationalFormat(): string {
    // Format US numbers as (XXX) XXX-XXXX
    if (this.countryCode === '+1' && this.number.length === 10) {
      return `(${this.number.substring(0, 3)}) ${this.number.substring(3, 6)}-${this.number.substring(6)}`;
    }
    return this.number;
  }

  equals(other: PhoneNumber): boolean {
    return (
      this.countryCode === other.countryCode &&
      this.number === other.number
    );
  }

  toString(): string {
    return this.toInternationalFormat();
  }
}

// Usage
const phone = PhoneNumber.fromString('(617) 555-1234');
console.log(phone.toInternationalFormat()); // '+1 (617) 555-1234'
console.log(phone.toNationalFormat()); // '(617) 555-1234'
```

### 6. Percentage

```typescript
class Percentage {
  private constructor(private readonly value: number) {
    if (value < 0 || value > 100) {
      throw new ValidationError('Percentage must be between 0 and 100');
    }
    Object.freeze(this);
  }

  static of(value: number): Percentage {
    return new Percentage(value);
  }

  static fromDecimal(decimal: number): Percentage {
    return new Percentage(decimal * 100);
  }

  static zero(): Percentage {
    return new Percentage(0);
  }

  static hundred(): Percentage {
    return new Percentage(100);
  }

  toDecimal(): number {
    return this.value / 100;
  }

  applyTo(amount: number): number {
    return amount * this.toDecimal();
  }

  applyToMoney(money: Money): Money {
    return money.multiply(this.toDecimal());
  }

  toString(): string {
    return `${this.value}%`;
  }

  equals(other: Percentage): boolean {
    return this.value === other.value;
  }
}

// Usage
const discount = Percentage.of(15);
const price = Money.dollars(100);
const discountAmount = discount.applyToMoney(price); // Money(15, 'USD')
const finalPrice = price.subtract(discountAmount); // Money(85, 'USD')
```

## When to Use Value Objects

### Use Value Objects When:

✅ **Concept is defined by its attributes**
```typescript
// Address is defined by street, city, etc.
class Address { ... }
```

✅ **Immutability makes sense**
```typescript
// Money doesn't change - create new instances
const total = price.add(tax);
```

✅ **Need validation**
```typescript
// Email must be validated
const email = Email.fromString('user@example.com');
```

✅ **Multiple attributes belong together**
```typescript
// Street, city, zip belong together
class Address {
  constructor(street, city, zipCode) { ... }
}
```

✅ **Adding domain behavior**
```typescript
class Money {
  add(other: Money): Money { ... }
  multiply(factor: number): Money { ... }
}
```

### Don't Use Value Objects When:

❌ **Single primitive is sufficient**
```typescript
// Don't over-engineer
// ❌ Overkill for simple name
class FirstName {
  constructor(private value: string) {}
}

// ✅ Just use string if no validation or behavior needed
class User {
  constructor(public firstName: string) {}
}
```

❌ **Identity matters**
```typescript
// Use entity instead
class Customer {
  constructor(
    private readonly id: CustomerId, // Identity matters
    private name: string
  ) {}
}
```

## Value Objects with TypeScript

### Using Type Guards

```typescript
class Email {
  private readonly _brand: 'Email' = 'Email'; // Brand for type safety

  private constructor(private readonly value: string) {}

  static fromString(email: string): Email {
    // validation...
    return new Email(email);
  }

  toString(): string {
    return this.value;
  }
}

// Type guard
function isEmail(value: unknown): value is Email {
  return typeof value === 'object' && value !== null && '_brand' in value && (value as any)._brand === 'Email';
}

// Usage
function sendEmail(to: Email) {
  console.log(`Sending to ${to.toString()}`);
}

const userInput = 'test@example.com';
const email = Email.fromString(userInput);
sendEmail(email); // Type-safe
```

### Using Readonly and Freeze

```typescript
class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string
  ) {
    Object.freeze(this); // Runtime immutability
  }
}

const money = new Money(100, 'USD');
// money.amount = 200; // Compile error (readonly)
// (money as any).amount = 200; // Runtime error (frozen)
```

## Real-World Example: Order with Value Objects

```typescript
class Order {
  private constructor(
    private readonly id: OrderId,
    private readonly customerId: CustomerId,
    private items: OrderItem[],
    private shippingAddress: Address,
    private billingAddress: Address,
    private status: OrderStatus
  ) {}

  static create(
    customerId: CustomerId,
    items: OrderItem[],
    shippingAddress: Address,
    billingAddress: Address
  ): Order {
    if (items.length === 0) {
      throw new DomainError('Order must have at least one item');
    }

    return new Order(
      OrderId.generate(),
      customerId,
      items,
      shippingAddress,
      billingAddress,
      OrderStatus.Draft
    );
  }

  calculateTotal(): Money {
    return this.items
      .map(item => item.calculateSubtotal())
      .reduce((sum, subtotal) => sum.add(subtotal), Money.dollars(0));
  }

  applyDiscount(discount: Percentage): Money {
    const total = this.calculateTotal();
    return discount.applyToMoney(total);
  }

  updateShippingAddress(address: Address): void {
    if (this.status !== OrderStatus.Draft) {
      throw new DomainError('Cannot modify submitted orders');
    }
    this.shippingAddress = address; // Replace entire value object
  }
}

class OrderItem {
  constructor(
    private readonly productId: ProductId,
    private readonly productName: string,
    private readonly price: Money,
    private readonly quantity: number
  ) {
    if (quantity <= 0) {
      throw new ValidationError('Quantity must be positive');
    }
  }

  calculateSubtotal(): Money {
    return this.price.multiply(this.quantity);
  }
}

// Usage
const order = Order.create(
  customerId,
  [
    new OrderItem(productId, 'Widget', Money.dollars(29.99), 2),
    new OrderItem(productId2, 'Gadget', Money.dollars(49.99), 1),
  ],
  Address.create('123 Main St', 'Boston', 'MA', '02101'),
  Address.create('456 Oak Ave', 'Cambridge', 'MA', '02138')
);

const total = order.calculateTotal(); // Money(109.97, 'USD')
const discount = Percentage.of(10);
const discountAmount = order.applyDiscount(discount); // Money(10.997, 'USD')
```

## AI Integration Guidance

### Using AI to Generate Value Objects

**Good Prompt:**
```
Generate a DDD value object for a Color in an e-commerce system. Include:
- RGB representation (red, green, blue: 0-255)
- Hex representation (#RRGGBB)
- Factory methods: fromRGB, fromHex
- Methods: toHex(), toRGB(), lighten(), darken()
- Validation for all inputs
- Immutability
- Equality by value
- TypeScript with strict types
```

**AI Can Help With:**
- Generating boilerplate validation
- Creating factory methods
- Implementing equality methods
- Converting between representations
- Writing unit tests

**AI Cannot Replace:**
- Understanding what should be a value object
- Domain-specific validation rules
- Business logic in methods
- Deciding what belongs together

### Example AI Code Review

```typescript
// AI Prompt: "Review this value object for DDD best practices"

// ❌ Problems
class Money {
  constructor(
    public amount: number, // Not readonly
    public currency: string
  ) {}

  setAmount(amount: number) { // Mutable!
    this.amount = amount;
  }
}

// ✅ AI-suggested improvements
class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string
  ) {
    if (amount < 0) {
      throw new ValidationError('Amount cannot be negative');
    }
    Object.freeze(this);
  }

  // Immutable operations
  add(other: Money): Money {
    this.ensureSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }
}
```

## Common Pitfalls

### 1. Mutable Value Objects

```typescript
// ❌ Wrong: Mutable value object
class Address {
  constructor(
    public street: string, // Can be changed!
    public city: string
  ) {}

  setStreet(street: string) { // Setters on value objects!
    this.street = street;
  }
}

// ✅ Correct: Immutable value object
class Address {
  constructor(
    public readonly street: string,
    public readonly city: string
  ) {
    Object.freeze(this);
  }

  // Return new instance instead of modifying
  withStreet(street: string): Address {
    return new Address(street, this.city);
  }
}
```

### 2. No Validation

```typescript
// ❌ Wrong: No validation
class Email {
  constructor(public readonly value: string) {}
}

const email = new Email('not-valid'); // Garbage in!

// ✅ Correct: Validate on construction
class Email {
  private constructor(private readonly value: string) {}

  static fromString(email: string): Email {
    if (!this.isValid(email)) {
      throw new ValidationError('Invalid email');
    }
    return new Email(email);
  }
}
```

### 3. Primitive Obsession

```typescript
// ❌ Wrong: Using primitives everywhere
function calculateTotal(
  price: number,
  quantity: number,
  taxRate: number
): number {
  return price * quantity * (1 + taxRate);
}

calculateTotal(29.99, 2, 0.08); // What currency? Tax is percentage?

// ✅ Correct: Use value objects
function calculateTotal(
  price: Money,
  quantity: number,
  taxRate: Percentage
): Money {
  return price.multiply(quantity).add(taxRate.applyToMoney(price));
}

calculateTotal(Money.dollars(29.99), 2, Percentage.of(8)); // Clear!
```

## Key Takeaways

1. **Value objects are immutable** - Create new instances, don't modify
2. **Equality by value** - Two value objects with same attributes are equal
3. **Self-validating** - Invalid value objects cannot exist
4. **Replace primitive obsession** - Use value objects for domain concepts
5. **Group related attributes** - Address, Money, DateRange
6. **Add domain behavior** - Money.add(), Email.getDomain()
7. **Use factory methods** - Private constructor, static factory

## Next Steps

In the next lesson, we'll explore **Aggregates and Consistency Boundaries**—how to group entities and value objects into cohesive units with clear transactional boundaries.

## Hands-On Exercise

**Create Value Objects:**

Implement these value objects for an e-commerce system:

1. **ProductSKU** - Stock Keeping Unit
   - Format: CAT-XXX-NNNN (category code, 3-letter code, 4 digits)
   - Example: ELC-MON-0123
   - Validation for format

2. **Quantity**
   - Non-negative integer
   - Methods: add, subtract, multiply
   - Cannot go negative

3. **DiscountCode**
   - Format: 3-8 uppercase alphanumeric characters
   - Expiry date
   - isExpired() method

```typescript
// Try implementing yourself first!

// Example usage:
const sku = ProductSKU.fromString('ELC-MON-0123');
const qty = Quantity.of(5);
const discountCode = DiscountCode.create('SAVE20', new Date('2024-12-31'));

console.log(discountCode.isExpired()); // false
const newQty = qty.add(Quantity.of(3)); // Quantity(8)
```

---

**Time to complete:** 45 minutes
**Difficulty:** Intermediate

Share your implementations in the course forum!
