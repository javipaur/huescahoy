import {
  Baby,
  CalendarDays,
  Clapperboard,
  Dumbbell,
  Image,
  Landmark,
  MapPin,
  Music,
  PartyPopper,
  ShoppingBag,
  Theater,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  music: Music,
  theater: Theater,
  image: Image,
  dumbbell: Dumbbell,
  baby: Baby,
  clapperboard: Clapperboard,
  "shopping-bag": ShoppingBag,
  "party-popper": PartyPopper,
  landmark: Landmark,
  calendar: CalendarDays,
  pin: MapPin,
};

export function getIcon(name: string | null | undefined): LucideIcon {
  if (name && ICONS[name]) return ICONS[name];
  return CalendarDays;
}

export const ICON_OPTIONS = Object.keys(ICONS).map((key) => ({
  value: key,
  label: key,
}));
