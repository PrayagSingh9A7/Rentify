import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import useBookingStore from '../../store/bookingStore';

const TIME_SLOTS = ['09:00', '11:00', '13:00', '15:00', '17:00'];

const tomorrow = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
};

export default function BookingModal({ propertyId, property, onClose }) {
  const createBooking = useBookingStore((state) => state.createBooking);
  const [visitDate, setVisitDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const minDate = useMemo(() => tomorrow(), []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    const result = await createBooking({ property: propertyId, visitDate, timeSlot, message });
    setSubmitting(false);

    if (result.success) {
      toast.success('Visit request sent');
      onClose();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onMouseDown={onClose}>
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-card-hover overflow-hidden" onMouseDown={(event) => event.stopPropagation()}>
        <div className="p-6 border-b border-surface-secondary">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold">Schedule a visit</h2>
              <p className="text-sm text-text-muted mt-1">{property?.title || 'Choose a date and time that works for you.'}</p>
            </div>
            <button type="button" onClick={onClose} className="w-9 h-9 rounded-xl bg-surface-secondary hover:bg-surface-tertiary transition-colors">x</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">Visit date</label>
            <input type="date" min={minDate} required value={visitDate} onChange={(e) => setVisitDate(e.target.value)} className="input-field" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">Preferred time</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setTimeSlot(slot)}
                  className={`rounded-xl border px-3 py-2 text-sm transition-all ${timeSlot === slot ? 'bg-accent text-white border-accent' : 'border-surface-tertiary text-text-secondary hover:border-accent/50'}`}
                >
                  {slot}
                </button>
              ))}
            </div>
            <input className="sr-only" required value={timeSlot} onChange={() => {}} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">Message to owner</label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share your preferred move-in timeline or questions."
              className="input-field resize-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary sm:flex-1">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary sm:flex-1">{submitting ? 'Sending...' : 'Request visit'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
