"use client";

import { useEffect, useRef, useState } from "react";

interface BarcodeScannerProps {
  onScan:  (isbn: string) => void;
  onClose: () => void;
}

type ScanState = "requesting" | "scanning" | "error";

const ERROR_MESSAGES: Record<string, string> = {
  NotAllowedError:   "Camera permission denied. Allow camera access and try again.",
  NotFoundError:     "No camera found on this device.",
  NotSupportedError: "Camera not supported in this browser. Try Chrome or Safari.",
  NotReadableError:  "Camera is in use by another app.",
};

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const videoRef        = useRef<HTMLVideoElement>(null);
  const [state, setState]       = useState<ScanState>("requesting");
  const [errorMsg, setErrorMsg] = useState<string>("");
  
  const stopRef         = useRef<(() => void) | null>(null);
  const hasScannedRef   = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function startScanner() {
      try {
        
        const { BrowserMultiFormatReader } = await import("@zxing/browser");
        
        const { NotFoundException } = await import("@zxing/library");

        if (cancelled || !videoRef.current) return;

        const reader = new BrowserMultiFormatReader();
        setState("scanning");

        
        const controls = await reader.decodeFromVideoDevice(
          undefined,        // use default camera
          videoRef.current,
          (result, err) => {
            if (cancelled || hasScannedRef.current) return;

            if (result) {
              const text = result.getText();
              const isIsbn13 = /^97[89]\d{10}$/.test(text);
              const isIsbn10 = /^\d{9}[\dX]$/.test(text);
              if (isIsbn13 || isIsbn10) {
                hasScannedRef.current = true;
                onScan(text);
              }
            }

           
            if (err && !(err instanceof NotFoundException)) {
              console.warn("[BarcodeScanner]", err);
            }
          },
        );

        
        stopRef.current = () => controls.stop();

      } catch (err) {
        if (cancelled) return;
        const name = err instanceof Error ? err.name : "UnknownError";
        setErrorMsg(
          ERROR_MESSAGES[name] ??
          "Could not access camera. Make sure you are on HTTPS.",
        );
        setState("error");
      }
    }

    void startScanner();

    return () => {
      cancelled = true;
      try { stopRef.current?.(); } catch { /* already stopped */ }
    };
  }, [onScan]);

  return (
    <div
      style={{
        position:        "fixed",
        inset:           0,
        zIndex:          9999,
        backgroundColor: "rgba(0,0,0,0.92)",
        display:         "flex",
        flexDirection:   "column",
        alignItems:      "center",
        justifyContent:  "center",
        gap:             "20px",
        padding:         "24px",
      }}
      role="dialog"
      aria-modal="true"
      aria-label="ISBN barcode scanner"
    >
      
      <button
        onClick={onClose}
        style={{
          position:        "absolute",
          top:             "20px",
          right:           "20px",
          width:           "36px",
          height:          "36px",
          display:         "flex",
          alignItems:      "center",
          justifyContent:  "center",
          borderRadius:    "50%",
          border:          "1.5px solid rgba(255,255,255,0.3)",
          backgroundColor: "rgba(255,255,255,0.1)",
          color:           "#fff",
          cursor:          "pointer",
          fontSize:        "18px",
          lineHeight:      1,
        }}
        aria-label="Close scanner"
      >
        ✕
      </button>

      
      <div style={{ textAlign: "center" }}>
        <p style={{ fontFamily: "var(--font-display)", fontSize: "18px", color: "#fff", marginBottom: "4px" }}>
          Scan a barcode
        </p>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)" }}>
          Point your camera at the ISBN barcode on the back of a book
        </p>
      </div>

      
      <div
        style={{
          position:        "relative",
          width:           "100%",
          maxWidth:        "360px",
          aspectRatio:     "4/3",
          borderRadius:    "var(--radius-lg)",
          overflow:        "hidden",
          backgroundColor: "#000",
          border:          "2px solid rgba(200,135,58,0.6)",
          boxShadow:       "0 0 0 1px rgba(200,135,58,0.2), 0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <video
          ref={videoRef}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          muted
          playsInline
          autoPlay
        />

        
        {state === "scanning" && (
          <>
            {[
              { top: 12,    left:  12,  borderTop:    "3px solid var(--color-accent)", borderLeft:   "3px solid var(--color-accent)" },
              { top: 12,    right: 12,  borderTop:    "3px solid var(--color-accent)", borderRight:  "3px solid var(--color-accent)" },
              { bottom: 12, left:  12,  borderBottom: "3px solid var(--color-accent)", borderLeft:   "3px solid var(--color-accent)" },
              { bottom: 12, right: 12,  borderBottom: "3px solid var(--color-accent)", borderRight:  "3px solid var(--color-accent)" },
            ].map((s, i) => (
              <div key={i} aria-hidden="true" style={{ position: "absolute", width: 24, height: 24, borderRadius: 2, ...s }} />
            ))}
            <div
              aria-hidden="true"
              style={{
                position:   "absolute",
                left:       "10%",
                right:      "10%",
                height:     "2px",
                background: "linear-gradient(to right, transparent, var(--color-accent), transparent)",
                animation:  "scan-line 2s ease-in-out infinite",
                boxShadow:  "0 0 8px var(--color-accent)",
              }}
            />
          </>
        )}

        
        {state === "requesting" && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.7)" }}>
            <p style={{ color: "#fff", fontSize: "14px" }}>Requesting camera…</p>
          </div>
        )}
      </div>

      {/* Error */}
      {state === "error" && (
        <div style={{ backgroundColor: "rgba(184,84,80,0.2)", border: "1px solid rgba(184,84,80,0.5)", borderRadius: "var(--radius-md)", padding: "14px 18px", maxWidth: "360px", width: "100%", textAlign: "center" }}>
          <p style={{ color: "#f87171", fontSize: "14px", lineHeight: 1.5 }}>{errorMsg}</p>
        </div>
      )}

      {state === "scanning" && (
        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", textAlign: "center" }}>
          Keep the barcode steady and well-lit
        </p>
      )}

      <style>{`
        @keyframes scan-line {
          0%   { top: 15%; }
          50%  { top: 80%; }
          100% { top: 15%; }
        }
      `}</style>
    </div>
  );
}