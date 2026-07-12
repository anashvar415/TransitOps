import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      const { accessToken, user } = res.data;
      
      login(accessToken, user);

      // Redirect depending on user role permissions
      if (user.role === 'SAFETY_OFFICER' || user.role === 'DRIVER') {
        navigate('/vehicles');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid credentials or connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, var(--bg-gradient-start) 0%, var(--bg-gradient-end) 100%)',
        p: 2,
      }}
    >
      <Card
        className="glass-panel"
        sx={{
          maxWidth: 420,
          width: '100%',
          bgcolor: 'var(--glass-bg)',
          borderRadius: '16px',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                fontFamily: 'Outfit, sans-serif',
                background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              TransitOps
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
              Smart Transport Operations Platform
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              variant="outlined"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ color: '#6b7280' }}>
                    <Mail size={18} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  bgcolor: 'rgba(0, 0, 0, 0.2)',
                },
              }}
            />

            <TextField
              fullWidth
              label="Password"
              variant="outlined"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ color: '#6b7280' }}>
                    <Lock size={18} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: '#6b7280' }}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 4,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  bgcolor: 'rgba(0, 0, 0, 0.2)',
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.5,
                borderRadius: '10px',
                fontWeight: 600,
                textTransform: 'none',
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)',
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </form>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(139, 92, 246, 0.05)', borderRadius: '8px', border: '1px solid rgba(139, 92, 246, 0.2)', textAlign: 'left' }}>
              <Typography variant="subtitle2" sx={{ color: '#8b5cf6', mb: 1, fontWeight: 600 }}>Demo Credentials (Password: Transit@123)</Typography>
              <Typography variant="caption" sx={{ display: 'block', color: 'var(--text-secondary)' }}>• Manager: manager@transitops.in</Typography>
              <Typography variant="caption" sx={{ display: 'block', color: 'var(--text-secondary)' }}>• Driver: driver@transitops.in</Typography>
              <Typography variant="caption" sx={{ display: 'block', color: 'var(--text-secondary)' }}>• Safety: safety@transitops.in</Typography>
              <Typography variant="caption" sx={{ display: 'block', color: 'var(--text-secondary)' }}>• Finance: finance@transitops.in</Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#4b5563', display: 'block', mt: 2 }}>
              TransitOps v1.0.0
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
