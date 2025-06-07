import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  TextField,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Alert,
  Tooltip,
  Divider,
  InputAdornment,
  TablePagination,
  useTheme,
  useMediaQuery,
  Avatar,
} from '@mui/material';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { MainLayout } from '../../components/Layout/MainLayout';
import { vermieterNavigationItems } from './vermieterNavigation';
import api from '../../services/api';
import { Meldung, MeldungStatus, Property, Unit, RepairType } from '../../types/meldung.types';
import { useNavigate } from 'react-router-dom';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ApartmentIcon from '@mui/icons-material/Apartment';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import BuildIcon from '@mui/icons-material/Build';

export const VermieterAuftraege: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  
  // Zustand für Daten
  const [meldungen, setMeldungen] = useState<Meldung[]>([]);
  const [filteredMeldungen, setFilteredMeldungen] = useState<Meldung[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Zustand für Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [selectedRepairType, setSelectedRepairType] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({
    start: '',
    end: ''
  });
  
  // Zustand für Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchMeldungen = async () => {
    try {
      setIsLoading(true);
      setError('');
      // Hier holen wir nur die abgeschlossenen Meldungen vom API
      const response = await api.get('/vermieter/meldungen/abgeschlossen');
      setMeldungen(response.data);
      setFilteredMeldungen(response.data);
    } catch (err) {
      console.error('Fehler beim Laden der abgeschlossenen Meldungen:', err);
      setError('Fehler beim Laden der abgeschlossenen Meldungen');
      setMeldungen([]);
      setFilteredMeldungen([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const response = await api.get('/vermieter/properties');
      setProperties(response.data);
    } catch (err) {
      console.error('Fehler beim Laden der Immobilien:', err);
    }
  };

  // Daten bei Komponenten-Initialisierung laden
  useEffect(() => {
    fetchMeldungen();
    fetchProperties();
  }, []);

  // Filtern der Meldungen
  useEffect(() => {
    let filtered = [...meldungen];
    
    // Filtere nach Suchbegriff
    if (searchTerm) {
      filtered = filtered.filter(m => 
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.reporter && `${m.reporter.firstName} ${m.reporter.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (m.assignedHandwerker && `${m.assignedHandwerker.firstName} ${m.assignedHandwerker.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Filtere nach Immobilie
    if (selectedProperty !== 'all') {
      filtered = filtered.filter(m => m.unit && m.unit.property && m.unit.property._id === selectedProperty);
    }
    
    // Filtere nach Wohneinheit
    if (selectedUnit !== 'all') {
      filtered = filtered.filter(m => m.unit && m.unit._id === selectedUnit);
    }
    
    // Filtere nach Reparaturart
    if (selectedRepairType !== 'all') {
      filtered = filtered.filter(m => m.repairType === selectedRepairType);
    }
    
    // Filtere nach Datumsbereich
    if (dateRange.start) {
      const startDate = new Date(dateRange.start);
      filtered = filtered.filter(m => new Date(m.completedAt || m.createdAt) >= startDate);
    }
    
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999); // Ende des Tages
      filtered = filtered.filter(m => new Date(m.completedAt || m.createdAt) <= endDate);
    }
    
    setFilteredMeldungen(filtered);
  }, [meldungen, searchTerm, selectedProperty, selectedUnit, selectedRepairType, dateRange]);

  // Alle Filter zurücksetzen
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedProperty('all');
    setSelectedUnit('all');
    setSelectedRepairType('all');
    setDateRange({ start: '', end: '' });
  };

  // Daten aktualisieren
  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      await fetchMeldungen();
      await fetchProperties();
      setError('');
    } catch (error) {
      setError('Fehler beim Aktualisieren der Daten');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Reparaturtypen
  const repairTypes = [
    {value: 'sanitaer', label: 'Sanitär'},
    {value: 'elektrik', label: 'Elektrik'}, 
    {value: 'heizung', label: 'Heizung'},
    {value: 'schreiner', label: 'Schreiner'}, 
    {value: 'malerarbeiten', label: 'Malerarbeiten'},
    {value: 'sonstiges', label: 'Sonstiges'}
  ];

  // Formatiert das Datum im deutschen Format
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return format(parseISO(dateString), 'dd.MM.yyyy', { locale: de });
  };

  // Handhabt den Seitenwechsel der Tabelle
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handhabt die Änderung der Zeilen pro Seite
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Berechnet die aktuell anzuzeigenden Meldungen basierend auf Pagination
  const currentMeldungen = filteredMeldungen.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Wohneinheiten für die ausgewählte Immobilie
  const availableUnits = selectedProperty !== 'all' 
    ? properties.find(p => p._id === selectedProperty)?.units || []
    : properties.flatMap(p => p.units || []) as Unit[];

  if (isLoading) {
    return (
      <MainLayout title="Aufträge" navigationItems={vermieterNavigationItems}>
        <Box 
          display="flex" 
          flexDirection="column"
          justifyContent="center" 
          alignItems="center" 
          minHeight="500px"
        >
          <CircularProgress sx={{ color: '#E67E22', mb: 3 }} />
          <Typography variant="body1" color="text.secondary">
            Aufträge werden geladen...
          </Typography>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Aufträge" navigationItems={vermieterNavigationItems}>
      {/* Header-Bereich */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            fontWeight: 700,
            mb: 1,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1.5
          }}
        >
          <CheckCircleIcon sx={{ color: '#E67E22', fontSize: '2rem' }} />
          Abgeschlossene Aufträge
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          Übersicht aller erledigten Reparaturen und Meldungen.
        </Typography>
      </Box>

      {/* Fehlermeldung */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            borderRadius: 2,
          }}
        >
          {error}
        </Alert>
      )}

      {/* Filter-Bereich */}
      <Paper 
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
          border: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Suchen..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'rgba(0,0,0,0.54)' }} />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setSearchTerm('')}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ bgcolor: 'background.paper' }}
            />
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Immobilie</InputLabel>
                  <Select
                    value={selectedProperty}
                    onChange={(e) => {
                      setSelectedProperty(e.target.value);
                      setSelectedUnit('all'); // Zurücksetzen der Wohneinheit
                    }}
                    label="Immobilie"
                    startAdornment={
                      <ApartmentIcon sx={{ ml: 1, mr: 1, color: 'rgba(0,0,0,0.54)' }} />
                    }
                  >
                    <MenuItem value="all">Alle Immobilien</MenuItem>
                    {properties.map((property) => (
                      <MenuItem key={property._id} value={property._id}>
                        {property.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Wohneinheit</InputLabel>
                  <Select
                    value={selectedUnit}
                    onChange={(e) => setSelectedUnit(e.target.value)}
                    label="Wohneinheit"
                    disabled={availableUnits.length === 0}
                    startAdornment={
                      <HomeIcon sx={{ ml: 1, mr: 1, color: 'rgba(0,0,0,0.54)' }} />
                    }
                  >
                    <MenuItem value="all">Alle Wohneinheiten</MenuItem>
                    {availableUnits.map((unit: Unit) => (
                      <MenuItem key={unit._id} value={unit._id}>
                        {unit.unitNumber}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Reparaturart</InputLabel>
                  <Select
                    value={selectedRepairType}
                    onChange={(e) => setSelectedRepairType(e.target.value)}
                    label="Reparaturart"
                    startAdornment={
                      <BuildIcon sx={{ ml: 1, mr: 1, color: 'rgba(0,0,0,0.54)' }} />
                    }
                  >
                    <MenuItem value="all">Alle Arten</MenuItem>
                    {repairTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Von Datum"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarTodayIcon sx={{ color: 'rgba(0,0,0,0.54)' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Bis Datum"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarTodayIcon sx={{ color: 'rgba(0,0,0,0.54)' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 2 }}>
              <Button 
                variant="outlined" 
                startIcon={<ClearIcon />}
                onClick={resetFilters}
                sx={{
                  borderColor: 'rgba(0,0,0,0.23)',
                  color: 'text.secondary',
                  '&:hover': {
                    borderColor: 'rgba(0,0,0,0.5)',
                    bgcolor: 'rgba(0,0,0,0.05)',
                  }
                }}
              >
                Filter zurücksetzen
              </Button>
              <Button
                variant="contained"
                startIcon={isRefreshing ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
                onClick={refreshData}
                disabled={isRefreshing}
                sx={{
                  bgcolor: '#E67E22',
                  '&:hover': {
                    bgcolor: '#D35400',
                  },
                }}
              >
                Aktualisieren
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Tabelle mit abgeschlossenen Aufträgen */}
      <Paper 
        elevation={0}
        sx={{
          borderRadius: 2, 
          overflow: 'hidden',
          border: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        <Box p={2} display="flex" justifyContent="space-between" alignItems="center" bgcolor="rgba(0,0,0,0.02)">
          <Typography variant="subtitle1" fontWeight={600}>
            Abgeschlossene Aufträge ({filteredMeldungen.length})
          </Typography>
        </Box>
        
        <Divider />
        
        <TableContainer sx={{ maxHeight: 'calc(100vh - 400px)' }}>
          <Table stickyHeader aria-label="Abgeschlossene Aufträge Tabelle">
            <TableHead>
              <TableRow>
                <TableCell width="30%">Auftrag</TableCell>
                <TableCell width="15%">Immobilie/Einheit</TableCell>
                <TableCell width="15%">Mieter</TableCell>
                <TableCell width="15%">Handwerker</TableCell>
                <TableCell width="15%">Abschlussdatum</TableCell>
                <TableCell width="10%" align="center">Aktion</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentMeldungen.length > 0 ? (
                currentMeldungen.map((meldung) => (
                  <TableRow 
                    key={meldung._id}
                    hover
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      '&:hover': {
                        bgcolor: 'rgba(0,0,0,0.02)',
                      }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {meldung.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 300 }}>
                          {meldung.description.length > 60
                            ? `${meldung.description.substring(0, 60)}...`
                            : meldung.description
                          }
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          {meldung.repairType && (
                            <Chip 
                              size="small"
                              label={repairTypes.find(type => type.value === meldung.repairType)?.label || meldung.repairType}
                              sx={{ 
                                bgcolor: 'rgba(230, 126, 34, 0.1)',
                                color: '#E67E22',
                                fontWeight: 500,
                                fontSize: '0.75rem',
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {meldung.unit && meldung.unit.property ? (
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {meldung.unit.property.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Einheit: {meldung.unit.unitNumber}
                          </Typography>
                        </Box>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {meldung.reporter ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar 
                            sx={{ 
                              width: 28, 
                              height: 28, 
                              bgcolor: 'rgba(230, 126, 34, 0.1)',
                              color: '#E67E22',
                              fontSize: '0.875rem',
                              fontWeight: 600,
                            }}
                          >
                            {meldung.reporter.firstName[0]}{meldung.reporter.lastName[0]}
                          </Avatar>
                          <Typography variant="body2">
                            {meldung.reporter.firstName} {meldung.reporter.lastName}
                          </Typography>
                        </Box>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {meldung.assignedTo ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar 
                            sx={{ 
                              width: 28, 
                              height: 28, 
                              bgcolor: 'rgba(52, 152, 219, 0.1)',
                              color: '#3498db',
                              fontSize: '0.875rem',
                              fontWeight: 600,
                            }}
                          >
                            {meldung.assignedTo.firstName[0]}{meldung.assignedTo.lastName[0]}
                          </Avatar>
                          <Typography variant="body2">
                            {meldung.assignedTo.firstName} {meldung.assignedTo.lastName}
                          </Typography>
                        </Box>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(meldung.completedAt || meldung.updatedAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Details anzeigen">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/vermieter/meldungen/${meldung._id}`)}
                          sx={{
                            color: '#E67E22',
                            '&:hover': {
                              bgcolor: 'rgba(230, 126, 34, 0.1)',
                            }
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      Keine abgeschlossenen Aufträge gefunden.
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Passen Sie Ihre Filterkriterien an oder erstellen Sie neue Meldungen.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredMeldungen.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Zeilen pro Seite:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} von ${count}`}
        />
      </Paper>
    </MainLayout>
  );
};

export default VermieterAuftraege;
