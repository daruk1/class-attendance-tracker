import { Users, CheckCircle2, XCircle } from "lucide-react";

interface SubjectStatProps {
  subject: string;
  total: number;
  present: number;
  absent: number;
}

const SubjectStats = ({ subject, total, present, absent }: SubjectStatProps) => {
  return (
    <div className="bg-card border rounded-lg p-5">
      <h3 className="font-display font-semibold text-base mb-3">{subject}</h3>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-secondary rounded-md p-2">
          <Users className="h-4 w-4 mx-auto text-muted-foreground mb-0.5" />
          <p className="text-lg font-bold">{total}</p>
          <p className="text-[10px] text-muted-foreground">Total</p>
        </div>
        <div className="bg-success/10 rounded-md p-2">
          <CheckCircle2 className="h-4 w-4 mx-auto text-success mb-0.5" />
          <p className="text-lg font-bold text-success">{present}</p>
          <p className="text-[10px] text-muted-foreground">Present</p>
        </div>
        <div className="bg-absent/10 rounded-md p-2">
          <XCircle className="h-4 w-4 mx-auto text-absent mb-0.5" />
          <p className="text-lg font-bold text-absent">{absent}</p>
          <p className="text-[10px] text-muted-foreground">Absent</p>
        </div>
      </div>
    </div>
  );
};

export default SubjectStats;
