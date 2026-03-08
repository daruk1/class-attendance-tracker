import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import AttendanceTable from "@/components/AttendanceTable";
import SubjectStats from "@/components/SubjectStats";
import { ScanLine, Users, CheckCircle2, XCircle, BookOpen, CreditCard, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import nenasaLogo from "@/assets/nenasa-logo.jpeg";

const Dashboard = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0 });
  const [subjectStats, setSubjectStats] = useState<{ subject: string; total: number; present: number; absent: number }[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const fetchAttendance = useCallback(async () => {
    const dateStr = format(selectedDate, "yyyy-MM-dd");

    const { data: attendanceData } = await supabase
      .from("attendance_records")
      .select("*, students(name, student_id, class_name)")
      .eq("date", dateStr)
      .order("scanned_at", { ascending: false });

    const { data: allStudents } = await supabase
      .from("students")
      .select("id, subject");

    const totalStudents = allStudents?.length || 0;

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
      total: totalStudents,
      present: presentCount,
      absent: totalStudents - presentCount,
    });

    // Calculate per-subject stats
    const presentStudentIds = new Set(
      (attendanceData || []).filter((a: any) => a.status === "present").map((a: any) => a.student_id)
    );
    const subjectMap = new Map<string, { total: number; present: number; absent: number }>();
    (allStudents || []).forEach((s: any) => {
      if (!s.subject) return;
      if (!subjectMap.has(s.subject)) subjectMap.set(s.subject, { total: 0, present: 0, absent: 0 });
      const stat = subjectMap.get(s.subject)!;
      stat.total++;
      if (presentStudentIds.has(s.id)) stat.present++;
      else stat.absent++;
    });
    setSubjectStats(
      Array.from(subjectMap.entries()).map(([subject, data]) => ({ subject, ...data }))
    );
  }, [selectedDate]);

  useEffect(() => {
    fetchAttendance();

    const channel = supabase
      .channel("attendance-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "attendance_records" }, () => {
        fetchAttendance();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchAttendance]);

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
          <div className="flex gap-2 flex-wrap">
            <Link to="/class-attendance">
              <Button variant="outline" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Classes
              </Button>
            </Link>
            <Link to="/payments">
              <Button variant="outline" className="gap-2">
                <CreditCard className="h-4 w-4" />
                Payments
              </Button>
            </Link>
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

        {/* Subject-wise Stats */}
        {subjectStats.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display font-semibold">Subject Attendance</h2>
              <Link to="/class-attendance">
                <Button variant="link" size="sm">View Details →</Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjectStats.map((s) => (
                <SubjectStats key={s.subject} {...s} />
              ))}
            </div>
          </div>
        )}

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
