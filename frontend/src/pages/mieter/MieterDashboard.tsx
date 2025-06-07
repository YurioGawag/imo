import { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Chip,
  Avatar,
  Stack,
  Divider,
  useTheme,
  alpha,
  CircularProgress,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  Home as HomeIcon,
  Apartment as ApartmentIcon,
  Square as SquareIcon,
  BedOutlined as RoomIcon,
  LocationOn as LocationOnIcon,
  Euro as EuroIcon,
} from '@mui/icons-material';
import { MainLayout } from '../../components/Layout/MainLayout';
import { MeldungCard } from '../../components/Meldung/MeldungCard';
import api from '../../services/api';
import { useAuthStore } from '../../store/auth.store';
import { COMMON_ISSUES, ROOM_TYPES, getStatusColor, getStatusText } from '../../constants/meldung';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { navigationItems } from './mieterNavigation';
import { MeldungStatus } from '../../types/meldung.types';

interface Meldung {
  _id: string;
  title: string;
  description: string;
  status: MeldungStatus;
  createdAt: string;
  images: string[];
  assignedTo?: {
    firstName: string;
    lastName: string;
  };
}

interface MieterDashboardData {
  meldungen: Meldung[];
  unit: {
    unitNumber: string;
    floor?: number;
    squareMeters: number;
    rooms: number;
    monthlyRent?: number;
    property: {
      name: string;
      address: {
        street: string;
        postalCode: string;
        city: string;
        country?: string;
      };
    };
  };
}

