import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { EmployeesPage } from "./pages/EmployeesPage";
import { EmployeeDetailsPage } from "./pages/EmployeeDetailsPage";
import { EmployeeFormPage } from "./pages/EmployeeFormPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DeletedEmployeesPage } from "./pages/DeletedEmployeesPage";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-6 p-4">
          <span className="font-semibold">ACME Salary</span>
          <NavLink
            to="/employees"
            className={({ isActive }) =>
              `text-sm ${isActive ? "text-slate-900 font-medium" : "text-slate-600 hover:text-slate-900"}`
            }
          >
            Employees
          </NavLink>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `text-sm ${isActive ? "text-slate-900 font-medium" : "text-slate-600 hover:text-slate-900"}`
            }
          >
            Dashboard
          </NavLink>
        </div>
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/employees" replace />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/employees/deleted" element={<DeletedEmployeesPage />} />
          <Route path="/employees/new" element={<EmployeeFormPage />} />
          <Route path="/employees/:id/edit" element={<EmployeeFormPage />} />
          <Route path="/employees/:id" element={<EmployeeDetailsPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="*" element={<Navigate to="/employees" replace />} />
        </Routes>
      </main>
    </div>
  );
}
