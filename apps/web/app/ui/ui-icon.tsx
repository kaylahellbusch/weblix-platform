import { ArrowLeft, ChevronRight, FileText, Info, LayoutGrid, Link, List, MapPin, Search, Settings, Store, type LucideIcon } from "lucide-react";

type IconName = "business" | "details" | "content" | "grid" | "compact" | "search" | "location" | "link" | "back" | "arrow" | "settings";
const icons: Record<IconName, LucideIcon> = {
  business: Store,
  details: Info,
  content: FileText,
  grid: LayoutGrid,
  compact: List,
  search: Search,
  location: MapPin,
  link: Link,
  back: ArrowLeft,
  arrow: ChevronRight,
  settings: Settings,
};
export function Icon({ name }: { name: IconName }) {
  const LucideIcon = icons[name];
  return <LucideIcon aria-hidden="true" className="ui-icon" size={20} strokeWidth={1.7} />;
}
