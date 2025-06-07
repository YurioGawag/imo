import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  TextField,
  Button,
  Chip,
  InputAdornment,
  Divider,
  IconButton,
  Collapse,
  Alert,
  Avatar,
  Badge,
  Tooltip,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { MainLayout } from '../../components/Layout/MainLayout';
import { MeldungCard } from '../../components/Meldung/MeldungCard';
import api from '../../services/api';
import { vermieterNavigationItems } from './vermieterNavigation';
import { STATUS_OPTIONS, ROOM_TYPES } from '../../constants/meldung';
import { Meldung, MeldungStatus, Room } from '../../types/meldung.types';
import { format, isToday, isYesterday, parseISO, subDays } from 'date-fns';

// Icons
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningIcon from '@mui/icons-material/Warning';
import BuildIcon from '@mui/icons-material/Build';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
import SortIcon from '@mui/icons-material/Sort';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ClearIcon from '@mui/icons-material/Clear';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DateRangeIcon from '@mui/icons-material/DateRange';
import PersonIcon from '@mui/icons-material/Person';
import ApartmentIcon from '@mui/icons-material/Apartment';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';

// Styled components
const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#E67E22',
    color: 'white',
    fontWeight: 'bold',
    boxShadow: '0 0 0 2px white',
  },
}));

const StatusChip = styled(Chip)<{ statuscolor: string }>(({ statuscolor }) => ({
  borderRadius: 8,
  fontWeight: 600,
  backgroundColor: statuscolor,
  color: 'white',
  '&:hover': {
    backgroundColor: statuscolor,
    opacity: 0.9,
  },
}));

const FilterButton = styled(Button)({
  borderColor: '#E67E22',
  color: '#E67E22',
  borderRadius: 8,
  textTransform: 'none',
  fontWeight: 600,
  '&:hover': {
    borderColor: '#D35400',
    backgroundColor: 'rgba(230, 126, 34, 0.04)',
  },
});

const ActionButton = styled(Button)({
  backgroundColor: '#E67E22',
  color: 'white',
  borderRadius: 8,
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: 'none',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: '#D35400',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(230, 126, 34, 0.2)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
});

