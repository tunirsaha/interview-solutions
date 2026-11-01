# Ride Fare: Core Fare Calculator

## 1. Problem Statement

*Time guideline: ~1.30 hours. This is the full core problem — build a complete, clean, well-tested solution. A small extension may be offered later to anyone who finishes early, but don't hold back on quality here waiting for it.*

### Context

You're building the core pricing engine for a ride-sharing platform, **Ride Fare**. For this stage, you only need to calculate the fare for a single completed ride.

The platform currently supports four vehicle types, each with its own rate card:

| Vehicle Type | Base Fare | Cost per km | Cost per minute | Minimum Fare | Formula |
|---|---|---|---|---|---|
| Economy | ₹40.00 | ₹10.00 | ₹1.50 | ₹80.00 | Additive: base + distance cost + time cost |
| Premium | ₹70.00 | ₹15.00 | ₹2.50 | ₹150.00 | Additive: base + distance cost + time cost |
| SUV | ₹100.00 | ₹20.00 | ₹3.00 | ₹200.00 | Base + whichever is greater: distance cost or time cost |
| XL | ₹120.00 | ₹18.00 (first 5 km) / ₹27.00 (beyond 5 km) | ₹3.50 | ₹250.00 | Base + tiered distance cost + time cost |

The platform expects to introduce new vehicle types, adjust rate cards, and introduce new pricing rules fairly often as it expands into new markets.

Two more things affect what a rider is charged:

**Demand-based (surge) pricing.** During busier periods, the platform applies demand-based pricing — also called surge pricing — which increases fares. The current demand level is provided as part of the ride request, as one of:

| Demand Level | Multiplier |
|---|---|
| NORMAL | 1.0x |
| HIGH | 1.5x |
| PEAK | 2.0x |

**A promo code.** Riders may optionally enter one promo code at checkout. The platform currently supports:

| Code | Effect |
|---|---|
| WELCOME10 | 10% off the fare |
| FLAT50 | ₹50.00 off the fare |
| FREERIDE | the ride is free — typically offered to riders on their first-ever ride |

Marketing is already planning further promo campaigns, including codes restricted to specific vehicle types and campaigns that combine multiple codes in a single ride. You don't need to build those campaigns now, but your discount logic should make it easy to introduce new codes and combination rules without reworking existing, tested code.

### Your task

Implement a system that, given a ride's vehicle type, distance (km), duration (minutes), demand level, and an optional promo code, computes the total fare charged to the rider.

### Sample Input / Output

| # | Vehicle Type | Distance | Duration | Demand | Promo Code | Output |
|---|---|---|---|---|---|---|
| 1 | Economy | 8.5 km | 22 min | — | — | ₹158.00 |
| 2 | SUV | 1.0 km | 3 min | — | — | ₹200.00 |
| 3 | Premium | 15 km | 35 min | — | — | ₹382.50 |
| 4 | SUV | 10 km | 5 min | — | — | ₹300.00 |
| 5 | SUV | 1.0 km | 3 min | PEAK | — | ₹240.00 |
| 6 | Economy | 8.5 km | 22 min | HIGH | WELCOME10 | ₹213.30 |
| 7 | XL | 12 km | 20 min | NORMAL | — | ₹469.00 |
| 8 | Economy | 8.5 km | 22 min | NORMAL | FLAT50 | ₹108.00 |
| 9 | Economy | 5 km | 10 min | NORMAL | FREERIDE | ₹0.00 |

### Deliverable

Working code (any language, no frameworks/DB/API/UI required) plus a short note of any assumptions you made where the requirements above didn't fully specify behavior.

---

## 2. Our Approach

**Files**

- `rate-card.json`: base, per-km and per-minute tiers, min fare, and the SUV "greater of" flag, per vehicle type.
- `demand-levels.json`: demand multipliers.
- `promo-codes.json`: promo value and whether it is a percentage.
- `script.js`: the calculator. Loads the three JSON files with `fetch` once, then `calculateRate(vehicleType, distance, duration, demand, promoCode)` returns the fare.
- `index.html`: loads `script.js`. Results print to the browser console.

**Calculation**

1. Distance and time costs are tiered: each tier covers up to `uptoKms` / `uptoMins`, and `null` means "the rest".
2. Variable cost: the greater of distance and time cost for SUV (`greaterOfDistanceAndTime`), otherwise their sum.
3. Fare = base + variable cost, multiplied by the demand multiplier.
4. Minimum fare is applied to that total: if it is below the vehicle's min fare, the min fare is charged.
5. Promo is applied last, as a percentage or a flat amount.

**Decisions**

- Min fare is applied before the promo, so a discounted fare can fall below min fare. FREERIDE needs this to be 0.
- FREERIDE returns 0 immediately, before any calculation.
- An unknown promo code is ignored (no discount, no error).
- Vehicle type, demand level, and promo code are case-insensitive.

**Tests**

The nine sample cases from the problem statement are at the bottom of `script.js`. Each one prints its result to the console; all nine should match the table in section 1.

## 3. How to Run

No dependencies are needed. The page loads JSON with `fetch`, so it must be served over HTTP (opening `index.html` directly will not work).

From the project folder:

```
python3 -m http.server 8000
```

Then open http://localhost:8000 and check the browser console. Stop the server with Ctrl+C.
