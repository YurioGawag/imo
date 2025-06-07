import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Alert,
  Paper,
  SelectChangeEvent
} from '@mui/material';
import { CreateUserData } from '../../services/user.service';
import api from '../../services/api';
import { UserRole } from '../../types/auth';

interface CreateUserFormProps {
  onSubmit: (userData: CreateUserData) => void;
  onCancel: () => void;
}

function CreateUserForm({ onSubmit, onCancel }: CreateUserFormProps) {
  const [formData, setFormData] = useState<CreateUserData>({
    email: '',
    firstName: '',
    lastName: '',
    role: UserRole.MIETER,
    phone: '',
    unitId: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showUnitField, setShowUnitField] = useState(true);
  const [units, setUnits] = useState<Array<{ _id: string, unitNumber: string, property: { name: string } }>>([]);
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState('');

  // Fetch available units for tenant assignment
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        setLoading(true);
        // API request using axios instance with auth headers
        const response = await api.get('/units/available');
        const data = response.data;
        setUnits(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching units:', error);
        // Ensure units is always an array
        setUnits([]);
      } finally {
        setLoading(false);
      }
    };

    if (formData.role === UserRole.MIETER) {
      fetchUnits();
    } else {
      // Set empty array if not a tenant
      setUnits([]);
    }
  }, [formData.role]);

  // Update UI based on selected role
  useEffect(() => {
    setShowUnitField(formData.role === UserRole.MIETER);
    
    // Clear unit selection if not a tenant
    if (formData.role !== UserRole.MIETER) {
      setFormData(prev => ({ ...prev, unitId: '' }));
    }
  }, [formData.role]);

  // Handle text field changes
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!name) return;
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // Handle select field changes
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    if (!name) return;
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Required fields
    if (!formData.email) newErrors.email = 'E-Mail ist erforderlich';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Ungültige E-Mail-Adresse';
    
    if (!formData.firstName) newErrors.firstName = 'Vorname ist erforderlich';
    if (!formData.lastName) newErrors.lastName = 'Nachname ist erforderlich';
    
    // Unit is required for tenants
    if (formData.role === UserRole.MIETER && !formData.unitId) {
      newErrors.unitId = 'Wohneinheit ist erforderlich für Mieter';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      setLoading(true);
      await onSubmit(formData);
      // The response with temporary password is handled by the parent component
      setSubmitSuccess(true);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      {submitSuccess ? (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" color="primary" gutterBottom>
            Benutzer erfolgreich erstellt
          </Typography>
          <Alert severity="success" sx={{ mb: 2 }}>
            Ein temporäres Passwort wurde generiert und an den Benutzer gesendet.
          </Alert>
          <Typography variant="body1" gutterBottom>
            <strong>Temporäres Passwort:</strong> {temporaryPassword}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Bitte notieren Sie sich dieses Passwort, es wird nur einmal angezeigt.
          </Typography>
          <Box sx={{ mt: 3 }}>
            <Button onClick={onCancel} variant="contained">
              Schließen
            </Button>
          </Box>
        </Paper>
      ) : (
        <>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="firstName"
                label="Vorname"
                fullWidth
                value={formData.firstName}
                onChange={handleTextChange}
                error={!!errors.firstName}
                helperText={errors.firstName}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="lastName"
                label="Nachname"
                fullWidth
                value={formData.lastName}
                onChange={handleTextChange}
                error={!!errors.lastName}
                helperText={errors.lastName}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="email"
                label="E-Mail"
                fullWidth
                value={formData.email}
                onChange={handleTextChange}
                error={!!errors.email}
                helperText={errors.email}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="phone"
                label="Telefon"
                fullWidth
                value={formData.phone}
                onChange={handleTextChange}
                error={!!errors.phone}
                helperText={errors.phone}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel id="role-label">Rolle</InputLabel>
                <Select
                  labelId="role-label"
                  name="role"
                  value={formData.role}
                  label="Rolle"
                  onChange={handleSelectChange}
                >
                  <MenuItem value={UserRole.MIETER}>Mieter</MenuItem>
                  <MenuItem value={UserRole.HANDWERKER}>Handwerker</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {showUnitField && (
              <Grid item xs={12}>
                <FormControl fullWidth required error={!!errors.unitId}>
                  <InputLabel id="unit-label">Wohneinheit</InputLabel>
                  <Select
                    labelId="unit-label"
                    name="unitId"
                    value={formData.unitId}
                    label="Wohneinheit"
                    onChange={handleSelectChange}
                    disabled={loading}
                  >
                    {Array.isArray(units) ? units.map(unit => (
                      <MenuItem key={unit._id} value={unit._id}>
                        {unit.property.name} - Wohnung {unit.unitNumber}
                      </MenuItem>
                    )) : null}
                  </Select>
                  {errors.unitId && <FormHelperText>{errors.unitId}</FormHelperText>}
                </FormControl>
              </Grid>
            )}
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button onClick={onCancel} sx={{ mr: 1 }}>
              Abbrechen
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Wird erstellt...' : 'Benutzer erstellen'}
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default CreateUserForm;
