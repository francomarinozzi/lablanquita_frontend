import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#85622B',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
  },

  typography: {
    fontFamily: "'Poppins', sans-serif",
    h4: {
      fontWeight: 600,
      fontSize: '2.125rem',
      lineHeight: 1.235,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.334,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.6,
    },
    body1: {
      fontWeight: 400,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontWeight: 400,
      fontSize: '0.875rem',
      lineHeight: 1.43,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    }
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          paddingTop: '10px',
          paddingBottom: '10px',
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiPaper: {
        styleOverrides: {
            root: {
                boxShadow: '0px 4px 12px rgba(0,0,0,0.05)',
                borderRadius: 12,
            }
        }
    },
    MuiTableHead: {
        styleOverrides: {
            root: {
                '& .MuiTableCell-root': {
                    fontWeight: 600,
                    color: '#000',
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                }
            }
        }
    }
  },
});

export default theme;