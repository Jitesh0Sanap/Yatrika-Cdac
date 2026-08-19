import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RoomForm from '../components/RoomForm';
import api from '../services/api';

function ManageRooms() {
  const { hotelId } = useParams();
  const { user } = useAuth();
  const [hotel, setHotel] = useState(null);
  const [roomCategories, setRoomCategories] = useState([]);
  const [editingRoom, setEditingRoom] = useState(null);
  const [addingRoom, setAddingRoom] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadRoomCategories = async () => {
    try {
      const [hotelResponse, categoriesResponse] = await Promise.all([
        api.get(`/hotels/${hotelId}`),
        api.get(`/hotels/${hotelId}/owner/${user.userId}/room-categories`),
      ]);
      setHotel(hotelResponse.data);
      setRoomCategories(categoriesResponse.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'You cannot manage rooms for this hotel.');
    }
  };

  useEffect(() => { loadRoomCategories(); }, [hotelId, user.userId]);

  const addRoomCategory = async (room) => {
    setSaving(true); setError('');
    try {
      await api.post(`/hotels/${hotelId}/owner/${user.userId}/room-categories?quantity=${room.quantity}`, room);
      setAddingRoom(false);
      await loadRoomCategories();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not add this room category.');
    } finally { setSaving(false); }
  };

  const updateRoomCategory = async (room) => {
    setSaving(true); setError('');
    try {
      await api.put(`/room-categories/owner/${user.userId}/${editingRoom.roomCategoryId}?quantity=${room.quantity}`, room);
      setEditingRoom(null);
      await loadRoomCategories();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not update this room category.');
    } finally { setSaving(false); }
  };

  const deleteRoomCategory = async (roomCategoryId) => {
    if (!window.confirm('Delete this room category and all its rooms?')) return;
    try {
      await api.delete(`/room-categories/owner/${user.userId}/${roomCategoryId}`);
      await loadRoomCategories();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not delete this room category.');
    }
  };

  return (
    <main style={{ backgroundColor: 'var(--bg-light)', minHeight: '100vh', paddingBottom: '80px' }}>
      {/* Header */}
      <div className="bg-white border-bottom pt-4 pb-4 mb-4">
        <div className="page-container d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <Link to="/owner-dashboard" className="text-decoration-none text-muted small fw-bold text-uppercase d-inline-block mb-2 hover-primary transition" style={{ letterSpacing: '1px' }}>
              <i className="bi bi-arrow-left me-1"></i> Back to Dashboard
            </Link>
            <h2 className="fw-bold mb-0">Manage Room Inventory</h2>
            {hotel && <p className="text-muted mb-0">{hotel.name}</p>}
          </div>
          {!addingRoom && !editingRoom && (
            <button className="btn-primary-custom px-4 text-nowrap d-inline-flex align-items-center justify-content-center" onClick={() => { setAddingRoom(true); setEditingRoom(null); }}>
              <i className="bi bi-plus-lg me-2"></i> Add Room Category
            </button>
          )}
        </div>
      </div>

      <div className="page-container">
        {error && (
          <div className="alert alert-danger border-0 shadow-sm d-flex align-items-center p-4 rounded-3 mb-4">
            <i className="bi bi-exclamation-triangle-fill fs-4 me-3"></i>
            <div>{error}</div>
          </div>
        )}

        {(addingRoom || editingRoom) && (
          <div className="mb-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="fw-bold mb-0">{editingRoom ? 'Edit Room Category' : 'Add New Room Category'}</h4>
              <button className="btn btn-outline-secondary btn-sm fw-bold" onClick={() => { setAddingRoom(false); setEditingRoom(null); }}>
                <i className="bi bi-x-lg me-1"></i> Cancel
              </button>
            </div>
            <RoomForm 
              initialRoom={editingRoom || undefined} 
              submitLabel={editingRoom ? 'Save Changes' : 'Create Category'} 
              onSubmit={editingRoom ? updateRoomCategory : addRoomCategory} 
              saving={saving} 
            />
          </div>
        )}

        {!error && !addingRoom && !editingRoom && roomCategories.length === 0 && (
          <div className="text-center py-5 my-5 bg-white rounded-4 shadow-sm border p-5">
            <div className="mb-4 d-inline-flex align-items-center justify-content-center rounded-circle bg-light" style={{ width: '80px', height: '80px', color: 'var(--text-muted)' }}>
              <i className="bi bi-door-closed fs-2"></i>
            </div>
            <h3 className="fw-bold mb-2">No rooms added yet</h3>
            <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '400px' }}>You haven't created any room categories for this property yet. Guests won't be able to book until you add rooms.</p>
            <button className="btn-primary-custom px-4" onClick={() => { setAddingRoom(true); setEditingRoom(null); }}>
              Add Your First Room
            </button>
          </div>
        )}

        {!addingRoom && !editingRoom && roomCategories.length > 0 && (
          <div className="row g-4">
            {roomCategories.map((room) => (
              <div className="col-12 col-md-6 col-lg-4" key={room.roomCategoryId}>
                <div className="premium-card h-100 d-flex flex-column hover-lift shadow-sm" style={{ borderRadius: 'var(--border-radius-lg)', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)' }}>
                  
                  {/* Thumbnail Banner */}
                  <div className="position-relative" style={{ height: '180px', backgroundImage: `url('https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    <div className="position-absolute top-0 start-0 m-3">
                      <span className={`badge ${room.availableRooms > 0 ? 'bg-success' : 'bg-danger'} shadow-sm px-2 py-1`}>
                        {room.availableRooms > 0 ? 'Available' : 'Sold Out'}
                      </span>
                    </div>
                    <div className="position-absolute bottom-0 start-0 w-100 p-3 pt-5" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0))' }}>
                      <h4 className="fw-bolder mb-0 text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{room.roomType} Room</h4>
                    </div>
                  </div>

                  <div className="p-4 flex-grow-1 bg-white">
                    <p className="text-muted small mb-4 line-clamp-2" style={{ minHeight: '40px' }}>{room.description || 'A beautiful and spacious room perfect for your stay.'}</p>

                    <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                      <div className="text-muted small fw-bold text-uppercase" style={{ letterSpacing: '0.5px' }}><i className="bi bi-box-seam me-1"></i> Inventory</div>
                      <div className="fw-bolder">
                        <span className="text-success">{room.availableRooms ?? 0}</span>
                        <span className="text-muted mx-1">/</span>
                        <span className="text-dark">{room.totalRooms ?? 0}</span>
                      </div>
                    </div>
                    
                    <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                      <div className="text-muted small fw-bold text-uppercase" style={{ letterSpacing: '0.5px' }}><i className="bi bi-calendar-check me-1"></i> Booked</div>
                      <div className="fw-bolder text-primary-custom">{Math.max(0, (room.totalRooms ?? 0) - (room.availableRooms ?? 0))}</div>
                    </div>
                    
                    <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                      <div className="text-muted small fw-bold text-uppercase" style={{ letterSpacing: '0.5px' }}><i className="bi bi-people me-1"></i> Capacity</div>
                      <div className="fw-bolder text-dark">{room.capacity} Guests</div>
                    </div>
                    
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <div className="text-muted small fw-bold text-uppercase" style={{ letterSpacing: '0.5px' }}>Price / Night</div>
                      <div className="fw-bolder fs-4 text-primary-custom">₹{Number(room.pricePerNight).toLocaleString('en-IN')}</div>
                    </div>
                  </div>

                  <div className="p-3 bg-light d-flex gap-2 border-top">
                    <button onClick={() => { setEditingRoom(room); setAddingRoom(false); }} className="btn btn-outline-secondary btn-sm flex-grow-1 fw-bold hover-lift">
                      <i className="bi bi-pencil-square me-1"></i> Edit Room
                    </button>
                    <button onClick={() => deleteRoomCategory(room.roomCategoryId)} className="btn btn-outline-danger btn-sm px-3 hover-lift" title="Delete Category">
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default ManageRooms;
