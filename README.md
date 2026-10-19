# Inner Room Schema Scout

Before building THE INNER ROOM, inspect the Supabase project currently selected in this prompt.

IMPORTANT:
The database schema has already been created and verified manually. Do not execute SQL or make any database changes during this inspection.

Do not create a new Supabase project.
Do not enable Lovable Cloud or create a second backend.
Do not create, alter, drop, rename, or migrate tables.
Do not modify existing data, constraints, triggers, indexes, grants, or RLS policies.
Do not generate the application UI yet.

Inspect the existing Supabase schema and report the actual state of these four tables:

writing_projects

characters

scenario_library

character_explorations

Verify, where your available access permits:

Table columns and data types.

Primary keys, unique constraints, foreign keys, and check constraints.

Relationships that enforce matching ownership between projects, characters, and explorations.

Triggers for updating timestamps and preserving exploration scenario snapshots.

RLS status and policies on all four tables.

Whether the scenario library contains the 12 expected published scenarios.

Whether the existing schema supports the intended MVP.

The intended application uses Supabase Auth, PostgreSQL, and database-level RLS. Each user must access only their own projects, characters, and explorations. The scenario library is read-only for normal authenticated users and exposes published scenarios only.

Return a concise report with three sections:

Verified correctly.

Missing or mismatched items.

Items you could not verify.

Do not claim that anything was verified unless you actually inspected it. If your access is insufficient, explain what remains unverified and stop without making changes.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://inner-room-schema-scout.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5b6dc700-1f5f-4344-b915-6e3ae5704f21).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
