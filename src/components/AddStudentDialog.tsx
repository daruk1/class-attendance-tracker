import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SUBJECTS = ["English", "Science", "ICT"] as const;
const GRADES = [6, 7, 8, 9, 10, 11] as const;
const MONTHLY_FEE = 1200;

interface AddStudentDialogProps {
  onStudentAdded: () => void;
}

const AddStudentDialog = ({ onStudentAdded }: AddStudentDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !studentId.trim() || !grade || !subject) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    const className = `Grade ${grade} - ${subject}`;
    const qrCode = `STU-${studentId}-${Date.now()}`;

    const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
    const monthlyQrCode = `STU-${studentId.trim()}-${currentMonth}-${Date.now()}`;

    const { data: newStudent, error } = await supabase.from("students").insert({
      name: name.trim(),
      student_id: studentId.trim(),
      email: email.trim() || null,
      class_name: className,
      grade: parseInt(grade),
      subject,
      qr_code: monthlyQrCode,
    } as any).select().single();

    if (error) {
      toast.error(error.message.includes("duplicate") ? "Student ID already exists" : "Failed to add student");
    } else {
      // Create initial payment record for current month
      if (newStudent) {
        await supabase.from("monthly_payments").insert({
          student_id: newStudent.id,
          month_year: currentMonth,
          amount: MONTHLY_FEE,
          paid: false,
        } as any);
      }
      toast.success(`${name} added to Grade ${grade} - ${subject}!`);
      setName("");
      setStudentId("");
      setEmail("");
      setGrade("");
      setSubject("");
      setOpen(false);
      onStudentAdded();
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add Student
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display">Add New Student</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="studentId">Student ID</Label>
            <Input id="studentId" value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="STU001" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email (for payment reminders)</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@example.com" />
          </div>
          <div className="space-y-2">
            <Label>Grade</Label>
            <Select value={grade} onValueChange={setGrade}>
              <SelectTrigger>
                <SelectValue placeholder="Select grade" />
              </SelectTrigger>
              <SelectContent>
                {GRADES.map((g) => (
                  <SelectItem key={g} value={g.toString()}>Grade {g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Subject</Label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Adding..." : "Add Student"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddStudentDialog;
