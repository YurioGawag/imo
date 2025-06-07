import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  CircularProgress,
  SelectChangeEvent,
} from '@mui/material';
import api from '../../services/api';

interface Unit {
  _id: string;
  unitNumber: string;
  property: {
    _id: string;
    name: string;
  };
  status: string;
  currentTenant?: string | any; // ID des aktuellen Mieters, optional
}

interface AssignUnitFormProps {
  onSubmit: (unitId: string) => void;
  onCancel: () => void;
}

function AssignUnitForm({ onSubmit, onCancel }: AssignUnitFormProps) {
  const [unitId, setUnitId] = useState('');
  const [units, setUnits] = useState<Array<Unit>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch available units
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        setLoading(true);
        // API request using axios instance with auth headers
        const response = await api.get('/units/available', {
          params: { includeOccupied: 'true' },
        });
        const data = response.data;
        setUnits(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching units:', error);
        // Ensure units is always an array
        setUnits([]);
        setError('Fehler beim Laden der verfügbaren Wohneinheiten');
      } finally {
        setLoading(false);
      }
    };

    fetchUnits();
  }, []);

  const handleChange = (event: SelectChangeEvent) => {
    setUnitId(event.target.value);
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitId) {
      setError('Bitte wählen Sie eine Wohneinheit aus');
      return;
    }
    
    // Prüfen, ob die Wohnung bereits belegt ist
    try {
      const response = await api.get(`/units/${unitId}/check-occupied`);
      const data = response.data;
      if (data.isOccupied) {
        setError('Diese Wohneinheit ist bereits belegt');
        return;
      }
    } catch (error) {
      console.error('Error checking unit status:', error);
      // Fallback zur lokalen Prüfung, falls API-Aufruf fehlschlägt
      const selectedUnit = units.find(unit => unit._id === unitId);
      if (selectedUnit && (selectedUnit.status === 'occupied' || selectedUnit.currentTenant)) {
        setError('Diese Wohneinheit ist bereits belegt');
        return;
      }
    }
    
    onSubmit(unitId);
  };

  // Group units by property for better organization
  const groupedUnits = units.reduce((acc, unit) => {
    const propertyId = unit.property._id;
    if (!acc[propertyId]) {
      acc[propertyId] = {
        propertyName: unit.property.name,
        units: []
      };
    }
    acc[propertyId].units.push(unit);
    return acc;
  }, {} as Record<string, { propertyName: string; units: Unit[] }>);

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : units.length === 0 ? (
        <Typography color="error">
          Keine verfügbaren Wohneinheiten gefunden. Bitte fügen Sie zuerst Wohneinheiten hinzu.
        </Typography>
      ) : (
        <FormControl fullWidth error={!!error}>
          <InputLabel id="unit-select-label">Wohneinheit</InputLabel>
          <Select
            labelId="unit-select-label"
            value={unitId}
            onChange={handleChange}
            label="Wohneinheit"
          >
            {Array.isArray(units) && Object.values(groupedUnits).map(group => [
              <MenuItem key={group.propertyName} disabled divider>
                <Typography variant="subtitle2">{group.propertyName}</Typography>
              </MenuItem>,
              ...group.units.map(unit => (
                <MenuItem 
                  key={unit._id} 
                  value={unit._id}
                  disabled={unit.status === 'occupied' || !!unit.currentTenant}
                >
                  Wohnung {unit.unitNumber} - {unit.status === 'vacant' && !unit.currentTenant ? 'Frei' : 'Belegt'}
                </MenuItem>
              ))
            ])}
          </Select>
          {error && <FormHelperText>{error}</FormHelperText>}
        </FormControl>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button onClick={onCancel} sx={{ mr: 1 }}>
          Abbrechen
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading || units.length === 0}
        >
          Zuweisen
        </Button>
      </Box>
    </Box>
  );
};

export default AssignUnitForm;
