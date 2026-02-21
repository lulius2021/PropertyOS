"use client";

import type { ReactNode } from "react";

export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07080f] px-4 py-10">
      {/* Background glows */}
      <div className="pointer-events-none absolute bottom-0 left-0 h-[55vh] w-[55vw] -translate-x-1/4 translate-y-1/4 rounded-full bg-[#0066ff]/10 blur-[140px]" />
      <div className="pointer-events-none absolute right-0 top-0 h-[35vh] w-[35vw] translate-x-1/4 -translate-y-1/4 rounded-full bg-[#0066ff]/[0.06] blur-[90px]" />

      {/* Card with spinning border */}
      <div className="relative w-full max-w-[480px] overflow-hidden rounded-[22px] p-[1.5px] shadow-[0_32px_80px_rgba(0,0,0,0.6)]">
        {/* Rotating gradient border */}
        <div className="auth-border-spin" />
        {/* Card inner */}
        <div className="relative rounded-[21px] bg-[#0d1117] p-10">
{children}
        </div>
      </div>
    </div>
  );
}

/* Shared input with leading icon */
export function AuthInput({
  icon,
  trailing,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  icon: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#3d4d66]">
        {icon}
      </span>
      <input
        {...props}
        className="w-full rounded-full border border-white/[0.08] bg-[#0a0e17] py-3 pl-11 pr-4 text-[0.9375rem] text-white placeholder:text-[#3d4d66] focus:border-[#0066ff]/60 focus:outline-none focus:ring-1 focus:ring-[#0066ff]/25 transition"
      />
      {trailing && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2">
          {trailing}
        </span>
      )}
    </div>
  );
}

/* Primary submit button */
export function AuthButton({
  children,
  loading,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className="w-full rounded-full bg-[#0066ff] py-3.5 text-[0.9375rem] font-semibold text-white shadow-[0_4px_20px_rgba(0,102,255,0.35)] transition hover:bg-[#0052cc] hover:shadow-[0_6px_28px_rgba(0,102,255,0.5)] focus:outline-none focus:ring-2 focus:ring-[#0066ff]/50 disabled:opacity-50"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
          </svg>
          {children}
        </span>
      ) : children}
    </button>
  );
}

/* Error banner */
export function AuthError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
      {message}
    </div>
  );
}

/* Icon components */
export const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

export const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

export const EyeIcon = ({ off }: { off?: boolean }) => off ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
) : (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

export const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

export const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
