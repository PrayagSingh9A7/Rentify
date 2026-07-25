import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import PropertyCard from '../components/property/PropertyCard';

const PROPERTY_TYPES = ['Apartment', 'Independent Floor', 'Studio Apartment', 'Villa', 'Independent House'];
const AMENITIES = ['WiFi', 'Parking', 'Security', 'Laundry', 'Gym', 'AC', 'Power Backup', 'Cooking Allowed'];
const PURPOSES = ['Student', 'Family', 'Working Professional'];

function ToolShell({ title, subtitle, children }) {
  return (
    <section className="bg-white rounded-3xl shadow-card p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="font-display text-xl font-bold">{title}</h2>
        <p className="text-sm text-text-muted mt-1">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function LocalityAdvisor() {
  const [form, setForm] = useState({ city: '', locality: '', budget: '', propertyType: 'Apartment' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/ai/locality-advisor', form);
      setResult(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolShell title="AI Locality Advisor" subtitle="Compare a city or locality using the current Rentify inventory.">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" className="input-field" />
        <input value={form.locality} onChange={(e) => setForm({ ...form, locality: e.target.value })} placeholder="Locality optional" className="input-field" />
        <input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="Budget" className="input-field" />
        <select value={form.propertyType} onChange={(e) => setForm({ ...form, propertyType: e.target.value })} className="input-field">
          {PROPERTY_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
        </select>
        <button type="submit" disabled={loading} className="btn-primary sm:col-span-2">{loading ? 'Analyzing...' : 'Analyze locality'}</button>
      </form>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-5 bg-surface-secondary rounded-2xl p-5">
            <p className="text-sm leading-relaxed text-text-secondary">{result.recommendation}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {[
                ['Listings', result.totalListings],
                ['Avg rent', `Rs ${result.averageRent?.toLocaleString()}`],
                ['Available', result.availableNow],
                ['Budget fit', result.budgetFit],
              ].map(([label, value]) => (
                <div key={label} className="bg-white rounded-2xl p-3">
                  <p className="font-bold text-sm">{value}</p>
                  <p className="text-xs text-text-muted mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ToolShell>
  );
}

function ExpensePredictor() {
  const [form, setForm] = useState({ rent: '', city: '', furnishing: 'furnished', occupancy: 'single' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/ai/expense-predictor', form);
      setResult(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolShell title="AI Expense Predictor" subtitle="Estimate monthly living cost before scheduling visits.">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input required type="number" value={form.rent} onChange={(e) => setForm({ ...form, rent: e.target.value })} placeholder="Monthly rent" className="input-field" />
        <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" className="input-field" />
        <select value={form.furnishing} onChange={(e) => setForm({ ...form, furnishing: e.target.value })} className="input-field">
          {['furnished', 'semi-furnished', 'unfurnished'].map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <select value={form.occupancy} onChange={(e) => setForm({ ...form, occupancy: e.target.value })} className="input-field">
          {['single', 'double', 'triple'].map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <button type="submit" disabled={loading} className="btn-primary sm:col-span-2">{loading ? 'Calculating...' : 'Predict expenses'}</button>
      </form>

      {result && (
        <div className="mt-5 bg-surface-secondary rounded-2xl p-5">
          <div className="flex justify-between items-baseline border-b border-surface-tertiary pb-3 mb-3">
            <span className="font-semibold">Estimated monthly total</span>
            <span className="font-display text-2xl font-bold text-accent">Rs {result.total?.toLocaleString()}</span>
          </div>
          <div className="space-y-2">
            {Object.entries(result.breakdown).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="capitalize text-text-secondary">{key}</span>
                <span className="font-medium">Rs {value?.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </ToolShell>
  );
}

function PropertyRecommender() {
  const [form, setForm] = useState({
    budget: '',
    city: '',
    propertyType: 'Apartment',
    bhk: '',
    furnishing: '',
    amenities: [],
    purpose: 'Working Professional',
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleAmenity = (amenity) => {
    setForm((current) => ({
      ...current,
      amenities: current.amenities.includes(amenity)
        ? current.amenities.filter((item) => item !== amenity)
        : [...current.amenities, amenity],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/ai/property-recommender', form);
      setResults(data.data || []);
      if (!data.data?.length) toast('No strong matches found. Try widening your filters.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Recommendation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolShell title="AI Property Recommender" subtitle="Rank real properties by fit, not random popularity.">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <input required type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="Max budget" className="input-field" />
        <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" className="input-field" />
        <select value={form.propertyType} onChange={(e) => setForm({ ...form, propertyType: e.target.value })} className="input-field">
          {PROPERTY_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
        </select>
        <select value={form.bhk} onChange={(e) => setForm({ ...form, bhk: e.target.value })} className="input-field">
          <option value="">Any BHK</option>
          {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value} BHK</option>)}
        </select>
        <select value={form.furnishing} onChange={(e) => setForm({ ...form, furnishing: e.target.value })} className="input-field">
          <option value="">Any furnishing</option>
          {['furnished', 'semi-furnished', 'unfurnished'].map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <select value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} className="input-field">
          {PURPOSES.map((purpose) => <option key={purpose} value={purpose}>{purpose}</option>)}
        </select>
        <div className="sm:col-span-2 lg:col-span-4 flex flex-wrap gap-2">
          {AMENITIES.map((amenity) => (
            <button
              type="button"
              key={amenity}
              onClick={() => toggleAmenity(amenity)}
              className={`px-3 py-1.5 rounded-xl text-xs border transition-all ${form.amenities.includes(amenity) ? 'bg-accent text-white border-accent' : 'bg-white border-surface-tertiary text-text-secondary'}`}
            >
              {amenity}
            </button>
          ))}
        </div>
        <button type="submit" disabled={loading} className="btn-primary sm:col-span-2 lg:col-span-4">{loading ? 'Ranking properties...' : 'Find best matches'}</button>
      </form>

      {results.length > 0 && (
        <div className="mt-6 space-y-5">
          {results.map((item, index) => (
            <div key={item.property._id} className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-4 bg-surface-secondary rounded-3xl p-4">
              <PropertyCard property={item.property} />
              <div className="bg-white rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-display font-bold text-xl">Rank #{index + 1}</p>
                  <span className="badge bg-accent/10 text-accent">{item.score}/100 match</span>
                </div>
                <div className="space-y-2">
                  {item.reasons.map((reason) => (
                    <p key={reason} className="text-sm text-text-secondary">✓ {reason}</p>
                  ))}
                  {item.tradeoffs?.map((tradeoff) => (
                    <p key={tradeoff} className="text-sm text-text-muted">• {tradeoff}</p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ToolShell>
  );
}

export default function AIAdvisorPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 min-h-screen">
      <div className="mb-10">
        <span className="inline-flex bg-accent/10 text-accent text-xs px-4 py-1.5 rounded-full font-medium mb-4">Data-backed rental intelligence</span>
        <h1 className="font-display text-4xl font-bold mb-3">Smart Rental Advisor</h1>
        <p className="text-text-secondary max-w-2xl text-sm leading-relaxed">
          Compare locations, forecast monthly costs, and rank real Rentify properties using explainable scoring.
        </p>
      </div>

      <div className="space-y-6">
        <PropertyRecommender />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LocalityAdvisor />
          <ExpensePredictor />
        </div>
      </div>
    </div>
  );
}
