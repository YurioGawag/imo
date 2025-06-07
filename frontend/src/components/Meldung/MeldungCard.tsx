import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Avatar,
} from '@mui/material';
import { getStatusColor, getStatusText } from '../../constants/meldung';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { MeldungStatus } from '../../types/meldung.types';

interface MeldungCardProps {
  title: string;
  description: string;
  status: string;
  createdAt: string;
  onClick?: () => void;
  unreadMessages?: number;
  unitInfo?: {
    unitNumber: string;
    propertyName: string;
  };
  reporter?: {
    firstName: string;
    lastName: string;
  };
  statusColor?: string;
  statusText?: string;
}

export const MeldungCard: React.FC<MeldungCardProps> = ({
  title,
  description,
  status,
  createdAt,
  onClick,
  unreadMessages,
  unitInfo,
  reporter,
  statusColor,
  statusText,
}) => {
  const formattedDate = new Date(createdAt).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const timeAgo = formatDistanceToNow(new Date(createdAt), { 
    addSuffix: true,
    locale: de
  });

  return (
    <Card 
      sx={{ 
        cursor: onClick ? 'pointer' : 'default',
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        overflow: 'visible',
        position: 'relative',
        '&:hover': onClick ? { 
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
        } : {},
      }} 
      onClick={onClick}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2}>
          <Box flex={1}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 1.5, 
                fontWeight: 600,
                fontSize: '1.15rem',
                color: '#2D3436'
              }}
            >
              {title}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'rgba(0, 0, 0, 0.6)',
                mb: 2,
                lineHeight: 1.6,
                fontSize: '0.95rem',
              }}
            >
              {description}
            </Typography>
            
            <Box 
              sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 2, 
                alignItems: 'center', 
                mt: 2,
                color: 'rgba(0, 0, 0, 0.5)',
                fontSize: '0.85rem',
              }}
            >
              {unitInfo && (
                <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontSize: '0.85rem', color: 'rgba(0, 0, 0, 0.5)' }}>
                    {unitInfo.propertyName} - Einheit {unitInfo.unitNumber}
                  </Typography>
                </Box>
              )}
              
              {reporter && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar 
                    sx={{ 
                      width: 24, 
                      height: 24, 
                      fontSize: '0.75rem',
                      bgcolor: 'rgba(230, 126, 34, 0.1)',
                      color: '#E67E22',
                    }}
                  >
                    {reporter.firstName[0]}{reporter.lastName[0]}
                  </Avatar>
                  <Typography variant="body2" sx={{ fontSize: '0.85rem', color: 'rgba(0, 0, 0, 0.5)' }}>
                    {reporter.firstName} {reporter.lastName}
                  </Typography>
                </Box>
              )}
              
              <Typography 
                variant="body2" 
                sx={{ 
                  fontSize: '0.85rem', 
                  color: 'rgba(0, 0, 0, 0.5)',
                  fontStyle: 'italic'
                }}
              >
                {timeAgo}
              </Typography>
            </Box>
          </Box>
          
          <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1.5}>
            <Chip 
              label={statusText || getStatusText(status)}
              sx={{ 
                bgcolor: statusColor || getStatusColor(status),
                color: 'white',
                fontWeight: 500,
                borderRadius: '12px',
                px: 1,
                '& .MuiChip-label': {
                  px: 1,
                }
              }}
            />
            
            {unreadMessages && unreadMessages > 0 && (
              <Chip
                label={`${unreadMessages} neue Nachrichten`}
                sx={{
                  background: 'linear-gradient(135deg, #FF8E53 0%, #E67E22 100%)',
                  color: 'white',
                  fontWeight: 500,
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(230, 126, 34, 0.2)',
                  '& .MuiChip-label': {
                    px: 1,
                  }
                }}
                size="small"
              />
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
