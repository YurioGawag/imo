import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Grid,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  MenuItem,
  Paper,
  InputAdornment,
  Divider,
  Chip,
  Tooltip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { 
  Add as AddIcon, 
  Edit as EditIcon,
  HomeWork as HomeWorkIcon,
  Search as SearchIcon,
  LocationOn as LocationOnIcon,
  Apartment as ApartmentIcon,
  DomainAdd as DomainAddIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { vermieterService } from '../../services/vermieter.service';
import { MainLayout } from '../../components/Layout/MainLayout';
import { vermieterNavigationItems } from './vermieterNavigation';
import { Property } from '../../types/property';

interface PropertyFormData {
  name: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  totalUnits: number;
}

export const PropertyList: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<PropertyFormData>({
    name: '',
    address: {
      street: '',
      city: '',
      postalCode: '',
      country: 'Deutschland'
    },
    totalUnits: 0
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const data = await vermieterService.getProperties();
      setProperties(data);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Fehler beim Laden der Immobilien');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'totalUnits') {
      setFormData(prev => ({
        ...prev,
        totalUnits: parseInt(value) || 0
      }));
    } else if (name === 'name') {
      setFormData(prev => ({
        ...prev,
        name: value
      }));
    } else {
      // Behandle Adressfelder
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [name]: value
        }
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      // Erstelle das Property-Objekt
      const propertyData = {
        name: formData.name,
        address: {
          street: formData.address.street,
          city: formData.address.city,
          postalCode: formData.address.postalCode,
          country: 'Deutschland'
        },
        totalUnits: 1 // Standardwert
      };
      
      await vermieterService.createProperty(propertyData);
      setOpenDialog(false);
      
      // Reset form
      setFormData({
        name: '',
        address: {
          street: '',
          city: '',
          postalCode: '',
          country: 'Deutschland'
        },
        totalUnits: 0
      });
      
      // Aktualisiere die Liste
      fetchProperties();
      
    } catch (err) {
      console.error('Error creating property:', err);
    }
  };

  const filteredProperties = properties.filter(property => 
    searchTerm === '' || 
    property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.address.street.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.address.postalCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <MainLayout title="Immobilien" navigationItems={vermieterNavigationItems}>
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
    <MainLayout title="Immobilien" navigationItems={vermieterNavigationItems}>
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

      {/* Header and Search */}
      <Paper 
        sx={{ 
          p: 3, 
          mb: 4, 
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
              background: 'linear-gradient(135deg, #63B3ED 0%, #4299E1 100%)',
              color: 'white',
              boxShadow: '0 4px 12px rgba(66, 153, 225, 0.25)',
            }}
          >
            <HomeWorkIcon fontSize="small" />
          </Box>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              color: '#2D3436',
            }}
          >
            Immobilien
          </Typography>
          <Chip 
            label={`${properties.length} Immobilien`} 
            size="small"
            sx={{ 
              bgcolor: 'rgba(66, 153, 225, 0.1)', 
              color: '#4299E1',
              fontWeight: 600,
              borderRadius: 8,
            }}
          />
        </Box>
        
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
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
          
          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
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
              Neue Immobilie
            </Button>
            
            <Tooltip title="Aktualisieren">
              <IconButton 
                onClick={fetchProperties}
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
      </Paper>

      {/* Property List */}
      <Grid container spacing={3}>
        {filteredProperties.length > 0 ? (
          filteredProperties.map((property) => (
            <Grid item xs={12} sm={6} md={4} key={property._id}>
              <Card 
                sx={{ 
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                    transform: 'translateY(-4px)',
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        width: 42,
                        height: 42,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #63B3ED 0%, #4299E1 100%)',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(66, 153, 225, 0.25)',
                        flexShrink: 0,
                      }}
                    >
                      <HomeWorkIcon />
                    </Box>
                    <Box>
                      <Typography 
                        variant="h6" 
                        component="h2"
                        sx={{ 
                          fontWeight: 600,
                          color: '#2D3436',
                          mb: 0.5,
                        }}
                      >
                        {property.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'rgba(0, 0, 0, 0.6)' }}>
                        <LocationOnIcon sx={{ fontSize: 16 }} />
                        <Typography variant="body2">
                          {property.address.street}, {property.address.postalCode} {property.address.city}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                    <ApartmentIcon sx={{ fontSize: 18, color: 'rgba(0, 0, 0, 0.6)' }} />
                    <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                      {property.totalUnits} {property.totalUnits === 1 ? 'Einheit' : 'Einheiten'}
                    </Typography>
                  </Box>
                </CardContent>
                <Divider sx={{ opacity: 0.6 }} />
                <CardActions sx={{ p: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate(`/vermieter/properties/${property._id}`)}
                    startIcon={<EditIcon />}
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
                    Details
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
              }}
            >
              <HomeWorkIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
              <Typography sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
                Keine Immobilien gefunden
              </Typography>
              <Typography sx={{ fontSize: '0.95rem' }}>
                {searchTerm 
                  ? 'Versuchen Sie andere Suchkriterien'
                  : 'Erstellen Sie Ihre erste Immobilie mit dem "Neue Immobilie" Button'}
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* New Property Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
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
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              variant="outlined"
              placeholder="Name der Immobilie"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <HomeWorkIcon sx={{ color: 'rgba(0, 0, 0, 0.5)' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
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
              name="street"
              value={formData.address.street}
              onChange={handleInputChange}
              variant="outlined"
              placeholder="Straße und Hausnummer"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOnIcon sx={{ color: 'rgba(0, 0, 0, 0.5)' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
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
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="PLZ"
                name="postalCode"
                value={formData.address.postalCode}
                onChange={handleInputChange}
                variant="outlined"
                placeholder="Postleitzahl"
                sx={{
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
                name="city"
                value={formData.address.city}
                onChange={handleInputChange}
                variant="outlined"
                placeholder="Stadt"
                sx={{
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
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setOpenDialog(false)}
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
            onClick={handleSubmit} 
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

export default PropertyList;
