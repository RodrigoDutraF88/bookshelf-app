"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";

interface AppNavProps {
  user: Session["user"];
}

const NAV_LINKS = [
  { href: "/library", label: "Library", icon: <LibraryIcon /> },
  { href: "/reviews", label: "Reviews", icon: <StarIcon /> },
];

export function AppNav({ user }: AppNavProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const initial = (user.name ?? user.email ?? "R")[0]?.toUpperCase() ?? "R";
  const firstName = user.name?.split(" ")[0] ?? "Reader";

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          width: "100%",
          backgroundColor: "rgba(245, 239, 230, 0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(139, 99, 64, 0.14)",
          boxShadow: "0 1px 0 rgba(139, 99, 64, 0.06)",
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            padding: "0 24px",
            height: "85px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
      
          <Link
            href="/library"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "9px",
              textDecoration: "none",
              marginRight: "8px",
              flexShrink: 0,
            }}
          >
            <NavLogo />
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "16px",
                color: "var(--color-text-primary)",
                letterSpacing: "-0.01em",
              }}
            >
              Bookshelf
            </span>
          </Link>

   
          <nav
            style={{ display: "flex", alignItems: "center", gap: "2px", flex: 1 }}
            aria-label="Main navigation"
          >
            {NAV_LINKS.map(({ href, label, icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 13px",
                    borderRadius: "var(--radius-pill)",
                    fontSize: "13px",
                    fontWeight: active ? 700 : 500,
                    fontFamily: "var(--font-body)",
                    color: active ? "var(--color-accent)" : "var(--color-text-secondary)",
                    textDecoration: "none",
                    backgroundColor: active ? "var(--color-accent-glass)" : "transparent",
                    border: "1px solid",
                    borderColor: active ? "rgba(200,135,58,0.22)" : "transparent",
                    transition: "all 150ms ease",
                  }}
                >
                  {icon}
                  {label}
                </Link>
              );
            })}
          </nav>

       
          <div ref={menuRef} style={{ position: "relative", flexShrink: 0 }}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-haspopup="true"
              aria-label="Open user menu"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                padding: "3px 10px 3px 3px",
                borderRadius: "var(--radius-pill)",
                border: "1.5px solid",
                borderColor: menuOpen
                  ? "var(--color-accent)"
                  : "rgba(139,99,64,0.25)",
                backgroundColor: menuOpen
                  ? "var(--color-accent-glass)"
                  : "rgba(251,248,243,0.7)",
                cursor: "pointer",
                transition: "all 150ms ease",
              }}
            >
              
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name ?? "Avatar"}
                  width={28}
                  height={28}
                  style={{ borderRadius: "50%", flexShrink: 0 }}
                />
              ) : (
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    backgroundColor: "var(--color-accent)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-display)",
                    fontSize: "12px",
                    flexShrink: 0,
                  }}
                >
                  {initial}
                </div>
              )}
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-primary)",
                  maxWidth: "88px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {firstName}
              </span>
              <svg
                width="11" height="11" viewBox="0 0 12 12"
                fill="none" stroke="var(--color-text-muted)"
                strokeWidth="2" strokeLinecap="round"
                style={{
                  transform: menuOpen ? "rotate(180deg)" : "none",
                  transition: "transform 200ms ease",
                  flexShrink: 0,
                }}
                aria-hidden="true"
              >
                <path d="M2 4l4 4 4-4" />
              </svg>
            </button>

        
            {menuOpen && (
              <div
                role="menu"
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  minWidth: "210px",
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-lg)",
                  boxShadow: "var(--shadow-xl)",
                  overflow: "hidden",
                  animation: "fade-down 0.15s ease both",
                }}
              >
         
                <div
                  style={{
                    padding: "14px 16px",
                    borderBottom: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-bg-deep)",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "13px",
                      color: "var(--color-text-primary)",
                      marginBottom: "2px",
                    }}
                  >
                    {user.name ?? "Reader"}
                  </p>
                  {user.email && (
                    <p
                      style={{
                        fontSize: "11px",
                        color: "var(--color-text-muted)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {user.email}
                    </p>
                  )}
                </div>

              
                <div style={{ padding: "6px" }}>
                  {[
                    { href: "/profile", icon: <UserIcon />, label: "My Profile" },
                    { href: "/library", icon: <LibraryIcon />, label: "My Library" },
                    { href: "/reviews", icon: <StarIcon />, label: "My Reviews" },
                  ].map(({ href, icon, label }) => (
                    <Link
                      key={href}
                      href={href}
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "9px 12px",
                        borderRadius: "var(--radius-md)",
                        textDecoration: "none",
                        color: "var(--color-text-secondary)",
                        fontSize: "13px",
                        fontFamily: "var(--font-body)",
                        fontWeight: 500,
                        transition: "background-color 120ms ease, color 120ms ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "var(--color-bg-deep)";
                        e.currentTarget.style.color = "var(--color-text-primary)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "var(--color-text-secondary)";
                      }}
                    >
                      {icon}
                      {label}
                    </Link>
                  ))}

                  <div
                    style={{
                      height: "1px",
                      backgroundColor: "var(--color-border)",
                      margin: "5px 0",
                    }}
                  />

                  <button
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      void signOut({ callbackUrl: "/login" });
                    }}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "9px 12px",
                      borderRadius: "var(--radius-md)",
                      border: "none",
                      backgroundColor: "transparent",
                      color: "var(--color-danger)",
                      fontSize: "13px",
                      fontFamily: "var(--font-body)",
                      fontWeight: 500,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background-color 120ms ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "var(--color-danger-dim)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <SignOutIcon />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <style>{`
        @keyframes fade-down {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}


function NavLogo() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <rect x="2" y="19" width="22" height="4" rx="2" fill="#8B6340" />
      <rect x="2" y="22" width="22" height="2" rx="1" fill="#3D2314" />
      <rect x="3"  y="7"  width="5" height="12" rx="1" fill="#4A7C59" />
      <rect x="9"  y="4"  width="4" height="15" rx="1" fill="#C8873A" />
      <rect x="14" y="8"  width="5" height="11" rx="1" fill="#6B8FA8" />
      <rect x="20" y="6"  width="4" height="13" rx="1" fill="#B85450" />
    </svg>
  );
}

function LibraryIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="4" height="18" rx="1" />
      <rect x="9" y="7" width="4" height="14" rx="1" />
      <rect x="15" y="5" width="4" height="16" rx="1" />
      <line x1="3" y1="21" x2="21" y2="21" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

function SignOutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}