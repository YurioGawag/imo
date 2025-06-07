import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Tooltip,
  Chip,
  Badge,
  ButtonGroup,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import ApartmentIcon from '@mui/icons-material/Apartment';
import PercentIcon from '@mui/icons-material/Percent';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import DomainAddIcon from '@mui/icons-material/DomainAdd';
import SettingsIcon from '@mui/icons-material/Settings';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import { MainLayout } from '../../components/Layout/MainLayout';
import { StatCard } from '../../components/StatCard';
import { MeldungCard } from '../../components/Meldung/MeldungCard';
import api from '../../services/api';
import { useAuthStore } from '../../store/auth.store';
import { getStatusColor, getStatusText } from '../../constants/meldung';
import { vermieterNavigationItems } from './vermieterNavigation';
import { MeldungStatus } from '../../types/meldung.types';
import { DefectStats } from '../../components/Dashboard/DefectStats';
import { TenantTimeline } from '../../components/Dashboard/TenantTimeline';
import { OccupancyGrid } from '../../components/Dashboard/OccupancyGrid';
import { MaintenanceCalendar } from '../../components/Dashboard/MaintenanceCalendar';
import { MiniDashboard } from '../../components/Dashboard/MiniDashboard';
import type { MessageItem } from '../../components/Dashboard/TenantTimeline';

interface DashboardData {
  kpis: {
    totalProperties: number;
    totalUnits: number;
    occupiedUnits: number;
    occupancyRate: string;
    openMeldungen: number;
    resolvedMeldungen: number;
  };
  recentMeldungen: Array<{
    _id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    createdAt: string;
    unit: {
      unitNumber: string;
      property: {
        name: string;
      };
    };
    reporter: {
      firstName: string;
      lastName: string;
    };
    unreadMessages?: number;
  }>;
  // Erweiterte Daten für Management-Komponenten
  communications?: MessageItem[];
  units?: Array<{
    id: string;
    number: string;
    vacantDays: number;
    occupied: boolean;
  }>;
  properties?: Array<{
    id: string;
    name: string;
    address: string;
    units: number;
    area: number;
    year: number;
    documents: Array<{
      id: string;
      name: string;
    }>;
  }>;
  maintenanceEvents?: Array<{
    date: string;
    urgent: boolean;
  }>;
}

interface NewPropertyData {
  name: string;
  address: string;
  city: string;
  postalCode: string;
}

// Fallback-Daten für den Fall, dass keine Daten vom Backend geladen werden können
const fallbackTimeline: MessageItem[] = [
  { unit: '1A', date: '01.05.2024', message: 'Keine Kommunikationsdaten verfügbar', status: 'Waiting' as 'Waiting' },
];

const fallbackUnits = [
  { id: '1', number: 'N/A', vacantDays: 0, occupied: false },
];



// Status filter button configuration
const statusFilters = [
  { value: 'all', label: 'Alle', icon: <AllInclusiveIcon fontSize="small" /> },
  { value: MeldungStatus.OFFEN, label: 'Offen', icon: <HourglassEmptyIcon fontSize="small" /> },
  { value: MeldungStatus.IN_BEARBEITUNG, label: 'In Bearbeitung', icon: <ErrorIcon fontSize="small" /> },
  { value: MeldungStatus.ABGESCHLOSSEN, label: 'Abgeschlossen', icon: <CheckCircleIcon fontSize="small" /> },
];

