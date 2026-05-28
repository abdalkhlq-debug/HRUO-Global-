import { useState, useEffect } from "react";
import { useListAttendanceRecords, useClockIn, useClockOut, useGetAttendanceSummary } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Play, Square } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function Attendance() {
  const { user } = useAuth();
  const [time, setTime] = useState(new Date());
  
  const { data: records, refetch } = useListAttendanceRecords();
  const { data: summary } = useGetAttendanceSummary();
  
  const clockIn = useClockIn();
  const clockOut = useClockOut();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClockIn = async () => {
    try {
      await clockIn.mutateAsync({
        data: {
          employeeId: user?.employeeId || 1,
        }
      });
      toast.success("Clocked in successfully");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to clock in");
    }
  };

  const handleClockOut = async () => {
    if (!todayRecord) {
      toast.error("No clock-in record found for today");
      return;
    }
    try {
      await clockOut.mutateAsync({
        id: todayRecord.id,
        data: {
          employeeId: user?.employeeId || 1,
        }
      });
      toast.success("Clocked out successfully");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to clock out");
    }
  };

  const todayRecord = records?.find(r => r.date === format(new Date(), "yyyy-MM-dd"));
  const isClockedIn = todayRecord?.clockIn && !todayRecord?.clockOut;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Attendance</h2>
        <p className="text-muted-foreground">Track daily presence and working hours.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1 bg-primary text-primary-foreground border-none">
          <CardContent className="pt-6 flex flex-col items-center justify-center space-y-4">
            <div className="text-4xl font-bold tracking-tighter">
              {format(time, "HH:mm:ss")}
            </div>
            <div className="text-primary-foreground/80">
              {format(time, "EEEE, MMMM d, yyyy")}
            </div>
            <div className="pt-4 flex gap-4 w-full">
              <Button 
                variant="secondary" 
                className="flex-1" 
                size="lg"
                disabled={isClockedIn || clockIn.isPending}
                onClick={handleClockIn}
              >
                <Play className="mr-2 h-4 w-4" /> Clock In
              </Button>
              <Button 
                variant={isClockedIn ? "destructive" : "secondary"}
                className="flex-1" 
                size="lg"
                disabled={!isClockedIn || clockOut.isPending}
                onClick={handleClockOut}
              >
                <Square className="mr-2 h-4 w-4" /> Clock Out
              </Button>
            </div>
            {todayRecord && (
              <div className="text-xs text-primary-foreground/70 mt-2 text-center">
                {todayRecord.clockIn && `Clocked in at ${format(new Date(todayRecord.clockIn), "HH:mm")}`}
                {todayRecord.clockOut && ` • Clocked out at ${format(new Date(todayRecord.clockOut), "HH:mm")}`}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Summary</CardTitle>
            <CardDescription>{format(new Date(), "MMMM yyyy")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold">{summary?.totalPresent || 0}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Present</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold">{summary?.totalAbsent || 0}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Absent</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold">{summary?.totalLate || 0}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Late</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold">{summary?.totalOvertime || 0}h</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Overtime</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No records found.</TableCell>
                </TableRow>
              ) : (
                records?.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{format(new Date(record.date), "MMM d, yyyy")}</TableCell>
                    <TableCell className="font-medium">{record.employeeName}</TableCell>
                    <TableCell>{record.clockIn ? format(new Date(record.clockIn), "HH:mm") : "-"}</TableCell>
                    <TableCell>{record.clockOut ? format(new Date(record.clockOut), "HH:mm") : "-"}</TableCell>
                    <TableCell>{record.totalHours ? record.totalHours.toFixed(2) : "-"}</TableCell>
                    <TableCell>
                      <Badge variant={record.status === "present" ? "default" : record.status === "absent" ? "destructive" : "secondary"}>
                        {record.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}