import type { SvgIconComponent } from '@mui/icons-material';
import {
  Dashboard as DashboardIcon,
  Apartment as ApartmentIcon,
  Report as ReportIcon,
  Person as PersonIcon,
  Engineering as EngineeringIcon,
  Home as HomeIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';

interface NavigationItem {
  text: string;
  icon: SvgIconComponent;
  path: string;
}

export const navigationItems: NavigationItem[] = [
  {
    text: 'Dashboard',
    icon: DashboardIcon,
    path: '/vermieter/dashboard',
  },
  {
    text: 'Immobilien',
    icon: ApartmentIcon,
    path: '/vermieter/properties',
  },
  {
    text: 'Meldungen',
    icon: ReportIcon,
    path: '/vermieter/meldungen',
  },
];
