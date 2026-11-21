import { SOCIAL_LINKS, type SocialLink } from "@/lib/social/links";

function InstagramIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" strokeLinejoin="round" />
      <path
        d="M14 8.5c-2-0.8-3.5 0.1-3.5 2v7.5M8.7 12h4.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <rect x="3" y="5" width="18" height="14" rx="2" strokeLinejoin="round" />
      <path
        d="M4 6.5 12 13 20 6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const ICONS_BY_PLATFORM: Record<string, () => React.ReactNode> = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  email: EmailIcon,
};

export function SocialLinks({ className }: { className?: string }) {
  return (
    <ul className={`flex items-center gap-4 ${className ?? ""}`}>
      {SOCIAL_LINKS.map((link: SocialLink) => {
        const Icon = ICONS_BY_PLATFORM[link.platform];
        const isExternal = !link.href.startsWith("mailto:");
        return (
          <li key={link.href}>
            <a
              href={link.href}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              aria-label={link.label}
              className="text-bone/60 hover:text-bone inline-flex transition-colors"
            >
              {Icon ? <Icon /> : null}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
