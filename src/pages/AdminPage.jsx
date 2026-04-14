import { useState, useCallback } from 'react';
import { ShieldAlert, Settings, FileText, Upload, Link2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminConfigPanel from '../components/admin/AdminConfigPanel';
import AuditLogViewer from '../components/admin/AuditLogViewer';
import InterimUploadDialog from '../components/admin/InterimUploadDialog';
import QuickLinksPanel from '../components/embedding/QuickLinksPanel';

const userRole = import.meta.env.VITE_DEFAULT_ROLE || 'engineer';

const TABS = [
  { key: 'config', label: 'Field Configuration', icon: Settings },
  { key: 'audit', label: 'Audit Logs', icon: FileText },
  { key: 'upload', label: 'Upload Data', icon: Upload },
  { key: 'links', label: 'Quick Links', icon: Link2 },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('config');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const navigate = useNavigate();

  const isAdmin = userRole === 'manager';
  const isLead = userRole === 'lead';
  const hasAccess = isAdmin || isLead;

  const handleUploadComplete = useCallback(() => {
    setShowUploadDialog(false);
  }, []);

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="bg-white rounded-xl shadow-card p-8 max-w-md w-full text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-danger-50 flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-danger-600" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-surface-900">
            Access Denied
          </h2>
          <p className="text-surface-500 text-sm">
            You do not have permission to access the Admin panel. This area is
            restricted to Lead and Manager roles.
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium text-sm"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'config':
        return <AdminConfigPanel />;
      case 'audit':
        return <AuditLogViewer />;
      case 'upload':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-surface-900">
                    Data Upload
                  </h3>
                  <p className="text-sm text-surface-500 mt-1">
                    Upload interim data files to update dashboard metrics and
                    reports.
                  </p>
                </div>
                <button
                  onClick={() => setShowUploadDialog(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium text-sm"
                >
                  <Upload className="w-4 h-4" />
                  Upload File
                </button>
              </div>
              <div className="border border-surface-200 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-surface-300 mx-auto mb-3" />
                <p className="text-surface-500 text-sm">
                  Click the &quot;Upload File&quot; button to import data from
                  CSV or Excel files.
                </p>
                <p className="text-surface-400 text-xs mt-2">
                  Supported types: Release Readiness, Defect Data, Test
                  Execution, Program Status, SIT Defects
                </p>
              </div>
            </div>

            {showUploadDialog && (
              <InterimUploadDialog
                isOpen={showUploadDialog}
                onClose={() => setShowUploadDialog(false)}
                onUploadComplete={handleUploadComplete}
              />
            )}
          </div>
        );
      case 'links':
        return <QuickLinksPanel editable={isAdmin} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">
            Administration
          </h1>
          <p className="text-sm text-surface-500 mt-1">
            Manage field configurations, view audit logs, upload data, and
            configure quick links.
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
            isAdmin
              ? 'bg-success-50 text-success-700'
              : 'bg-brand-50 text-brand-700'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          {isAdmin ? 'Manager' : 'Lead'}
        </span>
      </div>

      <div className="border-b border-surface-200">
        <nav className="flex gap-1 -mb-px" aria-label="Admin tabs">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            const isDisabled = tab.key === 'config' && !isAdmin;

            return (
              <button
                key={tab.key}
                onClick={() => {
                  if (!isDisabled) {
                    setActiveTab(tab.key);
                  }
                }}
                disabled={isDisabled}
                className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-brand-600 text-brand-600'
                    : isDisabled
                      ? 'border-transparent text-surface-300 cursor-not-allowed'
                      : 'border-transparent text-surface-500 hover:text-surface-700 hover:border-surface-300'
                }`}
                aria-selected={isActive}
                role="tab"
                title={
                  isDisabled
                    ? 'Manager role required for field configuration'
                    : tab.label
                }
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div role="tabpanel" className="min-h-[400px]">
        {renderTabContent()}
      </div>
    </div>
  );
}