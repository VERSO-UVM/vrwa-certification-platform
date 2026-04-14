## Background

Our stakeholders (“VRWA”) offer 3–12 training classes per month for
water and wastewater treatment operators across the state. These classes
provide continuing education credits required for certification.
Currently, over 90% of class registrations are completed via the VRWA
website, which uses WordPress with WooCommerce and Event Tickets Plus.
However, registrations are manually entered into a Microsoft Access
database that also handles payment tracking, sign-in sheets, attendance,
certificates, and regulatory reporting. This project seeks to replace
the outdated database with a modern, integrated solution that automates
registration syncing, enhances usability, and improves access for both
operators and regulatory partners.

### Primary Project Goals

- Replace the MS Access db with a purpose built database layer
- Create a more purpose built user interface
- Automatically translate website registrations into this database (Currently, registrations are manually entered into MS Access)
- Allow operators to log in and view their upcoming courses and past completed courses (specifically, number of credit hours earned)
- Enable Vermont state officials to view the training history of operators, to smooth the process of official certification

## Web app layout plan

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

Think: Netflix-style profile system where a user (an `account`) can be
associated with multiple named profiles. When someone logs in using an
account’s credentials, they are greeted with a screen where they select
what person’s information they want to work with. Accounts with only one
associated profile would bypass this screen.

## Admin view

1.  Course manager (prototype already implemented)

    For VRWA staff to manage upcoming courses end-to-end: create/edit
    course details (title, description, instructor, dates), manage the
    trainee roster (add/remove trainees), optionally handle a waitlist,
    it should also integrate with certifications batch export.
    - Must support user-friendly CRUD for both courses and
      classes/sessions (courseEvents)

2.  Admin dashboard (partially implemented). Easy access to other pages
    and common workflows. Links should work to view a specific course,
    class, trainee, or user on a given page.

3.  Invoices (Stripe)

    Provide a single interface for VRWA staff to view and manage
    invoices.

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

6.  Payment portal

7.  Certification pdf exporter (pdf generation prototype implemented,
    review @backend/src/pdf/pdf_template.tsx and
    @backend/src/routers/certificate.tsx)
    1.  Also integrated with course manager to batch send out
        certifications from a whole class.

        Provide a UI in Admin Dash to generate PDFs for:
    - A single trainee for a given course

    - All trainees in a course (bulk export)

      Admin can download individual certificates or send out emails to
      all trainees with the appropriate certificate.

    - This feature includes automated email features. Update
      .env.example with configuration variables needed to send emails.

## Certification PDFs generator

- These will be generated on-the-fly instead of saved somewhere (though
  the user doesn’t need to know that)
- Admins can mass-send out emails with certificates
- Admins can download or send individual certificates through email
- Trainees can download their certificates from their portal.

## Trainee view

