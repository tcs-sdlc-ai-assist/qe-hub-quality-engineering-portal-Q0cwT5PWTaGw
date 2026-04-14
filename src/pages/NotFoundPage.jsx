import { useNavigate } from 'react-router-dom';
import { Home, FileQuestion } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center animate-fade-in">
        <div className="bg-white rounded-xl shadow-card p-8 space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center">
              <FileQuestion className="w-10 h-10 text-brand-600" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-6xl font-bold text-brand-600">404</h1>
            <h2 className="text-xl font-semibold text-surface-900">
              Page Not Found
            </h2>
            <p className="text-surface-500 text-sm leading-relaxed">
              The page you are looking for does not exist or has been moved.
              Please check the URL or navigate back to the dashboard.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium text-sm shadow-soft"
            >
              <Home className="w-4 h-4" />
              Back to Dashboard
            </button>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface-100 text-surface-700 rounded-lg hover:bg-surface-200 transition-colors font-medium text-sm"
            >
              Go Back
            </button>
          </div>
        </div>

        <p className="mt-6 text-xs text-surface-400">
          QE Hub — Quality Engineering Dashboard
        </p>
      </div>
    </div>
  );
}