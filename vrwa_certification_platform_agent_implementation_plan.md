## Background

Our stakeholders (“VRWA”) offer 3–12 training classes per month for water and wastewater treatment operators across the state. These classes provide continuing education credits required for certification. Currently, over 90% of class registrations are completed via the VRWA website, which uses WordPress with WooCommerce and Event Tickets Plus. However, registrations are manually entered into a Microsoft Access database that also handles payment tracking, sign-in sheets, attendance, certificates, and regulatory reporting. This project seeks to replace the outdated database with a modern, integrated certifications platform that automates registration syncing, enhances usability, and improves access for both operators and regulatory partners.

## Web app structure plan

Role-based views:

- Default
  - Homepage
  - Login
  - Logout
- User (“trainee”) (“operator”)
  - Dashboard
  - Calendar view
  - Course sign up page with waitlist
  - Payment portal (stripe)
  - Invoice viewer (stripe)
- Admin
  - Dashboard
    - Overview of all other pages
  - Courses
    - Schedule courses and course sessions
    - Set trainees and instructors
    - Bulk send out certificates per course sessions
  - Trainees
    - Manage users and profiles for trainees
  - Roles
    - Manage roles for instructors, trainees, and adminsA
  - Certification pdf export
  - Invoices
    - View and send out invoices (stripe)
- Instructor
  - Dashboard
  - Course session manager for taught courses
  - Attendance for taught courses

## Profile system

A user (an `account`) can be associated with multiple named profiles (think: Netflix-style profile system). When someone logs in using an account’s credentials, they are greeted with a screen where they select what person’s information they want to work with. Accounts with only one associated profile bypass this screen.

## Admin view

1.  Course manager (prototype already implemented)

    For VRWA staff to manage upcoming courses end-to-end: create/edit course details (title, description, instructor, dates), manage the trainee roster (add/remove trainees), optionally handle a waitlist, it should also integrate with certifications batch export.

    - Must support user-friendly CRUD for both courses and classes/sessions (courseEvents)

2.  Admin dashboard (partially implemented). Easy access to other pages
    and common workflows. Links should work to view a specific course,
    class, trainee, or user on a given page.

3.  Invoices (Stripe)

    Provide a single interface for VRWA staff to view and manage invoices.

    Support core workflows:

    - Review unpaid invoices by month
    - Record payments (credit card / check)
    - Mark invoices as paid, partially paid, waived, or refunded
    - Export invoice reports for accounting and compliance workflows

4.  Trainee manager (prototype is implemented)
    - Add a tabbed or toggle view for switching between viewing past,
      future, or all classes.

5.  User manager
	1.  Manage roles (Trainee, Instructor, Admin)
    2. Search users with a DataTable and easily update their role

6.  Payment portal (stripe)

- Basic stripe interface

7.  Certification pdf exporter (pdf generation prototype implemented, review @backend/src/pdf/pdf_template.tsx and @backend/src/routers/certificate.tsx)

	Provide a UI in Admin Dash to generate PDFs for:
    - A single trainee for a given course
    - All trainees in a class (bulk export)
	    -  Also must be accessible from course manager to batch send out certifications from a whole class.
	    - Manually add and remove trainees to send PDFs for
    -  Admin can download individual certificates or send out emails to all trainees with the appropriate certificate.
    - This feature includes automated email features. Update
      .env.example with configuration variables needed to send emails.

## Certification PDFs generator

- These will actually be generated on-the-fly instead of saved somewhere
- The PDF generation code is already implemented in the backend! This code should be used. This API simply returns a blob.
- Admins can mass-send out emails with certificates
- Admins can download or send individual certificates through email
- Trainees can download their certificates from their portal.

## Trainee view

