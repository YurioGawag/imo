import {
  Home as HomeIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

export const navigationItems = [
  {
    text: 'Dashboard',
    icon: HomeIcon,
    path: '/handwerker/dashboard',
  },
  {
    text: 'Aufträge',
    icon: AssignmentIcon,
    path: '/handwerker/meldungen',
  },
  {
    text: 'Profil',
    icon: PersonIcon,
    path: '/handwerker/profil',
  },
];
