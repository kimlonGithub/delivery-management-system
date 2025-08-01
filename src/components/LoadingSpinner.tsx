export default function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading Delivery Management System...</p>
        <p className="mt-2 text-sm text-gray-500">Please wait while we initialize the application</p>
      </div>
    </div>
  );
} 