export const VermieterDashboard: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isNewPropertyDialogOpen, setIsNewPropertyDialogOpen] = useState(false);
  const [newPropertyData, setNewPropertyData] = useState<NewPropertyData>({
    name: '',
    address: '',
    city: '',
    postalCode: '',
  });
  const [error, setError] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDashboardData = async () => {
    // Nur setIsLoading auf true wenn keine Daten vorhanden sind
    if (!dashboardData) {
      setIsLoading(true);
    }
    
    try {
      const response = await api.get<DashboardData>('/vermieter/dashboard');
      
      // Transformiere die Meldungen in Kommunikationsdaten, falls vorhanden
      const communications: MessageItem[] = response.data.recentMeldungen?.map(meldung => ({
        unit: meldung.unit.unitNumber,
        date: new Date(meldung.createdAt).toLocaleDateString('de-DE'),
        message: meldung.title,
        status: meldung.status === MeldungStatus.OFFEN ? 'Waiting' as 'Waiting' :
                meldung.status === MeldungStatus.IN_BEARBEITUNG ? 'Responded' as 'Responded' : 
                'Overdue' as 'Overdue'
      })) || [];
      
      // Erweitere die Dashboard-Daten um die Management-Komponenten
      const enhancedData: DashboardData = {
        ...response.data,
        communications,
        // Wenn keine resolvedMeldungen vorhanden sind, setze auf 0
        kpis: {
          ...response.data.kpis,
          resolvedMeldungen: response.data.kpis.resolvedMeldungen || 0
        }
      };
      
      setDashboardData(enhancedData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Fehler beim Laden der Dashboard-Daten');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateProperty = async () => {
    try {
      await api.post('/vermieter/properties', newPropertyData);
      setIsNewPropertyDialogOpen(false);
      setNewPropertyData({
        name: '',
        address: '',
        city: '',
        postalCode: '',
      });
      fetchDashboardData();
    } catch (err) {
      console.error('Error creating property:', err);
    }
  };

  const filteredMeldungen = dashboardData?.recentMeldungen
    .filter(meldung => selectedStatus === 'all' || meldung.status === selectedStatus)
    .filter(meldung => 
      searchTerm === '' || 
      meldung.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meldung.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meldung.unit.property.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (isLoading) {
    return (
      <MainLayout title="Vermieter Dashboard" navigationItems={vermieterNavigationItems}>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: 'calc(100vh - 120px)' 
          }}
        >
          <CircularProgress 
            sx={{ 
              color: '#4299E1'
            }} 
          />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Vermieter Dashboard" navigationItems={vermieterNavigationItems}>
      {error && (
        <Box 
          sx={{ 
            mb: 3, 
            p: 2, 
            borderRadius: 3, 
            bgcolor: 'rgba(211, 47, 47, 0.1)', 
            color: '#C62828',
            border: '1px solid rgba(211, 47, 47, 0.2)',
          }}
        >
          <Typography>
            {error}
          </Typography>
        </Box>
      )}
      
      {/* KPIs */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Immobilien"
            value={dashboardData?.kpis.totalProperties ?? 0}
            icon={<HomeWorkIcon />}
            color="#4299E1" // Blue
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Wohneinheiten"
            value={dashboardData?.kpis.totalUnits ?? 0}
            subtitle={`${dashboardData?.kpis.occupiedUnits ?? 0} vermietet`}
            icon={<ApartmentIcon />}
            color="#38B2AC" // Teal
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Belegungsrate"
            value={`${dashboardData?.kpis.occupancyRate}%`}
            icon={<PercentIcon />}
            color="#9F7AEA" // Purple
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Offene Meldungen"
            value={dashboardData?.kpis.openMeldungen ?? 0}
            icon={<NotificationsActiveIcon />}
            color="#ED8936" // Orange
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Paper 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #63B3ED 0%, #4299E1 100%)',
              color: 'white',
              boxShadow: '0 4px 12px rgba(66, 153, 225, 0.25)',
            }}
          >
            <SettingsIcon fontSize="small" />
          </Box>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              color: '#2D3436',
            }}
          >
            Schnellzugriff
          </Typography>
        </Box>
        
        <Box display="flex" gap={2} flexWrap="wrap">
          <Button
            variant="contained"
            startIcon={<DomainAddIcon />}
            onClick={() => setIsNewPropertyDialogOpen(true)}
            sx={{
              bgcolor: '#4299E1',
              borderRadius: 2,
              py: 1.2,
              px: 3,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(66, 153, 225, 0.25)',
              '&:hover': {
                bgcolor: '#3182CE',
                boxShadow: '0 6px 16px rgba(66, 153, 225, 0.35)',
              }
            }}
          >
            Neue Immobilie
          </Button>
          <Button
            variant="outlined"
            startIcon={<LocationCityIcon />}
            onClick={() => navigate('/vermieter/properties')}
            sx={{
              borderColor: '#4299E1',
              color: '#4299E1',
              borderRadius: 2,
              py: 1.2,
              px: 3,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                borderColor: '#3182CE',
                bgcolor: 'rgba(66, 153, 225, 0.04)',
              }
            }}
          >
            Immobilien verwalten
          </Button>
          <Button
            variant="outlined"
            startIcon={<NotificationsActiveIcon />}
            onClick={() => navigate('/vermieter/meldungen')}
            sx={{
              borderColor: '#4299E1',
              color: '#4299E1',
              borderRadius: 2,
              py: 1.2,
              px: 3,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                borderColor: '#3182CE',
                bgcolor: 'rgba(66, 153, 225, 0.04)',
              }
            }}
          >
            Alle Meldungen
          </Button>
        </Box>
      </Paper>

      {/* Recent Meldungen */}
      <Paper 
        sx={{ 
          p: 3, 
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #F6AD55 0%, #ED8936 100%)',
              color: 'white',
              boxShadow: '0 4px 12px rgba(237, 137, 54, 0.25)',
            }}
          >
            <NotificationsActiveIcon fontSize="small" />
          </Box>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              color: '#2D3436',
            }}
          >
            Aktuelle Meldungen
          </Typography>
          
          {dashboardData?.kpis?.openMeldungen && dashboardData?.kpis?.openMeldungen > 0 && (
            <Chip 
              label={`${dashboardData.kpis.openMeldungen} offen`} 
              size="small"
              sx={{ 
                bgcolor: 'rgba(237, 137, 54, 0.1)', 
                color: '#ED8936',
                fontWeight: 600,
                borderRadius: 8,
              }}
            />
          )}
        </Box>
        
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <TextField
              placeholder="Suchen..."
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'rgba(0, 0, 0, 0.5)' }} />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 2,
                  bgcolor: '#F8FAFC',
                  '&:hover': {
                    bgcolor: '#F1F5F9',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#4299E1',
                  }
                }
              }}
            />
            
            {/* Status filter buttons */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {statusFilters.map((filter) => (
                <Button
                  key={filter.value}
                  variant={selectedStatus === filter.value ? "contained" : "outlined"}
                  size="small"
                  startIcon={filter.icon}
                  onClick={() => setSelectedStatus(filter.value)}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    px: 2,
                    py: 0.8,
                    fontSize: '0.85rem',
                    ...(selectedStatus === filter.value
                      ? {
                          bgcolor: '#4299E1',
                          color: 'white',
                          boxShadow: '0 4px 12px rgba(66, 153, 225, 0.25)',
                          '&:hover': {
                            bgcolor: '#3182CE',
                          },
                        }
                      : {
                          borderColor: 'rgba(0, 0, 0, 0.15)',
                          color: 'rgba(0, 0, 0, 0.7)',
                          '&:hover': {
                            borderColor: '#4299E1',
                            bgcolor: 'rgba(66, 153, 225, 0.04)',
                            color: '#4299E1',
                          },
                        }),
                  }}
                >
                  {filter.label}
                </Button>
              ))}
            </Box>
          </Box>
          
          <Box display="flex" gap={2}>
            <Tooltip title="Alle Meldungen anzeigen">
              <Button
                variant="outlined"
                startIcon={<VisibilityIcon />}
                onClick={() => navigate('/vermieter/meldungen')}
                size="small"
                sx={{
                  borderColor: '#4299E1',
                  color: '#4299E1',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#3182CE',
                    bgcolor: 'rgba(66, 153, 225, 0.04)',
                  }
                }}
              >
                Alle anzeigen
              </Button>
            </Tooltip>
            
            <Tooltip title="Aktualisieren">
              <IconButton 
                onClick={fetchDashboardData}
                sx={{
                  bgcolor: '#F8FAFC',
                  '&:hover': {
                    bgcolor: '#F1F5F9',
                  }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Grid container spacing={2.5}>
          {filteredMeldungen && filteredMeldungen.length > 0 ? (
            filteredMeldungen.map((meldung) => (
              <Grid item xs={12} key={meldung._id}>
                <MeldungCard
                  title={meldung.title}
                  description={meldung.description}
                  status={meldung.status}
                  createdAt={meldung.createdAt}
                  onClick={() => navigate(`/vermieter/meldungen/${meldung._id}`)}
                  unreadMessages={meldung.unreadMessages}
                  unitInfo={{
                    unitNumber: meldung.unit.unitNumber,
                    propertyName: meldung.unit.property.name
                  }}
                  reporter={meldung.reporter}
                  statusColor={getStatusColor(meldung.status)}
                  statusText={getStatusText(meldung.status)}
                />
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Box 
                sx={{ 
                  py: 8, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  color: 'rgba(0, 0, 0, 0.4)',
                }}
              >
                <NotificationsActiveIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                <Typography sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
                  Keine Meldungen gefunden
                </Typography>
                <Typography sx={{ fontSize: '0.95rem' }}>
                  {searchTerm || selectedStatus !== 'all' 
                    ? 'Versuchen Sie andere Suchkriterien oder Filter'
                    : 'Aktuell gibt es keine Meldungen'}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Management Dashboard Components */}
      <Typography variant="h5" sx={{ mt: 5, mb: 3, fontWeight: 600 }}>
        Management Übersicht
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, borderRadius: 3, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)', border: '1px solid rgba(0, 0, 0, 0.05)' }}>
            <Typography variant="h6" gutterBottom>
              Defektstatistik
            </Typography>
            <DefectStats 
              open={dashboardData?.kpis?.openMeldungen || 0} 
              resolved={dashboardData?.kpis?.resolvedMeldungen || 0} 
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, borderRadius: 3, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)', border: '1px solid rgba(0, 0, 0, 0.05)' }}>
            <Typography variant="h6" gutterBottom>
              Kommunikation
            </Typography>
            <TenantTimeline items={dashboardData?.communications || fallbackTimeline} />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderRadius: 3, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)', border: '1px solid rgba(0, 0, 0, 0.05)' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Belegung
              <Typography variant="body2" color="text.secondary">
                Belegungsrate: {dashboardData?.kpis?.occupancyRate || '0%'}
              </Typography>
            </Typography>
            {dashboardData?.units && dashboardData.units.length > 0 ? (
              <Box sx={{ mt: 2 }}>
                <OccupancyGrid units={dashboardData.units} />
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: 16, height: 16, borderRadius: 1, bgcolor: '#4caf50', mr: 1 }} />
                    <Typography variant="body2">Vermietet: {dashboardData?.kpis?.occupiedUnits || 0}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: 16, height: 16, borderRadius: 1, bgcolor: '#f44336', mr: 1 }} />
                    <Typography variant="body2">Frei: {(dashboardData?.kpis?.totalUnits || 0) - (dashboardData?.kpis?.occupiedUnits || 0)}</Typography>
                  </Box>
                </Box>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
                Keine Einheiten verfügbar
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderRadius: 3, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)', border: '1px solid rgba(0, 0, 0, 0.05)' }}>
            <Typography variant="h6" gutterBottom>
              Wartungskalender
            </Typography>
            <MaintenanceCalendar items={dashboardData?.maintenanceEvents || [{ date: new Date().toISOString().split('T')[0], urgent: false }]} />
          </Paper>
        </Grid>
      </Grid>

      {/* New Property Dialog */}
      <Dialog
        open={isNewPropertyDialogOpen}
        onClose={() => setIsNewPropertyDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1, 
          pt: 3, 
          px: 3,
          fontSize: '1.3rem',
          fontWeight: 600,
          color: '#2D3436',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #63B3ED 0%, #4299E1 100%)',
              color: 'white',
              boxShadow: '0 4px 12px rgba(66, 153, 225, 0.25)',
            }}
          >
            <DomainAddIcon fontSize="small" />
          </Box>
          Neue Immobilie erstellen
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Name"
              value={newPropertyData.name}
              onChange={(e) => setNewPropertyData({ ...newPropertyData, name: e.target.value })}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <HomeWorkIcon sx={{ color: 'rgba(0, 0, 0, 0.5)' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontSize: '1rem',
                  backgroundColor: '#F8FAFC',
                  transition: 'all 0.2s ease',
                  '& input': {
                    padding: '16px',
                  },
                  '&:hover': {
                    backgroundColor: '#F1F5F9',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#fff',
                    '& fieldset': {
                      borderColor: '#4299E1',
                      borderWidth: '2px',
                    }
                  }
                }
              }}
            />
            <TextField
              fullWidth
              label="Adresse"
              value={newPropertyData.address}
              onChange={(e) => setNewPropertyData({ ...newPropertyData, address: e.target.value })}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationCityIcon sx={{ color: 'rgba(0, 0, 0, 0.5)' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontSize: '1rem',
                  backgroundColor: '#F8FAFC',
                  transition: 'all 0.2s ease',
                  '& input': {
                    padding: '16px',
                  },
                  '&:hover': {
                    backgroundColor: '#F1F5F9',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#fff',
                    '& fieldset': {
                      borderColor: '#4299E1',
                      borderWidth: '2px',
                    }
                  }
                }
              }}
            />
            <TextField
              fullWidth
              label="Stadt"
              value={newPropertyData.city}
              onChange={(e) => setNewPropertyData({ ...newPropertyData, city: e.target.value })}
              margin="normal"
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontSize: '1rem',
                  backgroundColor: '#F8FAFC',
                  transition: 'all 0.2s ease',
                  '& input': {
                    padding: '16px',
                  },
                  '&:hover': {
                    backgroundColor: '#F1F5F9',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#fff',
                    '& fieldset': {
                      borderColor: '#4299E1',
                      borderWidth: '2px',
                    }
                  }
                }
              }}
            />
            <TextField
              fullWidth
              label="PLZ"
              value={newPropertyData.postalCode}
              onChange={(e) => setNewPropertyData({ ...newPropertyData, postalCode: e.target.value })}
              margin="normal"
              sx={{
                mb: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontSize: '1rem',
                  backgroundColor: '#F8FAFC',
                  transition: 'all 0.2s ease',
                  '& input': {
                    padding: '16px',
                  },
                  '&:hover': {
                    backgroundColor: '#F1F5F9',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#fff',
                    '& fieldset': {
                      borderColor: '#4299E1',
                      borderWidth: '2px',
                    }
                  }
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setIsNewPropertyDialogOpen(false)}
            sx={{
              color: 'rgba(0, 0, 0, 0.6)',
              borderRadius: 2,
              py: 1,
              px: 3,
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
            onClick={handleCreateProperty} 
            variant="contained"
            sx={{
              bgcolor: '#4299E1',
              borderRadius: 2,
              py: 1,
              px: 3,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(66, 153, 225, 0.25)',
              '&:hover': {
                bgcolor: '#3182CE',
                boxShadow: '0 6px 16px rgba(66, 153, 225, 0.35)',
              }
            }}
          >
            Erstellen
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};
