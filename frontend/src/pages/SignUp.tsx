import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
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
  Link,
  MenuItem
} from '@mui/material';
import { Eye, EyeOff, Lock, Mail, User, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('FLEET_MANAGER');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Simulate API call for Sign Up since there is no backend endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mocked successful response
      const mockAccessToken = 'mock_jwt_token_for_new_user';
      const mockUser = {
        id: 'new_user_id',
        name: name,
        email: email,
        role: role,
      };

      login(mockAccessToken, mockUser);

      // Redirect depending on user role permissions
      if (mockUser.role === 'SAFETY_OFFICER') {
        navigate('/drivers');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
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
              Create a new account
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
              label="Full Name"
              variant="outlined"
              margin="normal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ color: '#6b7280' }}>
                    <User size={18} />
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
              label="Email Address"
              variant="outlined"
              margin="normal"
              type="email"
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
              select
              label="Role"
              variant="outlined"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ color: '#6b7280' }}>
                    <Shield size={18} />
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
            >
              <MenuItem value="FLEET_MANAGER">Fleet Manager</MenuItem>
              <MenuItem value="DRIVER">Driver</MenuItem>
              <MenuItem value="SAFETY_OFFICER">Safety Officer</MenuItem>
              <MenuItem value="FINANCIAL_ANALYST">Financial Analyst</MenuItem>
            </TextField>

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
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
            </Button>
          </form>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" sx={{ color: '#8b5cf6', textDecoration: 'none', fontWeight: 600 }}>
                Sign In
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SignUp;
