import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const CustomerFormPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await api.post('/api/customers', form);
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to create customer.');
    }
  };

  return (
    <div className="page-shell">
      <div className="card form-card">
        <h2>Add Customer</h2>
        <form onSubmit={handleSubmit} className="stack-form">
          <label>
            Name
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </label>
          <label>
            Phone
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          </label>
          <label>
            Address
            <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </label>
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="primary-button">Save Customer</button>
        </form>
      </div>
    </div>
  );
};

export default CustomerFormPage;
