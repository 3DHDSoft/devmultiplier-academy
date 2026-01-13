# Module 2, Lesson 4: Anti-Corruption Layers

**Duration:** 17 minutes
**Learning Objectives:**
- Understand what anti-corruption layers (ACLs) are and when to use them
- Implement translation layers to protect domain models
- Design adapters and facades for external systems
- Test ACLs effectively

---

## Introduction

An Anti-Corruption Layer (ACL) is a protective barrier between your clean domain model and external systems with poor or incompatible models. It acts as a translator, preventing "corruption" of your domain's ubiquitous language and design principles.

## The Problem: Model Pollution

### Without ACL

```typescript
// ❌ External API's model leaks into your domain

// External Legacy ERP System
interface LegacyCustomerDTO {
  CUST_ID: string;
  CUST_NM: string;
  CUST_TYPE: 'I' | 'B'; // Individual or Business
  ADDR_LINE_1: string;
  ADDR_LINE_2: string | null;
  CITY: string;
  STATE: string;
  ZIP_CD: string;
  CREDIT_SCORE: number;
  ACCT_STATUS: 'A' | 'I' | 'S'; // Active, Inactive, Suspended
  CREATED_DT: string; // MM/DD/YYYY format
  LAST_PURCHASE: string | null; // MM/DD/YYYY format
}

// Your domain forced to use legacy model
namespace Sales {
  export class OrderService {
    async createOrder(customerId: string): Promise<void> {
      // Pollution begins
      const legacyCustomer = await this.legacyERP.getCustomer(customerId);

      // Your code now deals with legacy terminology
      if (legacyCustomer.ACCT_STATUS !== 'A') {
        throw new Error('Customer account not active');
      }

      // Awkward data transformation everywhere
      const customerType = legacyCustomer.CUST_TYPE === 'I'
        ? 'Individual'
        : 'Business';

      // Your domain logic mixed with legacy format parsing
      const lastPurchase = legacyCustomer.LAST_PURCHASE
        ? this.parseLegacyDate(legacyCustomer.LAST_PURCHASE)
        : null;

      // PROBLEM: Legacy model has infected your domain!
    }

    private parseLegacyDate(dateStr: string): Date {
      // MM/DD/YYYY parsing logic everywhere
      const [month, day, year] = dateStr.split('/');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
  }
}
```

### With ACL

```typescript
// ✅ ACL protects your domain model

// Your Clean Domain Model
export class Customer {
  private constructor(
    public readonly id: CustomerId,
    public readonly name: CustomerName,
    public readonly type: CustomerType,
    public readonly address: Address,
    public readonly creditScore: CreditScore,
    public readonly status: AccountStatus,
    public readonly createdAt: Date,
    public readonly lastPurchaseAt: Date | null
  ) {}

  isActive(): boolean {
    return this.status === AccountStatus.Active;
  }

  canPlaceOrder(): boolean {
    return this.isActive() && this.creditScore.isAcceptable();
  }
}

// ACL: Translator between Legacy and Domain
export class LegacyCustomerAdapter {
  toDomain(legacy: LegacyCustomerDTO): Customer {
    return new Customer(
      CustomerId.from(legacy.CUST_ID),
      CustomerName.from(legacy.CUST_NM),
      this.translateCustomerType(legacy.CUST_TYPE),
      this.translateAddress(legacy),
      CreditScore.from(legacy.CREDIT_SCORE),
      this.translateAccountStatus(legacy.ACCT_STATUS),
      this.parseDate(legacy.CREATED_DT),
      legacy.LAST_PURCHASE ? this.parseDate(legacy.LAST_PURCHASE) : null
    );
  }

  fromDomain(customer: Customer): LegacyCustomerDTO {
    return {
      CUST_ID: customer.id.value,
      CUST_NM: customer.name.value,
      CUST_TYPE: customer.type === CustomerType.Individual ? 'I' : 'B',
      ADDR_LINE_1: customer.address.street,
      ADDR_LINE_2: customer.address.apartment || null,
      CITY: customer.address.city,
      STATE: customer.address.state,
      ZIP_CD: customer.address.zipCode,
      CREDIT_SCORE: customer.creditScore.value,
      ACCT_STATUS: this.fromAccountStatus(customer.status),
      CREATED_DT: this.formatDate(customer.createdAt),
      LAST_PURCHASE: customer.lastPurchaseAt
        ? this.formatDate(customer.lastPurchaseAt)
        : null,
    };
  }

  private translateCustomerType(type: 'I' | 'B'): CustomerType {
    switch (type) {
      case 'I':
        return CustomerType.Individual;
      case 'B':
        return CustomerType.Business;
      default:
        throw new Error(`Unknown customer type: ${type}`);
    }
  }

  private translateAccountStatus(status: 'A' | 'I' | 'S'): AccountStatus {
    switch (status) {
      case 'A':
        return AccountStatus.Active;
      case 'I':
        return AccountStatus.Inactive;
      case 'S':
        return AccountStatus.Suspended;
      default:
        throw new Error(`Unknown account status: ${status}`);
    }
  }

  private translateAddress(legacy: LegacyCustomerDTO): Address {
    return new Address(
      legacy.ADDR_LINE_1,
      legacy.ADDR_LINE_2 || undefined,
      legacy.CITY,
      legacy.STATE,
      legacy.ZIP_CD
    );
  }

  private parseDate(dateStr: string): Date {
    const [month, day, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  }

  private formatDate(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  private fromAccountStatus(status: AccountStatus): 'A' | 'I' | 'S' {
    switch (status) {
      case AccountStatus.Active:
        return 'A';
      case AccountStatus.Inactive:
        return 'I';
      case AccountStatus.Suspended:
        return 'S';
    }
  }
}

// Your domain service stays clean
export class OrderService {
  constructor(
    private readonly customerRepository: CustomerRepository // Uses ACL internally
  ) {}

  async createOrder(customerId: CustomerId): Promise<Order> {
    // Clean domain code
    const customer = await this.customerRepository.findById(customerId);

    if (!customer.canPlaceOrder()) {
      throw new CustomerCannotPlaceOrderError(customer);
    }

    return Order.create(customer.id);
  }
}

// Repository uses ACL
export class LegacyCustomerRepository implements CustomerRepository {
  constructor(
    private readonly legacyClient: LegacyERPClient,
    private readonly adapter: LegacyCustomerAdapter
  ) {}

  async findById(id: CustomerId): Promise<Customer | null> {
    const legacy = await this.legacyClient.getCustomer(id.value);
    if (!legacy) return null;

    // ACL translates at the boundary
    return this.adapter.toDomain(legacy);
  }

  async save(customer: Customer): Promise<void> {
    // ACL translates back
    const legacy = this.adapter.fromDomain(customer);
    await this.legacyClient.updateCustomer(legacy);
  }
}
```

