"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/dashboard", label: "Dashboard", icon: <DashIcon /> },
  { href: "/reviews",   label: "Reviews",   icon: <ReviewsIcon /> },
  { href: "/library",   label: "Bookshelf", icon: <BookshelfIcon /> },
  { href: "/explore",   label: "Explore",   icon: <ExploreIcon /> },
  { href: "/profile",   label: "Profile",   icon: <ProfileIcon /> },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main navigation"
      style={{
        position:        "fixed",
        bottom:          0,
        left:            0,
        right:           0,
        zIndex:          40,
        height:          "64px",
        backgroundColor: "rgba(251,248,243,0.95)",
        backdropFilter:  "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop:       "1px solid rgba(139,99,64,0.12)",
        display:         "flex",
        alignItems:      "stretch",
        
        paddingBottom:   "env(safe-area-inset-bottom)",
      }}
    >
      {TABS.map(({ href, label, icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={active ? "page" : undefined}
            style={{
              flex:           1,
              display:        "flex",
              flexDirection:  "column",
              alignItems:     "center",
              justifyContent: "center",
              gap:            "3px",
              textDecoration: "none",
              color:          active ? "var(--color-accent)" : "var(--color-text-muted)",
              transition:     "color 150ms ease",
              paddingTop:     "8px",
            }}
          >
            
            <div style={{ position: "relative" }}>
              <span
                style={{
                  display:    "flex",
                  transform:  active ? "scale(1.15)" : "scale(1)",
                  transition: "transform 200ms cubic-bezier(0.34,1.56,0.64,1)",
                }}
              >
                {icon}
              </span>
              {active && (
                <span
                  style={{
                    position:        "absolute",
                    bottom:          "-5px",
                    left:            "50%",
                    transform:       "translateX(-50%)",
                    width:           "4px",
                    height:          "4px",
                    borderRadius:    "50%",
                    backgroundColor: "var(--color-accent)",
                  }}
                />
              )}
            </div>
            <span
              style={{
                fontSize:   "10px",
                fontWeight: active ? 700 : 500,
                fontFamily: "var(--font-body)",
                lineHeight: 1,
              }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}


function DashIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
}
function ReviewsIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
}
function BookshelfIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
}
function ExploreIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>;
}
function ProfileIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}