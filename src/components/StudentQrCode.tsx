import { QRCodeSVG } from "qrcode.react";

interface StudentQrCodeProps {
  qrCode: string;
  studentName: string;
  studentId: string;
}

const StudentQrCode = ({ qrCode, studentName, studentId }: StudentQrCodeProps) => {
  return (
    <div className="flex flex-col items-center gap-3 p-6 bg-card rounded-lg border">
      <QRCodeSVG
        value={qrCode}
        size={180}
        bgColor="hsl(0, 0%, 100%)"
        fgColor="hsl(220, 25%, 10%)"
        level="H"
      />
      <div className="text-center">
        <p className="font-display font-semibold text-card-foreground">{studentName}</p>
        <p className="text-sm text-muted-foreground">ID: {studentId}</p>
      </div>
    </div>
  );
};

export default StudentQrCode;