## When to Use ACL

### Good Use Cases

✅ **External Systems with Poor Models**
```typescript
// Legacy system with terrible naming
interface OLD_SYS_PROD {
  P_ID: number;
  P_NM: string;
  P_DSC: string;
  P_PRC: number;
  P_CTG: number;
}

// ACL protects you
class ProductAdapter {
  toDomain(old: OLD_SYS_PROD): Product {
    return new Product(
      ProductId.from(String(old.P_ID)),
      old.P_NM,
      old.P_DSC,
      Money.fromCents(old.P_PRC)
    );
  }
}
```

✅ **Third-Party APIs**
```typescript
// Stripe's API model
interface StripeCharge {
  id: string;
  amount: number; // in cents
  currency: string;
  status: 'succeeded' | 'pending' | 'failed';
  metadata: Record<string, string>;
}

// Your domain model
class Payment {
  constructor(
    public readonly id: PaymentId,
    public readonly amount: Money,
    public readonly status: PaymentStatus,
    public readonly orderId: OrderId
  ) {}
}

// ACL
class StripePaymentAdapter {
  toDomain(charge: StripeCharge): Payment {
    return new Payment(
      PaymentId.from(charge.id),
      Money.fromCents(charge.amount, charge.currency),
      this.translateStatus(charge.status),
      OrderId.from(charge.metadata.orderId)
    );
  }

  fromDomain(payment: Payment): CreateChargeRequest {
    return {
      amount: payment.amount.cents,
      currency: payment.amount.currency.toLowerCase(),
      metadata: {
        orderId: payment.orderId.value,
      },
    };
  }
}
```

