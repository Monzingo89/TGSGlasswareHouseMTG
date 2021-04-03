import { createMuiTheme } from '@material-ui/core/styles';
import { indigo } from '@material-ui/core/colors';

const darkTheme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: { main: '#8a85ff' },
    background: {
      paper: '#282C34',
      default: '#1c2025',
    },
    secondary: indigo,
  },
  overrides: {
    MuiPaper: {
      outlined: {
        borderColor: 'rgba(255, 255, 255, 0.23)',
      },
    },
  },
});

export default darkTheme;
