# Notification System Implementation

## Overview

Comprehensive notification system for task assignments, status updates, and sprint member management.

## Features Implemented

### 1. Task Assignment Notifications

**Location**: `project.service.ts` → `createTask()`

**Triggers**:

- When a new task is created with an assignee

**Notification Details**:

- **Title**: "New Task Assigned"
- **Type**: INFO
- **Message**: Includes task title, priority, project name, sprint name, and who assigned it
- **Recipients**: The assigned employee

**Implementation**:

```typescript
await projectService.createTask(taskData, createdByUserId);
```

### 2. Task Status Update Notifications

**Location**: `project.service.ts` → `updateTask()`

**Triggers**:

- When task status changes (TODO → IN_PROGRESS → IN_REVIEW → DONE → BLOCKED)

**Notification Details**:

- **Title**: "Task Status Updated"
- **Type**: SUCCESS (for DONE), ERROR (for BLOCKED), INFO (for others)
- **Message**: Shows old status → new status with project/sprint context
- **Recipients**: The task assignee

**Special Case - Task Completion**:

- When status changes to DONE, all active sprint members are notified
- **Title**: "Task Completed"
- **Type**: SUCCESS
- **Message**: "[Completer Name] has completed task [Title]"
- **Recipients**: All sprint members except the person who completed it

### 3. Task Reassignment Notifications

**Location**: `project.service.ts` → `updateTask()`

**Triggers**:

- When task assignee changes

**Notification Details**:

- **Old Assignee**:
  - Title: "Task Reassigned"
  - Type: WARNING
  - Message: "Task has been reassigned to [New Person]"
- **New Assignee**:
  - Title: "New Task Assigned"
  - Type: INFO
  - Message: "Task has been assigned to you"

**Recipients**: Both the old and new assignees

### 4. Sprint Member Addition Notifications

**Location**: `project.service.ts` → `addSprintMember()`

**Triggers**:

- When an employee is added to a sprint

**Notification Details**:

- **Title**: "Added to Sprint"
- **Type**: INFO
- **Message**: "You have been added to sprint [Name] in project [Name] as [Role] by [Person]"
- **Recipients**: The added employee

**Roles**:

- DEVELOPER
- TESTER
- REVIEWER
- SCRUM_MASTER
- PRODUCT_OWNER
- OBSERVER

### 5. Sprint Member Removal Notifications

**Location**: `project.service.ts` → `removeSprintMember()`

**Triggers**:

- When an employee is removed from a sprint

**Notification Details**:

- **Title**: "Removed from Sprint"
- **Type**: WARNING
- **Message**: "You have been removed from sprint [Name] in project [Name] by [Person]"
- **Recipients**: The removed employee

## Technical Implementation

### Service Layer Methods

#### Task Notifications

```typescript
// Task assignment
notifyTaskAssigned({
  employeeUserId: string,
  taskTitle: string,
  taskId: string,
  projectName: string,
  sprintName: string,
  priority: string,
  assignedByName: string,
  assignedByUserId?: string
})

// Task status update
notifyTaskStatusUpdated({
  employeeUserId: string,
  taskTitle: string,
  taskId: string,
  oldStatus: TaskStatus,
  newStatus: TaskStatus,
  projectName: string,
  sprintName: string,
  updatedByName: string,
  updatedByUserId?: string
})

// Task reassignment
notifyTaskReassigned({
  newEmployeeUserId: string,
  oldEmployeeUserId?: string,
  taskTitle: string,
  taskId: string,
  projectName: string,
  sprintName: string,
  reassignedByName: string,
  reassignedByUserId?: string
})

// Task completion (team notification)
notifyTaskCompleted({
  teamMemberUserIds: string[],
  taskTitle: string,
  taskId: string,
  completedByName: string,
  completedByUserId: string,
  projectName: string,
  sprintName: string
})
```

#### Sprint Member Notifications

```typescript
// Added to sprint
notifyAddedToSprint({
  employeeUserId: string,
  sprintName: string,
  projectName: string,
  role: string,
  addedByName: string,
  addedByUserId: string,
});

// Removed from sprint
notifyRemovedFromSprint({
  employeeUserId: string,
  sprintName: string,
  projectName: string,
  removedByName: string,
  removedByUserId: string,
});
```

### Controller Updates

#### AuthRequest Type

All controllers now use `AuthRequest` instead of `Request` to access `req.user.userId`:

```typescript
export const createTask = async (req: AuthRequest, res: Response)
export const updateTask = async (req: AuthRequest, res: Response)
export const addSprintMember = async (req: AuthRequest, res: Response)
export const removeSprintMember = async (req: AuthRequest, res: Response)
```

#### Passing User Context

