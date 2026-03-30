---
description: High-level Drizzle ORM patterns and best practices. Schema design, migrations, relational queries, and typings.
related_to: [[typescript-advanced]] [[database-design]]
---
# Drizzle ORM Expert

This skill outlines the standard operating procedure for Database work using Drizzle ORM in the CRM project.

## Core Rules
1. **Schema Design**: Always define schemas with atomic table files. Use `pgCore` exports (`pgTable`, `varchar`, `timestamp`).
2. **Relationships**: Use Drizzle relations API to define table connections. Favor `db.query` for complex relational reads, but fall back to `db.select()` for performance-critical aggregation.
3. **Zod Integration**: Use `drizzle-zod` to automatically generate `insert` and `select` schemas from drizzle tables.
4. **Migrations**: 
   - Never write raw SQL for migrations manually unless absolutely necessary. Use `drizzle-kit generate` to create migrations based on schema changes. 
   - Always verify the generated SQL and commit it.
5. **Types**: Infer types using `InferSelectModel` and `InferInsertModel` from `drizzle-orm`.
6. **Querying Patterns**:
   - Use `db.transaction()` rigorously for any multi-step writes.
   - Prefer Drizzle's relational query API (`db.query.table.findFirst`, `findMany`) for simpler readable queries within Next.js components.
