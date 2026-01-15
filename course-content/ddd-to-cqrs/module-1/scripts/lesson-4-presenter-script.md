# Virtual Presenter Script: Domain Modeling Techniques

**Lesson:** Module 1, Lesson 4
**Duration:** 28 minutes total
**Format:** Video presenter with animated diagrams

---

## SEGMENT 1: Introduction (2:00)

### Visual
- Presenter on screen (upper body, professional backdrop)
- Lower third: "Domain Modeling Techniques"
- Animated sticky notes floating in background

### Script

> **[PRESENTER ON CAMERA]**
>
> "You've got a room full of domain experts, developers, and a whiteboard. How do you turn fuzzy business requirements into a crisp, executable domain model?"
>
> **[PAUSE - lean in slightly]**
>
> "That's exactly what we're solving in this lesson."
>
> "I'm going to show you four battle-tested techniques that I've used on dozens of projects. These aren't theoretical exercises—these are practical tools you can use in your next meeting."
>
> **[GESTURE to upcoming content]**
>
> "We'll cover:
> - Event Storming—the big picture discovery workshop
> - Domain Storytelling—for validating with stakeholders
> - Example Mapping—for exploring edge cases
> - And Context Mapping—for visualizing system boundaries"
>
> "Let's start with the most powerful technique in our toolkit."

---

## SEGMENT 2: Event Storming Overview (3:30)

### Visual
- Split screen: Presenter (30%) + Whiteboard animation (70%)
- Animated sticky notes appearing on virtual whiteboard

### Script

> **[PRESENTER + WHITEBOARD VIEW]**
>
> "Event Storming was invented by Alberto Brandolini, and it's beautifully simple."
>
> **[ORANGE STICKY NOTE APPEARS]**
>
> "You start with orange sticky notes. These represent Domain Events—things that happened in the past that the business actually cares about."
>
> **[ANIMATION: Multiple orange notes appear: "OrderPlaced", "PaymentReceived", "OrderShipped"]**
>
> "Notice the past tense. 'Order PLACED', not 'Place Order'. We're capturing what happened, not what someone wants to do."
>
> **[BLUE STICKY NOTE APPEARS]**
>
> "Then we add blue notes for Commands—the intentions that cause events."
>
> **[ANIMATION: Blue notes connect to orange: "PlaceOrder → OrderPlaced"]**
>
> "A customer wants to PLACE an order. If successful, an ORDER was PLACED."
>
> **[YELLOW STICKY NOTE APPEARS]**
>
> "Yellow notes are for Aggregates—clusters of objects that change together."
>
> **[ANIMATION: Yellow "Order" note groups several events]**
>
> "And finally, we draw boundaries around related concepts—these become our Bounded Contexts."
>
> **[ANIMATION: Large boxes form around groups: "Sales", "Payment", "Fulfillment"]**

---

## SEGMENT 3: Event Storming Live Demo (5:00)

### Visual
- Full screen animated Event Storm diagram
- Presenter voice-over with occasional picture-in-picture

### Script

> **[FULL SCREEN DIAGRAM - Presenter in corner PIP]**
>
> "Let me walk you through a real Event Storm for an e-commerce checkout flow."
>
> **[ANIMATION: Sales Context builds step by step]**
>
> "In the Sales context, our Customer—represented by this actor icon—triggers two key commands."
>
> **[HIGHLIGHT: Customer → AddItemToCart → ItemAddedToCart]**
>
> "First, they add items to their cart. The command 'AddItemToCart' produces the event 'ItemAddedToCart'."
>
> **[HIGHLIGHT: Customer → PlaceOrder → OrderPlaced]**
>
> "Then they place the order. Notice the business rules here—we need items in the cart and valid payment info."
>
> **[ANIMATION: Arrow flows to Payment Context]**
>
> "Now watch what happens. The OrderPlaced event flows to our Payment context."
>
> **[HIGHLIGHT: Payment Context builds]**
>
> "Payment has its own model. It processes the payment and emits either PaymentProcessed or PaymentFailed."
>
> **[ANIMATION: External system icon appears]**
>
> "See that lightning bolt? That's Stripe—an external system. We mark these because they have different reliability characteristics."
>
> **[ANIMATION: Flow continues to Fulfillment]**
>
> "A successful payment triggers fulfillment. AllocateInventory, then ShipOrder."
>
> **[PRESENTER RETURNS TO CAMERA]**
>
> "Notice how we discovered three distinct contexts just by following the events. Sales doesn't know about shipping. Payment doesn't know about inventory. Each context has its own focused model."

---

## SEGMENT 4: Translating to Code (4:00)

### Visual
- Split screen: Event Storm diagram (40%) + Code editor (60%)
- Code highlights as presenter speaks

### Script

