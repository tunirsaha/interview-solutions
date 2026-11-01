# ATM Clone

## 1. Problem Statement

Build an ATM simulator in the browser. A customer inserts a card, enters a PIN and withdraws cash. The machine tracks how many bills of each denomination it holds and pays out only what it can dispense. An admin can reload cash and see the transactions.

## 2. Our Approach

- One Angular module per screen, lazy-loaded. `user.guard` and `admin.guard` block a route until a card or admin session exists.
- A single `StoreService` of `BehaviorSubject`s holds the session, bill inventory and transactions. No backend.
- Dispensing is greedy, from `$100` down to `$1`. The amount is checked against the bills actually left, so an amount the machine can't make is rejected up front. Logic is in `UtilityService` (`atmBalanceUpdator`, `amountValidator`).
- Screens: card insert, simulated card read, PIN entry, wrong-PIN, and a success screen that redirects to the start. Admin has a separate login, then a dashboard to add bills per denomination and review transactions.
- Kiosk extras: live clock, branch details, a scrolling promo marquee, and a side menu where only Withdrawal and Support are enabled.
- Menu, delay and starting-inventory constants live in `shared/constants` and `shared/models`.

## 3. How to Run

```bash
npm install && npm start   # http://localhost:4200
```

Demo card `1234 1234 1234 1234`, PIN `123456`. Admin `admin` / `123` at `/admin`.
