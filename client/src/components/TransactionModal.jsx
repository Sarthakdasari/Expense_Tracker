import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const TransactionModal = ({
  isOpen,
  onClose,
  transaction,
  categories,
  onSave,
  onOpenCategoryManager,
}) => {
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0],
    note: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (transaction) {
      setFormData({
        amount: transaction.amount || '',
        type: transaction.type || 'expense',
        category: transaction.category || '',
        date: transaction.date
          ? new Date(transaction.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        note: transaction.note || '',
      });
    } else {
      setFormData({
        amount: '',
        type: 'expense',
        category: categories.length > 0 ? categories[0].name : 'Food',
        date: new Date().toISOString().split('T')[0],
        note: '',
      });
    }
    setError('');
  }, [transaction, isOpen, categories]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }
    if (!formData.category) {
      setError('Please select a category');
      return;
    }

    try {
      setLoading(true);
      setError('');

      let response;
      if (transaction && transaction._id) {
        response = await axiosClient.put(
          `/transactions/${transaction._id}`,
          formData
        );
      } else {
        response = await axiosClient.post('/transactions', formData);
      }

      onSave(response.data.data);
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to save transaction entry'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{transaction ? 'Edit Transaction' : 'New Transaction'}</h3>
          <button
            onClick={onClose}
            style={{ fontSize: '1.25rem', color: '#64748b' }}
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="form-group">
              <label>Transaction Type</label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <label
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.6rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    background:
                      formData.type === 'expense'
                        ? 'var(--danger-bg)'
                        : '#ffffff',
                    color:
                      formData.type === 'expense'
                        ? 'var(--danger)'
                        : 'var(--text-main)',
                    fontWeight: 700,
                  }}
                >
                  <input
                    type="radio"
                    name="type"
                    value="expense"
                    checked={formData.type === 'expense'}
                    onChange={handleChange}
                    style={{ display: 'none' }}
                  />
                  <span>Expense</span>
                </label>

                <label
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.6rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    background:
                      formData.type === 'income'
                        ? 'var(--success-bg)'
                        : '#ffffff',
                    color:
                      formData.type === 'income'
                        ? 'var(--success)'
                        : 'var(--text-main)',
                    fontWeight: 700,
                  }}
                >
                  <input
                    type="radio"
                    name="type"
                    value="income"
                    checked={formData.type === 'income'}
                    onChange={handleChange}
                    style={{ display: 'none' }}
                  />
                  <span>Income</span>
                </label>
              </div>
            </div>

            <div className="form-row form-row-2">
              <div className="form-group">
                <label>Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  name="amount"
                  className="form-control"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  className="form-control"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.35rem',
                }}
              >
                <label style={{ margin: 0 }}>Category</label>
                <button
                  type="button"
                  onClick={onOpenCategoryManager}
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--primary)',
                    fontWeight: 600,
                  }}
                >
                  + Manage Categories
                </button>
              </div>
              <select
                name="category"
                className="form-control"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Select category
                </option>
                {categories.map((c) => (
                  <option key={c._id || c.name} value={c.name}>
                    {c.name} {c.isCustom ? '(Custom)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Note / Description (Optional)</label>
              <textarea
                name="note"
                className="form-control"
                rows="3"
                placeholder="Details, bill ref, or description..."
                value={formData.note}
                onChange={handleChange}
                maxLength={250}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading
                ? 'Saving...'
                : transaction
                ? 'Update Transaction'
                : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
