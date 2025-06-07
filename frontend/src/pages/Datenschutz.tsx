import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper,
  Button,
  Alert
} from '@mui/material';
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AppsIcon from '@mui/icons-material/Apps';

// Logo-Komponente
const Logo: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      mb: 5,
      textDecoration: 'none',
      color: 'inherit',
    }}
    component={Link}
    to="/"
  >
    <Box
      sx={{
        width: 42,
        height: 42,
        background: 'linear-gradient(135deg, #FF8E53 0%, #E67E22 100%)',
        borderRadius: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(230, 126, 34, 0.15)',
        transition: 'transform 0.2s ease',
        '&:hover': {
          transform: 'scale(1.05)',
        },
        '& .MuiSvgIcon-root': {
          color: 'white',
          fontSize: '1.6rem',
        }
      }}
    >
      <AppsIcon />
    </Box>
    <Typography
      variant="h4"
      component="span"
      sx={{
        fontWeight: 700,
        fontSize: '2rem',
        background: 'linear-gradient(135deg, #FF8E53 0%, #E67E22 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        letterSpacing: '-0.01em',
      }}
    >
      Immofox
    </Typography>
  </Box>
);

// Hauptkomponente
export const Datenschutz: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%)',
        py: 6,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Logo />
        </Box>

        <Alert severity="info" sx={{ mb: 4, borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            HINWEIS: Dies ist eine Beispiel-Datenschutzerklärung
          </Typography>
          <Typography>
            Diese Seite enthält keine rechtlich bindenden Informationen und dient nur als Platzhalter für Demonstrationszwecke.
          </Typography>
        </Alert>
        
        <Paper
          elevation={0}
          sx={{
            p: 4.5,
            borderRadius: 3,
            background: '#fff',
            boxShadow: '0 2px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            mb: 4
          }}
        >
          <Typography 
            variant="h4" 
            sx={{ 
              mb: 4, 
              color: '#2D3436',
              fontWeight: 700,
            }}
          >
            Datenschutzerklärung
          </Typography>
          
          <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>1. Verantwortliche Stelle</Typography>
          <Typography paragraph sx={{ lineHeight: 1.7 }}>
            Immofox GmbH (Beispiel)<br />
            Immobilienstraße 123<br />
            12345 Musterstadt<br />
            Deutschland<br />
            E-Mail: datenschutz@beispiel-immofox.de<br />
            Telefon: +49 123 456789
          </Typography>
          
          <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>2. Datenerhebung und -verwendung</Typography>
          <Typography paragraph sx={{ lineHeight: 1.7 }}>
            Bei der Nutzung unseres Dienstes erheben wir verschiedene Arten von Daten, um Ihnen unsere Leistungen zur Verfügung stellen zu können. Wir verarbeiten Ihre personenbezogenen Daten nur, soweit dies zur Bereitstellung einer funktionsfähigen Website sowie unserer Inhalte und Leistungen erforderlich ist.
          </Typography>
          
          <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>3. Erhobene Daten</Typography>
          <Typography paragraph sx={{ lineHeight: 1.7 }}>
            <strong>Registrierungsdaten:</strong> Bei der Anmeldung für unseren Dienst erfassen wir Ihren Namen, Ihre E-Mail-Adresse, Telefonnummer und Firmeninformationen (bei Vermietern).
          </Typography>
          <Typography paragraph sx={{ lineHeight: 1.7 }}>
            <strong>Immobiliendaten:</strong> Als Vermieter können Sie Informationen über Ihre Immobilien einschließlich Adressen, Einheitendaten und zugehörige Dokumente hochladen.
          </Typography>
          <Typography paragraph sx={{ lineHeight: 1.7 }}>
            <strong>Nutzungsdaten:</strong> Wir erfassen Informationen darüber, wie Sie unseren Dienst nutzen, einschließlich Zugriffszeiten, besuchter Seiten und durchgeführter Aktionen.
          </Typography>
          <Typography paragraph sx={{ lineHeight: 1.7 }}>
            <strong>Kommunikationsdaten:</strong> Wir speichern Nachrichten und Kommunikationen zwischen Vermietern, Mietern und Handwerkern innerhalb unserer Plattform.
          </Typography>
          
          <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>4. Rechtsgrundlage der Verarbeitung</Typography>
          <Typography paragraph sx={{ lineHeight: 1.7 }}>
            Wir verarbeiten Ihre personenbezogenen Daten auf Grundlage folgender Rechtsgrundlagen:
          </Typography>
          <Typography component="ul" sx={{ pl: 3, lineHeight: 1.7 }}>
            <li>Zur Erfüllung vertraglicher Pflichten (Art. 6 Abs. 1 lit. b DSGVO)</li>
            <li>Auf Grundlage Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO)</li>
            <li>Zur Wahrung berechtigter Interessen (Art. 6 Abs. 1 lit. f DSGVO)</li>
            <li>Zur Erfüllung rechtlicher Verpflichtungen (Art. 6 Abs. 1 lit. c DSGVO)</li>
          </Typography>
          
          <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>5. Datenspeicherung und Sicherheit</Typography>
          <Typography paragraph sx={{ lineHeight: 1.7 }}>
            Wir speichern Ihre personenbezogenen Daten nur so lange, wie es für die Zwecke, für die sie erhoben wurden, erforderlich ist oder gesetzliche Aufbewahrungsfristen dies vorsehen. Wir haben angemessene technische und organisatorische Maßnahmen implementiert, um Ihre Daten vor Verlust, Missbrauch, unbefugtem Zugriff, Offenlegung, Änderung und Zerstörung zu schützen.
          </Typography>
          
          <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>6. Ihre Rechte</Typography>
          <Typography paragraph sx={{ lineHeight: 1.7 }}>
            Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:
          </Typography>
          <Typography component="ul" sx={{ pl: 3, lineHeight: 1.7 }}>
            <li>Recht auf Auskunft</li>
            <li>Recht auf Berichtigung</li>
            <li>Recht auf Löschung</li>
            <li>Recht auf Einschränkung der Verarbeitung</li>
            <li>Recht auf Datenübertragbarkeit</li>
            <li>Widerspruchsrecht</li>
            <li>Recht auf Widerruf einer Einwilligung</li>
          </Typography>
          
          <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>7. Cookies und Analysetools</Typography>
          <Typography paragraph sx={{ lineHeight: 1.7 }}>
            Unsere Website verwendet Cookies, um die Benutzererfahrung zu verbessern. Wir nutzen Google Analytics, um Informationen darüber zu sammeln, wie Besucher unsere Website nutzen. Diese Daten helfen uns, unseren Service zu verbessern und besser auf Ihre Bedürfnisse zuzuschneiden.
          </Typography>
          
          <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>8. Änderungen dieser Datenschutzerklärung</Typography>
          <Typography paragraph sx={{ lineHeight: 1.7 }}>
            Wir behalten uns das Recht vor, diese Datenschutzerklärung jederzeit zu ändern. Die aktuellste Version finden Sie immer auf dieser Seite. Bei wesentlichen Änderungen werden wir Sie per E-Mail oder durch einen Hinweis auf unserer Website informieren.
          </Typography>
          
          <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>9. Kontakt</Typography>
          <Typography paragraph sx={{ lineHeight: 1.7 }}>
            Bei Fragen zu dieser Datenschutzerklärung oder zur Ausübung Ihrer Rechte kontaktieren Sie uns bitte unter:<br />
            datenschutz@beispiel-immofox.de
          </Typography>
          
          <Typography paragraph sx={{ mt: 5, textAlign: 'center', color: 'text.secondary', fontStyle: 'italic' }}>
            Stand: April 2025 (Beispieldatum)
          </Typography>
        </Paper>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            component={Link}
            to="/"
            sx={{
              color: 'rgba(0, 0, 0, 0.6)',
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
              py: 1,
              px: 3,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.08)',
              }
            }}
          >
            Zurück zur Startseite
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Datenschutz;
