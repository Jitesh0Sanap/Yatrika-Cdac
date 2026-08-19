import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const statusTabs = ['ALL', 'PAYMENT_PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'COMPLETED', 'CANCELLED']

function OwnerBookings() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    api.get(`/bookings/owner/${user.userId}`)
      .then(({ data }) => setBookings(data))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Could not load your hotel bookings.'))
      .finally(() => setLoading(false))
  }, [user.userId])

  const visibleBookings = useMemo(() => filter === 'ALL' ? bookings : bookings.filter((booking) => booking.bookingState === filter), [bookings, filter])

  const updateBookingState = async (bookingId, nextState) => {
    try {
      setActionError('')
      await api.put(`/admin/${user.userId}/bookings/${bookingId}/state?state=${nextState}`)
      setBookings((current) => current.map((booking) => booking.bookingId === bookingId ? { ...booking, bookingState: nextState } : booking))
    } catch (requestError) {
      setActionError(requestError.response?.data?.message || 'Unable to update this booking.')
    }
  }

  return <main className="booking-shell"><section className="results-section admin-section">
    <p className="eyebrow">OWNER BOOKING DESK</p>
    <div className="booking-list-header"><div><h2>Guest bookings</h2><p className="dashboard-copy">Every reservation made for hotels owned by you.</p></div><Link className="dashboard-add" to="/owner-dashboard">Back to My Hotels</Link></div>
    <div className="tabs">{statusTabs.map((state) => <button className={filter === state ? 'active' : ''} key={state} onClick={() => setFilter(state)}>{state.replaceAll('_', ' ')}</button>)}</div>
    {loading && <div className="empty-state">Loading guest reservations...</div>}
    {error && <p className="status-message">{error}</p>}
    {actionError && <p className="status-message">{actionError}</p>}
    {!loading && !error && visibleBookings.length === 0 && <div className="empty-state">No bookings found for this view.</div>}
    {!loading && !error && visibleBookings.map((booking) => <article className="booking-history-card owner-booking-card" key={booking.bookingId}>
      <div><span className="booking-history-ref">{booking.bookingReference || `Booking #${booking.bookingId}`}</span><p className="booking-history-hotel">{booking.hotelName}</p><p className="booking-history-sub">Guest: <strong>{booking.guestName}</strong> · {booking.guestEmail || 'No email'}</p><p className="booking-history-sub">{booking.roomType?.replaceAll('_', ' ')} · Room {booking.roomNumber || 'To be assigned'} · {booking.numberOfGuests} guest(s)</p></div>
      <div className="booking-history-meta"><span className="pill">{booking.bookingState?.replaceAll('_', ' ')}</span><span>{booking.checkInDate} → {booking.checkOutDate}</span><strong className="booking-history-total">INR {Number(booking.totalPrice || 0).toLocaleString('en-IN')}</strong></div>
    </article>)}
  </section></main>
}

export default OwnerBookings