- Sidebar should show current profile and an link to [open a view to
  switch profiles](#profile-system).
- User dashboard (upcoming course sessions, unpaid invoices quick view)
- Calendar view showing former and upcoming sessions
  - Support filters: date range, location type, course, availability
    (open/full).
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
  - Important: printable attendance sheet for signatures.

  VRWA’s current sign-in sheet looks like this:

  | Name           | System/Organization      | Address                        | Phone        | Email                    | Sign In | Break 1 | Break 2 |
  | :------------- | :----------------------- | :----------------------------- | :----------- | :----------------------- | :------ | ------- | ------- |
  | Steve Autiello | Barclay Water Management | 1 Ecolab Pl, St Paul, MN 55102 | 508-505-7619 | nick.powderly@ecolab.com |         |         |         |

## Note on views

Build a kind of “virtual view” feature so that admins can see trainee
and instructor views. Additionally, instructors should be able to open
the trainee view. This is also useful for testing, as a single admin
account can be used to explore the whole app. This feature should be
implemented as a simple dropdown in the footer of the admin sidebar. All
this does is link to the appropriate view. The trainee and instructor’s
`Layout` pages will check the role of the authenticated user. If they do
not have a high enough role, they will be redirected to the appropriate
age. If they are of a higher role, they ware in this kind of “virtual”
mode. DO NOT call it a “virtual view” in the actual web app, this is
just for explanation and code purposes. In this state, the layout should
display a colored header at the top of the page including a link to
return to their regular view. Something like, “You are an _admin_, but
this is the _trainee_ view. Browse around, or **click here to return**”.

## Database (drizzle with postgres, backend)

The current database schema is fairly developed. Carefully read and
understand @backend/database/schema.ts. For example, the `reservation`
table also acts as an “attendance” table – it connects a `profile` with
a `courseEvent`. For this reason, both `course` and `reservation` have a
`creditHours` field. By default, an operator who’s marked as attended
earns `course.creditHours`, but an admin or an instructor may manually
set the number of credit hours earned.

We should mostly just need to change the schema minimally for: (1)
better-auth integration (better-auth generates its own schema for
authentication), and (2) certain meta-fields like using a `deleted`
status field instead of actually deleting the value from the database.

INSTEAD of making other significant changes to the schema when it is
believed to be necessary for a feature or workflow, simply log the brief
issue and change Notes.md file and write the code in a modular way such
that changes and additions can be made in the future.

## Authentication

Review the old incomplete `add-better-auth` branch. Merge its concepts into
the main schema and replace all existing authentication middleware with
better-auth’s role-based access control. Then, drizzle seed data will
have to be updated. Email login and signup should be implementd and
automatic redirections must be performed.

## Tools and libraries

We make full use of all of these libraries and tools.

- @shadcn/ui and @tailwind-css
  - Run `bunx --bun skills add shadcn/ui` to learn how to use through
    skills.md files
- @react-router
- @tanstack-table for both datatables and single entry views & editors.
  For the latter, see @frontend/util/field-defs/ and
  @frontend/components/entry-views/.
- @playright is not yet added. But all code written by an AI agent must
  also be tested using this library in addition to regular unit tests.
- @drizzle ORM database with postgres
- @Zod types and database query integration with @drizle-zod.
- @trpc
- @better-auth
- @vite webapp
- @bun build tool and runtime

## Development Guidelines

- Test Driven Development. Write both unit tests and end-to-end
  integration tests using Playright to test every feature.
- State management: tRPC and React Query.
- Styling: Tailwind CSS conventions. Use @lg, @xl, etc for responsive
  design in pages (note the “@” symbol). Don’t use explicit colors but
  variables like bg-background. className should not get insanely long.
  Prioritize consistent design across pages.
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
  packages.json files. Use `bun` and not npm or other.
- Git: whenever you can _verify_ the application is working (through
  Playright), create a commit with your current changes as a snapshot.
- Coding style: No AI slop code or AI slop text. Run `prettier` to
  format code.

## Agent Execution Plan

Do NOT attempt to write the entire application at once. Follow this
phased approach absolutely.

### Before each phase

For each phase, before writing any code, you must:

1.  Review the relevant files in the @backend and @webapp directories.
    Identify what features are partially implemented.
2.  Output a brief, step-by-step technical implementation plan (as a
    Markdown checklist) for only the current phase.
3.  Specify exactly which files will be modified or created.
4.  Include comprehensive testing and verification through unit tests
    and Playright inside the plan

### After each phase

Confirm unit tests and E2E tests pass, and that everything that is testable is
tested. Check that code is high quality and all Development Guidelines are be
met. Check that all features are fully implemented. Only then is the phase considered
completed, otherwise, re-iterate with Test Driven Development.

### Phase 0: Playright

### Phase 1: Auth

1.  Implement the `better-auth` integration. Use the terminal to run
    `git diff main add-better-auth "backend/src/auth/*"` for a reference.
    You will need to rewrite seeding data to work with
    better-auth.
2.  Implement role-based middleware for tRPC routers.
3.  Implement client-side
4.  Update layout files with (1) role-based redirection and (2) “virtual
    view” impersonation
5.  Set up Playwright and write E2E tests.

### Phase 2: Instructor & Trainee Portals

1.  Implement Instructor dashboard and printable attendance sheet.
2.  Implement Trainee dashboard, calendar view, and signup flow
    (including the waitlist logic).
3.  Write unit tests for all created tRPC endpoints. Write E2E tests.

### Phase 3: Admin Features

1.  Complete and refine the Admin Course Manager backend routers and
    frontend views.
2.  Complete the Trainee Manager and build the User Manager APIs and UI.
3.  As usual, perform robust testing using Playright.

### Phase 4: Billing & Stripe Integration

1.  Create database schema for Invoices and Payments.
2.  Implement Stripe Checkout session generation and Webhook listener.
    (Just update .env.example for Stripe API keys.)
3.  Build Admin Invoice dashboard and Trainee Payment portal.
