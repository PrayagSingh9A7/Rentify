import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import api from '../../services/api';
import usePropertyStore from '../../store/propertyStore';
import toast from 'react-hot-toast';
import useBookingStore from '../../store/bookingStore';
import useInquiryStore from '../../store/inquiryStore';
import useNotificationStore from '../../store/notificationStore';

function StatCard({ icon, label, value, sub, color = 'accent' }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-${color}/10 flex items-center justify-center text-xl`}>{icon}</div>
      </div>
      <p className="font-display text-2xl font-bold text-text-primary">{value}</p>
      <p className="text-sm text-text-secondary mt-0.5">{label}</p>
      {sub && <p className="text-xs text-text-muted mt-1">{sub}</p>}
    </div>
  );
}

export default function OwnerDashboardPage() {
  const [stats, setStats] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { deleteProperty } = usePropertyStore();
  const {
  ownerBookings,
  fetchOwnerBookings,
  approveBooking,
  rejectBooking,
} = useBookingStore();

const {
  ownerInquiries,
  fetchOwnerInquiries,
} = useInquiryStore();

const {
  notifications,
  fetchNotifications,
} = useNotificationStore();

  useEffect(() => {
   Promise.all([
  api.get('/users/dashboard'),
  api.get('/properties/owner/my-listings'),

  fetchOwnerBookings(),
  fetchOwnerInquiries(),
  fetchNotifications()

]).then(([statsRes, listRes]) => {
      setStats(statsRes.data.data);
      setListings(listRes.data.data);
    }).catch(() => toast.error('Failed to load dashboard')).finally(() => setLoading(false));
  }, [fetchNotifications, fetchOwnerBookings, fetchOwnerInquiries]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this property?')) return;
    const { success } = await deleteProperty(id);
    if (success) {
      setListings((l) => l.filter((p) => p._id !== id));
      toast.success('Property deleted');
    } else {
      toast.error('Error deleting property');
    }
  };

  const handleToggleAvailability = async (id, current) => {
    try {
      await api.put(`/properties/${id}`, { isAvailable: !current });
      setListings((l) => l.map((p) => p._id === id ? { ...p, isAvailable: !current } : p));
      toast.success(`Marked as ${!current ? 'available' : 'occupied'}`);
    } catch { toast.error('Error updating'); }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-32 rounded-3xl" />)}
        </div>
        <div className="skeleton h-96 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 min-h-screen">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold">Owner Dashboard</h1>
          <p className="text-text-secondary text-sm mt-1">Manage your listings and track performance</p>
        </div>
       <div className="flex gap-3 flex-wrap">

    <Link
        to="/dashboard/bookings"
        className="btn-secondary"
    >
        📅 Bookings
    </Link>

    <Link
        to="/dashboard/inquiries"
        className="btn-secondary"
    >
        💬 Inquiries
    </Link>
    <Link
        to="/dashboard/notifications"
        className="btn-secondary"
    >
        🔔 Notifications
    </Link>

    <Link
        to="/dashboard/add-property"
        className="btn-primary"
    >
        + Add Property
    </Link>

</div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon="🏠" label="Total Properties" value={stats?.totalProperties || listings.length} />
        <StatCard icon="✅" label="Active Listings" value={stats?.activeListings || 0} sub="Currently available" />
        <StatCard icon="👁️" label="Total Views" value={stats?.totalViews?.toLocaleString() || 0} />
        <StatCard icon="📩" label="Inquiries" value={stats?.totalInquiries || 0} sub="This month" />
        <StatCard
icon="🔔"
label="Notifications"
value={notifications.length}
/>
<div className="grid grid-cols-2 gap-4 mb-8">

<StatCard
icon="📅"
label="Bookings"
value={ownerBookings.length}
/>

<StatCard
icon="💬"
label="Messages"
value={ownerInquiries.length}
/>

</div>
      </div>

      {/* Listings */}
<div className="card overflow-hidden">

  <div className="p-5 border-b border-surface-secondary flex items-center justify-between">

    <div>

      <h2 className="font-semibold text-lg">
        Your Listings
      </h2>

      <p className="text-xs text-text-muted mt-1">
        Manage all your listed properties
      </p>

    </div>

    <span className="badge bg-accent/10 text-accent">

      {listings.length} Properties

    </span>

  </div>

  {
    listings.length === 0 ? (

      <div className="text-center py-20">

        <div className="text-6xl mb-5">

          🏠

        </div>

        <h3 className="text-xl font-bold">

          No Properties Found

        </h3>

        <p className="text-sm text-text-muted mt-2 mb-6">

          Start by adding your first property.

        </p>

        <Link
          to="/dashboard/add-property"
          className="btn-primary"
        >
          Add Property
        </Link>

      </div>

    ) : (

      <div className="divide-y divide-surface-secondary">

        {

          listings.map((property)=>(

            <motion.div

              key={property._id}

              whileHover={{scale:1.01}}

              className="p-5 flex gap-5 items-center"

            >

              {/* IMAGE */}

              <div className="w-28 h-24 rounded-2xl overflow-hidden bg-surface-secondary shrink-0">

                {

                  property.images?.length ?

                  (

                    <img

                      src={property.images[0].url}

                      className="w-full h-full object-cover"

                    />

                  )

                  :

                  (

                    <div className="flex items-center justify-center h-full text-4xl">

                      🏠

                    </div>

                  )

                }

              </div>

              {/* INFO */}

              <div className="flex-1">

                <div className="flex items-center gap-2 flex-wrap">

                  <h3 className="font-bold text-lg">

                    {property.title}

                  </h3>

                  <span className={`badge ${
                    property.isAvailable
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}>

                    {property.isAvailable
                      ? "Available"
                      : "Occupied"}

                  </span>

                </div>

                <p className="text-sm text-text-muted mt-1">

                  {property.address?.locality},{" "}
                  {property.address?.city}

                </p>

                <div className="flex gap-5 mt-3 text-sm flex-wrap">

                  <span>

                    💰 ₹{property.rent?.toLocaleString()}/month

                  </span>

                  <span>

                    👁 {property.viewCount || 0} Views

                  </span>

                  <span>

                    📅 {property.bookingCount || 0} Bookings

                  </span>

                  <span>

                    💬 {property.inquiryCount || 0} Inquiries

                  </span>

                </div>

              </div>

              {/* ACTIONS */}

              <div className="flex flex-col gap-2">

                <Link

                  to={`/property/${property._id}`}

                  className="btn-primary text-xs text-center"

                >

                  View

                </Link>

                <Link

                  to={`/dashboard/edit-property/${property._id}`}

                  className="btn-secondary text-xs text-center"

                >

                  Edit

                </Link>

                <button

                  onClick={()=>

                    handleToggleAvailability(

                      property._id,

                      property.isAvailable

                    )

                  }

                  className="btn-secondary text-xs"

                >

                  {

                    property.isAvailable

                    ?

                    "Mark Occupied"

                    :

                    "Mark Available"

                  }

                </button>

                <button

                  onClick={()=>

                    handleDelete(property._id)

                  }

                  className="rounded-xl bg-red-500 text-white py-2 text-xs hover:bg-red-600"

                >

                  Delete

                </button>

              </div>

            </motion.div>

          ))

        }

      </div>

    )

  }

