import { useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import QrScanner from "@/components/QrScanner";
import { ArrowLeft, CheckCircle2, ScanLine, XCircle, Upload } from "lucide-react";
import { toast } from "sonner";
import { Html5Qrcode } from "html5-qrcode";

interface ScanResult {
  name: string;
  studentId: string;
  className: string;
  status: "success" | "error" | "duplicate";
  message: string;
}

const Scan = () => {
  const [scanning, setScanning] = useState(false);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const lastScannedRef = useRef<string>("");
  const cooldownRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScan = useCallback(async (qrCode: string) => {
    // Prevent duplicate scans
    if (cooldownRef.current || qrCode === lastScannedRef.current) return;
    cooldownRef.current = true;
    lastScannedRef.current = qrCode;
    setTimeout(() => { cooldownRef.current = false; }, 2000);

    // Find student by QR code
    const { data: student, error: findError } = await supabase
      .from("students")
      .select("*")
      .eq("qr_code", qrCode)
      .maybeSingle();

    if (findError || !student) {
      setLastResult({
        name: "Unknown",
        studentId: "",
        className: "",
        status: "error",
        message: "Student not found. Invalid QR code.",
      });
      toast.error("Invalid QR code");
      return;
    }

    // Try to insert attendance
    const today = new Date().toISOString().split("T")[0];
    const { error: insertError } = await supabase.from("attendance_records").insert({
      student_id: student.id,
      date: today,
      status: "present",
    });

    if (insertError?.message?.includes("duplicate")) {
      setLastResult({
        name: student.name,
        studentId: student.student_id,
        className: student.class_name,
        status: "duplicate",
        message: "Already marked present today",
      });
      toast.info(`${student.name} already checked in today`);
    } else if (insertError) {
      setLastResult({
        name: student.name,
        studentId: student.student_id,
        className: student.class_name,
        status: "error",
        message: "Failed to record attendance",
      });
      toast.error("Failed to record attendance");
    } else {
      setLastResult({
        name: student.name,
        studentId: student.student_id,
        className: student.class_name,
        status: "success",
        message: "Attendance recorded! ✓",
      });
      toast.success(`${student.name} marked present!`);
    }
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const html5QrCode = new Html5Qrcode("qr-file-reader");
      const result = await html5QrCode.scanFile(file, false);
      lastScannedRef.current = "";
      cooldownRef.current = false;
      await handleScan(result);
    } catch {
      setLastResult({
        name: "Unknown",
        studentId: "",
        status: "error",
        message: "No QR code found in the uploaded image.",
      });
      toast.error("No QR code found in the image");
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-background">
      <div id="qr-file-reader" className="hidden" />
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-display font-bold">Scan QR Code</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">
            Point the camera at a student's QR code to mark attendance
          </p>
        </div>

        {!scanning ? (
          <div className="flex flex-col items-center gap-6 py-12">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
              <ScanLine className="h-12 w-12 text-primary" />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button size="lg" onClick={() => setScanning(true)} className="gap-2 flex-1">
                <ScanLine className="h-5 w-5" />
                Live Camera Scan
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="gap-2 flex-1"
              >
                <Upload className="h-5 w-5" />
                {uploading ? "Processing..." : "Upload QR Image"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <QrScanner onScan={handleScan} isActive={scanning} />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setScanning(false);
                lastScannedRef.current = "";
              }}
            >
              Stop Scanning
            </Button>
          </div>
        )}

        {/* Last scan result */}
        {lastResult && (
          <div
            className={`rounded-lg border p-6 text-center space-y-2 ${
              lastResult.status === "success"
                ? "bg-success/5 border-success/30"
                : lastResult.status === "duplicate"
                ? "bg-accent/5 border-accent/30"
                : "bg-destructive/5 border-destructive/30"
            }`}
          >
            {lastResult.status === "success" ? (
              <CheckCircle2 className="h-12 w-12 text-success mx-auto animate-check-in" />
            ) : lastResult.status === "duplicate" ? (
              <CheckCircle2 className="h-12 w-12 text-accent mx-auto" />
            ) : (
              <XCircle className="h-12 w-12 text-destructive mx-auto" />
            )}
            <p className="font-display font-bold text-lg">{lastResult.name}</p>
            {lastResult.studentId && (
              <p className="text-sm text-muted-foreground">ID: {lastResult.studentId}</p>
            )}
            <p className="text-sm font-medium">{lastResult.message}</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Scan;
