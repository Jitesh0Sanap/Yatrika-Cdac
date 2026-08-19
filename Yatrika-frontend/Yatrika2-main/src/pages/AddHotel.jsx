import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import HotelForm from '../components/HotelForm'
import api from '../services/api'

function AddHotel() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const addHotel = async (hotel) => {
    setSaving(true); setError('')
    try {
      await api.post(`/hotels/owner/${user.userId}`, hotel)
      navigate('/owner-dashboard')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not add this hotel.')
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
              <p className="text-muted small fw-semibold text-uppercase mb-0" style={{ letterSpacing: '1px' }}>New Listing</p>
            </div>
            <h2 className="fw-bolder mb-0 text-dark" style={{ letterSpacing: '-0.5px' }}>Add a Property</h2>
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
        <HotelForm submitLabel="Publish Property" onSubmit={addHotel} saving={saving} />
      </div>
    </main>
  )
}

export default AddHotel
