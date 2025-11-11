import React from "react";
import { Outlet, Link } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";

export const AdminLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="admin-layout">
      <nav>
        <Link to="/admin">Admin Dashboard</Link>
        <Link to="/admin/users">User Management</Link>
        <Link to="/admin/system">System Settings</Link>
        <Link to="/admin/audit">Audit Logs</Link>
        <button onClick={logout}>Logout</button>
      </nav>

      <main>
        <h1>Admin Panel - {user?.fullName}</h1>
        <Outlet />
      </main>
    </div>
  );
};