```typescript
// Task creation
await projectService.createTask(taskData, req.user?.userId);

// Task update
await projectService.updateTask(taskId, updateData, req.user?.userId);

// Sprint member operations
await projectService.addSprintMember(memberData, req.user?.userId);
await projectService.removeSprintMember(sprintId, employeeId, req.user?.userId);
```

## Error Handling

All notification operations are wrapped in try-catch blocks:

```typescript
try {
  // Fetch required relations
  // Send notification
} catch (error) {
  console.error("Error sending notification:", error);
  // Don't fail the main operation if notification fails
}
```

**Benefits**:

- Main operations (create task, update task, etc.) never fail due to notification errors
- Errors are logged for debugging
- Graceful degradation if notification service is unavailable

## Socket.IO Integration

All notifications use the existing Socket.IO integration:

- Real-time delivery to connected clients
- Notifications are persisted in database
- Users can view notification history
- Unread notification count updates

## Database Schema

**Notification Fields**:

- `notificationId` (UUID)
- `title` (string)
- `message` (string)
- `type` (INFO | SUCCESS | WARNING | ERROR)
- `recipientUserId` (UUID, FK to User)
- `sentByUserId` (UUID, nullable, FK to User)
- `isRead` (boolean, default: false)
- `createdAt` (timestamp)

## Testing

### Manual Testing Steps

1. **Test Task Assignment**:

   - Create a task with an assignee
   - Check assignee receives notification
   - Verify notification contains project/sprint context

2. **Test Task Status Change**:

   - Update task status
   - Check assignee receives notification
   - Verify old/new status in message

3. **Test Task Completion**:

   - Mark task as DONE
   - Check all sprint members (except completer) receive notification

4. **Test Task Reassignment**:

   - Change task assignee
   - Check old assignee receives "reassigned" notification
   - Check new assignee receives "assigned" notification

5. **Test Sprint Member Addition**:

   - Add employee to sprint
   - Check employee receives notification with role

6. **Test Sprint Member Removal**:
   - Remove employee from sprint
   - Check employee receives notification

### API Endpoints to Test

```bash
# Create task with assignment
POST /api/projects/sprints/:sprintId/tasks
Body: { title, assignedTo, ... }

# Update task status
PATCH /api/projects/tasks/:taskId
Body: { status: "IN_PROGRESS" }

# Reassign task
PATCH /api/projects/tasks/:taskId
Body: { assignedTo: "new-employee-id" }

# Add sprint member
POST /api/projects/sprints/:sprintId/members
Body: { employeeId, role: "DEVELOPER" }

# Remove sprint member
DELETE /api/projects/sprints/:sprintId/members/:employeeId
```

## Future Enhancements

### Potential Additions

1. **Sprint Status Change Notifications**

   - Notify team when sprint starts/ends/paused
   - Already implemented: `notifySprintStatusChanged()` (pending integration)

2. **Task Comment Notifications**

   - Notify assignee when someone comments on their task
   - Notify commenters when someone replies

3. **Task Due Date Notifications**

   - Reminder 1 day before due date
   - Alert on overdue tasks

4. **Bulk Operation Notifications**

   - Notify when multiple tasks are reassigned
   - Summary notifications for bulk changes

5. **Notification Preferences**

   - Allow users to customize which notifications they receive
   - Email notifications for critical events

6. **Digest Notifications**
   - Daily/weekly summary of project activity
   - Reduce notification fatigue

## Related Files

### Backend

- `back-end/src/services/notification.service.ts` - Core notification service
- `back-end/src/services/project.service.ts` - Task/sprint business logic with notifications
- `back-end/src/controllers/project.controller.ts` - HTTP endpoints with userId context
- `back-end/src/models/entities/notification.ts` - Notification entity
- `back-end/src/models/entities/sprint-member.ts` - Sprint member entity

### Frontend (TODO)

- Need to connect to Socket.IO for real-time updates
- Need to display notifications in UI
- Need to implement notification bell icon
- Need to mark notifications as read

## Summary

✅ **Task Assignment** - Notify on create with assignee  
✅ **Task Status Updates** - Notify assignee on status change  
✅ **Task Completion** - Notify all sprint members  
✅ **Task Reassignment** - Notify both old and new assignees  
✅ **Sprint Member Addition** - Notify new member with role  
✅ **Sprint Member Removal** - Notify removed member  
✅ **Error Handling** - Graceful failure without breaking operations  
✅ **User Context** - Track who performed each action  
✅ **Real-time Delivery** - Socket.IO integration

🔲 **Frontend Integration** - Display notifications to users  
🔲 **Sprint Status Changes** - Notify on sprint start/end/pause  
🔲 **Routes** - Add sprint member routes to router
