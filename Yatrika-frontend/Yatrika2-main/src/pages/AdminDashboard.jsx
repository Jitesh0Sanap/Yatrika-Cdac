import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const bookingStates = ['PAYMENT_PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'COMPLETED', 'CANCELLED'];

function AdminDashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingFilter, setBookingFilter] = useState('ALL');
  
  const [usersPage, setUsersPage] = useState(0);
  const [hotelsPage, setHotelsPage] = useState(0);
  const [bookingsPage, setBookingsPage] = useState(0);

  const [usersData, setUsersData] = useState(null);
  const [hotelsData, setHotelsData] = useState(null);
  const [bookingsData, setBookingsData] = useState(null);

  useEffect(() => {
    api.get(`/admin/${user.userId}/dashboard`)
      .then(({ data }) => setDashboard(data))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Could not load the admin dashboard.'))
      .finally(() => setLoading(false));
  }, [user.userId]);

  useEffect(() => {
    api.get(`/admin/${user.userId}/users?page=${usersPage}&size=10`)
      .then(({ data }) => setUsersData(data))
      .catch(console.error);
  }, [user.userId, usersPage]);

  useEffect(() => {
    api.get(`/admin/${user.userId}/hotels?page=${hotelsPage}&size=10`)
      .then(({ data }) => setHotelsData(data))
      .catch(console.error);
  }, [user.userId, hotelsPage]);

  useEffect(() => {
    const stateParam = bookingFilter !== 'ALL' ? `&state=${bookingFilter}` : '';
    api.get(`/admin/${user.userId}/bookings?page=${bookingsPage}&size=10${stateParam}`)
      .then(({ data }) => setBookingsData(data))
      .catch(console.error);
  }, [user.userId, bookingsPage, bookingFilter]);

  // Reset bookings page to 0 when filter changes
  useEffect(() => {
    setBookingsPage(0);
  }, [bookingFilter]);

  const updateBookingState = async (bookingId, state) => {
    try {
      await api.put(`/admin/${user.userId}/bookings/${bookingId}/state`, null, { params: { state } });
      const stateParam = bookingFilter !== 'ALL' ? `&state=${bookingFilter}` : '';
      api.get(`/admin/${user.userId}/bookings?page=${bookingsPage}&size=10${stateParam}`)
        .then(({ data }) => setBookingsData(data));
    } catch (requestError) { 
      setError(requestError.response?.data?.message || 'Could not update booking status.'); 
    }
  };



  if (loading) {
    return (
      <main className="page-container py-5 text-center" style={{ minHeight: '80vh' }}>
        <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem', marginTop: '15vh' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </main>
    );
  }

  return (
    <main style={{ backgroundColor: 'var(--bg-light)', minHeight: '100vh', paddingBottom: '80px' }}>
      
      {/* Header */}
      <div className="bg-white border-bottom pt-4 pb-4 mb-4">
        <div className="page-container">
          <p className="text-uppercase fw-bold text-muted mb-1 small" style={{ letterSpacing: '1px' }}>Admin Control Center</p>
          <h2 className="fw-bold mb-0">Platform Overview</h2>
        </div>
      </div>

      <div className="page-container">
        {error && (
          <div className="alert alert-danger border-0 shadow-sm d-flex align-items-center p-4 rounded-3 mb-4">
            <i className="bi bi-exclamation-triangle-fill fs-4 me-3"></i>
            <div>{error}</div>
          </div>
        )}

        {dashboard && (
          <>
            <div className="row g-4 mb-5">
              <StatCard icon="bi-people" label="Registered Users" value={dashboard.userCount} color="var(--primary-color)" />
              <StatCard icon="bi-buildings" label="Listed Hotels" value={dashboard.hotelCount} color="var(--primary-custom)" />
              <StatCard icon="bi-tags" label="Room Categories" value={dashboard.roomCategoryCount} color="#6f42c1" />
              <StatCard icon="bi-door-open" label="Room Inventory" value={dashboard.roomCount} color="#fd7e14" />
              <StatCard icon="bi-journal-check" label="Total Bookings" value={dashboard.bookingCount} color="var(--success)" />
            </div>

            <section className="premium-card p-0 mb-5 overflow-hidden">
              <div className="p-4 border-bottom bg-light bg-opacity-50">
                <h4 className="fw-bold mb-0"><i className="bi bi-people-fill text-muted me-2"></i> All Registered Users</h4>
              </div>
              <div className="table-responsive">
                <table className="table table-hover mb-0 align-middle">
                  <thead className="table-light text-muted small text-uppercase" style={{ letterSpacing: '1px' }}>
                    <tr>
                      <th className="ps-4 py-3 border-0">Name</th>
                      <th className="py-3 border-0">Email</th>
                      <th className="py-3 border-0">Phone</th>
                      <th className="pe-4 py-3 border-0">Role</th>
                    </tr>
                  </thead>
                  <tbody className="border-top-0">
                    {usersData && usersData.content.map((member) => (
                      <tr key={member.userId}>
                        <td className="ps-4 py-3 fw-semibold">{member.name}</td>
                        <td className="py-3 text-muted">{member.email}</td>
                        <td className="py-3 text-muted">{member.phone || '—'}</td>
                        <td className="pe-4 py-3">
                          <span className={`badge bg-${member.role === 'ADMIN' ? 'danger' : member.role === 'HOTEL_OWNER' ? 'primary' : 'success'} bg-opacity-10 text-${member.role === 'ADMIN' ? 'danger' : member.role === 'HOTEL_OWNER' ? 'primary' : 'success'} border px-2 py-1`}>
                            {member.role.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination data={usersData} setPage={setUsersPage} />
            </section>

            <section className="premium-card p-0 mb-5 overflow-hidden">
              <div className="p-4 border-bottom bg-light bg-opacity-50">
                <h4 className="fw-bold mb-0"><i className="bi bi-buildings-fill text-muted me-2"></i> All Hotel Listings</h4>
              </div>
              <div className="table-responsive">
                <table className="table table-hover mb-0 align-middle">
                  <thead className="table-light text-muted small text-uppercase" style={{ letterSpacing: '1px' }}>
                    <tr>
                      <th className="ps-4 py-3 border-0">Hotel</th>
                      <th className="py-3 border-0">Location</th>
                      <th className="py-3 border-0">Category</th>
                      <th className="py-3 border-0">Rating</th>
                      <th className="pe-4 py-3 border-0">Owner</th>
                    </tr>
                  </thead>
                  <tbody className="border-top-0">
                    {hotelsData && hotelsData.content.map((hotel) => (
                      <tr key={hotel.hotelId}>
                        <td className="ps-4 py-3 fw-semibold">{hotel.name}</td>
                        <td className="py-3 text-muted">{hotel.city}</td>
                        <td className="py-3"><span className="badge bg-light text-dark border">{hotel.category}</span></td>
                        <td className="py-3 fw-semibold"><i className="bi bi-star-fill text-gold small me-1"></i> {hotel.averageRating ?? 'New'}</td>
                        <td className="pe-4 py-3 text-muted">
                          <div className="fw-semibold text-dark">{hotel.ownerName}</div>
                          <div className="small">{hotel.ownerEmail}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination data={hotelsData} setPage={setHotelsPage} />
            </section>

            <section className="premium-card p-0 mb-5 overflow-hidden">
              <div className="p-4 border-bottom bg-light bg-opacity-50 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                <h4 className="fw-bold mb-0"><i className="bi bi-journal-bookmark-fill text-muted me-2"></i> All Bookings</h4>
                
                <select className="form-select w-auto fw-semibold shadow-sm" value={bookingFilter} onChange={(e) => setBookingFilter(e.target.value)}>
                  <option value="ALL">All Statuses</option>
                  {bookingStates.map((state) => (
                    <option key={state} value={state}>{state.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div className="table-responsive">
                <table className="table table-hover mb-0 align-middle">
                  <thead className="table-light text-muted small text-uppercase" style={{ letterSpacing: '1px' }}>
                    <tr>
                      <th className="ps-4 py-3 border-0">Reference</th>
                      <th className="py-3 border-0">Guest</th>
                      <th className="py-3 border-0">Hotel</th>
                      <th className="py-3 border-0">Stay Dates</th>
                      <th className="py-3 border-0">Total</th>
                      <th className="pe-4 py-3 border-0">Status Control</th>
                    </tr>
                  </thead>
                  <tbody className="border-top-0">
                    {bookingsData && bookingsData.content.map((booking) => (
                      <tr key={booking.bookingId}>
                        <td className="ps-4 py-3 fw-bold text-primary-custom">{booking.bookingReference || `#${booking.bookingId}`}</td>
                        <td className="py-3">
                          <div className="fw-semibold">{booking.guestName}</div>
                          <div className="small text-muted">{booking.guestEmail}</div>
                        </td>
                        <td className="py-3 fw-semibold text-muted">{booking.hotelName}</td>
                        <td className="py-3 small text-muted">
                          {booking.checkInDate} <i className="bi bi-arrow-right mx-1"></i> {booking.checkOutDate}
                        </td>
                        <td className="py-3 fw-semibold">₹{Number(booking.totalPrice || 0).toLocaleString('en-IN')}</td>
                        <td className="pe-4 py-3">
                          <select 
                            className="form-select form-select-sm fw-semibold bg-light" 
                            value={booking.bookingState} 
                            onChange={(event) => updateBookingState(booking.bookingId, event.target.value)}
                          >
                            {bookingStates.map((state) => (
                              <option key={state} value={state}>{state.replace('_', ' ')}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                    {bookingsData && bookingsData.content.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center py-5 text-muted">No bookings found for the selected filter.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination data={bookingsData} setPage={setBookingsPage} />
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="col-12 col-sm-6 col-lg pb-2">
      <div className="premium-card p-4 h-100 d-flex align-items-center">
        <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '48px', height: '48px', backgroundColor: `${color}15`, color: color }}>
          <i className={`bi ${icon} fs-4`}></i>
        </div>
        <div>
          <div className="text-muted small fw-semibold text-uppercase mb-1" style={{ letterSpacing: '1px' }}>{label}</div>
          <div className="fw-bold fs-3" style={{ color: 'var(--text-dark)' }}>{value}</div>
        </div>
      </div>
    </div>
  );
}

function Pagination({ data, setPage }) {
  if (!data || data.totalPages <= 1) return null;
  return (
    <div className="d-flex justify-content-between align-items-center p-3 border-top bg-light bg-opacity-50">
      <button 
        className="btn btn-outline-secondary btn-sm fw-semibold" 
        disabled={data.number === 0} 
        onClick={() => setPage(data.number - 1)}
      >
        <i className="bi bi-chevron-left me-1"></i> Previous
      </button>
      <span className="text-muted small fw-semibold">
        Page {data.number + 1} of {data.totalPages}
      </span>
      <button 
        className="btn btn-outline-secondary btn-sm fw-semibold" 
        disabled={data.number >= data.totalPages - 1} 
        onClick={() => setPage(data.number + 1)}
      >
        Next <i className="bi bi-chevron-right ms-1"></i>
      </button>
    </div>
  );
}

export default AdminDashboard;
