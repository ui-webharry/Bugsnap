export interface BugReport {
  id: number;
  title: string;
  description: string;
  screenshot: string;
  url: string;
  userAgent: string;
  timestamp: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
}
