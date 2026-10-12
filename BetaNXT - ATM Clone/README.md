# ATM Clone

A browser-based ATM kiosk simulator. A customer inserts a card, enters a PIN and withdraws cash; the machine tracks how many bills of each denomination it holds and pays out only what it can actually dispense. An admin console reloads cash and shows the transaction log.

## What it does

- **Card flow**: card insert, simulated card read, PIN entry, wrong-PIN screen, withdrawal success with auto-redirect to the start.
- **Cash withdrawal**: greedy dispensing from `$100` down to `$1`. The amount field is validated against the bills actually left, so an amount the machine cannot make is rejected up front.
- **Admin**: separate login, then a dashboard to add bills per denomination and review transactions.
- **Kiosk chrome**: live clock, branch details, scrolling promo marquee, side-button menu (only Withdrawal and Support are enabled).

## How it is built

- Lazy-loaded feature module per screen; `canLoad` guards (`user.guard`, `admin.guard`) block routes until a card or admin session exists.
- Single `StoreService` of `BehaviorSubject`s holds session, bill inventory and transactions; no backend.
- Dispensing and validation live in `UtilityService` (`atmBalanceUpdator`, `amountValidator`).
- Constants for menu, delays and starting inventory sit in `shared/constants` and `shared/models`.

## Run

```bash
npm install && npm start   # http://localhost:4200
```

Demo card `1234 1234 1234 1234`, PIN `123456`. Admin `admin` / `123` at `/admin`.
