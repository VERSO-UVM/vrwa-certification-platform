# Agent Configuration

This file contains configuration and skill mappings for AI agents working on the VRWA Training Database project.

<!-- intent-skills:start -->
# Skill mappings - when working in these areas, load the linked skill file into context.
skills:
  - task: "Develop and test end-to-end browser automation"
    load: "node_modules/@playwright/cli/skills/playwright-cli/SKILL.md"
  - task: "Work with UI components, styling, and design system"
    load: ".agents/skills/shadcn/SKILL.md"
  - task: "Implement authentication, sessions, and role-based access control"
    load: ".agents/skills/better-auth-best-practices/SKILL.md"
  - task: "Follow best practices for React, React Router, and Vercel-style development"
    load: ".agents/skills/vercel-react-best-practices/SKILL.md"
  - task: "Implement email and password authentication security"
    load: ".agents/skills/email-and-password-best-practices/SKILL.md"
  - task: "Create custom skills for agents"
    load: ".agents/skills/create-auth-skill/SKILL.md"
  - task: "Set up and manage the tRPC server, routers, and Fastify adapter"
    load: "node_modules/@trpc/server/skills/trpc-router/SKILL.md"
  - task: "Set up tRPC client and React Query integration in the webapp"
    load: "node_modules/@trpc/tanstack-react-query/skills/react-query-setup/SKILL.md"
  - task: "Work with Drizzle ORM and database schema"
    load: ".agents/skills/drizzle-orm/SKILL.md"
<!-- intent-skills:end -->

## Project Structure

- `backend/`: Fastify server with tRPC and Drizzle ORM.
- `webapp/`: React Router v7 (Vite) frontend with Tailwind CSS and Shadcn UI.
- `e2e/`: Playwright end-to-end tests.

## Development Guidelines

- Use `bun` for all package management and running scripts.
- Follow Test-Driven Development (TDD) using Playwright for features.
- Use tRPC and React Query for state management and API calls.
- Prefer `credentials: "include"` for all tRPC and auth-related fetch calls.
