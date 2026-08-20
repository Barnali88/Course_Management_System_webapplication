# Course Management System

A modern full-stack Course Management System designed to manage students, teachers, staff, courses, categories, enrollments, payments, and user profiles from a clean role-based web interface.

The platform uses a React frontend with a FastAPI backend and PostgreSQL database. Different account types receive different permissions and dashboard experiences based on their role.

---

## Main Features

* Modern responsive dashboard interface
* Secure login with JWT authentication
* Role-based access control
* Admin, Staff, Teacher, and Student accounts
* Public student registration
* User profile management
* Profile image upload
* Student self-profile management
* Teacher profile management
* Staff profile management
* Course management
* Course thumbnails
* Course material uploads
* Course categories
* Teacher assignment to courses
* Student course browsing
* Course detail pages
* Student enrollment system
* Enrollment confirmation and cancellation
* Payment management
* Dashboard statistics
* Recent enrollment information
* Popular course statistics
* PostgreSQL database integration
* FastAPI Swagger API documentation
* Local file storage for uploaded images and course materials

---

## User Roles

The system contains four main user roles.

### Admin

Admin has the highest level of access and is responsible for managing the platform.

Admin can:

* Create and manage users
* Create teacher, staff, and administrator accounts
* Activate or deactivate users
* Manage student accounts
* Manage teacher profiles
* Manage staff profiles
* Create and manage courses
* Create and manage categories
* Assign teachers to courses
* Upload course thumbnails
* Upload course materials
* Manage enrollments
* Manage payments
* View dashboard statistics
* View platform-wide information

---

### Staff

Staff assists with platform management and administration.

Depending on the available permissions, staff can:

* View student information
* Manage enrollments
* Manage course-related information
* Work with course categories
* View dashboard statistics
* View payment and enrollment information

Staff accounts are created by an administrator.

---

### Teacher

Teacher accounts are created by an administrator and linked to a separate teacher profile.

A teacher profile can contain:

* Biography
* Phone number
* Expertise

Teachers can:

* Log in using their own account
* Update their account information
* Upload a profile image
* View courses assigned to them
* View course details
* Upload course materials for courses they teach

Teachers do not create categories or create new courses.

---

### Student

Students can create their own accounts through public registration.

Student accounts are automatically assigned the Student role.

Students can:

* Register and log in
* Update their own account information
* Change their password
* Upload a profile image
* Complete their student profile
* Update their student information
* Browse available courses
* View course details
* View course teachers and categories
* Access available course materials
* Enroll in courses

Student profile information includes:

* Phone number
* Address
* Date of birth

Students cannot create courses, edit courses, upload course thumbnails, or upload course materials.

---

## Tech Stack

### Frontend

* React
* JavaScript
* React Router
* Axios
* Formik
* Yup
* Tailwind CSS

### Backend

* Python
* FastAPI
* SQLAlchemy
* PostgreSQL
* JWT Authentication
* Pydantic
* Uvicorn

### File Handling

* Profile image upload
* Category image upload
* Course thumbnail upload
* Course material upload
* Local media storage

---

## Project Purpose

The Course Management System was created to provide a centralized platform for managing educational users, courses, enrollments, and learning resources.

Traditional course management can become difficult when user information, teacher assignments, course materials, enrollments, and payments are handled separately.

This project combines these features into one role-based platform where each type of user only receives the tools and information relevant to them.

The project is designed for:

* Educational institutions
* Training centers
* Course providers
* Learning platforms
* Academic management systems
* Full-stack development practice
* Portfolio demonstration

---

## How It Works

1. A user opens the Course Management System.
2. Students can create their own account from the registration page.
3. Teacher, Staff, and Admin accounts are created by an administrator.
4. The user logs in with their email and password.
5. FastAPI verifies the credentials and generates JWT access and refresh tokens.
6. The frontend loads the interface according to the user's role.
7. Students can complete and update their personal student profile.
8. Admin manages users, courses, categories, teachers, students, and staff.
9. Teachers access courses assigned to their teacher profile.
10. Students browse available courses and view course information.
11. Enrollment and payment information is stored in PostgreSQL.
12. Uploaded images and course files are stored through the backend file service.
13. Dashboard statistics are generated from database records.

---

## Authentication

