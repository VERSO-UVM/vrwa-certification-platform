CREATE TABLE Registrations (
    FirstName VARCHAR(255),
    LastName VARCHAR(255),
    OrganizationName VARCHAR(255),
    Address VARCHAR(255),
    City VARCHAR(255),
    State VARCHAR(255),
    PostalCode VARCHAR(16),
    EmergencyPhone VARCHAR(16),
    Email VARCHAR(255),
    IsMember BOOLEAN,
    Payment VARCHAR(255),
    CourseName VARCHAR(255),
    ClassDate DATE,
    ClassLocation VARCHAR(255),
    StaffMember VARCHAR(255), -- was: NerwaStaff
    ClassCode VARCHAR(16),
    CreditHours INTEGER -- was: TCH
);
