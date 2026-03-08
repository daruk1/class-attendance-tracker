import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, CheckCircle2, XCircle, CreditCard, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const SUBJECTS = ["English", "Science", "ICT"];
const MONTHLY_FEE = 1200;

const getCurrentMonthYear = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const formatMonthYear = (my: string) => {
  const [year, month] = my.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
};

const getMonthOptions = () => {
  const options: string[] = [];
  const now = new Date();
  for (let i = -2; i <= 2; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i);
    options.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return options;
};

const Payments = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthYear());
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    const { data: studentsData } = await supabase
      .from("students")
      .select("*")
      .order("grade")
      .order("name");

    const { data: paymentsData } = await supabase
      .from("monthly_payments")
      .select("*")
      .eq("month_year", selectedMonth);

    setStudents(studentsData || []);
    setPayments(paymentsData || []);
  }, [selectedMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTogglePayment = async (studentId: string, studentName: string, isPaid: boolean) => {
    setLoading(true);

    if (isPaid) {
      // Mark as unpaid - delete the payment record
      await supabase
        .from("monthly_payments")
        .delete()
        .eq("student_id", studentId)
        .eq("month_year", selectedMonth);
      toast.info(`${studentName} marked as unpaid for ${formatMonthYear(selectedMonth)}`);
    } else {
      // Mark as paid
      const { error } = await supabase.from("monthly_payments").insert({
        student_id: studentId,
        month_year: selectedMonth,
        amount: MONTHLY_FEE,
        paid: true,
        paid_at: new Date().toISOString(),
      } as any);

      if (error?.message?.includes("duplicate")) {
        toast.info("Already marked as paid");
      } else if (error) {
        toast.error("Failed to update payment");
      } else {
        // Regenerate QR code for the student
        const newQr = `STU-${studentId}-${selectedMonth}-${Date.now()}`;
        await supabase
          .from("students")
          .update({ qr_code: newQr })
          .eq("id", studentId);

        toast.success(`${studentName} marked as paid! QR code updated.`);
      }
    }

    setLoading(false);
    fetchData();
  };

  const handleGenerateAllPayments = async () => {
    setLoading(true);
    const existingStudentIds = new Set(payments.map((p) => p.student_id));
    const newPayments = students
      .filter((s) => !existingStudentIds.has(s.id))
      .map((s) => ({
        student_id: s.id,
        month_year: selectedMonth,
        amount: MONTHLY_FEE,
        paid: false,
      }));

    if (newPayments.length > 0) {
      await supabase.from("monthly_payments").insert(newPayments as any);
      toast.success(`Created ${newPayments.length} payment records`);
      fetchData();
    } else {
      toast.info("All students already have payment records for this month");
    }
    setLoading(false);
  };

  const filteredStudents = subjectFilter === "all"
    ? students
    : students.filter((s) => s.subject === subjectFilter);

  const paidMap = new Map(payments.map((p) => [p.student_id, p]));
  const paidCount = filteredStudents.filter((s) => paidMap.get(s.id)?.paid).length;
  const unpaidCount = filteredStudents.length - paidCount;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-display font-bold">Monthly Payments</h1>
              <p className="text-sm text-muted-foreground">LKR {MONTHLY_FEE} per subject per month</p>
            </div>
          </div>
          <Button onClick={handleGenerateAllPayments} disabled={loading} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Generate Records
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {getMonthOptions().map((m) => (
                <SelectItem key={m} value={m}>{formatMonthYear(m)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {SUBJECTS.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border rounded-lg p-4 flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-display font-bold">{filteredStudents.length}</p>
            </div>
          </div>
          <div className="bg-card border rounded-lg p-4 flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-success" />
            <div>
              <p className="text-sm text-muted-foreground">Paid</p>
              <p className="text-2xl font-display font-bold text-success">{paidCount}</p>
            </div>
          </div>
          <div className="bg-card border rounded-lg p-4 flex items-center gap-3">
            <XCircle className="h-8 w-8 text-destructive" />
            <div>
              <p className="text-sm text-muted-foreground">Unpaid</p>
              <p className="text-2xl font-display font-bold text-destructive">{unpaidCount}</p>
            </div>
          </div>
        </div>

        {/* Student payment list */}
        <div className="bg-card border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Student</th>
                  <th className="text-left px-4 py-3 font-medium">Grade</th>
                  <th className="text-left px-4 py-3 font-medium">Subject</th>
                  <th className="text-left px-4 py-3 font-medium">Email</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-right px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredStudents.map((student) => {
                  const payment = paidMap.get(student.id);
                  const isPaid = payment?.paid === true;
                  return (
                    <tr key={student.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.student_id}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">{student.grade ? `Grade ${student.grade}` : "-"}</td>
                      <td className="px-4 py-3">{student.subject || "-"}</td>
                      <td className="px-4 py-3 text-xs">{student.email || "-"}</td>
                      <td className="px-4 py-3">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 text-success text-xs font-medium bg-success/10 px-2 py-1 rounded-full">
                            <CheckCircle2 className="h-3 w-3" /> Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-destructive text-xs font-medium bg-destructive/10 px-2 py-1 rounded-full">
                            <XCircle className="h-3 w-3" /> Unpaid
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant={isPaid ? "outline" : "default"}
                          onClick={() => handleTogglePayment(student.id, student.name, isPaid)}
                          disabled={loading}
                        >
                          {isPaid ? "Undo" : "Mark Paid"}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      No students found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Payments;
