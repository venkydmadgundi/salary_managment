## Problem Statement

ACME Organization's HR team manages salary information for approximately 10,000 employees across multiple countries. Currently, this information is maintained using Excel spreadsheets, making it difficult to efficiently manage, search, analyze, and maintain salary data.

ACME wants to replace the Excel-based process with a web-based salary management application that enables the HR Manager to manage employee salary information and gain meaningful insights into how the organization compensates its workforce.

## Goal

Build a web-based Salary Management System that allows the HR Manager to:

- Browse and search employee salary information.
- Filter and sort employees based on relevant criteria.
- Create, update, view, and soft-delete employee records.
- Maintain salary history for employees.
- View salary and workforce statistics through a dashboard.
- Analyze salary distribution across countries and departments.

The application should be designed to efficiently handle approximately **10,000 employee records**.

## Target User

The primary user of the application is the **Human Resources Manager**.

## Scope

### 1. Data Model

#### Employees

The `employees` table should contain:

- `id`
- `name`
- `email`
- `country`
- `department`
- `job_title`
- `join_date`
- `employment_status`
- `salary`
- `created_at`
- `updated_at`
- `discarded_at`

#### Salary History

The `salary_history` table should contain:

- `id`
- `employee_id`
- `base_amount`
- `effective_on`
- `reason`
- `created_at`
- `updated_at`

### 2. Employee Management

Provide an employee listing page with:

- Server-side pagination with **10 employees per page**.
- Sortable columns.
- Filtering by:
  - Country
  - Department
  - Employment status
  - Salary range

### 3. Search

Provide free-text search functionality across:

- Employee name
- Employee email

### 4. Employee CRUD

The HR Manager should be able to:

- Create employees.
- View employee details.
- Edit employee information.
- Soft-delete employees.

The application should enforce validations including:

- Email must be unique.
- Salary is required.
- Salary cannot be negative.
- Required employee fields must be present.

### 5. Dashboard

Provide an HR dashboard displaying key salary and workforce metrics, including:

- Total headcount.
- Average salary.
- Median salary.
- Employee distribution by country.
- Employee distribution by department.

### 6. Seed Data

Provide a seed script that generates approximately **10,000 realistic employee records**.

The generated data should include:

- Multiple countries.
- Multiple departments.
- Different job titles.
- Realistic employment statuses.
- Country-appropriate salary distributions.
- Corresponding salary history where applicable.

## Out of Scope

The following features are intentionally excluded from this version:

1. CSV/Excel import.
2. Multi-currency salary support.

## Assumptions

1. All salaries represent **annual gross compensation**.
2. Currency is ignored for simplicity.
3. Each employee has exactly **one active salary** at any given time.
4. Historical salary changes are maintained in the `salary_history` table.
5. Deleted employees are soft-deleted rather than permanently removed.
