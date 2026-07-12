import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#06070a', alignItems: 'center', justifyContent: 'center', p: 3 }}>
          <Paper className="glass-panel" sx={{ p: 5, maxWidth: 500, textAlign: 'center', bgcolor: 'rgba(22, 24, 35, 0.8)' }}>
            <AlertTriangle size={64} color="#ef4444" style={{ marginBottom: '16px' }} />
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#f3f4f6' }}>
              System Error
            </Typography>
            <Typography variant="body1" sx={{ color: '#9ca3af', mb: 4 }}>
              An unexpected frontend exception occurred. Our systems have logged this issue.
            </Typography>
            <Box sx={{ bgcolor: 'rgba(0,0,0,0.3)', p: 2, borderRadius: 2, mb: 4, overflow: 'auto', maxHeight: 150, textAlign: 'left' }}>
              <Typography variant="caption" sx={{ color: '#ef4444', fontFamily: 'monospace' }}>
                {this.state.error?.toString()}
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              onClick={() => window.location.reload()}
              sx={{ bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#7c3aed' }, fontWeight: 600, textTransform: 'none' }}
            >
              Restart Session
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
