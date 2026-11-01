# Job Referral Bulletin

## 1. Problem Statement

Build an invite-only app for collecting job postings into lists and sharing them. A list can be private, public, or shared with specific people by email.

## 2. Our Approach

- `api/`: Express and PostgreSQL, with routes, controllers and repositories per resource (`auth`, `lists`, `jobs`, `invites`, `list-shares`). JWT login, SQL migrations, Swagger docs at `/api-docs`.
- `web/`: Angular 20 with standalone components, signals and Bootstrap 5. Lazy routes, an auth guard and an HTTP interceptor.
- Existing users generate invite links to bring in new ones. A job is a title plus an apply link.
- Recipients of a shared list see it under Shared Lists. The dashboard shows your lists as an accordion of jobs, with a confirm dialog on delete.
- Lists and jobs are soft-deleted through a status flag.
- Tables: `users`, `job_lists`, `jobs`, `invites`, `list_shares`.

## 3. How to Run

```bash
# api: needs Postgres and api/.env with DATABASE_URL and JWT_SECRET
cd api && npm install && npm run migrate && npm start   # :4000
cd web && npm install && npm start                      # :4200
```

`npm run migrate` seeds an admin user (see `api/migrations/001_init.sql`). `npm run sanity` checks the schema against the entities.
