# CourseMS — React Frontend

A clean, modern React dashboard for your FastAPI Course Management backend.

---

## Stack

- React 18 + React Router v6
- Axios (API calls + auth interceptor)
- Formik + Yup (forms + validation)
- Tailwind CSS (styling)
- Fonts: Syne (display) + DM Sans (body)

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

This installs all packages from `package.json`.
**Important:** Tailwind CSS and its peer deps are included. If you get errors run:

```bash
npm install tailwindcss@3 autoprefixer postcss --save-dev
```

### 2. Make sure your FastAPI backend is running

```bash
# Inside your course_management folder
uvicorn app.main:app --reload
# Should be running at http://127.0.0.1:8000
```

### 3. Start the frontend

```bash
npm start
# Opens at http://localhost:3000
```

---

## Project Structure

```
src/
├── api/                    # All Axios API calls (one file per resource)
│   ├── axiosInstance.js    # Axios base config + auth interceptor + getImageUrl()
│   ├── authApi.js
│   ├── coursesApi.js
│   ├── categoriesApi.js
│   ├── usersApi.js
│   ├── rolesApi.js
│   ├── teachersApi.js
│   └── dashboardApi.js
│
├── auth/                   # Auth logic
│   ├── tokenUtils.js       # Save/read/clear JWT from localStorage
│   ├── AuthContext.js      # Global auth state + login/logout + hasRole()
│   └── ProtectedRoute.js   # Route guard — redirects unauthenticated users
│
├── components/
│   ├── common/
│   │   ├── FormInput.js    # Reusable Formik-connected input
│   │   ├── Modal.js        # Reusable modal dialog
│   │   ├── ConfirmDialog.js
│   │   ├── PageHeader.js
│   │   └── Toast.js        # Toast notifications + ToastProvider context
│   └── layout/
│       ├── Sidebar.js      # Left sidebar with nav + user info + logout
│       └── DashboardLayout.js
│
├── pages/
│   ├── auth/LoginPage.js
│   ├── dashboard/DashboardPage.js
│   ├── courses/CoursesPage.js
│   ├── categories/CategoriesPage.js
│   ├── users/UsersPage.js
│   ├── roles/RolesPage.js
│   └── NotFoundPage.js
│
├── App.js                  # All routes
├── index.js
└── index.css               # Tailwind + global component classes
```

---

## How Authentication Works

1. User logs in at `/login` → POST to `/api/v1/auth/login`
2. Backend returns `{ access_token, refresh_token }`
3. Tokens saved in `localStorage`
4. Every Axios request automatically gets `Authorization: Bearer <token>`
5. If backend returns 401 → tokens cleared → redirect to `/login`

---

## Role-Based Access

The sidebar shows admin-only links (Users, Roles) only to admin users.
Admin-only routes (`/users`, `/roles`) are wrapped in `<ProtectedRoute requiredRole="admin" />`.

Role is read from `user.role.name` (if role is an object) or `user.role` (if it's a string).

---

## Thumbnail Images

Courses return `thumbnail: "uploads/thumbnails/file.jpg"`.
The helper `getImageUrl(path)` in `axiosInstance.js` converts this to:
`http://127.0.0.1:8000/uploads/thumbnails/file.jpg`

This works because your backend mounts `/uploads` as a static directory.

---

## Adding More Pages

1. Create `src/pages/yourpage/YourPage.js`
2. Add an API file in `src/api/yourApi.js`
3. Add a route in `src/App.js`
4. Add a nav item in `src/components/layout/Sidebar.js`
