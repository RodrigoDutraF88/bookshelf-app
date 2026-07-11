"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

const SHELF_BOOKS = [
  { x: 6,   w: 22, h: 88,  color: "#4A7C59", delay: 0 },
  { x: 30,  w: 16, h: 104, color: "#C8873A", delay: 0.3 },
  { x: 48,  w: 24, h: 76,  color: "#6B8FA8", delay: 0.6 },
  { x: 74,  w: 18, h: 96,  color: "#B85450", delay: 0.2 },
  { x: 94,  w: 20, h: 84,  color: "#8B6B8A", delay: 0.8 },
  { x: 116, w: 14, h: 100, color: "#5B7A8C", delay: 0.4 },
  { x: 132, w: 26, h: 80,  color: "#7A8C5B", delay: 1.0 },
  { x: 160, w: 18, h: 92,  color: "#8C6B3E", delay: 0.15 },
  { x: 180, w: 20, h: 72,  color: "#4A5E7A", delay: 0.7 },
  { x: 202, w: 16, h: 98,  color: "#7A4A4A", delay: 0.45 },
  { x: 220, w: 22, h: 86,  color: "#4A7C59", delay: 0.9 },
  { x: 244, w: 18, h: 94,  color: "#C8873A", delay: 0.25 },
];

const SHELF_Y = 110;

type LoadingProvider = "discord" | "google" | null;

