import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QrScannerProps {
  onScan: (data: string) => void;
  isActive: boolean;
}

const QrScanner = ({ onScan, isActive }: QrScannerProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          onScan(decodedText);
        },
        () => {}
      )
      .catch((err) => {
        setError("Camera access denied. Please allow camera permissions.");
        console.error("QR Scanner error:", err);
      });

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [isActive, onScan]);

  return (
    <div className="relative">
      <div
        id="qr-reader"
        className="w-full max-w-sm mx-auto rounded-lg overflow-hidden"
      />
      {error && (
        <p className="text-destructive text-sm text-center mt-2">{error}</p>
      )}
    </div>
  );
};

export default QrScanner;
