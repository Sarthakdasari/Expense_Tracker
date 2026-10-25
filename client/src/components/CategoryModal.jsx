import React, { useState } from 'react';
import axiosClient from '../api/axiosClient';

const CategoryModal = ({ isOpen, onClose, categories, onCategoryAdded, onCategoryDeleted }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a category name');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const res = await axiosClient.post('/categories', { name: name.trim() });
      setName('');
      onCategoryAdded(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosClient.delete(`/categories/${id}`);
      onCategoryDeleted(id);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete category');
    }
  };

  const customCategories = categories.filter((c) => c.isCustom);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Manage Categories</h3>
          <button onClick={onClose} style={{ fontSize: '1.25rem', color: '#64748b' }}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>
              Add New Custom Category
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., Healthcare, Pet Care..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={40}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || !name.trim()}
              >
                {submitting ? 'Adding...' : 'Add'}
              </button>
            </div>
          </form>

          <div>
            <h4 style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.75rem' }}>
              Your Custom Categories ({customCategories.length})
            </h4>
            {customCategories.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                No custom categories yet. Built-in categories (Food, Rent, Travel, etc.) are always available.
              </p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {customCategories.map((c) => (
                  <div
                    key={c._id}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      background: '#f1f5f9',
                      padding: '0.3rem 0.65rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}
                  >
                    <span>{c.name}</span>
                    <button
                      onClick={() => handleDelete(c._id)}
                      title="Delete category"
                      style={{
                        color: '#ef4444',
                        fontWeight: 'bold',
                        lineHeight: 1,
                        marginLeft: '0.2rem',
                      }}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;
