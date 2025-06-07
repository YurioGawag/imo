import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Paper,
  Avatar,
  Badge,
  Tooltip,
  useTheme,
  Tab,
  Tabs,
  useMediaQuery,
  Button,
} from '@mui/material';
import {
  Send as SendIcon,
  Person as PersonIcon,
  Handyman as HandymanIcon,
  Chat as ChatIcon,
  ArrowBack as ArrowBackIcon,
  PictureAsPdf as PictureAsPdfIcon,
} from '@mui/icons-material';
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

interface SplitChatProps {
  meldungId: string;
  currentUserRole: 'mieter' | 'vermieter' | 'handwerker';
  mieterPartner?: ChatPartner;
  handwerkerPartner?: ChatPartner;
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

// Komponente für einen einzelnen Chat-Bereich
const ChatArea: React.FC<{
  title: string;
  icon: React.ReactNode;
  messages: Message[];
  loading: boolean;
  newMessage: string;
  setNewMessage: (message: string) => void;
  handleSendMessage: () => void;
  partnerName: string;
  isDisabled?: boolean;
  color?: string;
}> = ({
  title,
  icon,
  messages,
  loading,
  newMessage,
  setNewMessage,
  handleSendMessage,
  partnerName,
  isDisabled = false,
  color = 'primary.main',
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  // Scroll zum Ende der Nachrichten, wenn neue Nachrichten hinzugefügt werden
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        bgcolor: 'background.paper',
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        opacity: isDisabled ? 0.7 : 1,
      }}
    >
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: `${color}15`,
        }}
      >
        <Avatar sx={{ bgcolor: color, width: 32, height: 32 }}>
          {icon}
        </Avatar>
        <Typography variant="subtitle1" fontWeight={600}>
          {title} - {partnerName}
        </Typography>
      </Box>
      
      <Box 
        sx={{ 
          flex: 1, 
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          bgcolor: '#f5f5f5',
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress size={24} sx={{ color: color }} />
          </Box>
        ) : messages.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography color="textSecondary">
              Noch keine Nachrichten
            </Typography>
          </Box>
        ) : (
          <>
            {messages.map((message) => {
              const isOwnMessage = message.senderRole === 'vermieter';
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
                      bgcolor: isOwnMessage ? color : 'white',
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
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </Box>
      
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={isDisabled ? "Kein Chat-Partner verfügbar" : "Nachricht eingeben..."}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isDisabled}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
          <IconButton 
            color="primary" 
            onClick={handleSendMessage}
            disabled={isDisabled || !newMessage.trim()}
            sx={{ 
              bgcolor: `${color}15`,
              '&:hover': {
                bgcolor: `${color}25`,
              },
              '&.Mui-disabled': {
                bgcolor: 'rgba(0, 0, 0, 0.05)',
              }
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Card>
  );
};

// Mobile-Ansicht mit Tabs für die Chats
const MobileChatView: React.FC<{
  mieterMessages: Message[];
  handwerkerMessages: Message[];
  mieterLoading: boolean;
  handwerkerLoading: boolean;
  mieterNewMessage: string;
  handwerkerNewMessage: string;
  setMieterNewMessage: (message: string) => void;
  setHandwerkerNewMessage: (message: string) => void;
  handleSendMieterMessage: () => void;
  handleSendHandwerkerMessage: () => void;
  mieterPartner?: ChatPartner;
  handwerkerPartner?: ChatPartner;
}> = ({
  mieterMessages,
  handwerkerMessages,
  mieterLoading,
  handwerkerLoading,
  mieterNewMessage,
  handwerkerNewMessage,
  setMieterNewMessage,
  setHandwerkerNewMessage,
  handleSendMieterMessage,
  handleSendHandwerkerMessage,
  mieterPartner,
  handwerkerPartner,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="Chat Tabs"
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
            },
          }}
        >
          <Tab 
            icon={<PersonIcon />} 
            label="Mieter" 
            id="chat-tab-0"
            aria-controls="chat-tabpanel-0"
            sx={{ 
              color: tabValue === 0 ? theme.palette.primary.main : 'inherit',
            }}
          />
          <Tab 
            icon={<HandymanIcon />} 
            label="Handwerker" 
            id="chat-tab-1"
            aria-controls="chat-tabpanel-1"
            disabled={!handwerkerPartner}
            sx={{ 
              color: tabValue === 1 ? '#FF8E53' : 'inherit',
            }}
          />
        </Tabs>
      </Box>
      <Box
        role="tabpanel"
        hidden={tabValue !== 0}
        id="chat-tabpanel-0"
        aria-labelledby="chat-tab-0"
        sx={{ height: 'calc(100% - 48px)', display: tabValue === 0 ? 'block' : 'none' }}
      >
        {mieterPartner && (
          <ChatArea
            title="Chat mit Mieter"
            icon={<PersonIcon fontSize="small" />}
            messages={mieterMessages}
            loading={mieterLoading}
            newMessage={mieterNewMessage}
            setNewMessage={setMieterNewMessage}
            handleSendMessage={handleSendMieterMessage}
            partnerName={mieterPartner ? `${mieterPartner.firstName} ${mieterPartner.lastName}` : ''}
            color={theme.palette.primary.main}
          />
        )}
      </Box>
      <Box
        role="tabpanel"
        hidden={tabValue !== 1}
        id="chat-tabpanel-1"
        aria-labelledby="chat-tab-1"
        sx={{ height: 'calc(100% - 48px)', display: tabValue === 1 ? 'block' : 'none' }}
      >
        {handwerkerPartner ? (
          <ChatArea
            title="Chat mit Handwerker"
            icon={<HandymanIcon fontSize="small" />}
            messages={handwerkerMessages}
            loading={handwerkerLoading}
            newMessage={handwerkerNewMessage}
            setNewMessage={setHandwerkerNewMessage}
            handleSendMessage={handleSendHandwerkerMessage}
            partnerName={handwerkerPartner ? `${handwerkerPartner.firstName} ${handwerkerPartner.lastName}` : ''}
            color="#FF8E53"
          />
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography color="textSecondary">
              Kein Handwerker zugewiesen
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export const SplitChat: React.FC<SplitChatProps> = ({
  meldungId,
  currentUserRole,
  mieterPartner,
  handwerkerPartner,
}) => {
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [mieterMessages, setMieterMessages] = useState<Message[]>([]);
  const [handwerkerMessages, setHandwerkerMessages] = useState<Message[]>([]);
  const [mieterNewMessage, setMieterNewMessage] = useState('');
  const [handwerkerNewMessage, setHandwerkerNewMessage] = useState('');
  const [mieterLoading, setMieterLoading] = useState(false);
  const [handwerkerLoading, setHandwerkerLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/messages/${meldungId}`);
      
      // Alle Nachrichten speichern
      setAllMessages(response.data.messages);
      
      // Nachrichten für Mieter filtern
      if (mieterPartner) {
        setMieterLoading(true);
        const mieterFiltered = response.data.messages.filter((msg: Message) => {
          return (
            // Nachricht vom Mieter an mich
            (msg.senderRole === 'mieter' && msg.receiver?.role === currentUserRole) ||
            // Meine Nachricht an den Mieter
            (msg.senderRole === currentUserRole && msg.receiver?.role === 'mieter')
          );
        });
        setMieterMessages(mieterFiltered);
        setMieterLoading(false);
      }
      
      // Nachrichten für Handwerker filtern
      if (handwerkerPartner) {
        setHandwerkerLoading(true);
        const handwerkerFiltered = response.data.messages.filter((msg: Message) => {
          return (
            // Nachricht vom Handwerker an mich
            (msg.senderRole === 'handwerker' && msg.receiver?.role === currentUserRole) ||
            // Meine Nachricht an den Handwerker
            (msg.senderRole === currentUserRole && msg.receiver?.role === 'handwerker')
          );
        });
        setHandwerkerMessages(handwerkerFiltered);
        setHandwerkerLoading(false);
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Nachrichten:', error);
      setMieterLoading(false);
      setHandwerkerLoading(false);
    }
  };

  // Effekt für initiales Laden und Polling
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [meldungId, mieterPartner, handwerkerPartner]);

  const handleSendMieterMessage = async () => {
    if (!mieterNewMessage.trim() || !mieterPartner) return;

    try {
      await api.post('/messages', {
        content: mieterNewMessage,
        meldungId,
        receiverRole: 'mieter'
      });
      setMieterNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Fehler beim Senden der Nachricht:', error);
    }
  };

  const handleSendHandwerkerMessage = async () => {
    if (!handwerkerNewMessage.trim() || !handwerkerPartner) return;

    try {
      await api.post('/messages', {
        content: handwerkerNewMessage,
        meldungId,
        receiverRole: 'handwerker'
      });
      setHandwerkerNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Fehler beim Senden der Nachricht:', error);
    }
  };

  // Mobile-Ansicht mit Tabs
  if (isMobile) {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ChatIcon fontSize="small" /> Chat
          </Typography>
          <Button variant="outlined" size="small" startIcon={<PictureAsPdfIcon />} onClick={handleExport}>
            PDF Export
          </Button>
        </Box>
        <MobileChatView
          mieterMessages={mieterMessages}
          handwerkerMessages={handwerkerMessages}
          mieterLoading={mieterLoading}
          handwerkerLoading={handwerkerLoading}
          mieterNewMessage={mieterNewMessage}
          handwerkerNewMessage={handwerkerNewMessage}
          setMieterNewMessage={setMieterNewMessage}
          setHandwerkerNewMessage={setHandwerkerNewMessage}
          handleSendMieterMessage={handleSendMieterMessage}
          handleSendHandwerkerMessage={handleSendHandwerkerMessage}
          mieterPartner={mieterPartner}
          handwerkerPartner={handwerkerPartner}
        />
      </Box>
    );
  }

  // Desktop-Ansicht mit zwei nebeneinander liegenden Chats
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ChatIcon fontSize="small" /> Chat
        </Typography>
        <Button variant="outlined" size="small" startIcon={<PictureAsPdfIcon />} onClick={handleExport}>
          PDF Export
        </Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
        {/* Mieter-Chat */}
        <Box sx={{ flex: 1 }}>
        {mieterPartner ? (
          <ChatArea
            title="Chat mit Mieter"
            icon={<PersonIcon fontSize="small" />}
            messages={mieterMessages}
            loading={mieterLoading}
            newMessage={mieterNewMessage}
            setNewMessage={setMieterNewMessage}
            handleSendMessage={handleSendMieterMessage}
            partnerName={mieterPartner ? `${mieterPartner.firstName} ${mieterPartner.lastName}` : ''}
            color={theme.palette.primary.main}
          />
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography color="textSecondary">
              Kein Mieter verfügbar
            </Typography>
          </Box>
        )}
      </Box>
      
      {/* Handwerker-Chat */}
      <Box sx={{ flex: 1 }}>
        <ChatArea
          title="Chat mit Handwerker"
          icon={<HandymanIcon fontSize="small" />}
          messages={handwerkerMessages}
          loading={handwerkerLoading}
          newMessage={handwerkerNewMessage}
          setNewMessage={setHandwerkerNewMessage}
          handleSendMessage={handleSendHandwerkerMessage}
          partnerName={handwerkerPartner ? `${handwerkerPartner.firstName} ${handwerkerPartner.lastName}` : ''}
          isDisabled={!handwerkerPartner}
          color="#FF8E53"
        />
      </Box>
      </Box>
    </Box>
  );
};
