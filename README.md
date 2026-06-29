# Vermont Rural Water Association - Certification Platform

## Summary

The Vermont Rural Water Association (VRWA) offers approximately 10-15 training classes per quarter for water and wastewater treatment operators across Vermont. These classes provide credit hours required for water certifications and wastewater licenses. <!-- Not sure if this next section is accurate - need to confirm -->Currently, over 90% of class registrations are completed via the VRWA website, which uses WordPress with WooCommerce and Event Tickets Plus. However, registrations are manually entered into a Microsoft Access database that also handles payment tracking, sign-in sheets, attendance, certificates, and regulatory reporting.<!----> This project seeks to replace the outdated database with a modern, integrated solution that automates registration syncing, enhances usability, and improves access for both operators and regulatory partners.

## Goal

To build a new training and credential tracking system that:
- Replaces the Microsoft Access database with a secure, web-accessible database
- Integrates with VRWA’s existing website for automatic data entry
- Enables operators to log in and view their training records and credit hours
- Supports reporting and compliance with Vermont regulatory agencies <!-- What does this mean? -->

## Design and Development

- **Core Features**:
  - Automatic syncing of website registrations into a secure backend database
  - Admin dashboard for manually adding phone, mail, or walk-in registrants
  - Attendance tracking and adjustment of earned credit hours
  - Certificate generation and exportable sign-in sheets
  - Waitlist functionality for full classes
  - Monthly reports of unpaid invoices
  - Payment tracking for credit card and check-based registrations

- **User Portal Features**:
  - Operator login with access to:
    - Upcoming class schedule and registration status
    - Past class attendance and earned credit hours
    - Downloadable course completion certificates
  - Admin dashboard to manually upload credit hours from non-VRWA classes <!-- why not add this above? -->
  <!-- Add something about instructor view? -->
  
<!--
Why do we have core features and user portal features as different sections? I think we can combine them, or make three subsections of a "Features" section for admin view, student view, and instructor view
-->

## Implementation

- Build database layer with support for search, reporting, and user access control
- Design user-friendly web interface for staff and certified operators
- Set up admin tools for adding/editing training records and credit hours
- Support data migration from existing Microsoft Access database
- Configure export tools for monthly invoice tracking and credit hour reporting

<!-- I feel like a lot of this is repeating the features section above. Maybe we add more details to the features section and keep this more general?
-->

## Testing and Launching

- Conduct internal testing with VRWA staff for registration syncing and admin workflows
- Beta test operator portal with a small group of users to gather feedback
- Soft launch with live data but limit access to ensure stability
- Official public launch to all users and operators with communication via the VRWA site
- Monitor system for bugs and user experience issues, with a post-launch improvement phase

## Resources for this project idea

### Partners and Stakeholders

- Vermont Rural Water Association Staff
- Certified Water & Wastewater Operators

### Potential Funding

- Internal VRWA budget
- State training and compliance funds
- Potential grants for workforce development or public infrastructure training systems

### Example Tools and Inspirations
[Operator Certification and Training References - US EPA](https://www.epa.gov/operator-certification)

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