> **[SPLIT SCREEN: Diagram + Code]**
>
> "Now the magic part—turning sticky notes into code."
>
> **[CODE HIGHLIGHT: DomainEvent class]**
>
> "Each orange sticky becomes a Domain Event class. Notice the properties capture WHAT happened—the cart ID, product ID, quantity."
>
> ```typescript
> export class ItemAddedToCart extends DomainEvent {
>   constructor(
>     public readonly cartId: CartId,
>     public readonly productId: ProductId,
>     public readonly quantity: number
>   ) { super(); }
> }
> ```
>
> **[CODE HIGHLIGHT: Order aggregate]**
>
> "Our yellow sticky—the Order aggregate—becomes a class with a factory method."
>
> **[CODE HIGHLIGHT: place() method]**
>
> "See this static `place` method? It enforces our business rule from the Event Storm: 'Cannot place order with empty cart'."
>
> **[CODE HIGHLIGHT: addDomainEvent call]**
>
> "And when we successfully create the order, we emit the OrderPlaced event. Same event from our sticky note, now in code."
>
> **[PRESENTER ON CAMERA]**
>
> "The beautiful thing? Your Event Storm diagram IS your documentation. Anyone can look at those sticky notes and understand the flow. Then they can open the code and see the exact same concepts."

---

## SEGMENT 5: Domain Storytelling (3:00)

### Visual
- Presenter on camera with animated story flow

### Script

> **[PRESENTER ON CAMERA]**
>
> "Event Storming is fantastic for discovery. But how do you validate your model with non-technical stakeholders?"
>
> **[ANIMATED STORY FLOW APPEARS]**
>
> "Enter Domain Storytelling. It's a pictorial language that reads like a storybook."
>
> **[ANIMATION: Step-by-step story builds]**
>
> "Step 1: Customer adds product to Cart"
> "Step 2: Customer proceeds to checkout"
> "Step 3: Customer enters payment details..."
>
> "You can literally read this to a business person and they'll either nod along or say 'Wait, that's not how it works.'"
>
> **[PRESENTER BACK ON CAMERA]**
>
> "I once had a stakeholder look at a story like this and say 'You forgot the fraud check before payment processing.' That single insight saved us two weeks of rework."
>
> "The story becomes a saga in your code—a process manager that orchestrates the flow across contexts."

---

## SEGMENT 6: Example Mapping (3:30)

### Visual
- Animated cards appearing on screen (color-coded)
- Presenter in corner PIP

### Script

> **[ANIMATED CARDS VIEW]**
>
> "Example Mapping is my favorite technique for exploring edge cases."
>
> **[BLUE CARD APPEARS]**
>
> "Start with a User Story in blue: 'As a customer, I want to return items.'"
>
> **[YELLOW CARD APPEARS]**
>
> "Add a Rule in yellow: 'Items can be returned within 30 days if unopened.'"
>
> **[GREEN CARDS APPEAR ONE BY ONE]**
>
> "Now the examples in green—concrete scenarios:"
> "- Customer bought January 1st, returns January 25th → ALLOWED"
> "- Customer bought January 1st, returns February 5th → REJECTED"
> "- Customer opened the item → REJECTED"
>
> **[RED CARDS APPEAR]**
>
> "Red cards are gold—these are QUESTIONS."
> "- What if the item was damaged during shipping?"
> "- What about digital products?"
>
> **[PRESENTER ON CAMERA]**
>
> "Every red card is a conversation you DIDN'T have that would have become a bug later."
>
> "After discussing with stakeholders, those questions become new rules:"
>
> **[NEW YELLOW CARDS APPEAR]**
>
> "'Damaged items can be returned anytime.'"
> "'Digital products cannot be returned.'"
>
> "And those examples? They become your tests—word for word."

---

## SEGMENT 7: Context Mapping (3:00)

### Visual
- Animated context map diagram building
- Presenter voice-over

### Script

> **[ANIMATED CONTEXT MAP]**
>
> "Once you have multiple bounded contexts, you need to understand how they relate."
>
> **[CONTEXTS APPEAR: Catalog, Sales, Payment, Fulfillment]**
>
> "Here are our four contexts from e-commerce."
>
> **[ARROW: Catalog → Sales with label]**
>
> "Catalog exposes an Open Host Service—a REST API with a published schema. Sales consumes product information but doesn't change it."
>
> **[ARROW: Sales → Fulfillment with "ACL" label]**
>
> "Sales talks to Fulfillment through an Anti-Corruption Layer. Why? Because Sales uses 'Orders' but Fulfillment thinks in 'Shipments.' The ACL translates between these concepts."
>
> **[ARROW: Payment → Fulfillment with event label]**
>
> "Payment publishes events that Fulfillment subscribes to. Loose coupling—Fulfillment doesn't call Payment directly."
>
> **[PRESENTER ON CAMERA]**
>
> "This map prevents a common disaster: accidentally coupling contexts that should be independent. When you see the relationships visually, you can make conscious decisions about where to put boundaries."

---

