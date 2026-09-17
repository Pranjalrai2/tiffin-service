import { useEffect, useState } from 'react';
import api from '../api/axios';

const BillsPage = () => {
  const [bills, setBills] = useState([]);

  const fetchBills = async () => {
    const { data } = await api.get('/api/bills');
    setBills(data.data);
  };

  useEffect(() => {
    fetchBills();
  }, []);

  return (
    <div className="page-shell dashboard-shell">
      <div className="panel">
        <h2>Billing History</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Month</th>
                <th>Weekdays</th>
                <th>Paused</th>
                <th>Rate / Day</th>
                <th>Final</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill) => (
                <tr key={bill._id}>
                  <td>{bill.customerId?.name || 'Customer'}</td>
                  <td>{bill.year}-{String(bill.month).padStart(2, '0')}</td>
                  <td>{bill.totalWeekdays}</td>
                  <td>{bill.pausedDays}</td>
                  <td>₹{Number(bill.ratePerDay).toFixed(2)}</td>
                  <td>₹{Number(bill.finalAmount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BillsPage;