The application uses JWT Bearer authentication.

After successful login, the backend generates:

* Access token
* Refresh token

Protected API routes require a valid Bearer token.

The backend also checks the logged-in user's role before allowing access to restricted operations.

---

## User Profiles

All account types share a main User account containing information such as:

* Name
* Email
* Password
* Role
* Profile image
* Active status

Role-specific information is stored separately.

### Student Profile

Student profiles contain:

* User ID relationship
* Phone
* Address
* Date of birth
* Creation date

Students can manage their own student information through their authenticated profile.

### Teacher Profile

Teacher profiles contain:

* User ID relationship
* Biography
* Phone
* Expertise
* Creation date

### Staff Profile

Staff information is stored separately from the main User account and linked using the user's ID.

---

## Course Management

Courses can contain:

* Course title
* Description
* Price
* Category
* Assigned teacher
* Thumbnail
* Course material
* Active status

Students can browse courses but cannot modify course content.

Administrative users manage course creation and course information.

Teachers can work with learning materials for courses assigned to them.

---

## Course Categories

Courses can be organized into categories.

Each category can contain:

* Category name
* Category information
* Category image

Course pages display the category name instead of internal database IDs.

---

## Teacher Assignment

Teacher accounts are linked to Teacher profile records.

Courses reference the Teacher profile rather than directly using the main User ID.

This allows the platform to keep general account information separate from teacher-specific information such as biography, phone number, and expertise.

---

## Student Self Profile

Students can manage their own role-specific information through dedicated authenticated API routes.

Available operations include:

```text
GET /api/v1/students/me
POST /api/v1/students/me
PUT /api/v1/students/me
```

Students can create their profile if it does not exist and update it later from the frontend Profile page.

---

## Pages

### Login

Allows registered users to securely log in to the platform.

---

### Register

Allows new students to create an account.

Public registration is intended for Student accounts.

---

### Dashboard

The dashboard provides an overview of platform activity.

Administrative dashboard information can include:

* Total students
* Total teachers
* Total courses
* Total enrollments
* Revenue
* Recent enrollments
* Popular courses

---

### Profile

The Profile page allows users to manage their personal account.

Users can update:

* Name
* Email
* Password
* Profile image

Students also receive additional fields for:

* Phone
* Address
* Date of birth

Internal database User IDs are not displayed to regular users.

---

### Courses

The Courses page displays available courses.

Students receive a read-only course browsing experience.

Administrative users receive management tools depending on their permissions.

Teachers receive access to courses associated with their teacher profile.

---

### Course Details

The Course Details page displays information such as:

* Course title
* Description
* Price
* Category name
* Teacher
* Course status
* Available course material

Database IDs are not intended to be displayed as user-facing course information.

---

### Categories

Allows authorized users to organize courses into categories and manage category information.

---

### Users

Allows administrators to manage platform accounts.

---

### Teachers

Allows teacher profiles to be created and managed.

Teacher profiles are linked to User accounts.

---

### Students

Allows authorized users to view student profiles and student information.

Students manage their own personal details through their Profile page.

---

### Staff

Allows staff profiles to be created and managed.

---

### Enrollments

Stores relationships between students and courses.

The system supports:

* Creating enrollments
* Viewing enrollments
* Confirming enrollments
* Cancelling enrollments
* Preventing duplicate enrollments

---

### Payments

Stores course payment information related to enrollments.

Completed payments can automatically confirm an enrollment.

---

## API Features

The FastAPI backend includes API routes for:

* Authentication
* Token refresh
* Users
* User profiles
* Profile images
* Roles
* Students
* Student self-profile
* Teachers
* Staff
* Courses
* Course thumbnails
* Course materials
* Categories
* Category images
* Enrollments
* Payments
* Dashboard statistics

---

## API Documentation

FastAPI automatically provides interactive Swagger documentation.

```text
http://127.0.0.1:8000/docs
```

The documentation can be used to test API routes, authentication, request data, and backend responses.

---

## Project Structure

