import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  Chip,
  Paper,
  IconButton,
  Tooltip,
  Divider,
  Avatar,
  Badge,
  CircularProgress,
  InputAdornment,
  Fade,
  Collapse,
  Alert,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import deLocale from 'date-fns/locale/de';
import { NotificationType, NotificationPriority } from '../../types/notification.types';
import api from '../../services/api';
import { format, isToday, isYesterday, parseISO, subDays } from 'date-fns';
import { MainLayout } from '../../components/Layout/MainLayout';
import { vermieterNavigationItems } from './vermieterNavigation';
import { PropertySelector } from '../../components/PropertySelector/PropertySelector';
import { useAuthStore } from '../../store/auth.store';
// Icons
import NotificationsIcon from '@mui/icons-material/Notifications';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import BuildIcon from '@mui/icons-material/Build';
import EventIcon from '@mui/icons-material/Event';
import WarningIcon from '@mui/icons-material/Warning';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

interface Property {
  _id: string;
  name: string;
  address: {
    street: string;
    postalCode: string;
    city: string;
  };
}

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  property: Property;
  date?: Date;
  createdAt: Date;
  createdBy: {
    firstName: string;
    lastName: string;
  };
  readBy: Array<{
    user: string;
    readAt: Date;
  }>;
}

interface CreateNotificationForm {
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  propertyId: string;
  date?: Date | null;
}

const initialFormState: CreateNotificationForm = {
  title: '',
  message: '',
  type: NotificationType.ANNOUNCEMENT,
  priority: NotificationPriority.MEDIUM,
  propertyId: '',
  date: null,
};

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  transition: 'all 0.3s ease',
  border: '1px solid rgba(0, 0, 0, 0.05)',
  overflow: 'visible',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(230, 126, 34, 0.12)',
  },
}));

const NotificationTypeIcon = ({ type }: { type: NotificationType }) => {
  switch (type) {
    case NotificationType.MAINTENANCE:
      return <BuildIcon sx={{ color: '#3498db' }} />;
    case NotificationType.ANNOUNCEMENT:
      return <AnnouncementIcon sx={{ color: '#E67E22' }} />;
    case NotificationType.EVENT:
      return <EventIcon sx={{ color: '#2ecc71' }} />;
    case NotificationType.EMERGENCY:
      return <WarningIcon sx={{ color: '#e74c3c' }} />;
    default:
      return <NotificationsIcon />;
  }
};

const PriorityChip = styled(Chip)<{ priority: NotificationPriority }>(({ theme, priority }) => {
  const getColor = () => {
    switch (priority) {
      case NotificationPriority.LOW:
        return { bg: '#E3F2FD', color: '#1976D2' };
      case NotificationPriority.MEDIUM:
        return { bg: '#E8F5E9', color: '#2E7D32' };
      case NotificationPriority.HIGH:
        return { bg: '#FFF3E0', color: '#E67E22' };
      case NotificationPriority.URGENT:
        return { bg: '#FFEBEE', color: '#C62828' };
      default:
        return { bg: '#E0E0E0', color: '#757575' };
    }
  };
  
  const colorSet = getColor();
  
  return {
    backgroundColor: colorSet.bg,
    color: colorSet.color,
    fontWeight: 600,
    borderRadius: 8,
    '& .MuiChip-icon': {
      color: colorSet.color,
    },
  };
});

const formatNotificationDate = (date: Date | string) => {
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  
  if (isToday(parsedDate)) {
    return `Heute, ${format(parsedDate, 'HH:mm')}`;
  } else if (isYesterday(parsedDate)) {
    return `Gestern, ${format(parsedDate, 'HH:mm')}`;
  } else {
    return format(parsedDate, 'dd.MM.yyyy, HH:mm');
  }
};

