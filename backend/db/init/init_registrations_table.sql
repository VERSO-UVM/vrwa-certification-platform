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

INSERT INTO Registrations
    (FirstName, LastName, OrganizationName, Address, City, State, PostalCode, EmergencyPhone, Email, IsMember, Payment, CourseName, ClassDate, ClassLocation, StaffMember, ClassCode, CreditHours)
VALUES
    ('Steven', 'Williams', 'Shelburne Wastewater', '53 Turtle Lane', 'Shelburne', 'VT', '05482-', '802-324-5307', 'swilliams@shelburnevt.org', TRUE, 'email registration - pd $24 6-20 ck#128596', 'Multimeters and Control Panels', DATE '2025-07-23', 'Montpelier, VT', 'Allison Smith', '072325MET', 3),
    ('Ethan', 'Graham', 'Town of St. Johnsbury', '799 Bay St', 'St. Johnsbury', 'VT', '05819-', '802-535-0521', 'egraham@stjvt.com', TRUE, 'order #20601 - pd $24 7-10 ck#98915', 'Multimeters and Control Panels', DATE '2025-07-23', 'Montpelier, VT', 'Allison Smith', '072325MET', 3),
    ('Elizabeth', 'Walker', '', '190 Valhalla Rd', 'Warren', 'VT', '05674-', '802-496-7480', 'elizabethwalker_56@hotmail.com', FALSE, 'order #20638 - pd $24 txn# 69A869067W725924V', 'Multimeters and Control Panels', DATE '2025-07-23', 'Montpelier, VT', 'Allison Smith', '072325MET', 3),
    ('Brett Lee', 'Vereecke', 'Sherburne Fire District #1', '46 Jay Drive', 'Poultney', 'VT', '05764-', '802-774-8234', 'brettvereecke@gmail.com', TRUE, 'apprenticeship owes $24', 'Multimeters and Control Panels', DATE '2025-07-23', 'Montpelier, VT', 'Allison Smith', '072325MET', 3),
    ('Craig', 'Pelletier', 'Town of Berlin', '108 Shed Rd', 'Berlin', 'VT', '05602-', '802-272-5805', 'craigopelletier25@gmail.com', TRUE, 'order #20681 - owes $24', 'Multimeters and Control Panels', DATE '2025-07-23', 'Montpelier, VT', 'Allison Smith', '072325MET', 3),
    ('Walt', 'Arsenault', 'Shelburne Wastewater', '53 Turtle Lane', 'Shelburne', 'VT', '05482-', '802-985-3533', 'warsenault@shelburnevt.org', TRUE, 'order #20694 - pd $24 6-24 ck#128601', 'Multimeters and Control Panels', DATE '2025-07-23', 'Montpelier, VT', 'Allison Smith', '072325MET', 3),
    ('Byron', 'Micheli', 'Barre Town', '79 Pitman Rd', 'Barre', 'VT', '05641-', '802-249-2393', 'bmicheli@barretown.org', TRUE, 'order #20698 - pd $24 7-1 ck#63190', 'Multimeters and Control Panels', DATE '2025-07-23', 'Montpelier, VT', 'Allison Smith', '072325MET', 3),
    ('Adam', 'Potter', 'Sunrise Homeowners Association', 'PO Box 335', 'Killington', 'VT', '05751-', '802-422-9494', 'cognito2112@gmail.com', TRUE, 'order #20710 - pd $24 txn# 9X396890KL091425X', 'Multimeters and Control Panels', DATE '2025-07-23', 'Montpelier, VT', 'Allison Smith', '072325MET', 3),
    ('Christopher', 'Huestis', 'Purpose Energy', '177 Industrial Ave', 'Middlebury', 'VT', '05753-', '802-343-9487', 'chuestis@purposeenergy.com', TRUE, 'order #20718 - pd $24 txn# 18N539215T9055450', 'Multimeters and Control Panels', DATE '2025-07-23', 'Montpelier, VT', 'Allison Smith', '072325MET', 3),
    ('Brian','Taylor','Weidmann Electrical Technology','125 Stark District Rd','St Johnsbury','VT','05819-','802-535-2218','brian.taylor@weidmann-group.com',TRUE,'order #20720 - pd $48 txn# 65Y18090GM4652006','Multimeters and Control Panels', DATE '2025-07-23','Montpelier VT','Allison Smith','072325MET', 3),
    ('Kirk','Patch','802 Water Treatment & Consulting LLC','227 West Melody Lane','Johnson','VT','05656-','802-371-9000','Watertreatment802@outlook.com','FALSE','order #20726 - pd $48 txn# 63C00343CC058003K','Multimeters and Control Panels', DATE '2025-07-23','Montpelier VT','Allison Smith','072325MET', 3),
    ('Jason','Kluza','City of Essex Junction Wastewater','39 Cascade St','Essex Junction','VT','05452-','802-878-6943','jkluza@essexjunction.org',TRUE,'order #20801 - pd $72 (3) txn# 6X790891AK500974C','Multimeters and Control Panels', DATE '2025-07-23','Montpelier VT','Allison Smith','072325MET', 3),
    ('Josh','Senackerib','City of Essex Junction Wastewater','39 Cascade St','Essex Junction','VT','05452-','802-878-6943','jsenackerib@essexjunction.org',TRUE,'order #20801 - pd $72 (3) txn# 6X790891AK500974C','Multimeters and Control Panels', DATE '2025-07-23','Montpelier VT','Allison Smith','072325MET', 3),
    ('Tyler','Sullivan','City of Essex Junction Wastewater','39 Cascade St','Essex Junction','VT','05452-','802-878-6943','tsullivan@essexjunction.org',TRUE,'order #20801 - pd $72 (3) txn# 6X790891AK500974C','Multimeters and Control Panels', DATE '2025-07-23','Montpelier VT','Allison Smith','072325MET', 3),
    ('Larry A','Rogers','Town of Hartford','192 Brookemeade Circle','White River Jct','VT','05001-','802 299-6767','larry.a.rogers@comcast.net',TRUE,'order #20807 - pd $24 txn# 62U66464U48058739','Multimeters and Control Panels', DATE '2025-07-23','Montpelier VT','Allison Smith','072325MET', 3)
    ;

