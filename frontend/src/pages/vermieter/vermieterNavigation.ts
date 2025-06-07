import {
  Dashboard as DashboardIcon,
  HomeWork as HomeWorkIcon,
  Campaign as CampaignIcon,
  Handyman as HandymanIcon,
  AccountCircle as AccountCircleIcon,
  Apartment as ApartmentIcon,
  LocationCity as LocationCityIcon,
  NotificationsActive as NotificationsActiveIcon,
  Settings as SettingsIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import type { SvgIconComponent } from '@mui/icons-material';

export interface NavigationItem {
  text: string;
  icon: SvgIconComponent;
  path: string;
  badge?: number;
}

export const vermieterNavigationItems: NavigationItem[] = [
  {
    text: 'Dashboard',
    icon: DashboardIcon,
    path: '/vermieter/dashboard',
  },
  {
    text: 'Immobilien',
    icon: LocationCityIcon,
    path: '/vermieter/properties',
  },
  {
    text: 'Meldungen',
    icon: AssignmentIcon,
    path: '/vermieter/meldungen',
  },
  {
    text: 'Aufträge',
    icon: CheckCircleIcon,
    path: '/vermieter/auftraege',
  },
  {
    text: 'Benachrichtigungen',
    icon: NotificationsActiveIcon,
    path: '/vermieter/benachrichtigungen',
  },
  {
    text: 'Benutzerverwaltung',
    icon: PeopleIcon,
    path: '/vermieter/users',
  },
  {
    text: 'Handwerker',
    icon: HandymanIcon,
    path: '/vermieter/handwerker',
  },
  {
    text: 'Profil',
    icon: AccountCircleIcon,
    path: '/vermieter/profile',
  },
];