export const VermieterBenachrichtigungen: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CreateNotificationForm>(initialFormState);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const isSmallScreen = useMediaQuery('(max-width:600px)');
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!localStorage.getItem('activePropertyId')) {
        console.warn('Keine aktive Immobilie ausgewählt');
        setNotifications([]);
        setFilteredNotifications([]);
        return [];
      }

      setLoading(true);
      try {
        const response = await api.get(`notifications/property/${localStorage.getItem('activePropertyId')}`);
        setNotifications(response.data);
        setFilteredNotifications(response.data);
        return response.data;
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotifications([]);
        setFilteredNotifications([]);
        setError('Fehler beim Laden der Benachrichtigungen');
        return [];
      } finally {
        setLoading(false);
      }
    };

    const load = async () => {
      const data = await fetchNotifications();
      if (user) {
        data.forEach((n: any) => {
          if (!n.readBy?.some((r: any) => r.user === user._id)) {
            api.put(`notifications/${n._id}/read`).catch(() => {});
          }
        });
      }
    };

    load();
  }, []);

  // Apply filters whenever filter state changes
  useEffect(() => {
    let filtered = [...notifications];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        notification => 
          notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notification.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply type filter
    if (typeFilter) {
      filtered = filtered.filter(notification => notification.type === typeFilter);
    }
    
    // Apply priority filter
    if (priorityFilter) {
      filtered = filtered.filter(notification => notification.priority === priorityFilter);
    }
    
    // Apply date filter
    if (dateFilter) {
      const today = new Date();
      
      switch (dateFilter) {
        case 'today':
          filtered = filtered.filter(notification => 
            isToday(new Date(notification.createdAt))
          );
          break;
        case 'yesterday':
          filtered = filtered.filter(notification => 
            isYesterday(new Date(notification.createdAt))
          );
          break;
        case 'week':
          const weekAgo = subDays(today, 7);
          filtered = filtered.filter(notification => 
            new Date(notification.createdAt) >= weekAgo
          );
          break;
        case 'month':
          const monthAgo = subDays(today, 30);
          filtered = filtered.filter(notification => 
            new Date(notification.createdAt) >= monthAgo
          );
          break;
      }
    }
    
    setFilteredNotifications(filtered);
  }, [notifications, searchTerm, typeFilter, priorityFilter, dateFilter]);

  const refreshNotifications = async () => {
    const activePropertyId = localStorage.getItem('activePropertyId');
    if (!activePropertyId) return;
    
    setRefreshing(true);
    try {
      const response = await api.get(`notifications/property/${activePropertyId}`);
      setNotifications(response.data);
      setError(null);
    } catch (error) {
      console.error('Error refreshing notifications:', error);
      setError('Fehler beim Aktualisieren der Benachrichtigungen');
    } finally {
      setRefreshing(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const activePropertyId = localStorage.getItem('activePropertyId');
      if (!activePropertyId) {
        setError('Bitte wählen Sie eine Immobilie aus');
        return;
      }

      await api.post('notifications', {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        propertyId: activePropertyId,
        priority: formData.priority,
        date: formData.date,
      });

      setOpen(false);
      setFormData(initialFormState);
      
      // Aktualisiere die Benachrichtigungen
      const response = await api.get(`notifications/property/${activePropertyId}`);
      setNotifications(response.data);
      setError(null);
    } catch (error) {
      console.error('Error creating notification:', error);
      setError('Fehler beim Erstellen der Benachrichtigung');
    }
  };

  const handleTypeChange = (event: SelectChangeEvent) => {
    setFormData({ ...formData, type: event.target.value as NotificationType });
  };

  const handlePriorityChange = (event: SelectChangeEvent) => {
    setFormData({ ...formData, priority: event.target.value as NotificationPriority });
  };

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case NotificationPriority.LOW:
        return 'info';
      case NotificationPriority.MEDIUM:
        return 'success';
      case NotificationPriority.HIGH:
        return 'warning';
      case NotificationPriority.URGENT:
        return 'error';
      default:
        return 'default';
    }
  };

  const getTypeLabel = (type: NotificationType) => {
    switch (type) {
      case NotificationType.MAINTENANCE:
        return 'Wartung';
      case NotificationType.ANNOUNCEMENT:
        return 'Ankündigung';
      case NotificationType.EVENT:
        return 'Veranstaltung';
      case NotificationType.EMERGENCY:
        return 'Notfall';
      default:
        return type;
    }
  };

  return (
    <MainLayout title="Benachrichtigungen" navigationItems={vermieterNavigationItems}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 700,
              mb: 1,
              background: 'linear-gradient(135deg, #FF8E53 0%, #E67E22 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1.5
            }}
          >
            <NotificationsIcon sx={{ color: '#E67E22', fontSize: '2rem' }} />
            Benachrichtigungen
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
            Verwalten Sie Ihre Benachrichtigungen und informieren Sie Ihre Mieter über wichtige Ereignisse.
          </Typography>
        </Box>

        {/* Property Selector and Action Buttons */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 3, 
            border: '1px solid rgba(0, 0, 0, 0.08)',
            background: 'linear-gradient(to right, rgba(255, 142, 83, 0.05), rgba(230, 126, 34, 0.02))'
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <PropertySelector 
                onPropertyChange={() => {
                  // Lade die Benachrichtigungen neu wenn sich die Property ändert
                  const activePropertyId = localStorage.getItem('activePropertyId');
                  if (activePropertyId) {
                    setLoading(true);
                    api.get(`notifications/property/${activePropertyId}`)
                      .then(response => {
                        setNotifications(response.data);
                        setFilteredNotifications(response.data);
                        setError(null);
                      })
                      .catch(error => {
                        console.error('Error fetching notifications:', error);
                        setError('Fehler beim Laden der Benachrichtigungen');
                        setNotifications([]);
                        setFilteredNotifications([]);
                      })
                      .finally(() => setLoading(false));
                  }
                }} 
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<AddIcon />}
                onClick={() => setOpen(true)}
                disabled={!localStorage.getItem('activePropertyId')}
                sx={{
                  py: 1.5,
                  backgroundColor: '#E67E22',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  boxShadow: 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: '#D35400',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(230, 126, 34, 0.2)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  }
                }}
              >
                Neue Benachrichtigung
              </Button>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<FilterListIcon />}
                onClick={() => setShowFilters(!showFilters)}
                sx={{
                  py: 1.5,
                  borderColor: '#E67E22',
                  color: '#E67E22',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  '&:hover': {
                    borderColor: '#D35400',
                    backgroundColor: 'rgba(230, 126, 34, 0.04)',
                  }
                }}
              >
                {showFilters ? 'Filter ausblenden' : 'Filter anzeigen'}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Filter Section */}
        <Collapse in={showFilters}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              mb: 4, 
              borderRadius: 3, 
              border: '1px solid rgba(0, 0, 0, 0.08)',
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#2D3436' }}>
              Filter
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  placeholder="Suche nach Titel oder Inhalt"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#E67E22' }} />
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2,
                      '&.Mui-focused': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#E67E22',
                        }
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Typ</InputLabel>
                  <Select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    label="Typ"
                    sx={{
                      borderRadius: 2,
                      '&.Mui-focused': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#E67E22',
                        }
                      }
                    }}
                  >
                    <MenuItem value="">Alle Typen</MenuItem>
                    {Object.values(NotificationType).map((type) => (
                      <MenuItem key={type} value={type}>
                        {getTypeLabel(type)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Priorität</InputLabel>
                  <Select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    label="Priorität"
                    sx={{
                      borderRadius: 2,
                      '&.Mui-focused': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#E67E22',
                        }
                      }
                    }}
                  >
                    <MenuItem value="">Alle Prioritäten</MenuItem>
                    {Object.values(NotificationPriority).map((priority) => (
                      <MenuItem key={priority} value={priority}>
                        {priority}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Zeitraum</InputLabel>
                  <Select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    label="Zeitraum"
                    sx={{
                      borderRadius: 2,
                      '&.Mui-focused': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#E67E22',
                        }
                      }
                    }}
                  >
                    <MenuItem value="">Alle Zeiträume</MenuItem>
                    <MenuItem value="today">Heute</MenuItem>
                    <MenuItem value="yesterday">Gestern</MenuItem>
                    <MenuItem value="week">Letzte Woche</MenuItem>
                    <MenuItem value="month">Letzter Monat</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button 
                variant="text" 
                onClick={() => {
                  setSearchTerm('');
                  setTypeFilter('');
                  setPriorityFilter('');
                  setDateFilter('');
                }}
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': { color: '#E67E22' }
                }}
              >
                Filter zurücksetzen
              </Button>
              <Button 
                variant="text" 
                startIcon={<RefreshIcon />}
                onClick={refreshNotifications}
                disabled={refreshing}
                sx={{ 
                  color: '#E67E22',
                  '&:hover': { backgroundColor: 'rgba(230, 126, 34, 0.04)' }
                }}
              >
                {refreshing ? 'Wird aktualisiert...' : 'Aktualisieren'}
              </Button>
            </Box>
          </Paper>
        </Collapse>

        {/* Error Message */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              '& .MuiAlert-icon': {
                fontSize: '1.5rem'
              }
            }}
          >
            {error}
          </Alert>
        )}

        {/* Notifications List */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#E67E22' }} />
          </Box>
        ) : (
          filteredNotifications.length > 0 ? (
            <Grid container spacing={3}>
              {filteredNotifications.map((notification) => (
                <Grid item xs={12} key={notification._id}>
                  <StyledCard>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2, gap: 2 }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: notification.type === NotificationType.ANNOUNCEMENT ? 'rgba(230, 126, 34, 0.12)' : 
                                    notification.type === NotificationType.MAINTENANCE ? 'rgba(52, 152, 219, 0.12)' :
                                    notification.type === NotificationType.EVENT ? 'rgba(46, 204, 113, 0.12)' : 
                                    'rgba(231, 76, 60, 0.12)',
                            color: notification.type === NotificationType.ANNOUNCEMENT ? '#E67E22' : 
                                   notification.type === NotificationType.MAINTENANCE ? '#3498db' :
                                   notification.type === NotificationType.EVENT ? '#2ecc71' : 
                                   '#e74c3c',
                          }}
                        >
                          <NotificationTypeIcon type={notification.type} />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                            <Typography variant="h6" component="div" sx={{ fontWeight: 600, color: '#2D3436' }}>
                              {notification.title}
                            </Typography>
                            <Chip
                              icon={<CalendarTodayIcon />}
                              label={formatNotificationDate(notification.createdAt)}
                              size="small"
                              sx={{ 
                                borderRadius: 2,
                                backgroundColor: 'rgba(230, 126, 34, 0.08)',
                                color: '#E67E22',
                                border: 'none',
                                fontWeight: 500,
                                '& .MuiChip-icon': {
                                  color: '#E67E22',
                                }
                              }}
                            />
                          </Box>
                          <Typography variant="body1" sx={{ my: 2, color: '#4B5563' }}>
                            {notification.message}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PersonIcon sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {notification.createdBy.firstName} {notification.createdBy.lastName}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <PriorityChip 
                                priority={notification.priority} 
                                label={notification.priority} 
                                size="small"
                                icon={notification.priority === NotificationPriority.URGENT || notification.priority === NotificationPriority.HIGH ? <PriorityHighIcon /> : undefined}
                              />
                              <Chip
                                label={getTypeLabel(notification.type)}
                                size="small"
                                sx={{ 
                                  borderRadius: 2,
                                  backgroundColor: notification.type === NotificationType.ANNOUNCEMENT ? 'rgba(230, 126, 34, 0.08)' : 
                                                  notification.type === NotificationType.MAINTENANCE ? 'rgba(52, 152, 219, 0.08)' :
                                                  notification.type === NotificationType.EVENT ? 'rgba(46, 204, 113, 0.08)' : 
                                                  'rgba(231, 76, 60, 0.08)',
                                  color: notification.type === NotificationType.ANNOUNCEMENT ? '#E67E22' : 
                                         notification.type === NotificationType.MAINTENANCE ? '#3498db' :
                                         notification.type === NotificationType.EVENT ? '#2ecc71' : 
                                         '#e74c3c',
                                }}
                              />
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </StyledCard>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper 
              elevation={0} 
              sx={{ 
                p: 6, 
                borderRadius: 3, 
                textAlign: 'center',
                border: '1px dashed rgba(0, 0, 0, 0.12)',
                backgroundColor: 'rgba(0, 0, 0, 0.01)'
              }}
            >
              <NotificationsIcon sx={{ fontSize: 60, color: 'rgba(0, 0, 0, 0.2)', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1, color: 'text.secondary', fontWeight: 600 }}>
                Keine Benachrichtigungen vorhanden
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {!localStorage.getItem('activePropertyId') 
                  ? 'Bitte wählen Sie eine Immobilie aus, um Benachrichtigungen anzuzeigen.' 
                  : 'Erstellen Sie eine neue Benachrichtigung, um Ihre Mieter zu informieren.'}
              </Typography>
              {localStorage.getItem('activePropertyId') && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpen(true)}
                  sx={{
                    backgroundColor: '#E67E22',
                    '&:hover': {
                      backgroundColor: '#D35400',
                    }
                  }}
                >
                  Neue Benachrichtigung
                </Button>
              )}
            </Paper>
          )
        )}

        {/* Create Notification Dialog */}
        <Dialog 
          open={open} 
          onClose={() => setOpen(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
            }
          }}
        >
          <DialogTitle sx={{ 
            pb: 1, 
            pt: 3,
            px: 3,
            fontWeight: 700,
            fontSize: '1.5rem',
            color: '#2D3436',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: 'rgba(230, 126, 34, 0.12)', color: '#E67E22' }}>
                <AddIcon />
              </Avatar>
              Neue Benachrichtigung erstellen
            </Box>
            <IconButton onClick={() => setOpen(false)} sx={{ color: 'text.secondary' }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ px: 3, py: 2 }}>
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Titel"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    InputProps={{
                      sx: {
                        borderRadius: 2,
                        '&.Mui-focused': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#E67E22',
                          }
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nachricht"
                    multiline
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    InputProps={{
                      sx: {
                        borderRadius: 2,
                        '&.Mui-focused': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#E67E22',
                          }
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Typ</InputLabel>
                    <Select
                      value={formData.type}
                      onChange={handleTypeChange}
                      label="Typ"
                      sx={{
                        borderRadius: 2,
                        '&.Mui-focused': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#E67E22',
                          }
                        }
                      }}
                    >
                      {Object.values(NotificationType).map((type) => (
                        <MenuItem key={type} value={type} sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          gap: 1
                        }}>
                          <NotificationTypeIcon type={type} />
                          {getTypeLabel(type)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Priorität</InputLabel>
                    <Select
                      value={formData.priority}
                      onChange={handlePriorityChange}
                      label="Priorität"
                      sx={{
                        borderRadius: 2,
                        '&.Mui-focused': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#E67E22',
                          }
                        }
                      }}
                    >
                      {Object.values(NotificationPriority).map((priority) => (
                        <MenuItem key={priority} value={priority}>
                          {priority}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={deLocale}>
                    <DateTimePicker
                      label="Datum (optional)"
                      value={formData.date}
                      onChange={(newValue) => setFormData({ ...formData, date: newValue })}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          sx: {
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&.Mui-focused': {
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#E67E22',
                                }
                              }
                            }
                          }
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button 
              onClick={() => setOpen(false)}
              sx={{ 
                color: 'text.secondary',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                }
              }}
            >
              Abbrechen
            </Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained" 
              startIcon={<CheckCircleIcon />}
              sx={{
                backgroundColor: '#E67E22',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                '&:hover': {
                  backgroundColor: '#D35400',
                }
              }}
            >
              Erstellen
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </MainLayout>
  );
};
