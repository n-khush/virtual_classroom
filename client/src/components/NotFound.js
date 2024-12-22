const NotFound = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
      <h2 className="text-4xl font-bold text-red-600 mb-4">404 - Page Not Found</h2>
      <p className="text-lg text-gray-600 mb-6">Sorry, the page you are looking for does not exist.</p>
      <button
        className="px-6 py-3 text-lg bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition duration-300"
        onClick={() => window.location.href = '/'}
      >
        Go to Home
      </button>
    </div>
  );
  
  export default NotFound;
  