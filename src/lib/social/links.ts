export interface SocialLink {
  platform: string;
  label: string;
  href: string;
}

export const SOCIAL_LINKS: SocialLink[] = [
  {
    platform: "email",
    label: "Email Temple of Toan",
    href: "mailto:hello@templeoftoan.com",
  },
];
