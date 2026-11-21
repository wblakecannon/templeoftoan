"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { NavItem } from "./nav-items";

export function MoreMenu({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const panel = rootRef.current?.querySelector<HTMLElement>('[role="menu"]');
    panel?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    function onDocumentClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("click", onDocumentClick);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("click", onDocumentClick);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="more-nav-menu"
        onClick={() => setOpen((value) => !value)}
        className="text-bone/80 hover:text-bone flex items-center gap-1 text-sm font-medium transition-colors"
      >
        More
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open ? (
        <ul
          id="more-nav-menu"
          role="menu"
          aria-label="More"
          className="bg-abyss border-bone/10 absolute top-full right-0 z-50 mt-2 min-w-40 rounded-md border py-1 shadow-lg"
        >
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="text-bone/80 hover:bg-bone/5 hover:text-bone block px-4 py-2 text-sm font-medium transition-colors"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
