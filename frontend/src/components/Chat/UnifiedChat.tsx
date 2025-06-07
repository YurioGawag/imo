// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useState, useEffect, useRef } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Divider,
  Button,
} from '@mui/material';
import { Send as SendIcon, PictureAsPdf as PictureAsPdfIcon } from '@mui/icons-material';
import { messagesService } from '../../services/messages.service';
import api from '../../services/api';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface ChatPartner {
  id: string;
  firstName: string;
  lastName: string;
  role: 'mieter' | 'vermieter' | 'handwerker';
}

interface UnifiedChatProps {
  meldungId: string;
  currentUserRole: 'mieter' | 'vermieter' | 'handwerker';
  availableChatPartners: ChatPartner[];
  defaultPartnerRole?: 'mieter' | 'vermieter' | 'handwerker';
}

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  receiver: {
    userId: {
      _id: string;
      firstName: string;
      lastName: string;
    };
    role: string;
  };
  senderRole: string;
  createdAt: string;
}

export const UnifiedChat: React.FC<UnifiedChatProps> = ({
  meldungId,
  currentUserRole,
  availableChatPartners,
  defaultPartnerRole
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPartnerRole, setSelectedPartnerRole] = useState<'mieter' | 'vermieter' | 'handwerker' | null>(
    defaultPartnerRole || (availableChatPartners.length > 0 ? availableChatPartners[0].role : null)
  );

  const fetchMessages = async () => {
    if (!selectedPartnerRole) return;

    try {
      setLoading(true);
      const response = await api.get(`/messages/${meldungId}`);
      console.log('API Response:', response);
      
      // Filtere Nachrichten basierend auf dem ausgewählten Partner
      const filteredMessages = response.data.messages.filter((msg: Message) => {
        console.log('Prüfe Nachricht:', {
          senderRole: msg.senderRole,
          receiverRole: msg.receiver?.role,
          selectedPartnerRole,
          currentUserRole,
          msg
        });

        return (
          // Nachricht vom ausgewählten Partner an mich
          (msg.senderRole === selectedPartnerRole && msg.receiver?.role === currentUserRole) ||
          // Meine Nachricht an den ausgewählten Partner
          (msg.senderRole === currentUserRole && msg.receiver?.role === selectedPartnerRole)
        );
      });

      console.log('Gefilterte Nachrichten:', filteredMessages);
      setMessages(filteredMessages);
    } catch (error) {
      console.error('Fehler beim Abrufen der Nachrichten:', error);
    } finally {
      setLoading(false);
    }
  };

  // Effekt für initiales Laden und Polling
  useEffect(() => {
    if (selectedPartnerRole && meldungId) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedPartnerRole, meldungId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedPartnerRole) return;

    try {
      const response = await api.post('/messages', {
        content: newMessage,
        meldungId,
        receiverRole: selectedPartnerRole
      });
      console.log('Nachricht gesendet:', response.data);
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Fehler beim Senden der Nachricht:', error);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const getCurrentPartner = () => {
    return availableChatPartners.find(partner => partner.role === selectedPartnerRole);
  };

  const handleExport = async () => {
    try {
      const blob = await messagesService.exportConversation(meldungId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversation_${meldungId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Fehler beim Export der Konversation:', error);
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      <CardContent sx={{ p: 2, flex: '0 0 auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" component="div">
            Chat
          </Typography>
          <Button variant="outlined" size="small" startIcon={<PictureAsPdfIcon />} onClick={handleExport}>
            PDF Export
          </Button>
        </Box>
        <FormControl fullWidth size="small">
          <InputLabel>Chat Partner</InputLabel>
          <Select
            value={selectedPartnerRole || ''}
            onChange={(e) => setSelectedPartnerRole(e.target.value as 'mieter' | 'vermieter' | 'handwerker')}
            label="Chat Partner"
          >
            {availableChatPartners.map((partner) => (
              <MenuItem key={partner.id} value={partner.role}>
                {partner.firstName} {partner.lastName} ({partner.role})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </CardContent>
      <Divider />
      <Box sx={{ 
        flex: 1, 
        overflowY: 'auto',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        bgcolor: '#f5f5f5'
      }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : messages.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography color="textSecondary">
              Noch keine Nachrichten
            </Typography>
          </Box>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.senderRole === currentUserRole;
            return (
              <Box
                key={message._id}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isOwnMessage ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  alignSelf: isOwnMessage ? 'flex-end' : 'flex-start',
                }}
              >
                <Box
                  sx={{
                    bgcolor: isOwnMessage ? 'primary.main' : 'white',
                    color: isOwnMessage ? 'white' : 'text.primary',
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    boxShadow: 1,
                  }}
                >
                  <Typography variant="body1">{message.content}</Typography>
                </Box>
                <Typography 
                  variant="caption" 
                  color="textSecondary"
                  sx={{ mt: 0.5 }}
                >
                  {`${message.sender.firstName} ${message.sender.lastName} • ${
                    format(new Date(message.createdAt), 'dd.MM.yyyy HH:mm', { locale: de })
                  }`}
                </Typography>
              </Box>
            );
          })
        )}
      </Box>
      <Divider />
      <CardContent sx={{ p: 2, flex: '0 0 auto' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Nachricht eingeben..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={!selectedPartnerRole}
          />
          <IconButton 
            color="primary" 
            onClick={handleSendMessage}
            disabled={!selectedPartnerRole || !newMessage.trim()}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};