interface NewMeldung {
  issueType: string;
  room: string;
  description: string;
  images: File[];
}

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export const MieterDashboard: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuthStore();
  const [dashboardData, setDashboardData] = useState<MieterDashboardData>({
    meldungen: [],
    unit: {
      unitNumber: '',
      floor: undefined,
      squareMeters: 0,
      rooms: 0,
      monthlyRent: undefined,
      property: {
        name: '',
        address: {
          street: '',
          postalCode: '',
          city: '',
          country: '',
        },
      },
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isNewMeldungDialogOpen, setIsNewMeldungDialogOpen] = useState(false);
  const navigate = useNavigate();
  const [newMeldung, setNewMeldung] = useState<NewMeldung>({
    issueType: '',
    room: '',
    description: '',
    images: [],
  });
  const [selectedIssue, setSelectedIssue] = useState<typeof COMMON_ISSUES[0] | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [meldungenResponse, unitResponse, profileResponse] = await Promise.all([
          api.get<Meldung[]>('/mieter/meldungen'),
          api.get<{ unit: MieterDashboardData['unit']; meldungen: Meldung[] }>('/mieter/dashboard'),
          api.get<{ unit?: MieterDashboardData['unit'] }>('/mieter/profile'),
        ]);

        console.log('Meldungen Response:', meldungenResponse.data);
        console.log('Unit Response:', unitResponse.data);

        const unitData = profileResponse.data.unit
          ? profileResponse.data.unit
          : unitResponse.data.unit;

        setDashboardData({
          meldungen: meldungenResponse.data,
          unit: unitData,
        });

        // Debug Ausgaben
        console.log('Offene Meldungen:', meldungenResponse.data.filter((m: Meldung) => m.status === MeldungStatus.OFFEN).length);
        console.log('In Bearbeitung:', meldungenResponse.data.filter((m: Meldung) => m.status === MeldungStatus.IN_BEARBEITUNG).length);
        console.log('Abgeschlossen:', meldungenResponse.data.filter((m: Meldung) => m.status === MeldungStatus.ABGESCHLOSSEN).length);
        
        // Alle Status-Werte ausgeben
        console.log('Alle Status-Werte:', meldungenResponse.data.map((m: Meldung) => m.status));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?._id) {
      fetchDashboardData();
    }
  }, [user?._id]);

  const handleCreateMeldung = async () => {
    try {
      const formData = new FormData();
      formData.append('title', selectedIssue?.title || '');
      formData.append('description', newMeldung.description);
      formData.append('room', newMeldung.room);
      newMeldung.images.forEach((image) => {
        formData.append('images', image);
      });

      await api.post('/mieter/meldungen', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setIsNewMeldungDialogOpen(false);
      setNewMeldung({
        issueType: '',
        room: '',
        description: '',
        images: [],
      });
      setSelectedIssue(null);
      setPreviewUrls([]);
      
      // Refresh dashboard data
      const response = await api.get('/mieter/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error creating meldung:', error);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setNewMeldung((prev: NewMeldung) => ({
        ...prev,
        images: [...prev.images, ...newFiles],
      }));

      // Create preview URLs
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls((prev: string[]) => [...prev, ...newPreviewUrls]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setNewMeldung((prev: NewMeldung) => ({
      ...prev,
      images: prev.images.filter((_: File, i: number) => i !== index),
    }));
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls((prev: string[]) => prev.filter((_: string, i: number) => i !== index));
  };

  const getChipProps = (status: MeldungStatus) => {
    switch (status) {
      case MeldungStatus.OFFEN:
        return { color: 'default' as const, variant: 'outlined' as const };
      case MeldungStatus.IN_BEARBEITUNG:
        return { color: 'warning' as const, variant: 'outlined' as const };
      case MeldungStatus.ABGESCHLOSSEN:
        return { color: 'success' as const, variant: 'outlined' as const };
      default:
        return { color: 'default' as const, variant: 'outlined' as const };
    }
  };

  const getStatusCount = (status: MeldungStatus) => {
    return dashboardData.meldungen.filter((m: Meldung) => 
      // Vergleiche Status case-insensitive und normalisiere Werte
      m.status.toUpperCase() === status.toUpperCase() ||
      (status === MeldungStatus.OFFEN && m.status.toLowerCase() === 'neu') ||
      (status === MeldungStatus.IN_BEARBEITUNG && m.status.toLowerCase() === 'in_bearbeitung') ||
      (status === MeldungStatus.ABGESCHLOSSEN && m.status.toLowerCase() === 'abgeschlossen')
    ).length || 0;
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <MainLayout navigationItems={navigationItems} title="Mieter Dashboard">
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        {/* Welcome Section */}
        <Box mb={4}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
            Willkommen zurück, {user?.firstName}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Hier finden Sie eine Übersicht Ihrer Wohnung und Meldungen.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Wohnungsinfo Card */}
          <Grid item xs={12} md={6}>
            <Card 
              elevation={0}
              sx={{ 
                height: '100%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
                borderRadius: 4,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={3}>
                  <ApartmentIcon sx={{ fontSize: 32, color: theme.palette.primary.main, mr: 2 }} />
                  <Typography variant="h5" sx={{ fontWeight: 'medium' }}>
                    Ihre Wohnung
                  </Typography>
                </Box>
                
                <Stack spacing={3}>
                  <Box display="flex" alignItems="center">
                    <HomeIcon sx={{ color: 'text.secondary', mr: 2 }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Immobilie
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {dashboardData.unit.property.name}
                      </Typography>
                    </Box>
                  </Box>

                  <Box display="flex" alignItems="center">
                    <LocationOnIcon sx={{ color: 'text.secondary', mr: 2 }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Adresse
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {dashboardData.unit.property.address.street}, {dashboardData.unit.property.address.postalCode}{' '}
                        {dashboardData.unit.property.address.city}
                      </Typography>
                    </Box>
                  </Box>

                  <Box display="flex" alignItems="center">
                    <RoomIcon sx={{ color: 'text.secondary', mr: 2 }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Wohnungsnummer
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {dashboardData.unit.unitNumber}
                      </Typography>
                    </Box>
                  </Box>

                  <Box display="flex" alignItems="center">
                    <SquareIcon sx={{ color: 'text.secondary', mr: 2 }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Details
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {dashboardData.unit.squareMeters} m² • {dashboardData.unit.rooms} Zimmer
                      </Typography>
                    </Box>
                  </Box>

                  {dashboardData.unit.monthlyRent && (
                    <Box display="flex" alignItems="center">
                      <EuroIcon sx={{ color: 'text.secondary', mr: 2 }} />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Miete
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          {dashboardData.unit.monthlyRent} € / Monat
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Meldungen Quick Stats */}
          <Grid item xs={12} md={6}>
            <Card 
              elevation={0}
              sx={{ 
                height: '100%',
                background: 'white',
                borderRadius: 4,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={3}>
                  <Typography variant="h5" sx={{ fontWeight: 'medium' }}>
                    Meldungen Übersicht
                  </Typography>
                </Box>

                <Box mb={3}>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    sx={{ 
                      borderRadius: 2,
                      py: 1.5,
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                    }}
                    onClick={() => setIsNewMeldungDialogOpen(true)}
                  >
                    + Neue Meldung erstellen
                  </Button>
                </Box>

                <Stack spacing={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography color="text.secondary">Offene Meldungen</Typography>
                    <Chip 
                      label={getStatusCount(MeldungStatus.OFFEN)}
                      {...getChipProps(MeldungStatus.OFFEN)}
                      size="small"
                    />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography color="text.secondary">In Bearbeitung</Typography>
                    <Chip 
                      label={getStatusCount(MeldungStatus.IN_BEARBEITUNG)}
                      {...getChipProps(MeldungStatus.IN_BEARBEITUNG)}
                      size="small"
                    />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography color="text.secondary">Abgeschlossen</Typography>
                    <Chip 
                      label={getStatusCount(MeldungStatus.ABGESCHLOSSEN)}
                      {...getChipProps(MeldungStatus.ABGESCHLOSSEN)}
                      size="small"
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Meldungen */}
          <Grid item xs={12}>
            <Card 
              elevation={0}
              sx={{ 
                borderRadius: 4,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <CardContent>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'medium' }}>
                  Aktuelle Meldungen
                </Typography>
                <Grid container spacing={2}>
                  {dashboardData.meldungen.length === 0 ? (
                    <Grid item xs={12}>
                      <Box 
                        sx={{ 
                          textAlign: 'center',
                          py: 4,
                          backgroundColor: alpha(theme.palette.primary.main, 0.05),
                          borderRadius: 2
                        }}
                      >
                        <Typography color="text.secondary">
                          Keine Meldungen vorhanden
                        </Typography>
                      </Box>
                    </Grid>
                  ) : (
                    dashboardData.meldungen.map((meldung) => (
                      <Grid item xs={12} md={6} key={meldung._id}>
                        <Card 
                          sx={{ 
                            cursor: 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: theme.shadows[4],
                            },
                            height: '100%',
                          }}
                          onClick={() => handleNavigate(`/mieter/meldungen/${meldung._id}`)}
                        >
                          <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                              <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                                {meldung.title}
                              </Typography>
                              <Chip 
                                label={getStatusText(meldung.status)}
                                {...getChipProps(meldung.status)}
                                size="small"
                              />
                            </Box>
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ 
                                mb: 2,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {meldung.description}
                            </Typography>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="caption" color="text.secondary">
                                Erstellt am: {new Date(meldung.createdAt).toLocaleDateString('de-DE')}
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* New Meldung Dialog */}
        <Dialog
          open={isNewMeldungDialogOpen}
          onClose={() => setIsNewMeldungDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Neue Meldung erstellen</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Wählen Sie die Art des Problems:
              </Typography>
              <Grid container spacing={2}>
                {COMMON_ISSUES.map((issue) => (
                  <Grid item xs={12} sm={4} key={issue.id}>
                    <Paper
                      sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        cursor: 'pointer',
                        border: selectedIssue?.id === issue.id ? '2px solid #1976d2' : 'none',
                        borderRadius: 1,
                      }}
                      onClick={() => {
                        setSelectedIssue(issue);
                        setNewMeldung((prev: NewMeldung) => ({ ...prev, issueType: issue.title }));
                      }}
                    >
                      <img
                        src={issue.image}
                        alt={issue.title}
                        loading="lazy"
                        style={{ height: '100px', objectFit: 'cover' }}
                      />
                      <Typography variant="subtitle2" sx={{ p: 1 }}>
                        {issue.title}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Raum</InputLabel>
                <Select
                  value={newMeldung.room}
                  onChange={(e) => setNewMeldung(prev => ({ ...prev, room: e.target.value }))}
                  label="Raum"
                >
                  {ROOM_TYPES.map((room) => (
                    <MenuItem key={room.id} value={room.id}>
                      {room.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                multiline
                rows={4}
                margin="normal"
                label="Beschreibung"
                value={newMeldung.description}
                onChange={(e) =>
                  setNewMeldung((prev: NewMeldung) => ({ ...prev, description: e.target.value }))
                }
              />

              <Box sx={{ mt: 2 }}>
                <Button
                  component="label"
                  variant="contained"
                  startIcon={<CloudUploadIcon />}
                >
                  Bilder hochladen
                  <VisuallyHiddenInput
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </Button>
              </Box>

              {previewUrls.length > 0 && (
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  {previewUrls.map((url, index) => (
                    <Grid item xs={12} sm={4} key={url}>
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        loading="lazy"
                        style={{ height: '100px', objectFit: 'cover' }}
                      />
                      <IconButton
                        sx={{
                          position: 'absolute',
                          right: 0,
                          top: 0,
                          bgcolor: 'rgba(255, 255, 255, 0.7)',
                        }}
                        size="small"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsNewMeldungDialogOpen(false)}>Abbrechen</Button>
            <Button
              onClick={handleCreateMeldung}
              variant="contained"
              disabled={!selectedIssue || !newMeldung.room}
            >
              Meldung erstellen
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
};
