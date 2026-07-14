# Vermont Rural Water Association - Certification Platform

## Background

The Vermont Rural Water Association (VRWA) offers approximately 10-15 training classes per quarter for water and wastewater treatment operators across Vermont. These classes provide credit hours required for water certifications and wastewater licenses. <!-- Need to check with VRWA to confirm this is still accurate -->Currently, over 90% of class registrations are completed via the VRWA website, which uses WordPress with WooCommerce and Event Tickets Plus. However, registrations are manually entered into a Microsoft Access database that also handles payment tracking, sign-in sheets, attendance, certificates, and regulatory reporting.<!----> This project seeks to replace the outdated database with a modern, integrated solution that automates registration syncing, enhances usability, and improves access for both operators and regulatory partners.

## Goal

To build a new training and credential tracking system that:
- Replaces the Microsoft Access database with one that is secure and web-accessible
- Integrates with VRWA’s existing website for automatic data entry
- Enables trainees to log in and view their training records and credit hours
- Supports reporting and complies with Vermont regulatory agencies <!-- Need to check with K about what this entails -->

## Design and Development

**Core Features**:
- **Administrator dashboard** for manually adding phone, mail, or walk-in registrants, as well as credit hours from non-VRWA classes
- **Instructor dashboard** with attendance tracking and adjustment of earned credit hours
- **Trainee dashboard** with access to:
  - Upcoming class schedule and registration status
  - Past class attendance and earned credit hours
  - Downloadable course completion certificates
- Automatic syncing of website registrations into a secure backend database
- Support for data migration from the existing Microsoft Access database
- Payment tracking for credit card and check-based registrations
- Monthly reports of unpaid invoices
- Waitlist functionality for full classes

## Implementation

- Build database with support for search, reporting, and user access control
- Design user-friendly web interface for administrators, staff, and trainees
- Configure tools to track monthly invoices and report credit hours

## Testing and Launching

- Work with VRWA staff to conduct internal testing for administration workflows and registration syncing
- Beta test trainee portal with a small group of users to gather feedback
- Soft launch with live data but limit access to ensure stability
- Official public launch to all users with an announcement on the VRWA site
- Monitor system for bugs and user experience issues, with a post-launch improvement phase

## Resources

### Partners and Stakeholders

- Vermont Rural Water Association Staff
- Certified Water & Wastewater Operators

### Potential Funding

<!-- Need to check with K to see if this is still accurate -->

- Internal VRWA budget
- State training and compliance funds
- Potential grants for workforce development or public infrastructure training systems

## Contribution & Development Instructions

### Initial setup:
#### Docker
First, install [Docker Desktop](https://docs.docker.com/get-started/get-docker/) on your computer. Docker allows you to run applications and their dependencies in containers, which share the same OS kernel but don't affect other containers. This gives you a more isolated environment, which means the software in each container will run uniformly. Docker Desktop must be running to create the container you will use to run this project.
#### .env
Next, in the [backend directory](backend), copy all lines from `.env.example` and paste them a new `.env` file (in the same directory). `.env` files generally store environment variables, and this one stores the URL for the database used by the project.
#### Bun
Once this is complete, go back to the [main directory](.) of the project. Then go to [bun.sh](https://bun.sh) to install Bun if it is not already on your computer. (Bun is primarily a runtime environment for JavaScript, but also functions as a package manager, among other things.)

In the terminal, run the command `bun install`. This will install all necessary dependencies for the project from `package.json`.

Then run `bun db:dev`. This will set up the development database for the project. For more information on everything this command does, view the README in the backend directory ([backend/README.md](backend/README.md)).

Finally, run `bun dev`. In the webapp section of the terminal output, open the link to the local host. Now you can view the running webapp! To close the webapp, run the command `docker compose -f backend/compose.dev.yml down` in the terminal.

### Quickstart
Once you have done the initial setup, you can simply run the following commands to get the webapp running:
```bash
# to make sure all dependencies are installed:
$ bun install

# to set up the development database:
$ bun db:dev # Docker Desktop must be open

# to run development servers:
$ bun dev
```

## Architecture

This project is structured as a monorepo with a `backend` API and a `webapp`.
Please see `backend/README.md` for details on the backend.

```
├── backend                             
│   ├── drizzle               // Generated database schema and migration files
│   ├── seed                  // Our custom seed data generation
│   ├── src                   // All the backend code
│   │   ├── auth              // Better-auth configuration
│   │   ├── database          // Main drizzle schema (and generated auth schema)
│   │   ├── pdf               // PDF generation
│   │   ├── routers           // API routers 
│   │   └── utils             
│   │       └── trpc          // TRPC configuration
│   ├── test                  // API tests
│   └── tool                  // Development and migration tools
└── webapp
    ├── app                   // All the frontend and web server code
    │   ├── admin             // All ADMIN pages
    │   ├── auth              // Login and signup pages
    │   ├── components        // Components common in different places
    │   │   ├── data-table    // Our fancy shmancy data table component
    │   │   ├── entry-views   // CRUD forms/views used with utils/field-defs.ts
    │   │   └── ui            // shadcn/ui components
    │   ├── hooks             // React custom useXXX hooks
    │   ├── instructor        // All INSTRUCTOR pages
    │   ├── layouts           // React-Router layouts
    │   ├── routes            // React-Router page loading and metadata
    │   ├── trainee           // All TRAINEE pages
    │   └── utils             // Helpers and utilities
    │       └── field-defs    // Defs for generating CRUD for database types
```