export const VermieterMeldungenList: React.FC = () => {
  const navigate = useNavigate();
  const [meldungen, setMeldungen] = useState<Meldung[]>([]);
  const [filteredMeldungen, setFilteredMeldungen] = useState<Meldung[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [roomFilter, setRoomFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string>('');
  const isSmallScreen = useMediaQuery('(max-width:600px)');

  const fetchMeldungen = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await api.get('/vermieter/meldungen');
      setMeldungen(response.data);
      setFilteredMeldungen(response.data);
    } catch (err) {
      console.error('Error fetching meldungen:', err);
      setError('Fehler beim Laden der Meldungen');
      setMeldungen([]);
      setFilteredMeldungen([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshMeldungen = async () => {
    setRefreshing(true);
    try {
      const response = await api.get('/vermieter/meldungen');
      setMeldungen(response.data);
      setError('');
    } catch (err) {
      console.error('Error refreshing meldungen:', err);
      setError('Fehler beim Aktualisieren der Meldungen');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMeldungen();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...meldungen];
    
    // Apply status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(meldung => meldung.status === selectedStatus);
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        meldung => 
          meldung.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          meldung.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (meldung.reporter && 
            `${meldung.reporter.firstName} ${meldung.reporter.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply room filter
    if (roomFilter) {
      filtered = filtered.filter(meldung => meldung.room === roomFilter);
    }
    
    // Apply date filter
    if (dateFilter) {
      const today = new Date();
      
      switch (dateFilter) {
        case 'today':
          filtered = filtered.filter(meldung => 
            isToday(new Date(meldung.createdAt))
          );
          break;
        case 'yesterday':
          filtered = filtered.filter(meldung => 
            isYesterday(new Date(meldung.createdAt))
          );
          break;
        case 'week':
          const weekAgo = subDays(today, 7);
          filtered = filtered.filter(meldung => 
            new Date(meldung.createdAt) >= weekAgo
          );
          break;
        case 'month':
          const monthAgo = subDays(today, 30);
          filtered = filtered.filter(meldung => 
            new Date(meldung.createdAt) >= monthAgo
          );
          break;
      }
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'priority') {
        // Sort by status priority (OFFEN > IN_BEARBEITUNG > HANDWERKER_ERLEDIGT > ABGESCHLOSSEN > STORNIERT)
        const statusPriority = {
          [MeldungStatus.OFFEN]: 5,
          [MeldungStatus.IN_BEARBEITUNG]: 4,
          [MeldungStatus.HANDWERKER_ERLEDIGT]: 3,
          [MeldungStatus.ABGESCHLOSSEN]: 2,
          [MeldungStatus.STORNIERT]: 1
        };
        return statusPriority[b.status] - statusPriority[a.status];
      } else if (sortBy === 'unread') {
        // Sort by unread messages count
        const aUnread = a.unreadMessages || 0;
        const bUnread = b.unreadMessages || 0;
        return bUnread - aUnread;
      }
      return 0;
    });
    
    setFilteredMeldungen(filtered);
  }, [meldungen, selectedStatus, searchTerm, roomFilter, dateFilter, sortBy]);

  const resetFilters = () => {
    setSelectedStatus('all');
    setSearchTerm('');
    setRoomFilter('');
    setDateFilter('');
    setSortBy('newest');
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case MeldungStatus.OFFEN:
        return '#3498db'; // Blue
      case MeldungStatus.IN_BEARBEITUNG:
        return '#E67E22'; // Orange
      case MeldungStatus.HANDWERKER_ERLEDIGT:
        return '#9b59b6'; // Purple
      case MeldungStatus.ABGESCHLOSSEN:
        return '#2ecc71'; // Green
      case MeldungStatus.STORNIERT:
        return '#e74c3c'; // Red
      default:
        return '#95a5a6'; // Grey
    }
  };

  const getTotalUnreadMessages = () => {
    return meldungen.reduce((total, meldung) => total + (meldung.unreadMessages || 0), 0);
  };

  const getStatusCounts = () => {
    const counts = {
      [MeldungStatus.OFFEN]: 0,
      [MeldungStatus.IN_BEARBEITUNG]: 0,
      [MeldungStatus.HANDWERKER_ERLEDIGT]: 0,
      [MeldungStatus.ABGESCHLOSSEN]: 0,
      [MeldungStatus.STORNIERT]: 0
    };
    
    meldungen.forEach(meldung => {
      if (counts[meldung.status] !== undefined) {
        counts[meldung.status]++;
      }
    });
    
    return counts;
  };

  const statusCounts = getStatusCounts();
  const totalUnreadMessages = getTotalUnreadMessages();

  if (isLoading) {
    return (
      <MainLayout title="Meldungen" navigationItems={vermieterNavigationItems}>
        <Box 
          display="flex" 
          flexDirection="column"
          justifyContent="center" 
          alignItems="center" 
          minHeight="500px"
        >
          <CircularProgress sx={{ color: '#E67E22', mb: 3 }} />
          <Typography variant="body1" color="text.secondary">
            Meldungen werden geladen...
          </Typography>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Meldungen" navigationItems={vermieterNavigationItems}>
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
          <HomeRepairServiceIcon sx={{ color: '#E67E22', fontSize: '2rem' }} />
          Meldungen
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          Verwalten Sie alle Meldungen und Reparaturanfragen Ihrer Mieter.
        </Typography>
      </Box>

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

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              borderRadius: 3, 
              border: '1px solid rgba(0, 0, 0, 0.08)',
              background: 'linear-gradient(to right, rgba(52, 152, 219, 0.05), rgba(52, 152, 219, 0.02))'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: 'rgba(52, 152, 219, 0.12)', color: '#3498db' }}>
                <WarningIcon />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#3498db' }}>
                  {statusCounts[MeldungStatus.OFFEN]}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Offene Meldungen
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              borderRadius: 3, 
              border: '1px solid rgba(0, 0, 0, 0.08)',
              background: 'linear-gradient(to right, rgba(230, 126, 34, 0.05), rgba(230, 126, 34, 0.02))'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: 'rgba(230, 126, 34, 0.12)', color: '#E67E22' }}>
                <BuildIcon />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#E67E22' }}>
                  {statusCounts[MeldungStatus.IN_BEARBEITUNG]}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  In Bearbeitung
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              borderRadius: 3, 
              border: '1px solid rgba(0, 0, 0, 0.08)',
              background: 'linear-gradient(to right, rgba(46, 204, 113, 0.05), rgba(46, 204, 113, 0.02))'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: 'rgba(46, 204, 113, 0.12)', color: '#2ecc71' }}>
                <CheckCircleIcon />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#2ecc71' }}>
                  {statusCounts[MeldungStatus.ABGESCHLOSSEN]}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Abgeschlossen
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              borderRadius: 3, 
              border: '1px solid rgba(0, 0, 0, 0.08)',
              background: 'linear-gradient(to right, rgba(155, 89, 182, 0.05), rgba(155, 89, 182, 0.02))'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <StyledBadge badgeContent={totalUnreadMessages} color="error" max={99}>
                <Avatar sx={{ bgcolor: 'rgba(155, 89, 182, 0.12)', color: '#9b59b6' }}>
                  <NotificationsIcon />
                </Avatar>
              </StyledBadge>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#9b59b6' }}>
                  {totalUnreadMessages}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ungelesene Nachrichten
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Actions and Filters */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 3, 
          border: '1px solid rgba(0, 0, 0, 0.08)',
          background: 'linear-gradient(to right, rgba(255, 142, 83, 0.05), rgba(230, 126, 34, 0.02))'
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3436' }}>
              Meldungen ({filteredMeldungen.length})
            </Typography>
            {filteredMeldungen.length !== meldungen.length && (
              <Chip 
                label={`${filteredMeldungen.length} von ${meldungen.length} angezeigt`} 
                size="small"
                sx={{ 
                  backgroundColor: 'rgba(230, 126, 34, 0.08)',
                  color: '#E67E22',
                  fontWeight: 500,
                  borderRadius: 8
                }}
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FilterButton 
              variant="outlined" 
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Filter ausblenden' : 'Filter anzeigen'}
            </FilterButton>
            <ActionButton 
              variant="contained" 
              startIcon={<RefreshIcon />}
              onClick={refreshMeldungen}
              disabled={refreshing}
            >
              {refreshing ? 'Wird aktualisiert...' : 'Aktualisieren'}
            </ActionButton>
          </Box>
        </Box>
      </Paper>

      {/* Filter Panel */}
      <Collapse in={showFilters}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 3, 
            borderRadius: 3, 
            border: '1px solid rgba(0, 0, 0, 0.08)',
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#2D3436' }}>
            Filter und Sortierung
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
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  label="Status"
                  sx={{
                    borderRadius: 2,
                    '&.Mui-focused': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#E67E22',
                      }
                    }
                  }}
                  startAdornment={
                    <InputAdornment position="start">
                      <BuildIcon sx={{ color: '#E67E22' }} />
                    </InputAdornment>
                  }
                >
                  {STATUS_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Raum</InputLabel>
                <Select
                  value={roomFilter}
                  onChange={(e) => setRoomFilter(e.target.value)}
                  label="Raum"
                  sx={{
                    borderRadius: 2,
                    '&.Mui-focused': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#E67E22',
                      }
                    }
                  }}
                  startAdornment={
                    <InputAdornment position="start">
                      <MeetingRoomIcon sx={{ color: '#E67E22' }} />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">Alle Räume</MenuItem>
                  {ROOM_TYPES.map((room) => (
                    <MenuItem key={room.id} value={room.id}>
                      {room.label}
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
                  startAdornment={
                    <InputAdornment position="start">
                      <DateRangeIcon sx={{ color: '#E67E22' }} />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">Alle Zeiträume</MenuItem>
                  <MenuItem value="today">Heute</MenuItem>
                  <MenuItem value="yesterday">Gestern</MenuItem>
                  <MenuItem value="week">Letzte Woche</MenuItem>
                  <MenuItem value="month">Letzter Monat</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Sortierung</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sortierung"
                  sx={{
                    borderRadius: 2,
                    '&.Mui-focused': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#E67E22',
                      }
                    }
                  }}
                  startAdornment={
                    <InputAdornment position="start">
                      <SortIcon sx={{ color: '#E67E22' }} />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="newest">Neueste zuerst</MenuItem>
                  <MenuItem value="oldest">Älteste zuerst</MenuItem>
                  <MenuItem value="priority">Nach Priorität</MenuItem>
                  <MenuItem value="unread">Nach ungelesenen Nachrichten</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="text" 
              startIcon={<ClearIcon />}
              onClick={resetFilters}
              sx={{ 
                color: '#E67E22',
                '&:hover': { backgroundColor: 'rgba(230, 126, 34, 0.04)' }
              }}
            >
              Filter zurücksetzen
            </Button>
          </Box>
        </Paper>
      </Collapse>

      {/* Status Filter Chips */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
        <StatusChip 
          label="Alle"
          clickable
          onClick={() => setSelectedStatus('all')}
          statuscolor={selectedStatus === 'all' ? '#E67E22' : '#95a5a6'}
        />
        <StatusChip 
          label="Offen"
          clickable
          onClick={() => setSelectedStatus(MeldungStatus.OFFEN)}
          statuscolor={selectedStatus === MeldungStatus.OFFEN ? '#3498db' : '#95a5a6'}
        />
        <StatusChip 
          label="In Bearbeitung"
          clickable
          onClick={() => setSelectedStatus(MeldungStatus.IN_BEARBEITUNG)}
          statuscolor={selectedStatus === MeldungStatus.IN_BEARBEITUNG ? '#E67E22' : '#95a5a6'}
        />
        <StatusChip 
          label="Wartet auf Bestätigung"
          clickable
          onClick={() => setSelectedStatus(MeldungStatus.HANDWERKER_ERLEDIGT)}
          statuscolor={selectedStatus === MeldungStatus.HANDWERKER_ERLEDIGT ? '#9b59b6' : '#95a5a6'}
        />
        <StatusChip 
          label="Abgeschlossen"
          clickable
          onClick={() => setSelectedStatus(MeldungStatus.ABGESCHLOSSEN)}
          statuscolor={selectedStatus === MeldungStatus.ABGESCHLOSSEN ? '#2ecc71' : '#95a5a6'}
        />
        <StatusChip 
          label="Storniert"
          clickable
          onClick={() => setSelectedStatus(MeldungStatus.STORNIERT)}
          statuscolor={selectedStatus === MeldungStatus.STORNIERT ? '#e74c3c' : '#95a5a6'}
        />
      </Box>

      {/* Meldungen List */}
      <Grid container spacing={2}>
        {filteredMeldungen.map((meldung) => (
          <Grid item xs={12} key={meldung._id}>
            <MeldungCard
              title={meldung.title}
              description={meldung.description}
              status={meldung.status}
              createdAt={meldung.createdAt}
              onClick={() => {
                console.log('onClick-Handler wurde ausgelöst');
                navigate(`/vermieter/meldungen/${meldung._id}`);
              }}
              unreadMessages={meldung.unreadMessages}
              unitInfo={{
                unitNumber: meldung.unit.unitNumber,
                propertyName: meldung.unit.property?.name || 'Keine Immobilie'
              }}
              reporter={meldung.reporter}
              statusColor={getStatusColor(meldung.status)}
            />
          </Grid>
        ))}
        {filteredMeldungen.length === 0 && (
          <Grid item xs={12}>
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
              <HomeRepairServiceIcon sx={{ fontSize: 60, color: 'rgba(0, 0, 0, 0.2)', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1, color: 'text.secondary', fontWeight: 600 }}>
                Keine Meldungen gefunden
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {meldungen.length > 0 
                  ? 'Keine Meldungen entsprechen den aktuellen Filterkriterien.' 
                  : 'Es sind noch keine Meldungen vorhanden.'}
              </Typography>
              {meldungen.length > 0 && (
                <Button
                  variant="contained"
                  startIcon={<ClearIcon />}
                  onClick={resetFilters}
                  sx={{
                    backgroundColor: '#E67E22',
                    '&:hover': {
                      backgroundColor: '#D35400',
                    }
                  }}
                >
                  Filter zurücksetzen
                </Button>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>
    </MainLayout>
  );
};
