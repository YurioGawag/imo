import React from 'react';
import { Box, Typography, Chip, List, ListItem, ListItemText } from '@mui/material';

export interface MessageItem {
  unit: string;
  date: string;
  message: string;
  status: 'Waiting' | 'Responded' | 'Overdue';
}

const statusColor: Record<MessageItem['status'], string> = {
  Waiting: '#ff9800',
  Responded: '#4caf50',
  Overdue: '#f44336',
};

export const TenantTimeline: React.FC<{ items: MessageItem[] }> = ({ items }) => (
  <List sx={{ width: '100%' }}>
    {items.map((item, idx) => (
      <ListItem key={idx} alignItems="flex-start" divider>
        <ListItemText
          primary={
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography fontWeight={600}>{item.unit}</Typography>
              <Chip
                label={item.status}
                size="small"
                sx={{ bgcolor: statusColor[item.status], color: 'white' }}
              />
            </Box>
          }
          secondary={`${item.date} – ${item.message}`}
        />
      </ListItem>
    ))}
  </List>
);