```text
course-management-system/
│
├── backend/
│   │
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       └── routes/
│   │   │           ├── auth.py
│   │   │           ├── categories.py
│   │   │           ├── courses.py
│   │   │           ├── dashboard.py
│   │   │           ├── enrollments.py
│   │   │           ├── payments.py
│   │   │           ├── roles.py
│   │   │           ├── staffs.py
│   │   │           ├── students.py
│   │   │           ├── teachers.py
│   │   │           └── users.py
│   │   │
│   │   ├── core/
│   │   │   ├── database.py
│   │   │   ├── deps.py
│   │   │   └── security.py
│   │   │
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   │
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   │
│   ├── public/
│   │
│   ├── src/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── categories/
│   │   │   ├── courses/
│   │   │   ├── dashboard/
│   │   │   ├── profile/
│   │   │   ├── staffs/
│   │   │   ├── students/
│   │   │   ├── teachers/
│   │   │   └── users/
│   │   │
│   │   ├── utils/
│   │   └── App.js
│   │
│   ├── package.json
│   └── tailwind.config.js
│
└── README.md
```

---

## Requirements

* Python
* PostgreSQL
* Node.js
* npm

Recommended development tools:

* VS Code
* PyCharm
* pgAdmin
* PostgreSQL command line tools

---

## Database

The project uses PostgreSQL as its relational database.

Main database entities include:

* Users
* Roles
* Students
* Teachers
* Staff
* Categories
* Courses
* Enrollments
* Payments

Relationships between users and role-specific profile tables allow the system to keep authentication information separate from student, teacher, and staff information.

---

## Backend Installation

Open the backend directory:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python -m venv .venv
```

Activate the virtual environment on Windows:

```bash
.venv\Scripts\activate
```

Install backend dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI development server:

```bash
uvicorn app.main:app --reload
```

Backend URL:

```text
http://127.0.0.1:8000
```

Swagger API documentation:

```text
http://127.0.0.1:8000/docs
```

---

## Frontend Installation

Open the frontend directory:

```bash
cd frontend
```

Install frontend dependencies:

```bash
npm install
```

Start the React development server:

```bash
npm run dev
```

If the frontend project uses the React start script instead:

```bash
npm start
```

---

## Basic Usage

1. Start PostgreSQL.
2. Start the FastAPI backend.
3. Start the React frontend.
4. Open the application in a browser.
5. Register a Student account or log in with an existing account.
6. Complete the Student profile if required.
7. Browse available courses.
8. Open a course to view its information and learning material.
9. Administrative accounts can manage users, categories, courses, and platform information.
10. Teachers can access their assigned courses and associated learning content.

---

## File Uploads

The backend supports uploaded files for:

* User profile images
* Category images
* Course thumbnails
* Course materials

Uploaded file paths are stored in the database and served to the frontend through the backend.

---

## Security

The application includes several authentication and authorization controls.

These include:

* Password hashing
* JWT access tokens
* JWT refresh tokens
* Bearer authentication
* Protected API routes
* Role-based authorization
* User ownership checks for profile updates
* Profile image ownership protection
* Email uniqueness validation
* Active account checking

---

## Current Course Access Rules

### Student

* View courses
* View course details
* View teacher and category information
* Open available course materials
* Cannot create courses
* Cannot edit courses
* Cannot change course thumbnails
* Cannot upload course materials

### Teacher

* View assigned courses
* View course information
* Manage learning materials for assigned courses

### Staff

* Manage supported course and administrative operations based on assigned permissions

### Admin

* Full course management access

---

## Current Database Design

The current course structure stores an assigned Teacher profile using a teacher reference.

The application currently supports a primary teacher assignment for each course.

---

## Future Improvements

* Multiple teachers assigned to the same course
* Many-to-many course and teacher relationships
* Student-specific enrolled course dashboard
* Teacher self-service profile editing
* Staff self-service profile editing
* More detailed course material management
* Course modules and lessons
* Assignments and submissions
* Student progress tracking
* Course completion status
* Certificates
* Notifications
* Email verification
* Password recovery
* Search and filtering improvements
* Pagination
* Advanced dashboard analytics
* Cloud file storage
* Docker support
* Production deployment
* Automated testing

---

## Project Status

The Course Management System is a working full-stack web application developed for learning, portfolio demonstration, and practical experience with modern frontend, backend, database, authentication, and role-based application development.

The project is actively being improved with additional permissions, profile features, course functionality, and user experience enhancements.

---

## Author

Bernard Debnath
