import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import OwnerRegisterPage from './pages/OwnerRegisterPage'
import OwnerDashboard from './pages/OwnerDashboard'
import AddHotel from './pages/AddHotel'
import EditHotel from './pages/EditHotel'
import ManageRooms from './pages/ManageRooms'
import HotelDetailsPage from './pages/HotelDetailsPage'
import BookRoomPage from './pages/BookRoomPage'
import MyBookings from './pages/MyBookings'
import BookingDetails from './pages/BookingDetails'
import ManageAddOns from './pages/ManageAddOns'
import OwnerBookings from './pages/OwnerBookings'
import AdminDashboard from './pages/AdminDashboard'
import PaymentPage from './pages/PaymentPage'
import HotelsPage from './pages/HotelsPage'
import RecommendationsPage from './pages/RecommendationsPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import ProfilePage from './pages/ProfilePage'

function PublicOnly({ children }) {
  const { user } = useAuth()
  return user ? <Navigate to="/" replace /> : children
}

function OwnerOnly({ children }) {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'HOTEL_OWNER') return <Navigate to="/" replace />

  return children
}

function AdminOnly({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'ADMIN') return <Navigate to="/" replace />
  return children
}

function HomeForRole() {
  const { user } = useAuth()
  if (user?.role === 'HOTEL_OWNER') return <Navigate to="/owner-dashboard" replace />
  if (user?.role === 'ADMIN') return <Navigate to="/admin-dashboard" replace />
  return <HomePage />
}

function App() {
  return (
    <div className="app-shell" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomeForRole />} />
        <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
        <Route path="/register" element={<PublicOnly><RegisterPage /></PublicOnly>} />
        <Route path="/register-owner" element={<PublicOnly><OwnerRegisterPage /></PublicOnly>} />
        <Route path="/forgot-password" element={<PublicOnly><ForgotPasswordPage /></PublicOnly>} />
        <Route path="/reset-password" element={<PublicOnly><ResetPasswordPage /></PublicOnly>} />
        <Route path="/owner-dashboard" element={<OwnerOnly><OwnerDashboard /></OwnerOnly>} />
        <Route path="/owner-bookings" element={<OwnerOnly><OwnerBookings /></OwnerOnly>} />
        <Route path="/admin-dashboard" element={<AdminOnly><AdminDashboard /></AdminOnly>} />
        <Route path="/owner/hotels/new" element={<OwnerOnly><AddHotel /></OwnerOnly>} />
        <Route path="/owner/hotels/:hotelId/edit" element={<OwnerOnly><EditHotel /></OwnerOnly>} />
        <Route path="/owner/hotels/:hotelId/rooms" element={<OwnerOnly><ManageRooms /></OwnerOnly>} />
        <Route path="/hotels/:hotelId" element={<HotelDetailsPage />} />
        <Route path="/owner/hotels/:hotelId/addons" element={<OwnerOnly><ManageAddOns /></OwnerOnly>} />
        <Route path="/hotels/:hotelId/book" element={<BookRoomPage />} />
        <Route path="/hotels" element={<HotelsPage />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/bookings/:bookingId" element={<BookingDetails />} />
        <Route path="/payments/:bookingId" element={<PaymentPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </div>
  )
}

export default App
