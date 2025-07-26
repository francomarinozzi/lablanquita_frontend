import { createTheme } from '@mui/material/styles';


const theme = createTheme({
 
  palette: {
    mode: 'light',
    primary: {
      main: '#85622B', 
      contrastText: '#FFFFFF', 
    },
    
    background: {
      default: '#D3D3D3',
      paper: '#FFFFFF',  
    },
    text: {
      primary: '#333333',
      secondary: '#666666', 
    },
  },


  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: { 
        fontWeight: 700,
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
  },
});

export default theme;
