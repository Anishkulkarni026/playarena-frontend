// src/app/owner/venues/new/page.tsx
import ProtectedRoute from '@/components/ProtectedRoute';
import NewVenueForm from '@/components/NewVenueForm'; // We will create this next

export default function NewVenuePage() {
  return (
    // We protect this page, only 'owner' or 'admin' can access it
    <ProtectedRoute allowedRoles={['player', 'owner', 'admin']}>
      <div className="min-h-screen bg-gray-100 pt-20">
        <div className="max-w-2xl mx-auto p-8">
          <h1 className="text-4xl font-bold text-black mb-6">
            List a New Venue
          </h1>
          <p className="text-lg text-gray-700 mb-6">
            Fill out the details below to submit your venue for admin approval.
          </p>
          
          {/* This is the form component we are about to build */}
          <NewVenueForm />
        </div>
      </div>
    </ProtectedRoute>
  );
}