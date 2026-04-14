import { BookOpen, Link2 } from 'lucide-react';
import QuickLinksPanel from '../components/embedding/QuickLinksPanel';

const userRole = import.meta.env.VITE_DEFAULT_ROLE || 'engineer';

export default function ConfluenceLinksPage() {
  const isEditable = userRole === 'manager';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Confluence Links</h1>
          <p className="text-sm text-surface-500 mt-1">
            Quick access to QE Quality Management Process documentation and QE Tools &amp; Framework Hub resources.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-surface-500">
          <Link2 size={16} />
          <span>Confluence Resources</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-card border border-surface-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-brand-50 rounded-lg">
              <BookOpen size={20} className="text-brand-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-surface-900">QE Quality Management Process</h2>
              <p className="text-xs text-surface-500">Process documentation and guidelines</p>
            </div>
          </div>
          <QuickLinksPanel
            category="confluence"
            editable={isEditable}
          />
        </div>

        <div className="bg-white rounded-xl shadow-card border border-surface-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-accent-50 rounded-lg">
              <BookOpen size={20} className="text-accent-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-surface-900">QE Tools &amp; Framework Hub</h2>
              <p className="text-xs text-surface-500">Tools, frameworks, and automation resources</p>
            </div>
          </div>
          <QuickLinksPanel
            category="tools"
            editable={isEditable}
          />
        </div>
      </div>
    </div>
  );
}