import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import AddStudentDialog from "@/components/AddStudentDialog";
import StudentQrCode from "@/components/StudentQrCode";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";

const Students = () => {
  const [students, setStudents] = useState<any[]>([]);

  const fetchStudents = async () => {
    const { data } = await supabase.from("students").select("*").order("name");
    setStudents(data || []);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete student");
    } else {
      toast.success(`${name} removed`);
      fetchStudents();
    }
  };

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
            <h1 className="text-2xl font-display font-bold">Students</h1>
          </div>
          <AddStudentDialog onStudentAdded={fetchStudents} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {students.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-4">No students added yet</p>
            <AddStudentDialog onStudentAdded={fetchStudents} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {students.map((student) => (
              <div key={student.id} className="relative group">
                <StudentQrCode
                  qrCode={student.qr_code}
                  studentName={student.name}
                  studentId={student.student_id}
                />
                <p className="text-center text-sm text-muted-foreground mt-1">{student.class_name}</p>
                <button
                  onClick={() => handleDelete(student.id, student.name)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Students;
