import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { MobileNavigation } from "@/components/navigation/MobileNavigation";
import { MoreMenu } from "@/components/navigation/MoreMenu";
import {
  MORE_NAV_ITEMS,
  PROMINENT_NAV_ITEMS,
} from "@/components/navigation/nav-items";

export function SiteHeader() {
  return (
    <header className="border-bone/10 relative border-b">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4 sm:px-10">
        <Wordmark />

        <nav aria-label="Primary" className="hidden sm:block">
          <ul className="flex items-center gap-6">
            {PROMINENT_NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-bone/80 hover:text-bone text-sm font-medium transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/search"
                aria-label="Search"
                className="text-bone/80 hover:text-bone block transition-colors"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <circle cx="11" cy="11" r="7" />
                  <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
                </svg>
              </Link>
            </li>
            <li>
              <MoreMenu items={MORE_NAV_ITEMS} />
            </li>
          </ul>
        </nav>

        <MobileNavigation />
      </div>
    </header>
  );
}
