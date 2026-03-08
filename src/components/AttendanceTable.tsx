import { CheckCircle2, XCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface AttendanceRecord {
  student_name: string;
  student_id: string;
  class_name: string;
  status: "present" | "absent";
  scanned_at: string;
}

interface AttendanceTableProps {
  records: AttendanceRecord[];
}

const AttendanceTable = ({ records }: AttendanceTableProps) => {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/50">
            <TableHead className="font-display">Student</TableHead>
            <TableHead className="font-display">ID</TableHead>
            <TableHead className="font-display">Class</TableHead>
            <TableHead className="font-display">Status</TableHead>
            <TableHead className="font-display">Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No attendance records for today
              </TableCell>
            </TableRow>
          ) : (
            records.map((record, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{record.student_name}</TableCell>
                <TableCell className="text-muted-foreground">{record.student_id}</TableCell>
                <TableCell>{record.class_name}</TableCell>
                <TableCell>
                  {record.status === "present" ? (
                    <span className="inline-flex items-center gap-1.5 text-success font-medium">
                      <CheckCircle2 className="h-4 w-4 animate-check-in" />
                      Present
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-absent font-medium">
                      <XCircle className="h-4 w-4" />
                      Absent
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(record.scanned_at).toLocaleTimeString()}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AttendanceTable;
