export interface Batch {
  sido_code: string;
  sido_name: string;
  complex_count: number;
  cron_schedule: string | null;
  last_run_at: string | null;
  last_run_status: string | null;
  is_running: boolean;
}
