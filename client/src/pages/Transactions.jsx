import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import FilterBar from '../components/FilterBar';
import TransactionModal from '../components/TransactionModal';
import CategoryModal from '../components/CategoryModal';

const initialFilters = {
  search: '',
  type: '',
  category: '',
  startDate: '',
  endDate: '',
  sortBy: 'date',
  sortOrder: 'desc',
};

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState(initialFilters);

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Loading & error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosClient.get('/categories');
        setCategories(res.data.data);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch transactions whenever page, limit, or filters change
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({
        page,
        limit,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });

      if (filters.search) params.append('search', filters.search);
      if (filters.type) params.append('type', filters.type);
      if (filters.category) params.append('category', filters.category);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const res = await axiosClient.get(`/transactions?${params.toString()}`);
      setTransactions(res.data.data);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to fetch transactions'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, limit, filters]);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1); // Reset to first page upon filter change
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
    setPage(1);
  };

  const handleOpenAdd = () => {
    setSelectedTx(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tx) => {
    setSelectedTx(tx);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      await axiosClient.delete(`/transactions/${id}`);
      setSuccessMsg('Transaction deleted successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchTransactions();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to delete transaction'
      );
    }
  };

  const handleTransactionSaved = () => {
    setSuccessMsg(
      selectedTx
        ? 'Transaction updated successfully'
        : 'Transaction added successfully'
    );
    setTimeout(() => setSuccessMsg(''), 3000);
    fetchTransactions();
  };

  return (
    <div className="main-content">
      {/* Page Title & Add Button */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Transactions</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Search, filter, and manage your full transaction history
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="btn btn-secondary"
          >
            Manage Categories
          </button>
          <button onClick={handleOpenAdd} className="btn btn-primary">
            + New Transaction
          </button>
        </div>
      </div>

      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Filter Component */}
      <FilterBar
        filters={filters}
        categories={categories}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      {/* Transaction Table / List */}
      <div className="card">
        {loading ? (
          <div className="loading-center">
            <div className="spinner"></div>
            <p>Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div
            style={{
              padding: '3rem 1rem',
              textAlign: 'center',
              color: 'var(--text-muted)',
            }}
          >
            <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>
              No transactions match your search or filters.
            </p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Try adjusting your filters or click "+ New Transaction" to create
              one.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="transaction-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Note / Memo</th>
                  <th>Type</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx._id}>
                    <td>{new Date(tx.date).toLocaleDateString()}</td>
                    <td>
                      <span className="badge badge-category">{tx.category}</span>
                    </td>
                    <td>{tx.note || '—'}</td>
                    <td>
                      <span
                        className={`badge ${
                          tx.type === 'income'
                            ? 'badge-income'
                            : 'badge-expense'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td
                      style={{
                        textAlign: 'right',
                        fontWeight: 700,
                        color:
                          tx.type === 'income'
                            ? 'var(--success)'
                            : 'var(--danger)',
                      }}
                    >
                      {tx.type === 'income' ? '+' : '-'}$
                      {tx.amount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div
                        style={{
                          display: 'flex',
                          gap: '0.4rem',
                          justifyContent: 'center',
                        }}
                      >
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenEdit(tx)}
                          title="Edit transaction"
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDelete(tx._id)}
                          title="Delete transaction"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="pagination-container">
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Showing{' '}
            <strong>{transactions.length > 0 ? (page - 1) * limit + 1 : 0}</strong>{' '}
            to <strong>{Math.min(page * limit, total)}</strong> of{' '}
            <strong>{total}</strong> entries
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Previous
            </button>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              Page {page} of {totalPages}
            </span>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transaction={selectedTx}
        categories={categories}
        onSave={handleTransactionSaved}
        onOpenCategoryManager={() => {
          setIsModalOpen(false);
          setIsCategoryModalOpen(true);
        }}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onCategoryAdded={(newCat) => {
          setCategories((prev) => [...prev, newCat]);
        }}
        onCategoryDeleted={(deletedId) => {
          setCategories((prev) => prev.filter((c) => c._id !== deletedId));
        }}
      />
    </div>
  );
};

export default Transactions;
