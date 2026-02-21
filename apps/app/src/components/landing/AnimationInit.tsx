"use client";

import { useEffect } from "react";

/**
 * AnimationInit — client component that boots all landing page animations.
 * Renders nothing visible; only sets up JS-driven effects.
 */
export default function AnimationInit() {
  useEffect(() => {
    // ── Intersection Observer (scroll reveal + stagger) ──────────────
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -48px 0px" }
    );

    document
      .querySelectorAll("[data-animate], [data-stagger-parent]")
      .forEach((el) => observer.observe(el));

    // ── Magnetic Buttons ─────────────────────────────────────────────
    const magneticEls = document.querySelectorAll<HTMLElement>(".magnetic");

    const onMagneticMove = (e: MouseEvent) => {
      const el = e.currentTarget as HTMLElement;
      const rect = el.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      el.style.transform = `translate(${dx * 0.22}px, ${dy * 0.22}px)`;
    };

    const onMagneticLeave = (e: MouseEvent) => {
      (e.currentTarget as HTMLElement).style.transform = "";
    };

    magneticEls.forEach((el) => {
      el.addEventListener("mousemove", onMagneticMove);
      el.addEventListener("mouseleave", onMagneticLeave);
    });

    // ── Cursor Glow (dark sections only) ─────────────────────────────
    const glow = document.createElement("div");
    glow.className = "cursor-glow";
    glow.style.opacity = "0";
    glow.style.left = "-9999px";
    glow.style.top = "-9999px";
    document.body.appendChild(glow);

    const darkSections = document.querySelectorAll<HTMLElement>("[data-dark]");

    const onMouseMove = (e: MouseEvent) => {
      glow.style.left = e.clientX + "px";
      glow.style.top = e.clientY + "px";

      const inDark = Array.from(darkSections).some((sec) => {
        const r = sec.getBoundingClientRect();
        return (
          e.clientY >= r.top &&
          e.clientY <= r.bottom &&
          e.clientX >= r.left &&
          e.clientX <= r.right
        );
      });

      glow.style.opacity = inDark ? "1" : "0";
    };

    document.addEventListener("mousemove", onMouseMove, { passive: true });

    // ── Nav link hover underline ─────────────────────────────────────
    const navLinks = document.querySelectorAll<HTMLElement>(".nav-link");
    const onNavEnter = (e: MouseEvent) => {
      const el = e.currentTarget as HTMLElement;
      el.style.color = "#ffffff";
    };
    const onNavLeave = (e: MouseEvent) => {
      const el = e.currentTarget as HTMLElement;
      el.style.color = "#a0a8b8";
    };
    navLinks.forEach((el) => {
      el.addEventListener("mouseenter", onNavEnter);
      el.addEventListener("mouseleave", onNavLeave);
    });

    // ── Feature card icon bounce on hover ────────────────────────────
    // (handled via CSS .feature-card:hover .feature-icon selector)

    return () => {
      observer.disconnect();
      magneticEls.forEach((el) => {
        el.removeEventListener("mousemove", onMagneticMove);
        el.removeEventListener("mouseleave", onMagneticLeave);
      });
      document.removeEventListener("mousemove", onMouseMove);
      navLinks.forEach((el) => {
        el.removeEventListener("mouseenter", onNavEnter);
        el.removeEventListener("mouseleave", onNavLeave);
      });
      glow.remove();
    };
  }, []);

  return null;
}
