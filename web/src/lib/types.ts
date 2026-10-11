export type EmploymentStatus = "active" | "on_leave" | "terminated";

export interface Employee {
  id: number;
  name: string;
  email: string;
  country: string;
  department: string;
  job_title: string;
  join_date: string;
  employment_status: EmploymentStatus;
  salary: string;
}

export interface Paginated<T> {
  data: T[];
  meta: { page: number; per_page: number; total_count: number; total_pages: number };
}

export interface EmployeeFilters {
  q?: string;
  country?: string;
  department?: string;
  status?: EmploymentStatus;
  min_salary?: number;
  max_salary?: number;
  sort?: string;
  page?: number;
}

export interface DashboardStats {
  headcount: number;
  active_headcount: number;
  total_salary: number;
  avg_salary: number;
  median_salary: number;
  by_country: { country: string; headcount: number; avg_salary: number; median_salary: number }[];
  by_department: { department: string; headcount: number; avg_salary: number; median_salary: number }[];
  salary_histogram: { salary_start: number; salary_end: number; count: number }[];
}
