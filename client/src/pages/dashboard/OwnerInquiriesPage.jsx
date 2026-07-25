import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import usePropertyStore from '../../store/propertyStore';

export default function OwnerDashboardPage() {
  const { myProperties, fetchMyProperties, loading } = usePropertyStore();

  useEffect(() => {
    fetchMyProperties();
  }, [fetchMyProperties]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Owner Dashboard</h1>
        <Link to="/dashboard/add-property" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium">
          + Add New Property
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/dashboard/bookings" className="p-6 bg-blue-50 border border-blue-100 rounded-xl hover:shadow-sm">
          <h3 className="text-xl font-bold text-blue-900">Visit Bookings</h3>
          <p className="text-sm text-blue-700 mt-1">Review and respond to scheduled tenant property visits.</p>
        </Link>
        <Link to="/dashboard/inquiries" className="p-6 bg-purple-50 border border-purple-100 rounded-xl hover:shadow-sm">
          <h3 className="text-xl font-bold text-purple-900">Messages & Inquiries</h3>
          <p className="text-sm text-purple-700 mt-1">Reply to tenant messages and questions regarding properties.</p>
        </Link>
      </div>

      <h2 className="text-2xl font-bold pt-4">My Property Listings</h2>
      {loading ? (
        <div>Loading listings...</div>
      ) : myProperties.length === 0 ? (
        <div className="text-gray-500 py-6">You have no active listings. Click above to list a property.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {myProperties.map((p) => (
            <div key={p._id} className="border bg-white rounded-lg p-4 space-y-2">
              <h4 className="font-bold text-lg">{p.title}</h4>
              <p className="text-sm text-gray-500">{p.location?.address}, {p.location?.city}</p>
              <p className="font-semibold text-blue-600">₹{p.rent?.toLocaleString()}/mo</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
