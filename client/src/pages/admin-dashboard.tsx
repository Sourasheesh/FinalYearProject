import * as React from "react";
import { useAdminDashboard } from "@/hooks/use-dashboards";
import { DashboardLayout } from "@/components/layout";
import { Card, Badge, Input } from "@/components/ui-elements";
import { format } from "date-fns";
import { Users, Search, Shield, AlertTriangle, Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const { data, isLoading, error } = useAdminDashboard();
  const [searchTerm, setSearchTerm] = React.useState("");

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary/50" />
          <p>Loading global security matrix...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-8 text-center max-w-2xl mx-auto mt-12">
          <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-destructive mb-2">Admin Access Required</h2>
          <p className="text-destructive/80">{(error as Error).message}</p>
        </div>
      </DashboardLayout>
    );
  }

  const allHistory = data?.all_history || [];
  
  const filteredHistory = allHistory.filter((entry: any) => 
    entry.ipAddress?.includes(searchTerm) || 
    entry.userId?.toString().includes(searchTerm)
  );

  const failedCount = allHistory.filter((e: any) => !e.success).length;

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Security Overview</h1>
          <p className="text-muted-foreground">System-wide authentication audit log.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search IP or User ID..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 flex items-center gap-4 border-l-4 border-l-primary">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Logs</p>
            <p className="text-2xl font-bold text-foreground">{allHistory.length}</p>
          </div>
        </Card>
        
        <Card className="p-6 flex items-center gap-4 border-l-4 border-l-destructive">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Failed Attempts</p>
            <p className="text-2xl font-bold text-foreground">{failedCount}</p>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        {filteredHistory.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
            <Search className="w-10 h-10 mb-3 opacity-20" />
            <p>No matching logs found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">User ID</th>
                  <th className="px-6 py-4 font-medium">IP Address</th>
                  <th className="px-6 py-4 font-medium">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y border-border/50">
                {filteredHistory.map((entry: any) => (
                  <tr key={entry.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {entry.success ? (
                        <Badge variant="success">Success</Badge>
                      ) : (
                        <Badge variant="destructive">Failed</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      User #{entry.userId}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                      {entry.ipAddress}
                    </td>
                    <td className="px-6 py-4 text-foreground/80">
                      {format(new Date(entry.timestamp), "MMM d, yyyy • HH:mm:ss")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}
