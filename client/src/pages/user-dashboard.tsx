import * as React from "react";
import { useUserDashboard } from "@/hooks/use-dashboards";
import { DashboardLayout } from "@/components/layout";
import { Card, Badge } from "@/components/ui-elements";
import { format } from "date-fns";
import { Activity, Clock, MapPin, Loader2, ShieldAlert } from "lucide-react";

export default function UserDashboard() {
  const { data, isLoading, error } = useUserDashboard();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary/50" />
          <p>Loading your secure data...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-8 text-center max-w-2xl mx-auto mt-12">
          <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-destructive mb-2">Access Denied</h2>
          <p className="text-destructive/80">{(error as Error).message}</p>
        </div>
      </DashboardLayout>
    );
  }

  const history = data?.history || [];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-2">My Activity</h1>
        <p className="text-muted-foreground">Review your recent authentication attempts to ensure account security.</p>
      </div>

      <Card className="overflow-hidden">
        <div className="p-6 border-b border-border/50 bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Login History</h3>
          </div>
          <Badge variant="default">Total entries: {history.length}</Badge>
        </div>
        
        {history.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
            <Clock className="w-10 h-10 mb-3 opacity-20" />
            <p>No activity recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Date & Time</th>
                  <th className="px-6 py-4 font-medium">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y border-border/50">
                {history.map((entry: any) => (
                  <tr key={entry.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {entry.success ? (
                        <Badge variant="success">Successful</Badge>
                      ) : (
                        <Badge variant="destructive">Failed</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-foreground/80 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 opacity-50" />
                      {format(new Date(entry.timestamp), "MMM d, yyyy • h:mm a")}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 opacity-50" />
                      {entry.ipAddress}
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
