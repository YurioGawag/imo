import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  Chip,
  CircularProgress,
  Grid
} from '@mui/material';
import api from '../../services/api';
import { Notification, NotificationType, NotificationPriority } from '../../types/notification.types';
import { format } from 'date-fns';
import { MainLayout } from '../../components/Layout/MainLayout';
import { navigationItems } from './mieterNavigation';
import { useAuthStore } from '../../store/auth.store';

const MieterBenachrichtigungen: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  const fetchNotifications = async () => {
    try {
      console.log('Fetching notifications for tenant');
      const response = await api.get('notifications/tenant');
      console.log('Notifications response:', response.data);
      setNotifications(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      const data = await fetchNotifications();
      if (data && user) {
        data.forEach((n: any) => {
          if (!n.readBy?.some((r: any) => r.user === user._id)) {
            api.put(`notifications/${n._id}/read`).catch(() => {});
          }
        });
      }
    };
    load();
  }, []);

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case NotificationPriority.HIGH:
      case NotificationPriority.URGENT:
        return 'error';
      case NotificationPriority.MEDIUM:
        return 'warning';
      case NotificationPriority.LOW:
        return 'info';
      default:
        return 'default';
    }
  };

  const getTypeLabel = (type: NotificationType) => {
    switch (type) {
      case NotificationType.MAINTENANCE:
        return 'Wartung';
      case NotificationType.ANNOUNCEMENT:
        return 'Ankündigung';
      case NotificationType.EVENT:
        return 'Veranstaltung';
      case NotificationType.EMERGENCY:
        return 'Notfall';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Benachrichtigungen" navigationItems={navigationItems}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Benachrichtigungen" navigationItems={navigationItems}>
      <Container maxWidth="lg">
        {notifications.length === 0 ? (
          <Typography variant="body1" align="center" color="text.secondary">
            Keine Benachrichtigungen vorhanden
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {notifications.map((notification) => (
              <Grid item xs={12} key={notification._id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" component="div">
                        {notification.title}
                      </Typography>
                      <Chip
                        label={format(new Date(notification.createdAt), 'dd.MM.yyyy HH:mm')}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {notification.message}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        {notification.createdBy && (
                          <Typography variant="body2" color="text.secondary">
                            Von: {notification.createdBy.firstName} {notification.createdBy.lastName}
                          </Typography>
                        )}
                        {notification.date && (
                          <Typography variant="body2" color="text.secondary">
                            Termin: {format(new Date(notification.date), 'dd.MM.yyyy HH:mm')}
                          </Typography>
                        )}
                      </Box>
                      <Box>
                        <Chip
                          label={getTypeLabel(notification.type)}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          label={notification.priority}
                          size="small"
                          color={getPriorityColor(notification.priority)}
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </MainLayout>
  );
};

export default MieterBenachrichtigungen;
