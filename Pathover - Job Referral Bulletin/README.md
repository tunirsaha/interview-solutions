# Job Referral Bulletin

Invite-only app for curating job postings into labelled lists and sharing them. Users keep private lists, publish public ones, or share a private list with specific people by email.

## What it does

- **Invite-based sign-up**: existing users generate registration links; JWT login.
- **Lists and jobs**: create, edit and soft-delete lists and the jobs inside them (title plus apply link).
- **Sharing**: share a private list by email; recipients browse it under Shared Lists.
- **Dashboard**: all your lists as an accordion of jobs, with confirm dialogs on delete.

## Layout

| Folder | Role |
|--------|------|
| `api/` | Express + PostgreSQL. Routes, controllers and repositories per resource (`auth`, `lists`, `jobs`, `invites`, `list-shares`). SQL migrations, a schema sanity check against the entities, Swagger docs at `/api-docs` |
| `web/` | Angular 20 standalone components, signals, Bootstrap 5, lazy routes with an auth guard and HTTP interceptor |

Data model: `users`, `job_lists`, `jobs`, `invites`, `list_shares`; lists and jobs use a status flag for soft delete.

## Run

```bash
# api: needs Postgres and api/.env with DATABASE_URL and JWT_SECRET
cd api && npm install && npm run migrate && npm start   # :4000
cd web && npm install && npm start                      # :4200
```

`npm run migrate` seeds an admin user (see `api/migrations/001_init.sql`). `npm run sanity` checks the schema against the entities.
