import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper,
  Button,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import AppsIcon from '@mui/icons-material/Apps';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import DescriptionIcon from '@mui/icons-material/Description';
import api from '../services/api';

// Logo-Komponente
const Logo: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      mb: 5,
      textDecoration: 'none',
      color: 'inherit',
    }}
    component={Link}
    to="/"
  >
    <Box
      sx={{
        width: 42,
        height: 42,
        background: 'linear-gradient(135deg, #FF8E53 0%, #E67E22 100%)',
        borderRadius: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(230, 126, 34, 0.15)',
        transition: 'transform 0.2s ease',
        '&:hover': {
          transform: 'scale(1.05)',
        },
        '& .MuiSvgIcon-root': {
          color: 'white',
          fontSize: '1.6rem',
        }
      }}
    >
      <AppsIcon />
    </Box>
    <Typography
      variant="h4"
      component="span"
      sx={{
        fontWeight: 700,
        fontSize: '2rem',
        background: 'linear-gradient(135deg, #FF8E53 0%, #E67E22 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        letterSpacing: '-0.01em',
      }}
    >
      Immofox
    </Typography>
  </Box>
);

// Hauptkomponente
export const Kontakt: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    propertiesCount: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('Bitte geben Sie Ihren Vornamen ein');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Bitte geben Sie Ihren Nachnamen ein');
      return false;
    }
    if (!formData.email.trim() || !validateEmail(formData.email)) {
      setError('Bitte geben Sie eine gültige E-Mail-Adresse ein');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Bitte geben Sie Ihre Telefonnummer ein');
      return false;
    }
    if (!formData.message.trim()) {
      setError('Bitte beschreiben Sie Ihr Anliegen');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      
      // API-Aufruf, um die Anfrage zu senden
      await api.post('/contact/vermieter-request', formData);
      
      setSuccess(true);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        propertiesCount: '',
        message: ''
      });
      
      // Nach 3 Sekunden zur Startseite navigieren
      setTimeout(() => {
        navigate('/');
      }, 3000);
      
    } catch (error: any) {
      console.error('Fehler beim Senden der Anfrage:', error);
      setError(error.response?.data?.message || 'Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
      }}
    >
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Logo />
          <Typography
            variant="h4"
            sx={{ 
              maxWidth: '600px',
              mx: 'auto',
              mb: 2,
              fontSize: { xs: '2.2rem', md: '2.5rem' },
              lineHeight: 1.2,
              color: '#2D3436',
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            Werden Sie Teil von Immofox
          </Typography>
          <Typography
            variant="h6"
            sx={{ 
              maxWidth: '700px',
              mx: 'auto',
              mb: 6,
              fontSize: '1.15rem',
              lineHeight: 1.6,
              color: 'rgba(0, 0, 0, 0.6)',
              fontWeight: 400,
              letterSpacing: '-0.01em',
            }}
          >
            Interesse an unserer Immobilienverwaltungslösung? Füllen Sie das Formular aus und unser Team wird sich innerhalb von 24 Stunden bei Ihnen melden.
          </Typography>
        </Box>

        <Paper
          component="form"
          onSubmit={handleSubmit}
          elevation={0}
          sx={{
            p: 4.5,
            borderRadius: 3,
            background: '#fff',
            width: '100%',
            mx: 'auto',
            boxShadow: '0 2px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
          }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField 
                fullWidth
                required
                label="Vorname"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <PersonIcon sx={{ mr: 1, color: '#E67E22', opacity: 0.7 }} />
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
                fullWidth
                required
                label="Nachname"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <PersonIcon sx={{ mr: 1, color: '#E67E22', opacity: 0.7 }} />
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
                fullWidth
                required
                label="E-Mail"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <EmailIcon sx={{ mr: 1, color: '#E67E22', opacity: 0.7 }} />
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
                fullWidth
                required
                label="Telefon"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <PhoneIcon sx={{ mr: 1, color: '#E67E22', opacity: 0.7 }} />
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
                fullWidth
                label="Unternehmen (optional)"
                name="company"
                value={formData.company}
                onChange={handleChange}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <BusinessIcon sx={{ mr: 1, color: '#E67E22', opacity: 0.7 }} />
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
                fullWidth
                label="Anzahl der Immobilien (optional)"
                name="propertiesCount"
                type="number"
                value={formData.propertiesCount}
                onChange={handleChange}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <BusinessIcon sx={{ mr: 1, color: '#E67E22', opacity: 0.7 }} />
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
                fullWidth
                required
                label="Ihre Nachricht"
                name="message"
                value={formData.message}
                onChange={handleChange}
                variant="outlined"
                multiline
                rows={4}
                InputProps={{
                  startAdornment: (
                    <DescriptionIcon sx={{ mr: 1, mt: 1, color: '#E67E22', opacity: 0.7 }} />
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/')}
                sx={{
                  color: 'rgba(0, 0, 0, 0.6)',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  }
                }}
              >
                Zurück
              </Button>
              <Button
                type="submit"
                variant="contained"
                endIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                disabled={isLoading}
                sx={{
                  py: 1.5,
                  px: 3,
                  backgroundColor: '#E67E22',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  boxShadow: '0 4px 6px rgba(230, 126, 34, 0.2)',
                  '&:hover': {
                    backgroundColor: '#D35400',
                    boxShadow: '0 6px 8px rgba(230, 126, 34, 0.3)',
                  }
                }}
              >
                {isLoading ? 'Wird gesendet...' : 'Anfrage senden'}
              </Button>
            </Grid>
          </Grid>
        </Paper>
        
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.5)' }}>
            Bereits ein Konto? <Link to="/login" style={{ color: '#E67E22', textDecoration: 'none', fontWeight: 500 }}>Anmelden</Link>
          </Typography>
        </Box>
      </Container>
      
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message="Ihre Anfrage wurde erfolgreich gesendet. Wir melden uns in Kürze bei Ihnen."
        sx={{
          '& .MuiSnackbarContent-root': {
            backgroundColor: '#2F855A',
            fontWeight: 500,
            borderRadius: 2
          }
        }}
      />
    </Box>
  );
};

export default Kontakt;