## SEGMENT 8: AI-Assisted Modeling (3:00)

### Visual
- Split screen: AI chat interface (mock) + resulting code

### Script

> **[PRESENTER ON CAMERA]**
>
> "Now, can AI help with domain modeling? Yes—but with important caveats."
>
> **[SPLIT SCREEN: AI prompt + output]**
>
> "AI is excellent at extracting initial events from a business description. Feed it a process narrative, and it can identify candidate events, commands, and aggregates."
>
> **[HIGHLIGHT: AI output list]**
>
> "Look at this output for a car rental process. VehicleSearched, ReservationConfirmed, VehiclePickedUp—pretty good starting point."
>
> **[PRESENTER ON CAMERA - serious expression]**
>
> "But here's what AI cannot do: validate with domain experts. That CarReservation aggregate? AI generated perfect-looking code. But it didn't know that your company has a special VIP bypass for the age requirement. Only your domain expert knows that."
>
> **[GESTURE]**
>
> "Use AI for boilerplate—generating event classes, command handlers, test scaffolding. Use HUMANS for business rules."
>
> "AI accelerates. It doesn't replace domain knowledge."

---

## SEGMENT 9: Key Takeaways (2:00)

### Visual
- Presenter on camera
- Animated bullet points appearing

### Script

> **[PRESENTER ON CAMERA - summarizing tone]**
>
> "Let's lock in what we learned."
>
> **[BULLET POINTS ANIMATE IN]**
>
> "One: Event Storming reveals workflow. Those orange sticky notes are the skeleton of your entire model."
>
> "Two: Use multiple techniques together. Event Storming for discovery, Domain Storytelling for validation, Example Mapping for edge cases."
>
> "Three: Context Maps show boundaries. Visualize how your contexts interact before you write integration code."
>
> "Four: AI accelerates but doesn't replace. Generate boilerplate with AI. Validate rules with humans."
>
> "Five: Iterate constantly. Your first model WILL be wrong. That's fine. Models evolve as understanding deepens."
>
> **[PRESENTER - direct to camera]**
>
> "In the next module, we'll dive deep into Bounded Contexts and Strategic Design. You'll learn how to organize complex systems into manageable contexts."
>
> "But first—I want you to practice. The hands-on exercise has you model a domain from scratch. Pick something you know—a restaurant, a library, a gym. Apply these techniques."
>
> "See you in Module 2."

---

## SEGMENT 10: Outro (30 seconds)

### Visual
- Course branding
- "Next: Module 2 - Bounded Contexts & Strategic Design"

### Script

> **[PRESENTER - friendly wrap-up]**
>
> "That's Domain Modeling Techniques. Share your Event Storm diagrams in the course forum—I'd love to see what you create."
>
> **[END CARD with course branding]**

---

## Production Notes

### Visuals Needed

1. **Event Storm Animation** (Segment 3)
   - Sticky notes appearing sequentially
   - Color-coded: Orange (events), Blue (commands), Yellow (aggregates)
   - Arrows showing flow between contexts
   - Based on mermaid diagram in lesson content

2. **Context Map Animation** (Segment 7)
   - Four bounded contexts as boxes
   - Relationship arrows with labels (ACL, Open Host Service, etc.)
   - Based on mermaid diagram in lesson content

3. **Example Mapping Animation** (Segment 6)
   - Card-style animations
   - Color-coded: Blue (story), Yellow (rules), Green (examples), Red (questions)

4. **Code Highlights** (Segment 4)
   - Syntax-highlighted TypeScript
   - Line-by-line highlighting as concepts explained

### Presenter Notes

- **Tone:** Confident, practical, conversational
- **Pace:** Medium—allow time for concepts to sink in
- **Gestures:** Use hands to indicate flow, emphasize key points
- **Energy:** Higher at opening and takeaways, calmer during explanations

### B-Roll Suggestions

- Whiteboard workshop footage (real or stock)
- Developers collaborating around sticky notes
- Screen recordings of code being written

### Audio

- Background music: Subtle, professional, fades during speech
- Sound effects: Soft "pop" when sticky notes appear

---

## Timing Breakdown

| Segment | Duration | Running Total |
|---------|----------|---------------|
| 1. Introduction | 2:00 | 2:00 |
| 2. Event Storming Overview | 3:30 | 5:30 |
| 3. Event Storming Demo | 5:00 | 10:30 |
| 4. Translating to Code | 4:00 | 14:30 |
| 5. Domain Storytelling | 3:00 | 17:30 |
| 6. Example Mapping | 3:30 | 21:00 |
| 7. Context Mapping | 3:00 | 24:00 |
| 8. AI-Assisted Modeling | 3:00 | 27:00 |
| 9. Key Takeaways | 2:00 | 29:00 |
| 10. Outro | 0:30 | 29:30 |

**Total: ~29-30 minutes** (slightly over 28 min estimate—can trim segments 5-6 if needed)
