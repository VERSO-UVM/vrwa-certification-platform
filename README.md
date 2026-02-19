# Vermont Rural Water Association - Certification Platform

## Summary

The Vermont Rural Water Association (VRWA) offers 3–12 training classes per month for water and wastewater treatment operators across Vermont. These classes provide continuing education credits required for certification. Currently, over 90% of class registrations are completed via the VRWA website, which uses WordPress with WooCommerce and Event Tickets Plus. However, registrations are manually entered into a Microsoft Access database that also handles payment tracking, sign-in sheets, attendance, certificates, and regulatory reporting. This project seeks to replace the outdated database with a modern, integrated solution that automates registration syncing, enhances usability, and improves access for both operators and regulatory partners.

## Goal

To build a new training and credential tracking system that:
- Replaces the Microsoft Access database with a secure, web-accessible database
- Integrates with VRWA’s existing website for automatic data entry
- Enables operators to log in and view their training records and credit hours
- Supports reporting and compliance with Vermont regulatory agencies

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
  - Admin dashboard to manually upload credit hours from non-VRWA classes


## Implementation

- Build database layer with support for search, reporting, and user access control
- Design user-friendly web interface for staff and certified operators
- Set up admin tools for adding/editing training records and credit hours
- Support data migration from existing Microsoft Access database
- Configure export tools for monthly invoice tracking and credit hour reporting

## Testing and Launching

- Conduct internal testing with VRWA staff for registration syncing and admin workflows
- Beta test operator portal with a small group of users to gather feedback
- Soft launch with live data but limited access to ensure stability
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

1. Install dependencies: `bun install`
2. Run development servers: `bun --filter="*" dev`