- Sidebar should show current profile and a link to [open a view to switch profiles](#profile-system).
- User dashboard
	- Show upcoming course sessions
	- Once Stripe is integrated: Show unpaid invoices (quick view)
- Calendar view showing former and upcoming sessions
  - Support filters: date range, location type, course, availability (open/full).
  - Calendar UI (month/week/list toggle).
  - Event cards with date/time, course name, location, seats remaining.
  - Filters for location type and availability.
  - Link to event details and registration/waitlist actions.
- Sign up page for courses with waitlist if full
- Certificate download page
- Invoice viewer with Stripe
- Payment portal with Stripe

## Instructor view

- Dashboard to view upcoming taught courses
- Do not yet implement class manager for taught courses. This needs more
  planning and stakeholder discussion. Just the dashboard and attendance
  page.
- Attendance page, including partial/custom options for trainees leaving
  early. For now, this should just mean the instructor can set the exact
  number of earned credit hours or use the default `course.creditHours`.
  - Important: allow printable attendance sheet for signatures.

  VRWA’s current sign-in sheet looks like this:

  | Name           | System/Organization      | Address                        | Phone        | Email                    | Sign In | Break 1 | Break 2 |
  | :------------- | :----------------------- | :----------------------------- | :----------- | :----------------------- | :------ | ------- | ------- |
  | Steve Autiello | Barclay Water Management | 1 Ecolab Pl, St Paul, MN 55102 | 508-505-7619 | nick.powderly@ecolab.com |         |         |         |

## Note on views

Build a kind of “virtual view” feature so that admins can see trainee and instructor views. Additionally, instructors should be able to open the trainee view. This is also useful for testing, as a single admin account can be used to explore the whole app. This feature should be implemented as a simple dropdown in the footer of the admin sidebar. All this does is link to the appropriate view. The trainee and instructor’s `Layout` pages will check the role of the authenticated user. If they do not have a high enough role, they will be redirected to the appropriate age. If they are of a higher role, they are in this kind of “virtual” mode; do NOT call it a “virtual view” in the actual web app, this is just for explanation and code purposes. In this state, the layout should display a colored header at the top of the page including a link to return to their regular view. Something like, “You are an _admin_, but this is the _trainee_ view. Browse around, or **click here to return**”.

## Database (drizzle with postgres)

The current database schema is fairly developed. Carefully read and understand @backend/database/schema.ts. We should mostly just need to change the schema minimally for: (1) better-auth integration (better-auth generates its own schema for authentication), and (2) certain meta-fields like using a `deleted` status field instead of actually deleting the value from the database. INSTEAD of making other significant changes to the schema when it is believed to be necessary for a feature or workflow, simply log the brief issue in a Notes.md file and write the code in a modular way such that changes and additions can be made in the future.

- The `reservation` table also acts as an “attendance” once a courseEvent has passed – it connects a `profile` with a `courseEvent`. 
- Both `course` and `reservation` have a `creditHours` field. By default, an operator who’s marked as attended earns `course.creditHours`, but an admin or an instructor may manually set the number of credit hours earned. 
- The `courseEvent` codename refers to a "class" or "session"

## Authentication

Review the old incomplete `add-better-auth` branch. Merge its concepts into the main schema and replace all existing authentication middleware with better-auth’s role-based access control. Then, drizzle seed data will have to be updated. Email login and signup should be implemented and automatic redirections must be performed.

## Tools, libraries, with associated Skills

We make full use of all of these libraries and tools. Agents must learn the associated skill when using them to ensure they are used correctly.

- shadcn/ui. All core UI components. Use Skill @shadcn and see files in @frontend/components/ui
- react-router. Skill @react-router-framework-mode
- @tanstack-table. Used for both data-tables and custom usage in single entry views & editors. For our custom usage, see files in @frontend/util/field-defs/ and @frontend/components/entry-views/.
- @tanstack-query. All queries.
- playwright. All code written by an AI agent must also be tested using this library in addition to regular unit tests. Skill @playwright-cli.
- drizzle ORM database definition and schema with postgres. Skill @drizzle-orm.
- @zod types and database query integration with drizzle-zod.
- trpc. Skill @react-query-setup for frontend and Skill @trpc-router for backend with associated skills @middleware and @validators. 
- better-auth. Skill @better-auth-best-practices and Skill @email-and-password-best-practices
- @bun build tool and runtime. Important: use bun/bunx not npm/npmx!
- Stripe. Library not yet added. Install with `bun` and follow Skill @stripe-best-practices. 

## Development Guidelines

- Test Driven Development. Write both unit tests and end-to-end
  integration tests using Playwright to test every feature. Use @playwright-cli.
- State management: tRPC and React Query.
- Styling: Tailwind CSS conventions. Use `@lg:`, `@xl:`, etc for responsive
  design in pages (note the “@” symbol). Don’t use explicit colors but
  variables like `bg-background`. className should not get insanely long.
  **Prioritize consistent design across pages.**
- Frontend component structure: separate page views from reusable UI
  components. For CRUD: Use tanstack-table ColumnDefs defined in
  @webapp/utils/field-defs/. Make use of views in
  @webapp/app/components/entry-views/ including edit-drawer.tsx, which
  is a generic side drawer defined by ColumnDefs with a custom
  meta.editor field. Use @webapp/components/data-table for robust table
  search, filtering, sorting, and pagination out of the box. Use
  @shadcn/ui to add any needed UI components to the project.
- Backend router structure in @backend/routers/: Use table-oriented
  routers like “profile.ts” and “reservation.ts” as well as
  view-oriented routers like we have for “admin.ts” and “instructor.ts”.
  Table-oriented routers can also separately export helper functions
  that return query builders for the associated DTOs – then
  `adminRouter`, `instructorRouter`, and `traineeRouter` can use these
  helper functions in their own router procedures.
- API types. These should be defined in @backend/database/dtos.ts.
- Type safety. This is a priority. Run `tsc` _in each subproject_ and fix
  compilation errors. Avoid use of `any` (or put a concise comment as to
  why it is necessary and avoid duplicating it across files), prefer
  `undefined`.
- External development tools: all through the commands in the
  packages.json files. Use `bun` and NOT npm or other. Note: use playwright-cli
  instead of npx playwright.
- Git: whenever you can _verify_ the application is working (through playwright-cli), create a commit with your current changes as a snapshot.
- Coding style: Run `bun format` to format code. No AI slop code or AI slop text.

## Running commands

1. Development servers MUST BE RUN IN THE BACKGROUND. Otherwise, you will deadlock waiting for it to finish.
2. Before re-running dev servers, kill existing processes with pkill -f 'bun dev'
3. Use `2>&1 >/dev/null` to avoid filling your memory with verbose output but see errors clearly.

You don't have to ask for permission to run these commands. You do need to run them correctly.

- `playwright-cli <args>` and `bunx playwright <args>` Use @playwright-cli Skill for correct usage.
- `bun dev &` Runs both the webapp and backend development servers.
- `cd backend && bun dev &` Run just the backend development server without filtering output.
- `cd webapp && bun dev &` Run just the webapp development server without filtering output.
- `cd backend && bun db:dev 2>&1 >/dev/null` This does a complete rebuild of the database and its docker container (will take ~8 seconds to run).
- `cd backend && bun tsc` Check typescript linting errors in the backend project.
- `cd webapp && bun tsc` Check typescript linting errors in the webapp.
- `bun format` Format the entire codebase.
- `git commit -m "Phase <number>: <updates>"` For committing current code

## Agent Execution Plan

Do NOT attempt to write the entire application at once. Follow this phased approach absolutely.

### Before each phase

For each phase, before writing any code, you must:

1.  Review the relevant files in the @backend and @webapp directories. Identify what features are partially implemented. Review relevant Skills for relevant frontend and backend features.
2.  Output a brief, step-by-step technical implementation plan for only the current phase.
	1. For each new page, create a UI/UX design plan for the interface. The interface should be consistent with other pages, support common workflows for the operator/instructor/admin, and be accessible.
	2.  Specify which files will be modified or created.
	3.  Include comprehensive testing and verification through unit tests and e2e tests inside the plan

- Before writing any tRPC procedure: (1) read @drizzle-orm Skill, (2) define the DTO in dtos.ts, (3) write the Zod validator, (4) wire the tRPC router

### After each phase

1. Make a git commit by running `git commit -m "Phase <number>: <short message>"`
2. Check unit tests and E2E tests pass. Check that everything that is testable is tested.
3. Check that code is high quality and all Development Guidelines are be met.
4. Check that all features are fully implemented.
5. Re-iterate on missing features and low-quality code with Test Driven Development then go back to step 2.
7. Run `bun tsc` from each subproject and go through typescript errors one by one
8. Only then is the phase considered completed.
9. Make a Git commit from the command line with `git commit -m "Phase <number>: <fixes>"`.

### Phase 0: Playwright

1. Setup playwright and use with @playwright-cli.

### Phase 1: Auth

1.  Implement the `better-auth` integration. Use the terminal to run `git diff main add-better-auth "backend/src/auth/*"` for a reference. You will need to rewrite seeding data to work with better-auth.
2.  Implement role-based middleware for tRPC routers.
3.  Update layout files with (1) role-based redirection and (2) “virtual view” impersonation
4.  Set up Playwright and write E2E tests.

### Phase 2: Instructor & Trainee Portals

1.  Build Instructor dashboard and Attendance page

- Attendance page should have a regular DataTable view, and then an option to "Print attendance sheet", which brings the user to a clean printable view that also hase css print values set so that printing hides everything just includes the attendance table.
- Attendance page should allow setting a trainee as present, which makes it default to filling in `course.creditHours` for earned credit hours. They should then be able to set manually the number of credit hours.
- All links in Instructor view should work.

2.  Build Trainee dashboard, calendar view, and signup flow (including the waitlist logic).

3.  Test
  - Write tests for all API endpoints
  - Create playwright tests for instructor dashboard, trainee dashboard, trainee calendar view, and trainee signup

### Phase 3: Admin Features

1. Complete and refine the Admin Course Manager backend routers and frontend views.

  - Use ColumnDefs from @webapp/app/util/field-defs/course-event.tsx
  - Create a matching @webapp/app/util/field-defs/course.tsx
  - Convert all DataTables to use these definitions/presets
  - Convert all Create and Edit features to use the same definitions with @webapp/app/components/entry-views/edit-drawer.tsx
  - Use a DataTable for searching for new trainees to add to roster

3. Build the User Manager APIs and UI.

  - Define a UserDto object in the dtos.ts file.
  - Define ColumnDefs in @webapp/app/utils/field-defs/user.ts following same format of other files.
  - Define an `account` router. Add the necesary api calls for the Users admin page which return `UserDto`.
  - Build the Users admin page that queries the API, uses ColumnDefs based off of utils, and passes it to the DataTable component.
  - Customize the `cell` field for the Role column. It should have an "Edit" button which opens an EditDrawer. The EditDrawer
    only lets you set the Role and has a save button. This workflow is easy to use and minimizes input errors. See @webapp/app/admin/profile.ts
    for a reference for all of that.
  - Roles options should be labeled: "Operator", "Instructor", and "Admin"

5.  Test

  - Write tests for all API endpoints
  - Create playwright tests for admin User Manager and Course Manager


### Phase 4: Billing & Stripe Integration

Stripe Integration Decisions:
- Use Stripe Invoices API (not Checkout, not raw PaymentIntents)
- When a trainee signs up for a course, create a Stripe Invoice immediately (in draft or open state) for that course's fee. The admin can then review, adjust, and finalize it.
- Local DB additions: stripeCustomerId on account, stripeInvoiceId on reservation
- Stripe is the source of truth; query it directly for invoice listings (no local cache for MVP)
- Status mappings:
    - "paid by card" → Stripe handles via hosted invoice page
    - "paid by check" → invoice.pay({ paid_out_of_band: true }) + memo note
    - "waived" → invoice.pay({ paid_out_of_band: true }) with memo "Waived"
    - "refunded" → Stripe Refunds API against the charge; add a memo to the invoice
    - "uncollectible" → invoice.markUncollectible()
    - "void" → invoice.voidInvoice() (for invoices created in error)
- Webhooks: implement one endpoint listening to invoice.paid only
    (to handle the case where a trainee pays via the hosted invoice URL
     without admin involvement)
- Webhook test key goes in .env.example as STRIPE_WEBHOOK_SECRET

1. use Skill @stripe-best-practices
2. Build the trainee Payment Portal and Invoice Viewer

    - Design simple checkout page with embedded payment form
    - Implement proper validation and error handling
    - Add success/failure confirmation pages

3. Build the Invoices admin page

    - Review unpaid invoices by month
    - Mark invoices as paid, waived, or refunded
