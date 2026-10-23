import {
  Briefcase,
  Building2,
  Cpu,
  FolderKanban,
  Handshake,
  Medal,
  MessagesSquare,
  Mountain,
  Sun,
  Target,
  User,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

/** One icon per unit theme (index = unit id - 1). */
export const UNIT_ICONS: LucideIcon[] = [User, Sun, Mountain, Cpu, FolderKanban, Users, Medal, Wrench, Building2, MessagesSquare, Target, Handshake]

export const UNIT_FALLBACK_ICON: LucideIcon = Briefcase
