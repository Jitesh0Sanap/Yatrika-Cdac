import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import HotelForm from '../components/HotelForm'
import api from '../services/api'

function EditHotel() {
  const { hotelId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [hotel, setHotel] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get(`/hotels/${hotelId}`).then((response) => setHotel(response.data)).catch(() => setError('Hotel could not be loaded.'))
  }, [hotelId])

  const updateHotel = async (hotelData) => {
    setSaving(true); setError('')
    try {
      await api.put(`/hotels/owner/${user.userId}/${hotelId}`, hotelData)
      navigate('/owner-dashboard')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'You cannot edit this hotel.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main style={{ backgroundColor: 'var(--bg-light)', minHeight: '100vh', paddingBottom: '80px' }}>
      <div className="bg-white border-bottom pt-4 pb-4 mb-5 shadow-sm position-sticky top-0" style={{ zIndex: 100 }}>
        <div className="page-container d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <div className="d-flex align-items-center mb-1">
              <span className="badge bg-dark text-white fw-bold me-2 px-2 py-1"><i className="bi bi-rocket-takeoff-fill me-1"></i> Partner Portal</span>
              <p className="text-muted small fw-semibold text-uppercase mb-0" style={{ letterSpacing: '1px' }}>Edit Listing</p>
            </div>
            <h2 className="fw-bolder mb-0 text-dark" style={{ letterSpacing: '-0.5px' }}>{hotel?.name || 'Edit Property'}</h2>
          </div>
        </div>
      </div>
      <div className="page-container" style={{ maxWidth: '900px' }}>
        {error && (
          <div className="alert alert-danger border-0 shadow-sm d-flex align-items-center p-4 rounded-3 mb-4">
            <i className="bi bi-exclamation-triangle-fill fs-4 me-3"></i>
            <div>{error}</div>
          </div>
        )}
        
        {hotel ? (
          <HotelForm initialHotel={hotel} submitLabel="Save Changes" onSubmit={updateHotel} saving={saving} />
        ) : !error && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary-custom" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default EditHotel
