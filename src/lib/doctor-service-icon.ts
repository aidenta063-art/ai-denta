import {
  Video,
  Filter,
  Megaphone,
  Palette,
  Share2,
  Layers,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

// Doctor services are free-text (admin-entered), so there's no stored
// icon key to render from — this just picks a reasonable icon by
// matching common keywords, same idea as the fixed icon lists used for
// WhyUsSection/ServicesSection.
const KEYWORD_ICONS: [RegExp, LucideIcon][] = [
  [/content/i, Video],
  [/funnel|conversion/i, Filter],
  [/ad(s|vertising)?|sponsored/i, Megaphone],
  [/brand|identity|logo|visual/i, Palette],
  [/social/i, Share2],
  [/setup|system/i, Layers],
];

export function getDoctorServiceIcon(nameEn: string): LucideIcon {
  const match = KEYWORD_ICONS.find(([pattern]) => pattern.test(nameEn));
  return match ? match[1] : Sparkles;
}
