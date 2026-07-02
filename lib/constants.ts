/**
 * Global constants for Anderson Palafoz Platform
 */

export const PROFESSOR_NAME = "Anderson Palafoz";

export const NAVIGATION_LINKS = [
  { label: "Home", href: "/" },
  { label: "Sobre", href: "/about" },
  { label: "Aulas", href: "/courses" },
  { label: "Materiais", href: "/materials" },
  { label: "Blog", href: "/blog" },
  { label: "Contato", href: "/contact" },
];

export const DASHBOARD_LINKS = [
  { label: "Cursos", href: "/dashboard/courses", icon: "BookOpen" },
  { label: "Atividades", href: "/dashboard/activities", icon: "CheckCircle2" },
  { label: "Biblioteca", href: "/dashboard/library", icon: "Library" },
  { label: "Calendário", href: "/dashboard/calendar", icon: "Calendar" },
  { label: "Certificados", href: "/dashboard/certificates", icon: "Award" },
  { label: "Perfil", href: "/dashboard/profile", icon: "User" },
];

export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

export const BIBLE_VERSE = {
  text: "Colossenses 3:23",
  fullText: "E tudo quanto fizerdes, fazei-o de todo o coração, como para o Senhor, e não para os homens.",
};

export const BRAND_COLORS = {
  primary: "#D62828",
  primaryHover: "#B91C1C",
  dark: "#333333",
  light: "#F3F4F6",
  white: "#FFFFFF",
};

export const SUPPORT_COLORS = {
  success: "#16A34A",
  warning: "#F59E0B",
  error: "#DC2626",
  info: "#2563EB",
};

export const SPACING = {
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  "2xl": "48px",
  "3xl": "64px",
  "4xl": "96px",
};

export const BORDER_RADIUS = {
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "24px",
};

export const SHADOWS = {
  card: "0 4px 12px rgba(0, 0, 0, 0.08)",
  hover: "0 8px 20px rgba(0, 0, 0, 0.12)",
};

export const SIDEBAR_WIDTH = 280;
export const NAVBAR_HEIGHT = 72;
