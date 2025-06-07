import React, { useEffect, useState } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Box,
} from '@mui/material';
import { api } from '../../utils/api';

interface Property {
  _id: string;
  name: string;
}

interface PropertySelectorProps {
  onPropertyChange?: (propertyId: string) => void;
}

export const PropertySelector: React.FC<PropertySelectorProps> = ({ onPropertyChange }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await api.get('/vermieter/properties');
        setProperties(response.data);
        
        // Setze die gespeicherte Property oder die erste verfügbare
        const savedPropertyId = localStorage.getItem('activePropertyId');
        if (savedPropertyId && response.data.some((p: Property) => p._id === savedPropertyId)) {
          setSelectedProperty(savedPropertyId);
        } else if (response.data.length > 0) {
          setSelectedProperty(response.data[0]._id);
          localStorage.setItem('activePropertyId', response.data[0]._id);
          onPropertyChange?.(response.data[0]._id);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [onPropertyChange]);

  const handleChange = (event: SelectChangeEvent<string>) => {
    const propertyId = event.target.value;
    setSelectedProperty(propertyId);
    localStorage.setItem('activePropertyId', propertyId);
    onPropertyChange?.(propertyId);
  };

  if (loading || properties.length === 0) {
    return null;
  }

  return (
    <Box sx={{ minWidth: 200, mr: 2 }}>
      <FormControl fullWidth size="small">
        <InputLabel>Immobilie</InputLabel>
        <Select
          value={selectedProperty}
          label="Immobilie"
          onChange={handleChange}
        >
          {properties.map((property) => (
            <MenuItem key={property._id} value={property._id}>
              {property.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