✅ **Other Bounded Contexts (when models don't align)**
```typescript
// Catalog Context's Product
namespace Catalog {
  export interface ProductDTO {
    id: string;
    sku: string;
    name: string;
    variants: VariantDTO[];
    images: string[];
  }
}

// Sales Context's Product (different concept)
namespace Sales {
  export class OrderProduct {
    constructor(
      public readonly productId: ProductId,
      public readonly name: string,
      public readonly price: Money // Snapshot at purchase time
    ) {}
  }

  // ACL
  export class CatalogProductAdapter {
    toOrderProduct(
      catalogProduct: Catalog.ProductDTO,
      selectedVariant: string
    ): OrderProduct {
      // Complex translation logic
      const variant = catalogProduct.variants.find(
        v => v.sku === selectedVariant
      );

      return new OrderProduct(
        ProductId.from(catalogProduct.id),
        `${catalogProduct.name} - ${variant.name}`,
        Money.of(variant.price, 'USD')
      );
    }
  }
}
```

### When NOT to Use ACL

❌ **Well-Designed Upstream**
```typescript
// If upstream already has a clean model, use it directly (Conformist pattern)
interface WellDesignedAPI {
  getProduct(id: string): Promise<Product>;
}

// No ACL needed
class ProductService {
  constructor(private readonly api: WellDesignedAPI) {}

  async getProduct(id: string): Promise<Product> {
    return await this.api.getProduct(id); // Use directly
  }
}
```

❌ **Over-Engineering Simple Cases**
```typescript
// Don't create ACL for simple DTOs
interface UserDTO {
  id: string;
  name: string;
  email: string;
}

// ❌ Overkill
class UserAdapter {
  toDomain(dto: UserDTO): User {
    return new User(dto.id, dto.name, dto.email);
  }
}

// ✅ Just use the DTO
class UserService {
  async getUser(id: string): Promise<UserDTO> {
    return await this.api.getUser(id);
  }
}
```

## ACL Design Patterns

### Pattern 1: Adapter

```typescript
// Adapts external interface to domain interface
export interface PaymentGateway {
  processPayment(amount: Money, method: PaymentMethod): Promise<PaymentResult>;
  refund(paymentId: PaymentId): Promise<void>;
}

// ACL: Stripe Adapter
export class StripeAdapter implements PaymentGateway {
  constructor(private readonly stripe: Stripe) {}

  async processPayment(
    amount: Money,
    method: PaymentMethod
  ): Promise<PaymentResult> {
    const intent = await this.stripe.paymentIntents.create({
      amount: amount.cents,
      currency: amount.currency.toLowerCase(),
      payment_method: method.stripeMethodId,
      confirm: true,
    });

    return PaymentResult.from({
      id: PaymentId.from(intent.id),
      status: this.translateStatus(intent.status),
    });
  }

  async refund(paymentId: PaymentId): Promise<void> {
    await this.stripe.refunds.create({
      payment_intent: paymentId.value,
    });
  }

  private translateStatus(status: string): PaymentStatus {
    // Translation logic
  }
}

// Can swap implementations without changing domain
export class PayPalAdapter implements PaymentGateway {
  // Different implementation, same interface
}
```

### Pattern 2: Facade

```typescript
// Simplifies complex external system
export class ShippingFacade {
  constructor(
    private readonly fedexClient: FedExClient,
    private readonly upsClient: UPSClient,
    private readonly rateCalculator: RateCalculator
  ) {}

  async shipPackage(shipment: Shipment): Promise<TrackingNumber> {
    // Facade hides complexity of choosing carrier
    const rates = await this.getRates(shipment);
    const bestCarrier = this.selectCarrier(rates);

    if (bestCarrier === 'FedEx') {
      return await this.shipViaFedEx(shipment);
    } else {
      return await this.shipViaUPS(shipment);
    }
  }

  private async shipViaFedEx(shipment: Shipment): Promise<TrackingNumber> {
    // Translate domain model to FedEx API
    const fedexRequest = {
      shipper: {
        name: shipment.from.name,
        address: this.toFedExAddress(shipment.from.address),
      },
      recipient: {
        name: shipment.to.name,
        address: this.toFedExAddress(shipment.to.address),
      },
      package: {
        weight: shipment.weight.pounds,
        dimensions: shipment.dimensions,
      },
    };

    const response = await this.fedexClient.createShipment(fedexRequest);
    return TrackingNumber.from(response.trackingNumber);
  }

  private toFedExAddress(address: Address): FedExAddress {
    // Translation logic
  }
}
```

### Pattern 3: Repository with ACL

```typescript
// Repository translates at persistence boundary
export class ProductRepository {
  constructor(
    private readonly legacyDB: LegacyDatabase,
    private readonly adapter: ProductAdapter
  ) {}

  async findById(id: ProductId): Promise<Product | null> {
    const row = await this.legacyDB.query(
      'SELECT * FROM PROD_TBL WHERE PROD_ID = ?',
      [id.value]
    );

    if (!row) return null;

    // ACL translates legacy data to domain model
    return this.adapter.toDomain(row);
  }

  async save(product: Product): Promise<void> {
    // ACL translates domain model to legacy format
    const row = this.adapter.fromDomain(product);

    await this.legacyDB.execute(
      'UPDATE PROD_TBL SET PROD_NM = ?, PROD_PRC = ? WHERE PROD_ID = ?',
      [row.PROD_NM, row.PROD_PRC, row.PROD_ID]
    );
  }
}
```

## Testing ACLs

```typescript
describe('LegacyCustomerAdapter', () => {
  const adapter = new LegacyCustomerAdapter();

  describe('toDomain', () => {
    it('translates legacy customer to domain model', () => {
      const legacy: LegacyCustomerDTO = {
        CUST_ID: '12345',
        CUST_NM: 'John Doe',
        CUST_TYPE: 'I',
        ADDR_LINE_1: '123 Main St',
        ADDR_LINE_2: null,
        CITY: 'Springfield',
        STATE: 'IL',
        ZIP_CD: '62701',
        CREDIT_SCORE: 750,
        ACCT_STATUS: 'A',
        CREATED_DT: '01/15/2023',
        LAST_PURCHASE: '12/25/2023',
      };

      const customer = adapter.toDomain(legacy);

      expect(customer.id.value).toBe('12345');
      expect(customer.name.value).toBe('John Doe');
      expect(customer.type).toBe(CustomerType.Individual);
      expect(customer.status).toBe(AccountStatus.Active);
      expect(customer.createdAt).toEqual(new Date(2023, 0, 15));
      expect(customer.lastPurchaseAt).toEqual(new Date(2023, 11, 25));
    });

    it('handles missing optional fields', () => {
      const legacy: LegacyCustomerDTO = {
        ...baseLegacy,
        ADDR_LINE_2: null,
        LAST_PURCHASE: null,
      };

      const customer = adapter.toDomain(legacy);

      expect(customer.address.apartment).toBeUndefined();
      expect(customer.lastPurchaseAt).toBeNull();
    });

    it('translates all account statuses correctly', () => {
      expect(
        adapter.toDomain({ ...baseLegacy, ACCT_STATUS: 'A' }).status
      ).toBe(AccountStatus.Active);

      expect(
        adapter.toDomain({ ...baseLegacy, ACCT_STATUS: 'I' }).status
      ).toBe(AccountStatus.Inactive);

      expect(
        adapter.toDomain({ ...baseLegacy, ACCT_STATUS: 'S' }).status
      ).toBe(AccountStatus.Suspended);
    });
  });

  describe('fromDomain', () => {
    it('translates domain model to legacy format', () => {
      const customer = new Customer(
        CustomerId.from('12345'),
        CustomerName.from('John Doe'),
        CustomerType.Individual,
        new Address('123 Main St', undefined, 'Springfield', 'IL', '62701'),
        CreditScore.from(750),
        AccountStatus.Active,
        new Date(2023, 0, 15),
        new Date(2023, 11, 25)
      );

      const legacy = adapter.fromDomain(customer);

      expect(legacy.CUST_ID).toBe('12345');
      expect(legacy.CUST_NM).toBe('John Doe');
      expect(legacy.CUST_TYPE).toBe('I');
      expect(legacy.ACCT_STATUS).toBe('A');
      expect(legacy.CREATED_DT).toBe('01/15/2023');
    });

    it('round-trips correctly', () => {
      const original = createTestCustomer();
      const legacy = adapter.fromDomain(original);
      const roundTripped = adapter.toDomain(legacy);

      expect(roundTripped).toEqual(original);
    });
  });
});
```

## Key Takeaways

1. **ACLs protect your domain** - Keep poor external models from polluting your code
2. **Translation at the boundary** - Convert at repository or client layer
3. **Bidirectional translation** - Support both toDomain and fromDomain
4. **Test thoroughly** - Ensure translations are correct and round-trip
5. **Use when needed** - Don't over-engineer simple integrations
6. **Consider the cost** - ACLs add code but preserve domain purity

## Common Mistakes

❌ **Leaking external models** - Letting DTOs spread throughout domain
❌ **Incomplete translation** - Forgetting edge cases or optional fields
❌ **No round-trip testing** - Not verifying toDomain/fromDomain consistency
❌ **ACL in wrong layer** - Putting translation logic in domain instead of infrastructure
❌ **Over-engineering** - Creating ACL when simple mapping would suffice

## Next Steps

In the next lesson, we'll explore **Strategic Design in Microservices**—how bounded contexts map to microservice boundaries.

## Hands-On Exercise

**Create an ACL:**

Choose an external system you integrate with:

1. **Define domain model:**
   ```typescript
   export class YourDomainEntity {
     // Clean domain model
   }
   ```

2. **Create adapter:**
   ```typescript
   export class ExternalSystemAdapter {
     toDomain(external: ExternalDTO): YourDomainEntity {
       // Translation logic
     }

     fromDomain(entity: YourDomainEntity): ExternalDTO {
       // Reverse translation
     }
   }
   ```

3. **Write tests:**
   ```typescript
   it('translates correctly', () => {
     const external = createExternalDTO();
     const domain = adapter.toDomain(external);
     expect(domain).toBeDefined();
   });

   it('round-trips correctly', () => {
     const original = createDomainEntity();
     const external = adapter.fromDomain(original);
     const roundTripped = adapter.toDomain(external);
     expect(roundTripped).toEqual(original);
   });
   ```

---

**Time to complete:** 45 minutes
**Difficulty:** Intermediate
