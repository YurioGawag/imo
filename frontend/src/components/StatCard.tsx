import React from 'react';
import { Box, Card, Typography, SvgIconProps } from '@mui/material';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import ApartmentIcon from '@mui/icons-material/Apartment';
import PercentIcon from '@mui/icons-material/Percent';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PaymentsIcon from '@mui/icons-material/Payments';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ConstructionIcon from '@mui/icons-material/Construction';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactElement<SvgIconProps>;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  subtitle,
  icon,
  color = '#4299E1' // Default blue color
}) => {
  // Determine icon based on title if not provided
  const getIconByTitle = () => {
    if (icon) return icon;
    
    const titleLower = title.toLowerCase();
    if (titleLower.includes('immobilie')) return <HomeWorkIcon />;
    if (titleLower.includes('wohneinheit')) return <ApartmentIcon />;
    if (titleLower.includes('rate') || titleLower.includes('prozent')) return <PercentIcon />;
    if (titleLower.includes('meldung')) return <NotificationsActiveIcon />;
    if (titleLower.includes('mieter')) return <PeopleAltIcon />;
    if (titleLower.includes('einkommen') || titleLower.includes('einnahme')) return <PaymentsIcon />;
    if (titleLower.includes('vertrag')) return <AssignmentIcon />;
    if (titleLower.includes('reparatur') || titleLower.includes('wartung')) return <ConstructionIcon />;
    
    // Default icon
    return <HomeWorkIcon />;
  };

  // Get gradient based on color
  const getGradient = () => {
    const gradients: Record<string, string> = {
      '#4299E1': 'linear-gradient(135deg, #63B3ED 0%, #4299E1 100%)', // Blue
      '#38B2AC': 'linear-gradient(135deg, #4FD1C5 0%, #38B2AC 100%)', // Teal
      '#ED8936': 'linear-gradient(135deg, #F6AD55 0%, #ED8936 100%)', // Orange
      '#9F7AEA': 'linear-gradient(135deg, #B794F4 0%, #9F7AEA 100%)', // Purple
      '#48BB78': 'linear-gradient(135deg, #68D391 0%, #48BB78 100%)', // Green
      '#E53E3E': 'linear-gradient(135deg, #FC8181 0%, #E53E3E 100%)', // Red
    };
    
    return gradients[color] || gradients['#4299E1'];
  };

  return (
    <Card
      sx={{
        height: '100%',
        p: 3,
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
        },
      }}
    >
      {/* Background decoration */}
      <Box 
        sx={{ 
          position: 'absolute',
          top: -20,
          right: -20,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: getGradient(),
          opacity: 0.07,
        }} 
      />
      
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 2,
            gap: 1.5
          }}
        >
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: 42,
              height: 42,
              borderRadius: 2,
              background: getGradient(),
              color: 'white',
              boxShadow: `0 4px 12px ${color}40`,
            }}
          >
            {getIconByTitle()}
          </Box>
          <Typography 
            variant="subtitle1" 
            component="div" 
            sx={{ 
              fontWeight: 600,
              color: '#2D3436',
              fontSize: '1rem',
            }}
          >
            {title}
          </Typography>
        </Box>
        
        <Typography 
          variant="h4" 
          component="div" 
          sx={{ 
            fontWeight: 700,
            fontSize: '2.2rem',
            color: '#2D3436',
            mb: 0.5,
          }}
        >
          {value}
        </Typography>
        
        {subtitle && (
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(0, 0, 0, 0.6)',
              fontSize: '0.95rem',
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Card>
  );
};
