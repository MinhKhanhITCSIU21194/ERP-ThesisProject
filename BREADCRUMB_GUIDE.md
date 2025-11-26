# Breadcrumb System Documentation

## Overview

The breadcrumb system provides automatic navigation trails based on the current route. It's integrated into both `DashboardLayout` and `AdminLayout`.

## Features

- ✅ Automatic breadcrumb generation based on route
- ✅ Support for dynamic routes (with `:id` parameters)
- ✅ Custom labels for specific pages
- ✅ Home icon for the first breadcrumb
- ✅ Material-UI styled components
- ✅ Dynamic label updates (for showing entity names)

## Basic Usage

The breadcrumbs are automatically displayed in your layouts. No additional configuration is needed for basic functionality.

### Example Routes

- `/dashboard` → Home
- `/dashboard/projects` → Home / Projects
- `/dashboard/projects/123` → Home / Projects / Project #123
- `/dashboard/employee/list` → Home / Employee List
- `/admin/settings/department` → Home / Departments

## Adding New Routes

To add breadcrumb support for new routes, edit `Breadcrumbs.tsx` and add to the `routeConfig`:

```typescript
const routeConfig: RouteConfig = {
  // ... existing routes

  // Static route
  "/dashboard/my-page": {
    label: "My Page",
    path: "/dashboard/my-page",
  },

  // Dynamic route with parameter
  "/dashboard/users/:userId": (params) => ({
    label: `User #${params.userId}`,
    path: `/dashboard/users/${params.userId}`,
  }),
};
```

## Dynamic Labels (Advanced)

Use the `useBreadcrumbLabel` hook to show actual entity names instead of IDs:

### Example 1: Task Detail View

```typescript
import { useBreadcrumbLabel } from "../../components/breadcrumbs";

const TaskDetailView = () => {
  const { id } = useParams();
  const task = useSelector((state) => selectTaskById(state, id));

  // Update breadcrumb with task title
  useBreadcrumbLabel(task ? `Task: ${task.title}` : `Task #${id}`);

  return <div>{/* Your component */}</div>;
};
```

### Example 2: Employee Contract View

```typescript
import { useBreadcrumbLabel } from "../../components/breadcrumbs";

const EmployeeContractView = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    fetchEmployee(id).then(setEmployee);
  }, [id]);

  // Update breadcrumb with employee name
  useBreadcrumbLabel(
    employee
      ? `Contract: ${employee.firstName} ${employee.lastName}`
      : `Contract #${id}`
  );

  return <div>{/* Your component */}</div>;
};
```

### Example 3: Multiple Breadcrumb Segments

```typescript
import { useBreadcrumbLabel } from "../../components/breadcrumbs";

const ProjectSprintView = () => {
  const { projectId, sprintId } = useParams();
  const project = useSelector((state) => selectProjectById(state, projectId));
  const sprint = useSelector((state) => selectSprintById(state, sprintId));

  // Update multiple breadcrumb segments
  useBreadcrumbLabel({
    [`/dashboard/projects/${projectId}`]:
      project?.name || `Project #${projectId}`,
    [`/dashboard/projects/${projectId}/sprints/${sprintId}`]:
      sprint?.name || `Sprint #${sprintId}`,
  });

  return <div>{/* Your component */}</div>;
};
```

## Customization

### Styling

The breadcrumbs use Material-UI's Breadcrumbs component. You can customize the styling by modifying the `sx` prop in `Breadcrumbs.tsx`:

```typescript
<MuiBreadcrumbs
  separator={<NavigateNextIcon fontSize="small" />}
  sx={{
    "& .MuiBreadcrumbs-ol": {
      flexWrap: "nowrap",
    },
    // Add your custom styles here
  }}
>
```

### Separator

Change the separator icon by replacing `NavigateNextIcon`:

```typescript
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

<MuiBreadcrumbs separator={<ChevronRightIcon fontSize="small" />}>
```

### Home Icon

Remove or change the home icon in the component:

```typescript
{
  isHome && <HomeIcon sx={{ mr: 0.5, fontSize: "1rem" }} />;
}
```

## Integration Points

### DashboardLayout

Located at: `front-end/src/pages/dashboard/index.tsx`

- Breadcrumbs appear below the header, above the page title

### AdminLayout

Located at: `front-end/src/pages/admin/index.tsx`

- Breadcrumbs appear at the top of the main content area

## File Structure

```
front-end/src/components/breadcrumbs/
├── Breadcrumbs.tsx              # Main breadcrumb component
├── useBreadcrumbLabel.ts        # Hook for dynamic labels
└── index.ts                     # Exports
```

## Common Patterns

### Pattern 1: Loading State

```typescript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);

useBreadcrumbLabel(loading ? "Loading..." : data ? data.name : "Not Found");
```

### Pattern 2: Fallback Labels

```typescript
useBreadcrumbLabel(entity?.name || `${entityType} #${id}`);
```

### Pattern 3: Nested Routes

```typescript
// For route: /dashboard/projects/123/tasks/456
useBreadcrumbLabel({
  "/dashboard/projects/123": project.name,
  "/dashboard/projects/123/tasks/456": task.title,
});
```

## Troubleshooting

### Breadcrumbs not showing

1. Check if route is defined in `routeConfig`
2. Verify layout includes `<Breadcrumbs />` component
3. Ensure route has at least 2 segments (breadcrumbs hidden for single-segment routes)

### Wrong labels displaying

1. Check route pattern matching in `routeConfig`
2. Verify parameter extraction for dynamic routes
3. Check if `useBreadcrumbLabel` is being called correctly

### Styling issues

1. Check Material-UI theme configuration
2. Verify `sx` prop styles in Breadcrumbs component
3. Check parent container spacing/padding

## Future Enhancements

Potential improvements:

- Add skip links for accessibility
- Add breadcrumb schema markup for SEO
- Support for breadcrumb menus (dropdown on click)
- Localization support
- Breadcrumb truncation for long labels
- Custom icons per breadcrumb segment
