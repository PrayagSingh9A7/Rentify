import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  open: 'bg-red-100 text-red-700',
  'in-progress': 'bg-yellow-100 text-yellow-700',
  resolved: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-gray-100 text-gray-500',
};
const PRIORITY_COLORS = {
  low: 'bg-blue-100 text-blue-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

export default function MaintenancePage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'plumbing', priority: 'medium', propertyId: '' });
  const [properties, setProperties] = useState([]);
  const { user } = useAuthStore();

  useEffect(() => {
    api.get('/maintenance').then(({ data }) => setComplaints(data.data)).catch(() => {}).finally(() => setLoading(false));
    if (user?.role === 'tenant') {
      api.get('/users/recently-viewed').then(({ data }) => setProperties(data.data?.slice(0, 10) || [])).catch(() => {});
    }
  }, []);

  const submitComplaint = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/maintenance', form);
      setComplaints([data.data, ...complaints]);
      setShowForm(false);
      setForm({ title: '', description: '', category: 'plumbing', priority: 'medium', propertyId: '' });
      toast.success('Complaint submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const { data } = await api.put(`/maintenance/${id}/status`, { status });
      setComplaints((c) => c.map((x) => x._id === id ? data.data : x));
      toast.success(`Status updated to ${status}`);
    } catch { toast.error('Error'); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-24 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold">Maintenance</h1>
          <p className="text-text-secondary text-sm mt-1">Track and manage maintenance requests</p>
        </div>
        {user?.role === 'tenant' && (
          <button onClick={() => setShowForm(true)} className="btn-primary">+ File Complaint</button>
        )}
      </div>

      {/* Complaint form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card p-6 mb-6">
          <h2 className="font-semibold text-lg mb-4">New Maintenance Request</h2>
          <form onSubmit={submitComplaint} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Issue Title *</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g., Leaking tap in bathroom" className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Category *</label>
                <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
                  {['plumbing', 'electrical', 'carpentry', 'appliance', 'cleaning', 'pest', 'other'].map((c) => (
                    <option key={c} value={c} className="capitalize">{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Priority</label>
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="input-field">
                  {['low', 'medium', 'high', 'urgent'].map((p) => <option key={p} value={p} className="capitalize">{p}</option>)}
                </select>
              </div>
              {properties.length > 0 && (
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">Property</label>
                  <select required value={form.propertyId} onChange={(e) => setForm({ ...form, propertyId: e.target.value })} className="input-field">
                    <option value="">Select property</option>
                    {properties.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
                  </select>
                </div>
              )}
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Description *</label>
                <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the issue in detail..." className="input-field resize-none" />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary text-sm py-2.5">Submit Request</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm py-2.5">Cancel</button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Complaints list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="skeleton h-28 rounded-3xl" />)}
        </div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-3">🔧</p>
          <h3 className="font-display text-xl font-semibold mb-2">No complaints yet</h3>
          <p className="text-text-muted text-sm">
            {user?.role === 'tenant' ? 'File a maintenance request when something needs fixing' : 'No maintenance requests from your tenants'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map((c) => (
            <motion.div key={c._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-semibold text-sm">{c.title}</h3>
                  {c.property && <p className="text-xs text-accent mt-0.5">{c.property.title}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`badge text-xs capitalize ${PRIORITY_COLORS[c.priority]}`}>{c.priority}</span>
                  <span className={`badge text-xs capitalize ${STATUS_COLORS[c.status]}`}>{c.status}</span>
                </div>
              </div>
              <p className="text-sm text-text-secondary mb-3">{c.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-text-muted">
                  <span className="capitalize">📂 {c.category}</span>
                  <span>🕐 {format(new Date(c.createdAt), 'MMM d, yyyy')}</span>
                  {c.tenant && <span>👤 {c.tenant.name}</span>}
                </div>
                {user?.role === 'owner' && c.status !== 'closed' && (
                  <div className="flex gap-2">
                    {c.status === 'open' && (
                      <button onClick={() => updateStatus(c._id, 'in-progress')} className="text-xs px-3 py-1.5 rounded-xl bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100 transition-colors">
                        Start
                      </button>
                    )}
                    {c.status === 'in-progress' && (
                      <button onClick={() => updateStatus(c._id, 'resolved')} className="text-xs px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors">
                        Mark Resolved
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}