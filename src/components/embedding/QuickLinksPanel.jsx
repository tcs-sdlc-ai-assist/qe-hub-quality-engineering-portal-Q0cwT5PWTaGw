import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  ExternalLink,
  Plus,
  Pencil,
  Trash2,
  Search,
  BookOpen,
  Link as LinkIcon,
  FileText,
  Wrench,
  Globe,
  X,
  Check,
  AlertCircle,
} from 'lucide-react';
import { getQuickLinks, saveQuickLinks } from '../../services/quickLinksService';

const ICON_MAP = {
  book: BookOpen,
  link: LinkIcon,
  file: FileText,
  toolbox: Wrench,
  globe: Globe,
  default: ExternalLink,
};

const ICON_OPTIONS = [
  { label: 'Book', value: 'book' },
  { label: 'Link', value: 'link' },
  { label: 'File', value: 'file' },
  { label: 'Toolbox', value: 'toolbox' },
  { label: 'Globe', value: 'globe' },
];

const CATEGORY_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Confluence', value: 'confluence' },
  { label: 'Tools', value: 'tools' },
  { label: 'Process', value: 'process' },
  { label: 'Reference', value: 'reference' },
  { label: 'Other', value: 'other' },
];

/**
 * Resolves an icon key string to a lucide-react icon component.
 * @param {string} iconKey
 * @returns {import('react').ComponentType}
 */
function resolveIcon(iconKey) {
  if (!iconKey) return ICON_MAP.default;
  const normalized = iconKey.toLowerCase().trim();
  return ICON_MAP[normalized] || ICON_MAP.default;
}

/**
 * Validates a URL string is HTTPS.
 * @param {string} url
 * @returns {boolean}
 */
function isValidUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/* ─── LinkForm sub-component ─── */
function LinkForm({ link, onSave, onCancel }) {
  const [title, setTitle] = useState(link ? link.title : '');
  const [url, setUrl] = useState(link ? link.url : '');
  const [icon, setIcon] = useState(link ? link.icon || 'book' : 'book');
  const [category, setCategory] = useState(link ? link.category || 'other' : 'confluence');
  const [description, setDescription] = useState(link ? link.description || '' : '');
  const [errors, setErrors] = useState({});

  const validate = useCallback(() => {
    const errs = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (!url.trim()) {
      errs.url = 'URL is required';
    } else if (!isValidUrl(url)) {
      errs.url = 'URL must be a valid HTTPS URL';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [title, url]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!validate()) return;
      onSave({
        id: link ? link.id : `ql-${Date.now()}`,
        title: title.trim(),
        url: url.trim(),
        icon,
        category,
        description: description.trim(),
      });
    },
    [link, title, url, icon, category, description, validate, onSave]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="ql-title" className="block text-sm font-medium text-surface-700 mb-1">
          Title <span className="text-danger-500">*</span>
        </label>
        <input
          id="ql-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`w-full px-3 py-2 rounded-lg border text-sm font-sans focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-soft ${
            errors.title ? 'border-danger-400' : 'border-surface-300'
          }`}
          placeholder="e.g. QE Quality Management"
        />
        {errors.title && (
          <p className="mt-1 text-xs text-danger-600 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.title}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="ql-url" className="block text-sm font-medium text-surface-700 mb-1">
          URL <span className="text-danger-500">*</span>
        </label>
        <input
          id="ql-url"
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className={`w-full px-3 py-2 rounded-lg border text-sm font-sans focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-soft ${
            errors.url ? 'border-danger-400' : 'border-surface-300'
          }`}
          placeholder="https://confluence.company.com/..."
        />
        {errors.url && (
          <p className="mt-1 text-xs text-danger-600 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.url}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="ql-icon" className="block text-sm font-medium text-surface-700 mb-1">
            Icon
          </label>
          <select
            id="ql-icon"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-surface-300 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-soft"
          >
            {ICON_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="ql-category" className="block text-sm font-medium text-surface-700 mb-1">
            Category
          </label>
          <select
            id="ql-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-surface-300 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-soft"
          >
            {CATEGORY_OPTIONS.filter((c) => c.value !== '').map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="ql-desc" className="block text-sm font-medium text-surface-700 mb-1">
          Description
        </label>
        <textarea
          id="ql-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 rounded-lg border border-surface-300 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-soft resize-none"
          placeholder="Brief description of this resource..."
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-surface-700 bg-surface-100 rounded-lg hover:bg-surface-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors flex items-center gap-1.5"
        >
          <Check className="w-4 h-4" />
          {link ? 'Update' : 'Add'} Link
        </button>
      </div>
    </form>
  );
}

LinkForm.propTypes = {
  link: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    url: PropTypes.string,
    icon: PropTypes.string,
    category: PropTypes.string,
    description: PropTypes.string,
  }),
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

LinkForm.defaultProps = {
  link: null,
};

/* ─── LinkCard sub-component ─── */
function LinkCard({ link, editable, onEdit, onDelete }) {
  const IconComponent = resolveIcon(link.icon);

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-white rounded-xl shadow-card hover:shadow-card-hover transition-shadow p-4 border border-surface-200"
      aria-label={`Open ${link.title} in new tab`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
          <IconComponent className="w-5 h-5 text-brand-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-surface-900 truncate group-hover:text-brand-600 transition-colors">
              {link.title}
            </h3>
            <ExternalLink className="w-3.5 h-3.5 text-surface-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </div>
          {link.description && (
            <p className="text-xs text-surface-500 mt-0.5 line-clamp-2">{link.description}</p>
          )}
          {link.category && (
            <span className="inline-block mt-1.5 px-2 py-0.5 text-xs font-medium rounded-full bg-surface-100 text-surface-600 capitalize">
              {link.category}
            </span>
          )}
        </div>
        {editable && (
          <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit(link);
              }}
              className="p-1.5 rounded-md text-surface-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
              aria-label={`Edit ${link.title}`}
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(link.id);
              }}
              className="p-1.5 rounded-md text-surface-500 hover:text-danger-600 hover:bg-danger-50 transition-colors"
              aria-label={`Delete ${link.title}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </a>
  );
}

