import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Container, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import HomeIcon from '@mui/icons-material/Home';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import { userService } from '../../services/user.service';
import { User, UserRole } from '../../types/auth';
import CreateUserForm from './CreateUserForm';
import AssignUnitForm from './AssignUnitForm';
import { CreateUserResponse } from '../../services/user.service';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `user-tab-${index}`,
    'aria-controls': `user-tabpanel-${index}`,
  };
}

const UserManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [assignUnitOpen, setAssignUnitOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [removeUnitConfirmOpen, setRemoveUnitConfirmOpen] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  const fetchUsers = async (role?: UserRole) => {
    try {
      setLoading(true);
      const data = await userService.getUsers(role);
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch users based on selected tab
    const roles = [undefined, UserRole.MIETER, UserRole.VERMIETER, UserRole.HANDWERKER];
    fetchUsers(roles[tabValue]);
  }, [tabValue]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateUser = async (userData: any) => {
    try {
      const result = await userService.createUser(userData);
      const handleUserCreated = (response: CreateUserResponse) => {
        setUsers([...users, response.user]);
        setTemporaryPassword(response.temporaryPassword);
        setPasswordDialogOpen(true);
        setTabValue(0); // Switch back to users tab
        
        // Hinweis auf E-Mail-Versand
        alert(`Benutzer wurde erfolgreich erstellt! Eine E-Mail mit dem temporären Passwort wurde an ${response.user.email} gesendet. In der Testumgebung wird die E-Mail nicht wirklich versendet, sondern in der Serverkonsole angezeigt.`);
      };
      handleUserCreated(result);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleAssignUnit = async (unitId: string) => {
    if (!selectedUser) return;
    
    try {
      await userService.updateUserUnit(selectedUser._id, unitId);
      setAssignUnitOpen(false);
      // Refresh user list
      fetchUsers(UserRole.MIETER);
    } catch (error) {
      console.error('Error assigning unit:', error);
    }
  };

  const handleRemoveUnit = async () => {
    if (!selectedUser) return;
    
    try {
      await userService.updateUserUnit(selectedUser._id, null);
      setRemoveUnitConfirmOpen(false);
      // Refresh user list
      fetchUsers(UserRole.MIETER);
    } catch (error) {
      console.error('Error removing unit:', error);
    }
  };

  const openAssignUnitDialog = (user: User) => {
    setSelectedUser(user);
    setAssignUnitOpen(true);
  };

  const openRemoveUnitConfirm = (user: User) => {
    setSelectedUser(user);
    setRemoveUnitConfirmOpen(true);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography component="h2" variant="h6" color="primary" gutterBottom>
            Benutzerverwaltung
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => setCreateUserOpen(true)}
          >
            Neuer Benutzer
          </Button>
        </Box>

        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="user tabs">
              <Tab label="Alle Benutzer" {...a11yProps(0)} />
              <Tab label="Mieter" {...a11yProps(1)} />
              <Tab label="Vermieter" {...a11yProps(2)} />
              <Tab label="Handwerker" {...a11yProps(3)} />
            </Tabs>
          </Box>
          
          {[0, 1, 2, 3].map((index) => (
            <TabPanel key={index} value={tabValue} index={index}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>E-Mail</TableCell>
                      <TableCell>Rolle</TableCell>
                      <TableCell>Telefon</TableCell>
                      <TableCell>Erstellt am</TableCell>
                      <TableCell>Aktionen</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">Laden...</TableCell>
                      </TableRow>
                    ) : users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">Keine Benutzer gefunden</TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user._id}>
                          <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.role}</TableCell>
                          <TableCell>{user.phone || '-'}</TableCell>
                          <TableCell>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</TableCell>
                          <TableCell>
                            {user.role === UserRole.MIETER && (
                              <>
                                <Tooltip title={user.assignedUnit ? "Wohnung ändern" : "Wohnung zuweisen"}>
                                  <IconButton 
                                    color="primary" 
                                    onClick={() => openAssignUnitDialog(user)}
                                  >
                                    {user.assignedUnit ? <HomeIcon /> : <HomeOutlinedIcon />}
                                  </IconButton>
                                </Tooltip>
                                
                                {user.assignedUnit && (
                                  <Tooltip title="Wohnung entfernen">
                                    <IconButton 
                                      color="error" 
                                      onClick={() => openRemoveUnitConfirm(user)}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>
          ))}
        </Box>
      </Paper>

      {/* Create User Dialog */}
      <Dialog open={createUserOpen} onClose={() => setCreateUserOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Neuen Benutzer erstellen</DialogTitle>
        <DialogContent>
          <CreateUserForm onSubmit={handleCreateUser} onCancel={() => setCreateUserOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Assign Unit Dialog */}
      <Dialog open={assignUnitOpen} onClose={() => setAssignUnitOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Wohnung zuweisen</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1">
                Mieter: {selectedUser.firstName} {selectedUser.lastName}
              </Typography>
              <AssignUnitForm 
                onSubmit={handleAssignUnit} 
                onCancel={() => setAssignUnitOpen(false)} 
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Remove Unit Confirmation Dialog */}
      <Dialog open={removeUnitConfirmOpen} onClose={() => setRemoveUnitConfirmOpen(false)}>
        <DialogTitle>Wohnung entfernen</DialogTitle>
        <DialogContent>
          <Typography>
            Möchten Sie wirklich die Wohnung von {selectedUser?.firstName} {selectedUser?.lastName} entfernen?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveUnitConfirmOpen(false)}>Abbrechen</Button>
          <Button onClick={handleRemoveUnit} color="error" variant="contained">
            Entfernen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Temporary Password Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)}>
        <DialogTitle>Temporäres Passwort</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              Der Benutzer wurde erfolgreich erstellt.
            </Alert>
            <Typography variant="body1" gutterBottom>
              Ein temporäres Passwort wurde generiert und an den Benutzer gesendet.
            </Typography>
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', border: '1px solid #ddd', borderRadius: 1 }}>
              <Typography variant="h6" fontFamily="monospace">
                {temporaryPassword}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Bitte notieren Sie sich dieses Passwort, es wird nur einmal angezeigt.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)} variant="contained">
            Schließen
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserManagement;
