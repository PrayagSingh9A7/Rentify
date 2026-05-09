import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';

function LocalityAdvisor() {
  const [form, setForm] = useState({ city: '', locality: '', budget: '', propertyType: 'pg' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/ai/locality-advisor', form);
      setResult(data.data);
    } catch { toast.error('Analysis failed. Try again.'); }
    setLoading(false);
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-xl">🏘️</div>
        <div>
          <h3 className="font-semibold text-lg">AI Locality Advisor</h3>
          <p className="text-xs text-text-muted">Get smart insights about any locality</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 mb-5">
        <div className="grid grid-cols-2 gap-3">
          <input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City (e.g. Bangalore)" className="input-field" />
          <input value={form.locality} onChange={(e) => setForm({ ...form, locality: e.target.value })} placeholder="Locality (optional)" className="input-field" />
          <input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="Your budget (₹)" className="input-field" />
          <select value={form.propertyType} onChange={(e) => setForm({ ...form, propertyType: e.target.value })} className="input-field">
            {['pg', 'flat', 'room', 'studio'].map((t) => <option key={t} value={t}>{t.toUpperCase()}</option>)}
          </select>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Analyzing locality...
            </span>
          ) : '✨ Analyze Locality'}
        </button>
      </form>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-surface-secondary rounded-2xl p-5 space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🤖</span>
              <div>
                <p className="font-semibold text-sm mb-1">AI Analysis for {result.locality}</p>
                <p className="text-sm text-text-secondary leading-relaxed">{result.recommendation}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total Listings', value: result.totalListings },
                { label: 'Avg Rent', value: `₹${result.averageRent?.toLocaleString()}` },
                { label: 'Available Now', value: result.availableNow },
                { label: 'Budget Fit', value: result.budgetFit },
              ].map((item) => (
                <div key={item.label} className="bg-white rounded-xl p-3 text-center">
                  <p className="font-bold text-sm">{item.value}</p>
                  <p className="text-xs text-text-muted">{item.label}</p>
                </div>
              ))}
            </div>
            {result.topAmenities?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-text-secondary mb-2">Top Amenities Available</p>
                <div className="flex flex-wrap gap-1.5">
                  {result.topAmenities.map((a) => <span key={a} className="tag capitalize">{a}</span>)}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ExpensePredictor() {
  const [form, setForm] = useState({ rent: '', city: '', furnishing: 'furnished', occupancy: 'single' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/ai/expense-predictor', form);
      setResult(data.data);
    } catch { toast.error('Prediction failed'); }
    setLoading(false);
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-xl">💰</div>
        <div>
          <h3 className="font-semibold text-lg">AI Expense Predictor</h3>
          <p className="text-xs text-text-muted">Know your true monthly cost before moving in</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 mb-5">
        <div className="grid grid-cols-2 gap-3">
          <input required type="number" value={form.rent} onChange={(e) => setForm({ ...form, rent: e.target.value })} placeholder="Monthly Rent (₹)" className="input-field" />
          <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" className="input-field" />
          <select value={form.furnishing} onChange={(e) => setForm({ ...form, furnishing: e.target.value })} className="input-field">
            {['furnished', 'semi-furnished', 'unfurnished'].map((f) => <option key={f} value={f} className="capitalize">{f}</option>)}
          </select>
          <select value={form.occupancy} onChange={(e) => setForm({ ...form, occupancy: e.target.value })} className="input-field">
            {['single', 'double', 'triple'].map((o) => <option key={o} value={o} className="capitalize">{o}</option>)}
          </select>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Calculating...' : '💡 Predict My Expenses'}
        </button>
      </form>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="bg-surface-secondary rounded-2xl p-5">
              <p className="text-xs font-semibold text-text-secondary mb-3">Monthly Expense Breakdown</p>
              <div className="space-y-2.5">
                {Object.entries(result.breakdown).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-3">
                    <p className="text-sm capitalize text-text-secondary w-28">{key}</p>
                    <div className="flex-1 bg-surface-tertiary rounded-full h-2">
                      <div className="bg-accent rounded-full h-2 transition-all" style={{ width: `${Math.min(100, (val / result.total) * 100)}%` }} />
                    </div>
                    <p className="text-sm font-semibold w-20 text-right">₹{val?.toLocaleString()}</p>
                  </div>
                ))}
                <div className="flex justify-between pt-3 border-t border-surface-tertiary font-bold">
                  <span>Total Monthly Cost</span>
                  <span className="text-accent text-lg">₹{result.total?.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="bg-amber-50 rounded-2xl p-4">
              <p className="text-xs font-semibold text-amber-700 mb-2">💡 Money-Saving Tips</p>
              <ul className="space-y-1.5">
                {result.tips.map((tip, i) => (
                  <li key={i} className="text-xs text-amber-800 flex items-start gap-1.5">
                    <span className="mt-0.5">•</span>{tip}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AIAdvisorPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-24 min-h-screen">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-accent/10 text-accent text-xs px-4 py-1.5 rounded-full mb-4 font-medium">
          ✨ AI-Powered Features
        </div>
        <h1 className="font-display text-4xl font-bold mb-3">Smart Rental Advisor</h1>
        <p className="text-text-secondary max-w-xl mx-auto text-sm leading-relaxed">
          Use our AI tools to make better decisions — analyze localities, predict expenses, and get personalized recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LocalityAdvisor />
        <ExpensePredictor />
      </div>

      {/* Premium feature callouts */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: '🎯', title: 'Smart Recommendations', desc: 'AI picks properties matching your exact lifestyle and budget', badge: 'Active' },
          { icon: '📊', title: 'Budget Insights', desc: 'Visual breakdown of all rental costs in your target city', badge: 'Coming Soon' },
          { icon: '🤝', title: 'Flatmate Matcher', desc: 'Find compatible roommates based on lifestyle and preferences', badge: 'Coming Soon' },
        ].map((f) => (
          <div key={f.title} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{f.icon}</span>
              <span className={`badge text-xs ${f.badge === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-surface-secondary text-text-muted'}`}>{f.badge}</span>
            </div>
            <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
            <p className="text-xs text-text-muted">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}