LinkCard.propTypes = {
  link: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    icon: PropTypes.string,
    category: PropTypes.string,
    description: PropTypes.string,
  }).isRequired,
  editable: PropTypes.bool.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

/* ─── DeleteConfirmation sub-component ─── */
function DeleteConfirmation({ linkTitle, onConfirm, onCancel }) {
  return (
    <div className="bg-danger-50 border border-danger-200 rounded-xl p-4 animate-fade-in">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-danger-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-danger-800">
            Delete &ldquo;{linkTitle}&rdquo;?
          </p>
          <p className="text-xs text-danger-600 mt-0.5">This action cannot be undone.</p>
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={onConfirm}
              className="px-3 py-1.5 text-xs font-medium text-white bg-danger-600 rounded-lg hover:bg-danger-700 transition-colors"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 text-xs font-medium text-surface-700 bg-white border border-surface-300 rounded-lg hover:bg-surface-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

DeleteConfirmation.propTypes = {
  linkTitle: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

/* ─── Main QuickLinksPanel component ─── */
function QuickLinksPanel({ editable, className }) {
  const [links, setLinks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);
  const searchInputRef = useRef(null);

  const userRole = import.meta.env.VITE_DEFAULT_ROLE || 'engineer';
  const isAdmin = editable !== undefined ? editable : userRole === 'manager';

  useEffect(() => {
    try {
      const stored = getQuickLinks();
      if (stored && Array.isArray(stored)) {
        setLinks(stored);
      }
    } catch (err) {
      console.error('[QuickLinksPanel] Failed to load quick links:', err);
      setError('Failed to load quick links.');
    }
  }, []);

  const persistLinks = useCallback((updatedLinks) => {
    try {
      saveQuickLinks(updatedLinks);
      setLinks(updatedLinks);
      setError(null);
    } catch (err) {
      console.error('[QuickLinksPanel] Failed to save quick links:', err);
      setError('Failed to save quick links.');
    }
  }, []);

  const handleSave = useCallback(
    (linkData) => {
      if (editingLink) {
        const updated = links.map((l) => (l.id === linkData.id ? linkData : l));
        persistLinks(updated);
      } else {
        persistLinks([...links, linkData]);
      }
      setShowForm(false);
      setEditingLink(null);
    },
    [links, editingLink, persistLinks]
  );

  const handleEdit = useCallback((link) => {
    setEditingLink(link);
    setShowForm(true);
    setDeletingId(null);
  }, []);

  const handleDelete = useCallback(
    (id) => {
      const updated = links.filter((l) => l.id !== id);
      persistLinks(updated);
      setDeletingId(null);
    },
    [links, persistLinks]
  );

  const handleCancelForm = useCallback(() => {
    setShowForm(false);
    setEditingLink(null);
  }, []);

  const filteredLinks = useMemo(() => {
    let result = links;

    if (categoryFilter) {
      result = result.filter(
        (l) => (l.category || 'other').toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter(
        (l) =>
          (l.title || '').toLowerCase().includes(query) ||
          (l.description || '').toLowerCase().includes(query) ||
          (l.url || '').toLowerCase().includes(query) ||
          (l.category || '').toLowerCase().includes(query)
      );
    }

    return result;
  }, [links, searchQuery, categoryFilter]);

  const deletingLink = useMemo(() => {
    if (!deletingId) return null;
    return links.find((l) => l.id === deletingId) || null;
  }, [deletingId, links]);

  return (
    <div className={`bg-white rounded-xl shadow-card p-6 ${className || ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-brand-600" />
          <h2 className="text-lg font-semibold text-surface-900">Quick Links</h2>
          <span className="text-xs text-surface-500 bg-surface-100 px-2 py-0.5 rounded-full">
            {filteredLinks.length}
          </span>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={() => {
              setEditingLink(null);
              setShowForm(true);
              setDeletingId(null);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors"
            aria-label="Add new quick link"
          >
            <Plus className="w-4 h-4" />
            Add Link
          </button>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 p-3 bg-danger-50 border border-danger-200 rounded-lg flex items-center gap-2 text-sm text-danger-700 animate-fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-auto p-0.5 hover:bg-danger-100 rounded"
            aria-label="Dismiss error"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Search and filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search links..."
            className="w-full pl-9 pr-8 py-2 rounded-lg border border-surface-300 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-soft"
            aria-label="Search quick links"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-surface-400 hover:text-surface-600 rounded"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-surface-300 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-soft bg-white"
          aria-label="Filter by category"
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="mb-4 p-4 bg-surface-50 border border-surface-200 rounded-xl animate-slide-down">
          <h3 className="text-sm font-semibold text-surface-800 mb-3">
            {editingLink ? 'Edit Link' : 'Add New Link'}
          </h3>
          <LinkForm link={editingLink} onSave={handleSave} onCancel={handleCancelForm} />
        </div>
      )}

      {/* Delete confirmation */}
      {deletingLink && (
        <div className="mb-4">
          <DeleteConfirmation
            linkTitle={deletingLink.title}
            onConfirm={() => handleDelete(deletingId)}
            onCancel={() => setDeletingId(null)}
          />
        </div>
      )}

      {/* Links grid */}
      {filteredLinks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredLinks.map((link) => (
            <LinkCard
              key={link.id}
              link={link}
              editable={isAdmin}
              onEdit={handleEdit}
              onDelete={(id) => setDeletingId(id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 animate-fade-in">
          <BookOpen className="w-10 h-10 text-surface-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-surface-500">
            {searchQuery || categoryFilter ? 'No links match your search' : 'No quick links yet'}
          </p>
          {!searchQuery && !categoryFilter && isAdmin && (
            <p className="text-xs text-surface-400 mt-1">
              Click &ldquo;Add Link&rdquo; to add your first resource link.
            </p>
          )}
          {(searchQuery || categoryFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('');
              }}
              className="mt-2 text-xs text-brand-600 hover:text-brand-700 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}

QuickLinksPanel.propTypes = {
  editable: PropTypes.bool,
  className: PropTypes.string,
};

QuickLinksPanel.defaultProps = {
  editable: undefined,
  className: '',
};

export default QuickLinksPanel;