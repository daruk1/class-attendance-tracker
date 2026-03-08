import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AddStudentDialogProps {
  onStudentAdded: () => void;
}

const AddStudentDialog = ({ onStudentAdded }: AddStudentDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [className, setClassName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !studentId.trim() || !className.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    const qrCode = `STU-${studentId}-${Date.now()}`;

    const { error } = await supabase.from("students").insert({
      name: name.trim(),
      student_id: studentId.trim(),
      class_name: className.trim(),
      qr_code: qrCode,
    });

    if (error) {
      toast.error(error.message.includes("duplicate") ? "Student ID already exists" : "Failed to add student");
    } else {
      toast.success(`${name} added successfully!`);
      setName("");
      setStudentId("");
      setClassName("");
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
            <Label htmlFor="className">Class</Label>
            <Input id="className" value={className} onChange={(e) => setClassName(e.target.value)} placeholder="Class 10A" />
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
