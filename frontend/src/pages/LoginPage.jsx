import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: 'admin@tiffintrack.com', password: 'admin123' });
  const [error, setError] = useState('');

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password);
      }
      navigate('/dashboard');
    } catch (err) {
      const apiMessage = err?.response?.data?.message;
      const validationErrors = err?.response?.data?.errors;

      if (validationErrors && Array.isArray(validationErrors) && validationErrors.length > 0) {
        const firstError = validationErrors[0];
        setError(`${firstError.field}: ${firstError.message}`);
        return;
      }

      if (apiMessage) {
        setError(apiMessage);
        return;
      }

      setError(err?.message || 'Authentication failed');
    }
  };

  return (
    <div className="page-shell auth-shell">
      <div className="auth-card">
        <div className="auth-header">
          <h2>{mode === 'login' ? 'Owner Login' : 'Register Owner'}</h2>
          <button type="button" className="text-button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Need an account?' : 'Already registered?'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="stack-form">
          {mode === 'register' && (
            <label>
              Name
              <input name="name" value={form.name} onChange={handleChange} required />
            </label>
          )}

          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </label>

          <label>
            Password
            <input name="password" type="password" value={form.password} onChange={handleChange} required />
          </label>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="primary-button full-width">
            {mode === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
