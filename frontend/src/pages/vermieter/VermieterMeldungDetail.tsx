import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Badge,
  Stack,
  useTheme,
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Handyman as HandymanIcon,
  Send as SendIcon,
  HomeWork as HomeWorkIcon,
  Assignment as AssignmentIcon,
  AccessTime as AccessTimeIcon,
  Room as RoomIcon,
  Info as InfoIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  LocationOn as LocationOnIcon,
  MeetingRoom as MeetingRoomIcon,
  Image as ImageIcon,
  Comment as CommentIcon,
} from '@mui/icons-material';
import { MainLayout } from '../../components/Layout/MainLayout';
import { vermieterNavigationItems as navigationItems } from './vermieterNavigation';
import { SplitChat } from '../../components/Chat/SplitChat';
import api from '../../services/api';
import { Meldung, MeldungStatus, User } from '../../types/meldung.types';
import { useSnackbar } from 'notistack';
import { format, formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { getStatusColor, getStatusText } from '../../constants/meldung';

export const VermieterMeldungDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const [meldung, setMeldung] = useState<Meldung | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [handwerker, setHandwerker] = useState<Array<{ _id: string; firstName: string; lastName: string }>>([]);
  const [selectedHandwerker, setSelectedHandwerker] = useState<string>('');
  const { enqueueSnackbar } = useSnackbar();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchMeldung = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError('');
        const response = await api.get(`/vermieter/meldungen/${id}`);
        setMeldung(response.data);
      } catch (err) {
        console.error('Error fetching meldung:', err);
        setError('Fehler beim Laden der Meldung');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeldung();
  }, [id]);

  useEffect(() => {
    const fetchHandwerker = async () => {
      try {
        const response = await api.get('/vermieter/handwerker');
        setHandwerker(response.data);
      } catch (err) {
        console.error('Error fetching handwerker:', err);
      }
    };

    fetchHandwerker();
  }, []);

  const handleBack = () => {
    navigate('/vermieter/meldungen');
  };

  const handleAssignHandwerker = async () => {
    if (!selectedHandwerker || !id) return;

    try {
      setIsUpdatingStatus(true);
      await api.put(`/vermieter/meldungen/${id}/assign`, {
        handwerkerId: selectedHandwerker
      });

      // Aktualisiere die Meldung
      const response = await api.get(`/vermieter/meldungen/${id}`);
      setMeldung(response.data);
      enqueueSnackbar('Handwerker erfolgreich zugewiesen', { variant: 'success' });
    } catch (err) {
      console.error('Error assigning handwerker:', err);
      enqueueSnackbar('Fehler beim Zuweisen des Handwerkers', { variant: 'error' });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleUpdateStatus = async (newStatus: MeldungStatus) => {
    if (!id) return;

    try {
      setIsUpdatingStatus(true);
      await api.put(`/vermieter/meldungen/${id}/status`, {
        status: newStatus
      });

      // Aktualisiere die Meldung
      const response = await api.get(`/vermieter/meldungen/${id}`);
      setMeldung(response.data);
      enqueueSnackbar(`Status erfolgreich auf "${getStatusText(newStatus)}" geändert`, { variant: 'success' });
    } catch (err) {
      console.error('Error updating status:', err);
      enqueueSnackbar('Fehler beim Aktualisieren des Status', { variant: 'error' });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const refreshMeldung = async () => {
    if (!id) return;
    
    try {
      setIsUpdatingStatus(true);
      const response = await api.get(`/vermieter/meldungen/${id}`);
      setMeldung(response.data);
      enqueueSnackbar('Meldung aktualisiert', { variant: 'success' });
    } catch (err) {
      console.error('Error refreshing meldung:', err);
      enqueueSnackbar('Fehler beim Aktualisieren der Meldung', { variant: 'error' });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Meldung laden..." navigationItems={navigationItems}>
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

  if (error || !meldung) {
    return (
      <MainLayout title="Fehler" navigationItems={navigationItems}>
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            height: 'calc(100vh - 120px)',
            gap: 2
          }}
        >
          <InfoIcon sx={{ fontSize: 48, color: 'rgba(0, 0, 0, 0.4)' }} />
          <Typography variant="h6" color="textSecondary">
            {error || 'Meldung nicht gefunden'}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{ mt: 2 }}
          >
            Zurück zur Übersicht
          </Button>
        </Box>
      </MainLayout>
    );
  }

  const timeAgo = formatDistanceToNow(new Date(meldung.createdAt), { 
    addSuffix: true,
    locale: de
  });

  const formattedDate = format(new Date(meldung.createdAt), 'dd. MMMM yyyy, HH:mm', { locale: de });

  return (
    <MainLayout title={`Meldung: ${meldung.title}`} navigationItems={navigationItems}>
      {/* Header mit Zurück-Button und Aktualisieren-Button */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3
        }}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            boxShadow: 'none',
          }}
        >
          Zurück zur Übersicht
        </Button>
        
        <Tooltip title="Meldung aktualisieren">
          <IconButton 
            onClick={refreshMeldung} 
            disabled={isUpdatingStatus}
            sx={{ 
              bgcolor: 'rgba(66, 153, 225, 0.1)',
              '&:hover': {
                bgcolor: 'rgba(66, 153, 225, 0.2)',
              }
            }}
          >
            {isUpdatingStatus ? <CircularProgress size={24} /> : <RefreshIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3}>
        {/* Meldungs-Details */}
        <Grid item xs={12} md={5} lg={4}>
          <Card 
            sx={{ 
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              overflow: 'visible',
              height: '100%',
            }}
          >
            <Box 
              sx={{ 
                p: 3, 
                background: 'linear-gradient(135deg, #4299E1 0%, #3182CE 100%)',
                color: 'white',
                borderRadius: '12px 12px 0 0',
              }}
            >
              <Typography variant="h5" fontWeight={600} gutterBottom>
                {meldung.title}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Chip 
                  label={getStatusText(meldung.status)}
                  sx={{ 
                    bgcolor: 'white',
                    color: getStatusColor(meldung.status),
                    fontWeight: 600,
                    borderRadius: '12px',
                  }}
                />
                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                  {timeAgo}
                </Typography>
              </Box>
            </Box>
            
            <CardContent sx={{ p: 3 }}>
              <Typography paragraph sx={{ mb: 3, lineHeight: 1.6 }}>
                {meldung.description}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Meldungs-Metadaten */}
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HomeWorkIcon color="primary" fontSize="small" />
                  <Typography variant="body2">
                    <strong>Immobilie:</strong> {meldung.unit.property?.name || 'Keine Immobilie'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MeetingRoomIcon color="primary" fontSize="small" />
                  <Typography variant="body2">
                    <strong>Wohneinheit:</strong> {meldung.unit.unitNumber}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <RoomIcon color="primary" fontSize="small" />
                  <Typography variant="body2">
                    <strong>Raum:</strong> {meldung.room}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTimeIcon color="primary" fontSize="small" />
                  <Typography variant="body2">
                    <strong>Gemeldet am:</strong> {formattedDate}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon color="primary" fontSize="small" />
                  <Typography variant="body2">
                    <strong>Gemeldet von:</strong> {meldung.reporter.firstName} {meldung.reporter.lastName}
                  </Typography>
                </Box>
                
                {meldung.images && meldung.images.length > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ImageIcon color="primary" fontSize="small" />
                    <Typography variant="body2">
                      <strong>Bilder:</strong> {meldung.images.length} Bilder angehängt
                    </Typography>
                  </Box>
                )}
              </Stack>
              
              <Divider sx={{ my: 3 }} />
              
              {/* Status-Management */}
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Status verwalten
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {Object.values(MeldungStatus).map((status) => (
                  <Button
                    key={status}
                    variant={meldung.status === status ? "contained" : "outlined"}
                    size="small"
                    disabled={meldung.status === status || isUpdatingStatus}
                    onClick={() => handleUpdateStatus(status)}
                    sx={{ 
                      borderRadius: 2,
                      textTransform: 'none',
                      minWidth: 'auto',
                      bgcolor: meldung.status === status ? getStatusColor(status) : 'transparent',
                      borderColor: getStatusColor(status),
                      color: meldung.status === status ? 'white' : getStatusColor(status),
                      '&:hover': {
                        bgcolor: meldung.status === status ? getStatusColor(status) : `${getStatusColor(status)}20`,
                      }
                    }}
                  >
                    {getStatusText(status)}
                  </Button>
                ))}
              </Box>
              
              {/* Handwerker Zuweisung */}
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Handwerker
              </Typography>
              
              {!meldung.assignedTo ? (
                <Box sx={{ mb: 2 }}>
                  <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel>Handwerker auswählen</InputLabel>
                    <Select
                      value={selectedHandwerker}
                      onChange={(e) => setSelectedHandwerker(e.target.value)}
                      label="Handwerker auswählen"
                      sx={{ borderRadius: 2 }}
                    >
                      {handwerker.map((h) => (
                        <MenuItem key={h._id} value={h._id}>
                          {h.firstName} {h.lastName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    startIcon={<HandymanIcon />}
                    onClick={handleAssignHandwerker}
                    disabled={!selectedHandwerker || isUpdatingStatus}
                    fullWidth
                    sx={{ 
                      borderRadius: 2,
                      textTransform: 'none',
                      bgcolor: '#4299E1',
                      '&:hover': {
                        bgcolor: '#3182CE',
                      }
                    }}
                  >
                    Handwerker zuweisen
                  </Button>
                </Box>
              ) : (
                <Box 
                  sx={{ 
                    p: 2, 
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    bgcolor: 'rgba(66, 153, 225, 0.05)',
                  }}
                >
                  <Avatar 
                    sx={{ 
                      bgcolor: 'rgba(66, 153, 225, 0.2)',
                      color: '#4299E1',
                    }}
                  >
                    <HandymanIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2">
                      {meldung.assignedTo.firstName} {meldung.assignedTo.lastName}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Zugewiesen
                    </Typography>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Chat-Bereich */}
        <Grid item xs={12} md={7} lg={8}>
          <Card 
            sx={{ 
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <CardContent sx={{ p: 0, flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box sx={{ 
                height: 'calc(100vh - 200px)',
                display: 'flex',
                flexDirection: 'column',
                p: 2,
              }}>
                <SplitChat
                  meldungId={meldung._id}
                  currentUserRole="vermieter"
                  mieterPartner={{
                    id: meldung.reporter._id,
                    firstName: meldung.reporter.firstName,
                    lastName: meldung.reporter.lastName,
                    role: 'mieter'
                  }}
                  handwerkerPartner={meldung.assignedTo ? {
                    id: meldung.assignedTo._id,
                    firstName: meldung.assignedTo.firstName,
                    lastName: meldung.assignedTo.lastName,
                    role: 'handwerker'
                  } : undefined}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </MainLayout>
  );
};
