import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import AttendanceTable from "@/components/AttendanceTable";
import SubjectStats from "@/components/SubjectStats";
import { ScanLine, Users, CheckCircle2, XCircle, BookOpen } from "lucide-react";
import nenasaLogo from "@/assets/nenasa-logo.jpeg";

const Dashboard = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0 });

  const fetchTodayAttendance = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0];

    const { data: attendanceData } = await supabase
      .from("attendance_records")
      .select("*, students(name, student_id, class_name)")
      .eq("date", today)
      .order("scanned_at", { ascending: false });

    const { count: totalStudents } = await supabase
      .from("students")
      .select("*", { count: "exact", head: true });

    const formatted = (attendanceData || []).map((r: any) => ({
      student_name: r.students?.name || "Unknown",
      student_id: r.students?.student_id || "",
      class_name: r.students?.class_name || "",
      status: r.status as "present" | "absent",
      scanned_at: r.scanned_at,
    }));

    const presentCount = formatted.filter((r) => r.status === "present").length;
    setRecords(formatted);
    setStats({
      total: totalStudents || 0,
      present: presentCount,
      absent: (totalStudents || 0) - presentCount,
    });
  }, []);

  useEffect(() => {
    fetchTodayAttendance();

    const channel = supabase
      .channel("attendance-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "attendance_records" }, () => {
        fetchTodayAttendance();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchTodayAttendance]);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={nenasaLogo} alt="Nenasa Logo" className="h-12 w-auto rounded" />
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Nenasa Education Database</h1>
              <p className="text-sm text-muted-foreground">{today}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/students">
              <Button variant="outline" className="gap-2">
                <Users className="h-4 w-4" />
                Students
              </Button>
            </Link>
            <Link to="/scan">
              <Button className="gap-2">
                <ScanLine className="h-4 w-4" />
                Scan QR
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border rounded-lg p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
              <Users className="h-6 w-6 text-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Students</p>
              <p className="text-3xl font-display font-bold">{stats.total}</p>
            </div>
          </div>
          <div className="bg-card border rounded-lg p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Present Today</p>
              <p className="text-3xl font-display font-bold text-success">{stats.present}</p>
            </div>
          </div>
          <div className="bg-card border rounded-lg p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-absent/10 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-absent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Absent Today</p>
              <p className="text-3xl font-display font-bold text-absent">{stats.absent}</p>
            </div>
          </div>
        </div>

        {/* Today's Attendance */}
        <div>
          <h2 className="text-xl font-display font-semibold mb-4">Today's Attendance</h2>
          <AttendanceTable records={records} />
        </div>
      </main>

      <footer className="border-t bg-card py-4 text-center">
        <p className="text-sm text-muted-foreground">Developed by <span className="font-semibold text-foreground">Daruka</span></p>
      </footer>
    </div>
  );
};

export default Dashboard;
