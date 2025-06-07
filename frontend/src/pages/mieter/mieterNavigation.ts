import {
  Home as HomeIcon,
  Assignment as AssignmentIcon,
  Notifications as NotificationsIcon,
  Apartment as ApartmentIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import type { SvgIconComponent } from '@mui/icons-material';

export interface NavigationItem {
  text: string;
  icon: SvgIconComponent;
  path: string;
}

export const navigationItems: NavigationItem[] = [
  {
    text: 'Dashboard',
    icon: HomeIcon,
    path: '/mieter/dashboard',
  },
  {
    text: 'Meine Wohnung',
    icon: ApartmentIcon,
    path: '/mieter/wohnung',
  },
  {
    text: 'Meldungen',
    icon: AssignmentIcon,
    path: '/mieter/meldungen',
  },
  {
    text: 'Benachrichtigungen',
    icon: NotificationsIcon,
    path: '/mieter/benachrichtigungen',
  },
  {
    text: 'Profil',
    icon: PersonIcon,
    path: '/mieter/profil',
  },
];