// components/admin/PlaceholderPage.jsx
import { Building2Icon, Settings, UserIcon, FileTextIcon, Construction } from 'lucide-react';

export default function PlaceholderPage({ title, description, icon = "construction" }) {
  const getIcon = () => {
    switch (icon) {
      case "business":
        return <Building2Icon className="w-12 h-12 text-blue-500" />;
      case "users":
        return <UserIcon className="w-12 h-12 text-green-500" />;
      case "settings":
        return <Settings className="w-12 h-12 text-blue-500" />;
      case "prompts":
        return <FileTextIcon className="w-12 h-12 text-orange-500" />;
      case "construction":
      default:
        return <Construction className="w-12 h-12 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          {getIcon()}
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          {description}
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Construction className="w-5 h-5 text-yellow-600" />
            <span className="text-yellow-800 font-medium">Page Under Development</span>
          </div>
          <p className="text-yellow-700 text-sm">
            This page is currently being implemented.
          </p>
        </div>
      </div>
    </div>
  );
}