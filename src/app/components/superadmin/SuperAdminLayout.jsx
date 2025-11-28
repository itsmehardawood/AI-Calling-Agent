import SuperAdminSidebar from "./SuperAdminSidebar";

export default function SuperAdminLayout({ children }) {
  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      <SuperAdminSidebar />
      
      {/* Main content */}
      <div className="lg:ml-64 flex flex-col w-0 flex-1 overflow-hidden">
        <main className="flex-1 relative overflow-y-auto focus:outline-none pt-16 lg:pt-0">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
