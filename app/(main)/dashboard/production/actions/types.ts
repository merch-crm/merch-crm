export interface DashboardActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
