export interface NavItem {
  label: string;
  href: string;
}

// Full flat list, used by MobileNavigation - every section, one column, no
// grouping. Add an entry here as each section ships real, non-empty content.
export const NAV_ITEMS: NavItem[] = [
  { label: "Sermons", href: "/sermons" },
  { label: "Relics", href: "/relics" },
  { label: "Rigs", href: "/rigs" },
  { label: "Disciples", href: "/disciples" },
  { label: "Tech", href: "/tech" },
  { label: "Collections", href: "/collections" },
  { label: "Search", href: "/search" },
  { label: "Confess", href: "/submit" },
  { label: "About", href: "/about" },
];

// Desktop-only grouping (SiteHeader): always-visible items in the primary
// row. Search isn't listed here - it renders as an icon link instead.
export const PROMINENT_NAV_ITEMS: NavItem[] = [
  { label: "Sermons", href: "/sermons" },
  { label: "Relics", href: "/relics" },
  { label: "Rigs", href: "/rigs" },
  { label: "Tech", href: "/tech" },
];

// Desktop-only grouping (SiteHeader): tucked behind the "More" menu.
export const MORE_NAV_ITEMS: NavItem[] = [
  { label: "Disciples", href: "/disciples" },
  { label: "Collections", href: "/collections" },
  { label: "Confess", href: "/submit" },
  { label: "About", href: "/about" },
];
