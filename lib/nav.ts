import { Home, Settings, type LucideIcon } from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "หน้าแรก", icon: Home },
  { href: "/settings", label: "ตั้งค่า", icon: Settings },
];
