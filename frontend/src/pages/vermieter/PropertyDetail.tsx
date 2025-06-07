import React, { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Card,
  CardContent,
  CardActions,
  Chip,
  Stack,
  Divider,
  CircularProgress,
  IconButton,
  Tooltip,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/Layout/MainLayout';
import { vermieterService } from '../../services/vermieter.service';
import { Property, Unit } from '../../types/property';
import { vermieterNavigationItems } from './vermieterNavigation';
import { 
  Add as AddIcon, 
  Person as PersonIcon,
  HomeWork as HomeWorkIcon,
  Apartment as ApartmentIcon,
  LocationOn as LocationOnIcon,
  MeetingRoom as MeetingRoomIcon,
  SquareFoot as SquareFootIcon,
  Euro as EuroIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarMonth as CalendarMonthIcon,
  DomainAdd as DomainAddIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Layers as LayersIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import deLocale from 'date-fns/locale/de';

export const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const [property, setProperty] = useState<Property | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isNewUnitDialogOpen, setIsNewUnitDialogOpen] = useState(false);
  const [isAssignTenantDialogOpen, setIsAssignTenantDialogOpen] = useState(false);
  const [isInviteTenantDialogOpen, setIsInviteTenantDialogOpen] = useState(false);
  const [availableUnits, setAvailableUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [newUnit, setNewUnit] = useState({
    unitNumber: '',
    floor: '',
    squareMeters: '',
    rooms: '',
    monthlyRent: '',
    features: '',
  });
  const [newTenant, setNewTenant] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    moveInDate: new Date(),
    unitId: '',
  });

  useEffect(() => {
    fetchPropertyDetails();
  }, [id]);

  const fetchPropertyDetails = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await vermieterService.getProperty(id);
      setProperty(data.property);
      setUnits(data.units);
      setError('');
    } catch (error) {
      console.error('Error fetching property details:', error);
      setError('Fehler beim Laden der Immobilie');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableUnits = async () => {
    if (!property) return;
    try {
      const units = await vermieterService.getAvailableUnits(property._id);
      setAvailableUnits(units);
    } catch (error) {
      console.error('Error fetching available units:', error);
    }
  };

  const handleCreateUnit = async () => {
    if (!id) return;
    try {
      const unitData = {
        ...newUnit,
        floor: parseInt(newUnit.floor),
        squareMeters: parseFloat(newUnit.squareMeters),
        rooms: parseInt(newUnit.rooms),
        monthlyRent: parseFloat(newUnit.monthlyRent),
        features: newUnit.features.split(',').map((f) => f.trim()),
      };
      const unit = await vermieterService.addUnit(id, unitData);
      setUnits([...units, unit]);
      setIsNewUnitDialogOpen(false);
      // Reset form
      setNewUnit({
        unitNumber: '',
        floor: '',
        squareMeters: '',
        rooms: '',
        monthlyRent: '',
        features: '',
      });
    } catch (error) {
      console.error('Error creating unit:', error);
    }
  };

  const handleAssignTenant = async () => {
    if (!property) return;

    const unitIdToUse = selectedUnit ? selectedUnit._id : newTenant.unitId;
    if (!unitIdToUse) return;

    try {
      await vermieterService.createTenant({
        propertyId: property._id,
        unitId: unitIdToUse,
        tenant: {
          firstName: newTenant.firstName,
          lastName: newTenant.lastName,
          email: newTenant.email,
          phone: newTenant.phone,
          moveInDate: newTenant.moveInDate,
        }
      });
      
      setIsAssignTenantDialogOpen(false);
      setSelectedUnit(null);
      setNewTenant({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        moveInDate: new Date(),
        unitId: '',
      });
      
      // Aktualisiere die Einheiten
      const data = await vermieterService.getProperty(property._id);
      setUnits(data.units);
    } catch (error) {
      console.error('Error assigning tenant:', error);
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Immobilie" navigationItems={vermieterNavigationItems}>
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

  if (!property) {
    return (
      <MainLayout title="Immobilie" navigationItems={vermieterNavigationItems}>
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
            Immobilie nicht gefunden
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/vermieter/properties')}
            sx={{
              mt: 2,
              borderColor: '#4299E1',
              color: '#4299E1',
              borderRadius: 2,
              py: 1,
              px: 3,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                borderColor: '#3182CE',
                bgcolor: 'rgba(66, 153, 225, 0.04)',
              }
            }}
          >
            Zurück zur Übersicht
          </Button>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={property.name} navigationItems={vermieterNavigationItems}>
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
      <Grid container spacing={3}>
        {/* Property Details */}
        <Grid item xs={12}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 2 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <HomeWorkIcon 
                sx={{ 
                  mr: 1.5, 
                  fontSize: 28, 
                  color: '#4299E1' 
                }} 
              />
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 600, 
                  color: '#2D3748' 
                }}
              >
                Immobilien Details
              </Typography>
            </Box>
            <Box>
              <Tooltip title="Daten aktualisieren">
                <IconButton 
                  onClick={fetchPropertyDetails}
                  sx={{ 
                    color: '#4299E1',
                    '&:hover': {
                      bgcolor: 'rgba(66, 153, 225, 0.08)',
                    }
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                sx={{
                  ml: 1,
                  borderColor: '#4299E1',
                  color: '#4299E1',
                  borderRadius: 2,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#3182CE',
                    bgcolor: 'rgba(66, 153, 225, 0.04)',
                  }
                }}
                onClick={() => navigate(`/vermieter/properties/${property._id}/edit`)}
              >
                Bearbeiten
              </Button>
            </Box>
          </Box>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 3, 
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              }
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <LocationOnIcon sx={{ mr: 1.5, color: '#4299E1', mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2D3748' }}>
                      Adresse
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#4A5568' }}>
                      {property.address.street}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#4A5568' }}>
                      {property.address.postalCode} {property.address.city}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <ApartmentIcon sx={{ mr: 1.5, color: '#4299E1', mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2D3748' }}>
                      Immobilien Details
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#4A5568' }}>
                      <strong>Baujahr:</strong> {property.yearBuilt || 'Nicht angegeben'}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#4A5568' }}>
                      <strong>Anzahl Wohneinheiten:</strong> {property.totalUnits}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              {property.description && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <InfoIcon sx={{ mr: 1.5, color: '#4299E1', mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2D3748' }}>
                        Beschreibung
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#4A5568' }}>
                        {property.description}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>

        {/* Units */}
        <Grid item xs={12}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 2,
            mt: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LayersIcon 
                sx={{ 
                  mr: 1.5, 
                  fontSize: 28, 
                  color: '#4299E1' 
                }} 
              />
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 600, 
                  color: '#2D3748' 
                }}
              >
                Wohneinheiten
              </Typography>
              <Chip 
                label={units.length} 
                size="small" 
                sx={{ 
                  ml: 1.5, 
                  bgcolor: '#EBF8FF', 
                  color: '#3182CE',
                  fontWeight: 600,
                  border: '1px solid #BEE3F8'
                }} 
              />
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setIsNewUnitDialogOpen(true)}
              sx={{
                bgcolor: '#4299E1',
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 4px 6px rgba(66, 153, 225, 0.2)',
                '&:hover': {
                  bgcolor: '#3182CE',
                  boxShadow: '0 6px 8px rgba(66, 153, 225, 0.3)',
                }
              }}
            >
              Neue Wohneinheit
            </Button>
            <Button
              variant="outlined"
              startIcon={<PersonIcon />}
              onClick={() => {
                setIsInviteTenantDialogOpen(true);
                fetchAvailableUnits();
              }}
              sx={{
                ml: 2,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Mieter einladen
            </Button>
          </Box>
          <Grid container spacing={3}>
            {units.length > 0 ? (
              units.map((unit) => (
                <Grid item xs={12} sm={6} md={4} key={unit._id}>
                  <Card 
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 16px rgba(66, 153, 225, 0.1)',
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box 
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            mr: 2,
                            background: 'linear-gradient(135deg, #4299E1 0%, #3182CE 100%)',
                          }}
                        >
                          <ApartmentIcon sx={{ color: 'white' }} />
                        </Box>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 600,
                            color: '#2D3748'
                          }}
                        >
                          Wohnung {unit.unitNumber}
                        </Typography>
                      </Box>
                      
                      <Stack spacing={1.5} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <MeetingRoomIcon sx={{ fontSize: 18, mr: 1, color: '#4299E1' }} />
                          <Typography variant="body2" sx={{ color: '#4A5568' }}>
                            <strong>Etage:</strong> {unit.floor}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <SquareFootIcon sx={{ fontSize: 18, mr: 1, color: '#4299E1' }} />
                          <Typography variant="body2" sx={{ color: '#4A5568' }}>
                            <strong>Fläche:</strong> {unit.squareMeters} m²
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LayersIcon sx={{ fontSize: 18, mr: 1, color: '#4299E1' }} />
                          <Typography variant="body2" sx={{ color: '#4A5568' }}>
                            <strong>Zimmer:</strong> {unit.rooms}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <EuroIcon sx={{ fontSize: 18, mr: 1, color: '#4299E1' }} />
                          <Typography variant="body2" sx={{ color: '#4A5568' }}>
                            <strong>Miete:</strong> {unit.monthlyRent} €
                          </Typography>
                        </Box>
                      </Stack>
                      
                      {unit.features && unit.features.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#4A5568', mb: 1 }}>
                            Ausstattung:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {unit.features.map((feature, index) => (
                              <Chip 
                                key={index} 
                                label={feature} 
                                size="small" 
                                sx={{ 
                                  bgcolor: '#EBF8FF', 
                                  color: '#3182CE',
                                  fontSize: '0.7rem',
                                  height: 24
                                }} 
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                      
                      <Box sx={{ mt: 2 }}>
                        {unit.currentTenant ? (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Chip
                              icon={<PersonIcon />}
                              label={`${unit.currentTenant.firstName} ${unit.currentTenant.lastName}`}
                              sx={{
                                bgcolor: '#C6F6D5',
                                color: '#2F855A',
                                fontWeight: 500,
                                '& .MuiChip-icon': {
                                  color: '#2F855A'
                                }
                              }}
                            />
                            <Tooltip title="Aktiver Mieter">
                              <CheckCircleIcon sx={{ ml: 1, color: '#2F855A', fontSize: 18 }} />
                            </Tooltip>
                          </Box>
                        ) : unit.pendingTenant ? (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Chip
                              icon={<PersonIcon />}
                              label={`${unit.pendingTenant.firstName} ${unit.pendingTenant.lastName}`}
                              sx={{
                                bgcolor: '#FEEBC8',
                                color: '#C05621',
                                fontWeight: 500,
                                '& .MuiChip-icon': {
                                  color: '#C05621'
                                }
                              }}
                            />
                            <Tooltip title="Einladung ausstehend">
                              <WarningIcon sx={{ ml: 1, color: '#C05621', fontSize: 18 }} />
                            </Tooltip>
                          </Box>
                        ) : (
                          <Chip
                            label="Keine Mieter"
                            variant="outlined"
                            sx={{
                              borderColor: '#CBD5E0',
                              color: '#718096',
                              fontWeight: 500
                            }}
                          />
                        )}
                      </Box>
                    </CardContent>
                    <Divider />
                    <CardActions sx={{ p: 2 }}>
                      <Button
                        size="small"
                        color="primary"
                        startIcon={<PersonIcon />}
                        onClick={() => {
                          setSelectedUnit(unit);
                          setIsAssignTenantDialogOpen(true);
                        }}
                        disabled={!!unit.currentTenant || !!unit.pendingTenant}
                        sx={{
                          color: '#4299E1',
                          textTransform: 'none',
                          fontWeight: 500,
                          '&.Mui-disabled': {
                            color: 'rgba(0, 0, 0, 0.26)',
                          }
                        }}
                      >
                        {unit.currentTenant 
                          ? 'Mieter aktiv'
                          : unit.pendingTenant 
                            ? 'Einladung ausstehend'
                            : 'Mieter zuweisen'
                        }
                      </Button>
                    </CardActions>
                  </Card>
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
                    bgcolor: '#F7FAFC',
                    borderRadius: 3,
                    border: '1px dashed #CBD5E0'
                  }}
                >
                  <ApartmentIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5, color: '#4299E1' }} />
                  <Typography sx={{ fontSize: '1.1rem', fontWeight: 500, color: '#4A5568', mb: 2 }}>
                    Keine Wohneinheiten gefunden
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => setIsNewUnitDialogOpen(true)}
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
                    Erste Wohneinheit erstellen
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>

      {/* New Unit Dialog */}
      <Dialog
        open={isNewUnitDialogOpen}
        onClose={() => setIsNewUnitDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center',
          p: 3,
          pb: 2
        }}>
          <DomainAddIcon sx={{ mr: 1.5, color: '#4299E1' }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748' }}>
            Neue Wohneinheit erstellen
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3, pt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                label="Wohnungsnummer"
                fullWidth
                value={newUnit.unitNumber}
                onChange={(e) =>
                  setNewUnit({ ...newUnit, unitNumber: e.target.value })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ApartmentIcon sx={{ color: '#4299E1' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Etage"
                type="number"
                fullWidth
                value={newUnit.floor}
                onChange={(e) => setNewUnit({ ...newUnit, floor: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MeetingRoomIcon sx={{ color: '#4299E1' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Quadratmeter"
                type="number"
                fullWidth
                value={newUnit.squareMeters}
                onChange={(e) =>
                  setNewUnit({ ...newUnit, squareMeters: e.target.value })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SquareFootIcon sx={{ color: '#4299E1' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Anzahl Zimmer"
                type="number"
                fullWidth
                value={newUnit.rooms}
                onChange={(e) => setNewUnit({ ...newUnit, rooms: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LayersIcon sx={{ color: '#4299E1' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Monatliche Miete"
                type="number"
                fullWidth
                value={newUnit.monthlyRent}
                onChange={(e) =>
                  setNewUnit({ ...newUnit, monthlyRent: e.target.value })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EuroIcon sx={{ color: '#4299E1' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Ausstattung (kommagetrennt)"
                fullWidth
                multiline
                rows={2}
                value={newUnit.features}
                onChange={(e) =>
                  setNewUnit({ ...newUnit, features: e.target.value })
                }
                helperText="z.B.: Balkon, Einbauküche, Aufzug"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setIsNewUnitDialogOpen(false)}
            sx={{
              color: '#718096',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              '&:hover': {
                bgcolor: 'rgba(113, 128, 150, 0.08)',
              }
            }}
          >
            Abbrechen
          </Button>
          <Button 
            onClick={handleCreateUnit} 
            variant="contained"
            sx={{
              bgcolor: '#4299E1',
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: '0 4px 6px rgba(66, 153, 225, 0.2)',
              '&:hover': {
                bgcolor: '#3182CE',
                boxShadow: '0 6px 8px rgba(66, 153, 225, 0.3)',
              }
            }}
          >
            Erstellen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Invite Tenant Dialog */}
      <Dialog
        open={isInviteTenantDialogOpen}
        onClose={() => setIsInviteTenantDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', p: 3, pb: 2 }}>
          <PersonIcon sx={{ mr: 1.5, color: '#4299E1' }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748' }}>
            Mieter einladen
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3, pt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                <InputLabel>Wohneinheit</InputLabel>
                <Select
                  label="Wohneinheit"
                  value={newTenant.unitId}
                  onChange={(e) => setNewTenant({ ...newTenant, unitId: e.target.value })}
                >
                  {availableUnits.map((u) => (
                    <MenuItem key={u._id} value={u._id}>
                      {u.unitNumber}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Vorname"
                fullWidth
                value={newTenant.firstName}
                onChange={(e) => setNewTenant({ ...newTenant, firstName: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: '#4299E1' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nachname"
                fullWidth
                value={newTenant.lastName}
                onChange={(e) => setNewTenant({ ...newTenant, lastName: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: '#4299E1' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="E-Mail"
                type="email"
                fullWidth
                value={newTenant.email}
                onChange={(e) => setNewTenant({ ...newTenant, email: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: '#4299E1' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Telefon"
                fullWidth
                value={newTenant.phone}
                onChange={(e) => setNewTenant({ ...newTenant, phone: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon sx={{ color: '#4299E1' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={deLocale}>
                <DatePicker
                  label="Einzugsdatum"
                  value={newTenant.moveInDate}
                  onChange={(date) => setNewTenant({ ...newTenant, moveInDate: date || new Date() })}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      InputProps: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarMonthIcon sx={{ color: '#4299E1' }} />
                          </InputAdornment>
                        ),
                      },
                      sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } }
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => setIsInviteTenantDialogOpen(false)}
            sx={{
              color: '#718096',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              '&:hover': { bgcolor: 'rgba(113, 128, 150, 0.08)' }
            }}
          >
            Abbrechen
          </Button>
          <Button
            variant="contained"
            onClick={async () => {
              await handleAssignTenant();
              setIsInviteTenantDialogOpen(false);
            }}
            disabled={!newTenant.unitId || !newTenant.firstName || !newTenant.lastName || !newTenant.email}
            sx={{
              bgcolor: '#4299E1',
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: '0 4px 6px rgba(66, 153, 225, 0.2)',
              '&:hover': { bgcolor: '#3182CE', boxShadow: '0 6px 8px rgba(66, 153, 225, 0.3)' },
              '&.Mui-disabled': { bgcolor: 'rgba(66, 153, 225, 0.3)' }
            }}
          >
            Einladung senden
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Tenant Dialog */}
      <Dialog
        open={isAssignTenantDialogOpen}
        onClose={() => {
          setIsAssignTenantDialogOpen(false);
          setSelectedUnit(null);
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center',
          p: 3,
          pb: 2
        }}>
          <PersonIcon sx={{ mr: 1.5, color: '#4299E1' }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748' }}>
              {selectedUnit?.currentTenant ? 'Mieter bearbeiten' : 'Neuen Mieter zuweisen'}
            </Typography>
            {selectedUnit && (
              <Typography variant="body2" sx={{ color: '#718096', mt: 0.5 }}>
                Wohnung {selectedUnit.unitNumber}
              </Typography>
            )}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3, pt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Vorname"
                fullWidth
                value={newTenant.firstName}
                onChange={(e) => setNewTenant({ ...newTenant, firstName: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: '#4299E1' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nachname"
                fullWidth
                value={newTenant.lastName}
                onChange={(e) => setNewTenant({ ...newTenant, lastName: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: '#4299E1' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="E-Mail"
                type="email"
                fullWidth
                value={newTenant.email}
                onChange={(e) => setNewTenant({ ...newTenant, email: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: '#4299E1' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Telefon"
                fullWidth
                value={newTenant.phone}
                onChange={(e) => setNewTenant({ ...newTenant, phone: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon sx={{ color: '#4299E1' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={deLocale}>
                <DatePicker
                  label="Einzugsdatum"
                  value={newTenant.moveInDate}
                  onChange={(date) => setNewTenant({ ...newTenant, moveInDate: date || new Date() })}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      InputProps: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarMonthIcon sx={{ color: '#4299E1' }} />
                          </InputAdornment>
                        ),
                      },
                      sx: {
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => {
              setIsAssignTenantDialogOpen(false);
              setSelectedUnit(null);
            }}
            sx={{
              color: '#718096',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              '&:hover': {
                bgcolor: 'rgba(113, 128, 150, 0.08)',
              }
            }}
          >
            Abbrechen
          </Button>
          <Button
            variant="contained"
            onClick={handleAssignTenant}
            disabled={!newTenant.firstName || !newTenant.lastName || !newTenant.email}
            sx={{
              bgcolor: '#4299E1',
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: '0 4px 6px rgba(66, 153, 225, 0.2)',
              '&:hover': {
                bgcolor: '#3182CE',
                boxShadow: '0 6px 8px rgba(66, 153, 225, 0.3)',
              },
              '&.Mui-disabled': {
                bgcolor: 'rgba(66, 153, 225, 0.3)',
              }
            }}
          >
            {selectedUnit?.currentTenant ? 'Speichern' : 'Mieter einladen'}
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};
