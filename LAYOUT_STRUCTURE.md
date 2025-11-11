# Layout Structure - Fixed Header and Navbar

## How it works now:

### Layout Components (Fixed - Don't Re-render)

- **Header** - Stays at the top, never changes
- **Navbar** - Stays on the left, never changes

### Content Area (Dynamic - Changes with Routes)

- **Dashboard** (default page at `/dashboard`)
- **Projects** (at `/dashboard/projects`)
- **Other pages** will be added here as you create them

## File Structure:

```
DashboardLayout (Container)
├── Header (Fixed)
└── Content Area
    ├── Navbar (Fixed)
    └── <Outlet> (Dynamic content based on route)
        ├── Dashboard component (when at /dashboard)
        ├── Projects component (when at /dashboard/projects)
        └── Other pages...
```

## How to add new pages:

1. **Create the page component** in `src/pages/dashboard/components/`
   Example: `employee-list.tsx`

2. **Add the route** in `src/routes/sections/main.tsx`

   ```tsx
   import EmployeeList from "../../pages/dashboard/components/employee-list";

   // Then add to children array:
   {
     path: "employee/list",
     element: <EmployeeList />,
   }
   ```

3. **Navigation**
   The navbar already has links configured. When users click on menu items,
   only the content area (Outlet) will update, Header and Navbar stay fixed.

## Example Navigation:

- `/dashboard` → Shows Dashboard component
- `/dashboard/projects` → Shows Projects component
- `/dashboard/employee/list` → Will show EmployeeList component (when you create it)

## Benefits:

✅ Header and Navbar don't re-render on navigation (better performance)
✅ Cleaner URL structure
✅ Easier to maintain and add new pages
✅ Better user experience (smooth transitions)
