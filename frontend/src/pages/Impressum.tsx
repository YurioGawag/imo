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
export const Impressum: React.FC = () => {
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
            HINWEIS: Dies ist ein Beispiel-Impressum
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
            Impressum
          </Typography>
          
          <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>Angaben gemäß § 5 TMG</Typography>
          <Typography paragraph sx={{ lineHeight: 1.7 }}>
            Immofox GmbH<br />
            Immobilienstraße 123<br />
            12345 Musterstadt<br />
            Deutschland
          </Typography>
          
          <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>Kontakt</Typography>
          <Typography paragraph sx={{ lineHeight: 1.7 }}>
            Telefon: +49 123 456789<br />
            E-Mail: info@beispiel-immofox.de
          </Typography>
          
          <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>Vertreten durch</Typography>
          <Typography paragraph sx={{ lineHeight: 1.7 }}>
            Max Mustermann<br />
            Geschäftsführer
          </Typography>
          
          <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>Registereintrag</Typography>
          <Typography paragraph sx={{ lineHeight: 1.7 }}>
            Eintragung im Handelsregister.<br />
            Registergericht: Amtsgericht Musterstadt<br />
            Registernummer: HRB 12345
          </Typography>
          
          <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>Umsatzsteuer-ID</Typography>
          <Typography paragraph sx={{ lineHeight: 1.7 }}>
            Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
            DE123456789
          </Typography>
          
          <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</Typography>
          <Typography paragraph sx={{ lineHeight: 1.7 }}>
            Max Mustermann<br />
            Immobilienstraße 123<br />
            12345 Musterstadt<br />
            Deutschland
          </Typography>
          
          <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>Streitschlichtung</Typography>
          <Typography paragraph sx={{ lineHeight: 1.7 }}>
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
            <Button
              component="a"
              href="https://ec.europa.eu/consumers/odr/"
              target="_blank"
              rel="noopener"
              sx={{
                textTransform: 'none',
                color: '#E67E22',
                fontWeight: 500,
                p: 0,
                minWidth: 'auto',
                mx: 1,
                verticalAlign: 'baseline',
                '&:hover': {
                  backgroundColor: 'transparent',
                  textDecoration: 'underline',
                }
              }}
            >
              https://ec.europa.eu/consumers/odr/
            </Button>
            <br />
            Unsere E-Mail-Adresse finden Sie oben im Impressum.
          </Typography>
          
          <Typography paragraph sx={{ lineHeight: 1.7 }}>
            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
          </Typography>
          
          <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>Haftung für Inhalte</Typography>
          <Typography paragraph sx={{ lineHeight: 1.7 }}>
            Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
          </Typography>
          
          <Typography paragraph sx={{ lineHeight: 1.7 }}>
            Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
          </Typography>
          
          <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>Haftung für Links</Typography>
          <Typography paragraph sx={{ lineHeight: 1.7 }}>
            Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.
          </Typography>
          
          <Typography paragraph sx={{ lineHeight: 1.7 }}>
            Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.
          </Typography>
          
          <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>Urheberrecht</Typography>
          <Typography paragraph sx={{ lineHeight: 1.7 }}>
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.
          </Typography>
          
          <Typography paragraph sx={{ lineHeight: 1.7 }}>
            Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
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

export default Impressum;
