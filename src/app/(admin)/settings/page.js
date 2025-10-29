// app/admin/settings/page.jsx
import AdminLayout from '@/app/components/admin/AdminLayout';
import PlaceholderPage from '@/app/components/admin/placeholderPage';
// import PlaceholderPage from '@/components/admin/PlaceholderPage';

export default function SettingsPage() {
  return (
    <AdminLayout>
    <PlaceholderPage 
      title="Settings"
      description="Configure system settings and preferences"
      icon="settings"
    />
    </AdminLayout>
  );
}