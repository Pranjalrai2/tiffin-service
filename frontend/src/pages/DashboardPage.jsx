import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const DashboardPage = () => {
  const [customers, setCustomers] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState('createdAt');
  const [direction, setDirection] = useState('desc');
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  const fetchCustomers = async () => {
    const { data } = await api.get('/api/customers', {
      params: { page, limit, sort, direction, search },
    });
    setCustomers(data.data);
    setTotal(data.total);
    setPages(data.pages);
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, limit, sort, direction, search]);

  return (
    <div className="page-shell dashboard-shell">
      <div className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Owner dashboard</p>
            <h2>Customers</h2>
          </div>
          <Link className="primary-button" to="/customers/new">Add Customer</Link>
        </div>

        <div className="toolbar">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by phone number"
          />

          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="createdAt">Join Date</option>
            <option value="name">Name</option>
            <option value="status">Status</option>
            <option value="phone">Phone</option>
          </select>

          <select value={direction} onChange={(event) => setDirection(event.target.value)}>
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>

          <select value={limit} onChange={(event) => setLimit(Number(event.target.value))}>
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
          </select>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Current Plan</th>
                <th>Joined</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer._id}>
                  <td>{customer.name}</td>
                  <td>{customer.phone}</td>
                  <td>
                    <span className={`status-pill ${customer.status === 'Paused' ? 'paused' : 'active'}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td>{customer.currentPlan?.name || 'No plan'}</td>
                  <td>{new Date(customer.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Link className="link-button" to={`/customers/${customer._id}`}>View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
            Previous
          </button>
          <span>
            Page {page} of {pages} · {total} total
          </span>
          <button type="button" disabled={page >= pages} onClick={() => setPage((current) => current + 1)}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