export function LoginView() {
  const [loading, setLoading] = useState<LoadingProvider>(null);

  async function handleSignIn(provider: "discord" | "google") {
    setLoading(provider);
    await signIn(provider, { callbackUrl: "/library" });
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        backgroundColor: "var(--color-bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      
      <div aria-hidden="true" style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(200,135,58,0.08) 0%, transparent 70%)", top: "-100px", left: "-150px", pointerEvents: "none" }} />
      <div aria-hidden="true" style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(74,124,89,0.07) 0%, transparent 70%)", bottom: "-80px", right: "-100px", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: "400px", position: "relative", zIndex: 1 }}>

        
        <div style={{ width: "100%", marginBottom: "32px", display: "flex", justifyContent: "center" }}>
          <AnimatedShelf />
        </div>

       
        <div
          style={{
            backgroundColor: "rgba(251, 248, 243, 0.88)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(139, 99, 64, 0.18)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "0 24px 64px rgba(44, 24, 16, 0.14), 0 4px 16px rgba(44, 24, 16, 0.08)",
            overflow: "hidden",
          }}
        >
          
          <div style={{ height: "3px", background: "linear-gradient(to right, #4A7C59, #C8873A, #6B8FA8, #B85450, #8B6B8A, #4A7C59)" }} />

          <div style={{ padding: "36px 32px 32px" }}>
           
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "30px", color: "var(--color-text-primary)", lineHeight: 1.1, marginBottom: "10px", letterSpacing: "-0.01em" }}>
                Bookshelf
              </h1>
              <p style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "15px", color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                Your reading life, beautifully organised.
              </p>
            </div>

            
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <div style={{ flex: 1, height: "1px", backgroundColor: "var(--color-border)" }} />
              <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
                Sign in with
              </span>
              <div style={{ flex: 1, height: "1px", backgroundColor: "var(--color-border)" }} />
            </div>

           
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

              
              <button
                onClick={() => { void handleSignIn("google"); }}
                disabled={loading !== null}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  padding: "14px 24px",
                  borderRadius: "var(--radius-pill)",
                  border: "1.5px solid rgba(139,99,64,0.2)",
                  backgroundColor: "#fff",
                  color: "#3c4043",
                  fontSize: "15px",
                  fontWeight: 600,
                  fontFamily: "var(--font-body)",
                  cursor: loading !== null ? "not-allowed" : "pointer",
                  opacity: loading !== null ? 0.7 : 1,
                  transition: "all 200ms ease",
                  boxShadow: "0 2px 8px rgba(44,24,16,0.10)",
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(44,24,16,0.16)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(44,24,16,0.10)";
                }}
              >
                {loading === "google" ? <SpinnerIcon color="#4285F4" /> : <GoogleIcon />}
                {loading === "google" ? "Connecting…" : "Continue with Google"}
              </button>

             
              <button
                onClick={() => { void handleSignIn("discord"); }}
                disabled={loading !== null}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  padding: "14px 24px",
                  borderRadius: "var(--radius-pill)",
                  border: "none",
                  backgroundColor: "#5865F2",
                  color: "#FFFFFF",
                  fontSize: "15px",
                  fontWeight: 700,
                  fontFamily: "var(--font-body)",
                  cursor: loading !== null ? "not-allowed" : "pointer",
                  opacity: loading !== null ? 0.7 : 1,
                  transition: "all 200ms ease",
                  boxShadow: "0 4px 16px rgba(88, 101, 242, 0.30)",
                  letterSpacing: "-0.01em",
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(88, 101, 242, 0.40)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(88, 101, 242, 0.30)";
                }}
              >
                {loading === "discord" ? <SpinnerIcon color="#fff" /> : <DiscordIcon />}
                {loading === "discord" ? "Connecting…" : "Continue with Discord"}
              </button>
            </div>

            <p style={{ fontSize: "11px", color: "var(--color-text-muted)", textAlign: "center", marginTop: "16px", lineHeight: 1.6 }}>
              No account needed — sign in once and your shelf is ready.
            </p>
          </div>

         
          <div style={{ padding: "18px 32px 24px", borderTop: "1px solid var(--color-border)", backgroundColor: "rgba(237, 228, 216, 0.60)", display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              ["📚", "Track every book you read"],
              ["⭐", "Rate and write personal reviews"],
              ["📊", "See your reading stats grow"],
            ].map(([icon, text]) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "15px", flexShrink: 0 }}>{icon}</span>
                <span style={{ fontSize: "13px", color: "var(--color-text-secondary)", fontFamily: "var(--font-body)" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ textAlign: "center", fontSize: "11px", color: "var(--color-text-muted)", marginTop: "20px" }}>
          Built for readers who care about their shelves 📖
        </p>
      </div>

      <style>{`
        @keyframes bob {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-5px); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function AnimatedShelf() {
  const svgW = 280;
  const ledgeY = SHELF_Y + 10;
  return (
    <svg width={svgW} height={ledgeY + 22} viewBox={`0 0 ${svgW} ${ledgeY + 22}`} fill="none" aria-hidden="true" style={{ overflow: "visible" }}>
      {SHELF_BOOKS.map((book, i) => {
        const bookTop = SHELF_Y - book.h;
        const tilt = i % 4 === 1 ? -1.5 : i % 4 === 3 ? 1.2 : 0;
        return (
          <g key={i} style={{ transformOrigin: `${book.x + book.w / 2}px ${SHELF_Y}px`, animation: `bob ${2.4 + (i % 4) * 0.3}s ease-in-out ${book.delay}s infinite` }}>
            <g transform={`rotate(${tilt}, ${book.x + book.w / 2}, ${SHELF_Y})`}>
              <rect x={book.x} y={bookTop} width={book.w} height={book.h} rx="2" fill={book.color} />
              <rect x={book.x} y={bookTop} width={3} height={book.h} rx="1" fill="rgba(255,255,255,0.22)" />
              <rect x={book.x} y={bookTop} width={book.w} height={3} rx="1" fill="rgba(255,255,255,0.30)" />
              <rect x={book.x + book.w - 4} y={bookTop} width={4} height={book.h} rx="1" fill="rgba(0,0,0,0.12)" />
            </g>
          </g>
        );
      })}
      <rect x="0" y={ledgeY}      width={svgW} height={6} fill="#C4956A" rx="1" />
      <rect x="0" y={ledgeY + 5}  width={svgW} height={8} fill="#8B6340" />
      <rect x="0" y={ledgeY + 12} width={svgW} height={4} fill="#3D2314" />
      {[30, 80, 140, 200, 250].map((gx) => (
        <line key={gx} x1={gx} y1={ledgeY} x2={gx} y2={ledgeY + 16} stroke="rgba(61,35,20,0.12)" strokeWidth="1" />
      ))}
      <rect x="4" y={ledgeY + 16} width={svgW - 8} height={6} rx="2" fill="rgba(44,24,16,0.15)" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.041.032.052a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
    </svg>
  );
}

function SpinnerIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ animation: "spin 0.8s linear infinite" }} aria-hidden="true">
      <circle cx="9" cy="9" r="7" stroke={`${color}40`} strokeWidth="2" />
      <path d="M9 2a7 7 0 0 1 7 7" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}