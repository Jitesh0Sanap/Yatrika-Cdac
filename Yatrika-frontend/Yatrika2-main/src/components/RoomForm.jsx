import { useEffect, useState } from 'react';

const emptyRoom = {
  roomType: 'SINGLE',
  quantity: 1,
  capacity: 1,
  pricePerNight: '',
  description: '',
};

function RoomForm({ initialRoom, submitLabel, onSubmit, saving }) {
  const [room, setRoom] = useState(emptyRoom);

  useEffect(() => {
    setRoom({
      ...emptyRoom,
      ...initialRoom,
      roomType: initialRoom?.roomType || 'SINGLE',
      quantity: initialRoom?.totalRooms || 1,
      pricePerNight: initialRoom?.pricePerNight ?? initialRoom?.price ?? '',
    });
  }, [initialRoom]);

  const submit = (event) => {
    event.preventDefault();
    onSubmit({
      ...room,
      capacity: Number(room.capacity),
      pricePerNight: Number(room.pricePerNight),
      quantity: Number(room.quantity),
    });
  };

  return (
    <form className="p-4 p-md-5 bg-white rounded-4 shadow-sm border mb-4" onSubmit={submit}>
      <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
        <div className="rounded-circle d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary-custom me-3" style={{ width: '48px', height: '48px' }}>
          <i className="bi bi-door-open fs-4"></i>
        </div>
        <h3 className="fw-bold mb-0">Room Category Details</h3>
      </div>
      
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <label className="form-label small fw-bold text-uppercase text-muted" style={{ letterSpacing: '1px' }}>Room Type</label>
          <select className="form-control-custom" value={room.roomType} onChange={(e) => setRoom({ ...room, roomType: e.target.value })}>
            <option value="SINGLE">SINGLE</option>
            <option value="DOUBLE">DOUBLE</option>
            <option value="DELUXE">DELUXE</option>
            <option value="SUITE">SUITE</option>
          </select>
        </div>
        
        <div className="col-md-6">
          <label className="form-label small fw-bold text-uppercase text-muted" style={{ letterSpacing: '1px' }}>Total Rooms of this type</label>
          <input className="form-control-custom" required type="number" min="1" value={room.quantity} onChange={(e) => setRoom({ ...room, quantity: e.target.value })} placeholder="e.g. 5" />
        </div>
        
        <div className="col-md-6">
          <label className="form-label small fw-bold text-uppercase text-muted" style={{ letterSpacing: '1px' }}>Max Guests per room</label>
          <div className="position-relative">
            <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"><i className="bi bi-people"></i></span>
            <input className="form-control-custom ps-5" required type="number" min="1" value={room.capacity} onChange={(e) => setRoom({ ...room, capacity: e.target.value })} placeholder="e.g. 2" />
          </div>
        </div>

        <div className="col-md-6">
          <label className="form-label small fw-bold text-uppercase text-muted" style={{ letterSpacing: '1px' }}>Price (per night)</label>
          <div className="position-relative">
            <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted">₹</span>
            <input className="form-control-custom ps-5" required type="number" min="1" value={room.pricePerNight} onChange={(e) => setRoom({ ...room, pricePerNight: e.target.value })} placeholder="1500" />
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <label className="form-label small fw-bold text-uppercase text-muted" style={{ letterSpacing: '1px' }}>Description</label>
        <textarea 
          className="form-control-custom" 
          required 
          rows="4"
          maxLength="1000" 
          value={room.description} 
          onChange={(e) => setRoom({ ...room, description: e.target.value })} 
          placeholder="Describe the room features, view, and layout..."
        />
        <div className="text-end small text-muted mt-1">{room.description.length}/1000 characters</div>
      </div>
      
      <div className="d-flex justify-content-end pt-3 border-top">
        <button className="btn-primary-custom px-5 py-3 text-uppercase fw-bold" disabled={saving} type="submit" style={{ letterSpacing: '1px' }}>
          {saving ? (
            <><span className="spinner-border spinner-border-sm me-2"></span> Saving...</>
          ) : (
            <><i className="bi bi-check2 me-2"></i> {submitLabel}</>
          )}
        </button>
      </div>
    </form>
  );
}

export default RoomForm;