</div>

{/* Recent Bookings */}

<div className="card mt-8">

 <div className="p-5 border-b flex items-center justify-between">

    <h2 className="font-bold text-lg">

        Recent Booking Requests

    </h2>

    <Link

        to="/dashboard/bookings"

        className="text-accent text-sm font-medium hover:underline"

    >

        View All →

    </Link>

</div>

  {

    ownerBookings.length===0

    ?

    (

      <div className="p-10 text-center text-text-muted">

        No booking requests yet.

      </div>

    )

    :

    ownerBookings.slice(0,5).map((booking)=>(

      <div

        key={booking._id}

        className="flex items-center justify-between p-5 border-b"

      >

        <div>

          <h3 className="font-semibold">

            {booking.tenant?.name}

          </h3>

          <p className="text-sm text-text-muted">

            {booking.property?.title}

          </p>

          <p className="text-xs mt-1">

            {booking.visitDate}

          </p>

        </div>

        <div className="flex gap-2">

          <button

            onClick={()=>

              approveBooking(booking._id)

            }

            className="px-3 py-2 rounded-lg bg-green-600 text-white"

          >

            Approve

          </button>

          <button

            onClick={()=>

              rejectBooking(booking._id)

            }

            className="px-3 py-2 rounded-lg bg-red-600 text-white"

          >

            Reject

          </button>

        </div>

      </div>

    ))

  }

</div>

{/* Recent Inquiries */}

<div className="card mt-8">

  <div className="p-5 border-b">

    <h2 className="font-bold text-lg">

      Recent Inquiries

    </h2>

  </div>

  {

    ownerInquiries.length===0

    ?

    (

      <div className="p-10 text-center text-text-muted">

        No inquiries found.

      </div>

    )

    :

    ownerInquiries.slice(0,5).map((item)=>(

      <div

        key={item._id}

        className="border-b p-5"

      >

        <h3 className="font-semibold">

          {item.user?.name}

        </h3>

        <p className="text-sm mt-2">

          {item.message}

        </p>

      </div>

    ))

  }

</div>

{/* Notifications */}

<div className="card mt-8 mb-10">

  <div className="p-5 border-b">

    <h2 className="font-bold text-lg">

      Latest Notifications

    </h2>

  </div>

  {

    notifications.length===0

    ?

    (

      <div className="p-10 text-center text-text-muted">

        No notifications.

      </div>

    )

    :

    notifications.slice(0,5).map((item)=>(

      <div

        key={item._id}

        className="border-b p-5"

      >

        <h3 className="font-semibold">

          {item.title}

        </h3>

        <p className="text-sm text-text-muted mt-1">

          {item.message}

        </p>

      </div>

    ))

  }

</div>
    </div>
  );
}
