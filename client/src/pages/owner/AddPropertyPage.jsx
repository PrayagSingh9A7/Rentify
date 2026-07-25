import { useMemo, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../services/api';
import usePropertyStore from '../../store/propertyStore';

const AMENITY_OPTIONS = ['WiFi', 'AC', 'Parking', 'Gym', 'Pool', 'Laundry', 'Security', 'Elevator', 'Power Backup', 'Water 24/7', 'Cooking Allowed', 'TV', 'Balcony', 'CCTV'];

const INITIAL_FORM = {
  title: '', description: '', propertyType: 'Apartment', rent: '', deposit: '', maintenanceCharges: '',
  furnishing: 'unfurnished', genderPreference: 'any', occupancy: 'single',
  bhk: 1, bathrooms: 1, area: '', floorNumber: '', totalFloors: '',
  availableFrom: '', noticePeriod: 30, virtualTourUrl: '', isAvailable: true,
  address: { street: '', locality: '', city: '', state: '', pincode: '' },
  amenities: [], rules: [],
};

export default function AddPropertyPage() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [rule, setRule] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { createProperty, updateProperty, fetchProperty } = usePropertyStore();
  const imagePreviews = useMemo(() => images.map((image) => ({ image, url: URL.createObjectURL(image) })), [images]);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [imagePreviews]);

  useEffect(() => {
    if (isEditing) {
      fetchProperty(id).then((p) => {
        if (p) {
          setForm({
            ...INITIAL_FORM,
            ...p,
            propertyType: p.propertyType || p.type || INITIAL_FORM.propertyType,
            address: p.address || INITIAL_FORM.address,
            amenities: p.amenities || [],
            rules: p.rules || [],
          });
          setExistingImages(p.images || []);
        }
      });
    }
  }, [id]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 10,
    onDrop: (files) => setImages((prev) => [...prev, ...files].slice(0, 10)),
  });

  const toggleAmenity = (a) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrls = [...existingImages];

      // Upload new images first
      if (images.length) {
        const fd = new FormData();
        images.forEach((img) => fd.append('images', img));
        const { data } = await api.post('/upload/images', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        imageUrls = [...imageUrls, ...data.data];
      }

      const payload = {
        ...form,
        images: imageUrls,
        address: JSON.stringify(form.address),
        amenities: JSON.stringify(form.amenities),
        rules: JSON.stringify(form.rules),
        rent: Number(form.rent),
        deposit: Number(form.deposit || 0),
        maintenanceCharges: Number(form.maintenanceCharges || 0),
        bhk: Number(form.bhk),
        bathrooms: Number(form.bathrooms),
        area: Number(form.area || 0),
        floorNumber: Number(form.floorNumber || 0),
        totalFloors: Number(form.totalFloors || 1),
        noticePeriod: Number(form.noticePeriod || 30),
      };

      const result = isEditing ? await updateProperty(id, payload) : await createProperty(payload);
      if (result.success) {
        toast.success(isEditing ? 'Property updated!' : 'Property listed successfully! 🏠');
        navigate('/dashboard');
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error('Something went wrong');
    }
    setLoading(false);
  };

  const fieldProps = (key, nested) => ({
    value: nested ? form[nested][key] : form[key],
    onChange: (e) => nested
      ? setForm((f) => ({ ...f, [nested]: { ...f[nested], [key]: e.target.value } }))
      : setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  const STEPS = ['Basic Info', 'Details', 'Amenities', 'Photos', 'Review'];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-24 min-h-screen">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">{isEditing ? 'Edit Property' : 'List Your Property'}</h1>
        <p className="text-text-secondary text-sm mt-1">Fill in the details to reach thousands of tenants</p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto scrollbar-hide pb-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setStep(i + 1)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                step === i + 1 ? 'bg-accent text-white' : step > i + 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-surface-secondary text-text-muted'
              }`}
            >
              {step > i + 1 ? '✓' : i + 1}. {s}
            </button>
            {i < STEPS.length - 1 && <div className="w-6 h-px bg-surface-tertiary" />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card p-6 space-y-5">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <h2 className="font-semibold text-lg">Basic Information</h2>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Property Title *</label>
                <input required {...fieldProps('title')} placeholder="e.g., Spacious 2BHK near Metro Station" className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Description *</label>
                <textarea required rows={4} {...fieldProps('description')} placeholder="Describe your property — location advantages, nearby facilities, special features..." className="input-field resize-none" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">Type *</label>
                  <select required {...fieldProps('propertyType')} className="input-field">
                    {['Apartment', 'Independent Floor', 'Studio Apartment', 'Villa', 'Independent House'].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">Monthly Rent (₹) *</label>
                  <input required type="number" {...fieldProps('rent')} placeholder="15000" className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">Security Deposit (₹)</label>
                  <input type="number" {...fieldProps('deposit')} placeholder="30000" className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Address *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input {...fieldProps('street', 'address')} placeholder="Street / Building" className="input-field" />
                  <input required {...fieldProps('locality', 'address')} placeholder="Locality / Area *" className="input-field" />
                  <input required {...fieldProps('city', 'address')} placeholder="City *" className="input-field" />
                  <input {...fieldProps('state', 'address')} placeholder="State" className="input-field" />
                  <input {...fieldProps('pincode', 'address')} placeholder="Pincode" className="input-field" />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <h2 className="font-semibold text-lg">Property Details</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">Furnishing</label>
                  <select {...fieldProps('furnishing')} className="input-field">
                    {['furnished', 'semi-furnished', 'unfurnished'].map((f) => <option key={f} value={f} className="capitalize">{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">Preferred For</label>
                  <select {...fieldProps('genderPreference')} className="input-field">
                    <option value="any">Any</option>
                    <option value="male">Boys Only</option>
                    <option value="female">Girls Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">Occupancy</label>
                  <select {...fieldProps('occupancy')} className="input-field">
                    {['single', 'double', 'triple', 'any'].map((o) => <option key={o} value={o} className="capitalize">{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">BHK</label>
                  <input type="number" min={1} max={10} {...fieldProps('bhk')} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">Bathrooms</label>
                  <input type="number" min={1} max={10} {...fieldProps('bathrooms')} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">Area (sq.ft)</label>
                  <input type="number" {...fieldProps('area')} placeholder="800" className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">Maintenance (₹)</label>
                  <input type="number" {...fieldProps('maintenanceCharges')} placeholder="500" className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">Available From</label>
                  <input type="date" {...fieldProps('availableFrom')} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">Notice Period (days)</label>
                  <input type="number" {...fieldProps('noticePeriod')} className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Virtual Tour URL (360°)</label>
                <input type="url" {...fieldProps('virtualTourUrl')} placeholder="https://..." className="input-field" />
              </div>
              {/* House rules */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">House Rules</label>
                <div className="flex gap-2 mb-2">
                  <input value={rule} onChange={(e) => setRule(e.target.value)} placeholder="Add a house rule" className="input-field flex-1" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (rule.trim()) { setForm((f) => ({ ...f, rules: [...f.rules, rule.trim()] })); setRule(''); } } }} />
                  <button type="button" onClick={() => { if (rule.trim()) { setForm((f) => ({ ...f, rules: [...f.rules, rule.trim()] })); setRule(''); } }} className="btn-secondary text-xs py-2 px-3">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.rules.map((r, i) => (
                    <span key={i} className="tag">
                      {r}
                      <button type="button" onClick={() => setForm((f) => ({ ...f, rules: f.rules.filter((_, j) => j !== i) }))} className="ml-1 hover:text-red-500">✕</button>
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Amenities */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <h2 className="font-semibold text-lg">Amenities & Features</h2>
              <p className="text-sm text-text-muted">Select all that apply to your property</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {AMENITY_OPTIONS.map((a) => {
                  const isSelected = form.amenities.includes(a);
                  return (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleAmenity(a)}
                      className={`p-3 rounded-2xl border text-sm font-medium text-left transition-all ${
                        isSelected ? 'bg-accent/10 border-accent text-accent' : 'border-surface-tertiary text-text-secondary hover:border-accent/50'
                      }`}
                    >
                      {isSelected ? '✓ ' : ''}{a}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Step 4: Photos */}
          {step === 4 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <h2 className="font-semibold text-lg">Property Photos</h2>
              <div {...getRootProps()} className={`border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-colors ${isDragActive ? 'border-accent bg-accent/5' : 'border-surface-tertiary hover:border-accent/50'}`}>
                <input {...getInputProps()} />
                <p className="text-3xl mb-3">📸</p>
                <p className="font-medium text-sm">Drop images here or click to browse</p>
                <p className="text-xs text-text-muted mt-1">Up to 10 images, JPG/PNG/WebP</p>
              </div>

              {/* New previews */}
              {images.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-text-secondary mb-2">New photos ({images.length})</p>
                  <div className="flex gap-2 flex-wrap">
                    {imagePreviews.map((preview, i) => (
                      <div key={i} className="relative w-20 h-20">
                        <img src={preview.url} alt="" className="w-full h-full object-cover rounded-2xl" />
                        <button type="button" onClick={() => setImages((imgs) => imgs.filter((_, j) => j !== i))}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Existing images */}
              {existingImages.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-text-secondary mb-2">Existing photos</p>
                  <div className="flex gap-2 flex-wrap">
                    {existingImages.map((img, i) => (
                      <div key={i} className="relative w-20 h-20">
                        <img src={img.url} alt="" className="w-full h-full object-cover rounded-2xl" />
                        <button type="button" onClick={() => setExistingImages((imgs) => imgs.filter((_, j) => j !== i))}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <h2 className="font-semibold text-lg">Review & Submit</h2>
              <div className="bg-surface-secondary rounded-2xl p-5 space-y-3">
                <div className="flex justify-between text-sm"><span className="text-text-muted">Title</span><span className="font-medium text-right max-w-xs">{form.title || '—'}</span></div>
                <div className="flex justify-between text-sm"><span className="text-text-muted">Type</span><span className="font-medium">{form.propertyType}</span></div>
                <div className="flex justify-between text-sm"><span className="text-text-muted">Location</span><span className="font-medium">{form.address.locality}, {form.address.city}</span></div>
                <div className="flex justify-between text-sm"><span className="text-text-muted">Rent</span><span className="font-bold text-accent">₹{Number(form.rent).toLocaleString()}/month</span></div>
                <div className="flex justify-between text-sm"><span className="text-text-muted">Furnishing</span><span className="font-medium capitalize">{form.furnishing}</span></div>
                <div className="flex justify-between text-sm"><span className="text-text-muted">Amenities</span><span className="font-medium">{form.amenities.length} selected</span></div>
                <div className="flex justify-between text-sm"><span className="text-text-muted">Photos</span><span className="font-medium">{images.length + existingImages.length} images</span></div>
              </div>
              <p className="text-xs text-text-muted">By submitting, your listing will be reviewed and published within 24 hours.</p>
            </motion.div>
          )}
        </div>

        {/* Nav buttons */}
        <div className="flex justify-between mt-6 gap-3">
          <button type="button" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1} className="btn-secondary disabled:opacity-40">← Previous</button>
          {step < STEPS.length ? (
            <button type="button" onClick={() => setStep(step + 1)} className="btn-primary">Next →</button>
          ) : (
            <button type="submit" disabled={loading} className="btn-primary px-8">
              {loading ? 'Saving...' : isEditing ? 'Update Property' : 'Publish Listing 🏠'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
