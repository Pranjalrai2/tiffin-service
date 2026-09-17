import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';

const CustomerDetailPage = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [pauseForm, setPauseForm] = useState({ startDate: '', endDate: '', reason: '' });
  const [billForm, setBillForm] = useState({ monthYear: new Date().toISOString().slice(0, 7) });
  const [billResult, setBillResult] = useState(null);
  const [message, setMessage] = useState('');

  const fetchCustomer = async () => {
    const { data } = await api.get(`/api/customers/${id}`);
    setCustomer(data.data);
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const handlePause = async (event) => {
    event.preventDefault();
    const { data } = await api.post(`/api/subscriptions/${customer.subscription._id}/pause`, pauseForm);
    setMessage('Pause saved successfully');
    fetchCustomer();
    setPauseForm({ startDate: '', endDate: '', reason: '' });
  };

  const handleResume = async () => {
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await api.post(`/api/subscriptions/${customer.subscription._id}/resume`, { date: today });
    setMessage('Subscription resumed successfully');
    fetchCustomer();
  };

  const handleGenerateBill = async () => {
    const { data } = await api.post('/api/bills/generate', {
      subscriptionId: customer.subscription._id,
      monthYear: billForm.monthYear,
    });
    setBillResult(data.data.breakdown);
    setMessage('Bill generated successfully');
  };

  if (!customer) return <div className="page-shell"><div className="card">Loading...</div></div>;

  const subscription = customer.subscription;

  return (
    <div className="page-shell detail-shell">
      <div className="card">
        <h2>{customer.name}</h2>
        <p><strong>Phone:</strong> {customer.phone}</p>
        <p><strong>Address:</strong> {customer.address}</p>
        <p><strong>Status:</strong> {subscription?.status || 'Inactive'}</p>
        <p><strong>Current Plan:</strong> {subscription?.plan?.name || 'No active plan'}</p>
      </div>

      {subscription && (
        <div className="panel-grid">
          <div className="card">
            <h3>Pause History</h3>
            {subscription.pauses?.length ? (
              <ul className="list-stack">
                {subscription.pauses.map((pause) => (
                  <li key={pause._id}>
                    {pause.startDate} → {pause.endDate} {pause.reason ? `(${pause.reason})` : ''}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No pauses recorded yet.</p>
            )}

            <form onSubmit={handlePause} className="stack-form">
              <h4>New Pause</h4>
              <label>
                Start Date
                <input type="date" value={pauseForm.startDate} onChange={(e) => setPauseForm({ ...pauseForm, startDate: e.target.value })} required />
              </label>
              <label>
                End Date
                <input type="date" value={pauseForm.endDate} onChange={(e) => setPauseForm({ ...pauseForm, endDate: e.target.value })} required />
              </label>
              <label>
                Reason
                <input value={pauseForm.reason} onChange={(e) => setPauseForm({ ...pauseForm, reason: e.target.value })} />
              </label>
              <button type="submit" className="primary-button">Pause</button>
            </form>

            <button type="button" className="secondary-button" onClick={handleResume}>
              Resume
            </button>
          </div>

          <div className="card">
            <h3>Generate Bill</h3>
            <label>
              Month
              <input type="month" value={billForm.monthYear} onChange={(e) => setBillForm({ monthYear: e.target.value })} />
            </label>
            <button type="button" className="primary-button" onClick={handleGenerateBill}>Generate Bill</button>

            {billResult && (
              <div className="bill-breakdown">
                <p><strong>Total weekdays:</strong> {billResult.totalWeekdays}</p>
                <p><strong>Paused days:</strong> {billResult.pausedDays}</p>
                <p><strong>Billable days:</strong> {billResult.billableDays}</p>
                <p><strong>Rate/day:</strong> ₹{billResult.ratePerDay.toFixed(2)}</p>
                <p><strong>Final amount:</strong> ₹{billResult.finalAmount.toFixed(2)}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {message && <p className="success-text">{message}</p>}
    </div>
  );
};

export default CustomerDetailPage;
