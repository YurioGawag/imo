import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  IconButton,
  Box,
} from '@mui/material';
import {
  Report as ReportIcon,
  Message as MessageIcon,
  Payment as PaymentIcon,
  Event as EventIcon,
  DoneAll as DoneAllIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { Notification, NotificationType } from '../../types/notification';

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onNotificationClick: (notification: Notification) => void;
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case NotificationType.NEW_MELDUNG:
    case NotificationType.MELDUNG_STATUS_CHANGE:
      return <ReportIcon />;
    case NotificationType.NEW_MESSAGE:
      return <MessageIcon />;
    case NotificationType.PAYMENT_DUE:
      return <PaymentIcon />;
    case NotificationType.LEASE_ENDING:
      return <EventIcon />;
    default:
      return <ReportIcon />;
  }
};

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onMarkAsRead,
  onNotificationClick,
}) => {
  return (
    <List>
      {notifications.map((notification) => (
        <ListItem
          key={notification._id}
          sx={{
            bgcolor: notification.read ? 'transparent' : 'action.hover',
            '&:hover': {
              bgcolor: 'action.selected',
            },
          }}
          secondaryAction={
            !notification.read && (
              <IconButton
                edge="end"
                aria-label="mark as read"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(notification._id);
                }}
              >
                <DoneAllIcon />
              </IconButton>
            )
          }
          onClick={() => onNotificationClick(notification)}
        >
          <ListItemIcon>{getNotificationIcon(notification.type)}</ListItemIcon>
          <ListItemText
            primary={notification.title}
            secondary={
              <Box component="span">
                <Typography
                  component="span"
                  variant="body2"
                  color="text.primary"
                  sx={{ display: 'block' }}
                >
                  {notification.message}
                </Typography>
                <Typography
                  component="span"
                  variant="caption"
                  color="text.secondary"
                >
                  {formatDistanceToNow(new Date(notification.createdAt), {
                    addSuffix: true,
                    locale: de,
                  })}
                </Typography>
              </Box>
            }
          />
        </ListItem>
      ))}
      {notifications.length === 0 && (
        <ListItem>
          <ListItemText
            primary="Keine Benachrichtigungen"
            secondary="Sie haben keine ungelesenen Benachrichtigungen"
          />
        </ListItem>
      )}
    </List>
  );
};
