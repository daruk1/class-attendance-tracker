import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Users, CheckCircle2, XCircle } from "lucide-react";

const SUBJECTS = ["English", "Science", "ICT"];
const GRADES = [6, 7, 8, 9, 10, 11];

interface ClassStat {
  grade: number;
  subject: string;
  total: number;
  present: number;
  absent: number;
}

const ClassAttendance = () => {
  const [classStats, setClassStats] = useState<ClassStat[]>([]);
  const [filterSubject, setFilterSubject] = useState<string>("all");
  const [filterGrade, setFilterGrade] = useState<string>("all");

  const fetchClassStats = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0];

    const { data: students } = await supabase
      .from("students")
      .select("id, grade, subject");

    const { data: attendance } = await supabase
      .from("attendance_records")
      .select("student_id, status")
      .eq("date", today);

    if (!students) return;

    const presentSet = new Set(
      (attendance || []).filter((a: any) => a.status === "present").map((a: any) => a.student_id)
    );

    const statsMap = new Map<string, ClassStat>();

    students.forEach((s: any) => {
      if (!s.grade || !s.subject) return;
      const key = `${s.grade}-${s.subject}`;
      if (!statsMap.has(key)) {
        statsMap.set(key, { grade: s.grade, subject: s.subject, total: 0, present: 0, absent: 0 });
      }
      const stat = statsMap.get(key)!;
      stat.total++;
      if (presentSet.has(s.id)) {
        stat.present++;
      } else {
        stat.absent++;
      }
    });

    const sorted = Array.from(statsMap.values()).sort((a, b) =>
      a.grade !== b.grade ? a.grade - b.grade : a.subject.localeCompare(b.subject)
    );
    setClassStats(sorted);
  }, []);

  useEffect(() => {
    fetchClassStats();
    const channel = supabase
      .channel("class-attendance-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "attendance_records" }, () => fetchClassStats())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchClassStats]);

  const filtered = classStats.filter((s) => {
    if (filterSubject !== "all" && s.subject !== filterSubject) return false;
    if (filterGrade !== "all" && s.grade !== parseInt(filterGrade)) return false;
    return true;
  });

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold">Class Attendance</h1>
            <p className="text-sm text-muted-foreground">{today}</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <Select value={filterSubject} onValueChange={setFilterSubject}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {SUBJECTS.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterGrade} onValueChange={setFilterGrade}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Grades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Grades</SelectItem>
              {GRADES.map((g) => (
                <SelectItem key={g} value={g.toString()}>Grade {g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Class stats grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No classes found. Add students with grade and subject to see class attendance.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((stat) => (
              <div key={`${stat.grade}-${stat.subject}`} className="bg-card border rounded-lg p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-lg">Grade {stat.grade} - {stat.subject}</h3>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-secondary rounded-md p-3">
                    <Users className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                    <p className="text-xl font-bold">{stat.total}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div className="bg-success/10 rounded-md p-3">
                    <CheckCircle2 className="h-5 w-5 mx-auto text-success mb-1" />
                    <p className="text-xl font-bold text-success">{stat.present}</p>
                    <p className="text-xs text-muted-foreground">Present</p>
                  </div>
                  <div className="bg-absent/10 rounded-md p-3">
                    <XCircle className="h-5 w-5 mx-auto text-absent mb-1" />
                    <p className="text-xl font-bold text-absent">{stat.absent}</p>
                    <p className="text-xs text-muted-foreground">Absent</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ClassAttendance;
