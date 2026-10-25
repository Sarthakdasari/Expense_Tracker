import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import axiosClient from '../api/axiosClient';
import SummaryCard from '../components/SummaryCard';
import TransactionModal from '../components/TransactionModal';
import CategoryModal from '../components/CategoryModal';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const CATEGORY_COLORS = [
  '#4f46e5',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#6366f1',
  '#84cc16',
];

const Dashboard = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState(
    currentDate.getFullYear()
  );

  const [monthlyData, setMonthlyData] = useState(null);
  const [yearlyData, setYearlyData] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [monthlyRes, yearlyRes, txRes, catRes] = await Promise.all([
        axiosClient.get(
          `/summary/monthly?month=${selectedMonth}&year=${selectedYear}`
        ),
        axiosClient.get(`/summary/yearly?year=${selectedYear}`),
        axiosClient.get('/transactions?limit=5&sortBy=date&sortOrder=desc'),
        axiosClient.get('/categories'),
      ]);

      setMonthlyData(monthlyRes.data.data);
      setYearlyData(yearlyRes.data.data);
      setRecentTransactions(txRes.data.data);
      setCategories(catRes.data.data);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load dashboard summary'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth, selectedYear]);

  // Pie chart data (Expense by category)
  const pieChartData = {
    labels:
      monthlyData?.expenseBreakdown?.length > 0
        ? monthlyData.expenseBreakdown.map((item) => item.category)
        : ['No Expenses'],
    datasets: [
      {
        data:
          monthlyData?.expenseBreakdown?.length > 0
            ? monthlyData.expenseBreakdown.map((item) => item.total)
            : [1],
        backgroundColor:
          monthlyData?.expenseBreakdown?.length > 0
            ? monthlyData.expenseBreakdown.map(
                (_, idx) => CATEGORY_COLORS[idx % CATEGORY_COLORS.length]
              )
            : ['#e2e8f0'],
        borderWidth: 1,
        borderColor: '#ffffff',
      },
    ],
  };

  // Bar chart data (Yearly month-by-month Income vs Expense)
  const barChartData = {
    labels:
      yearlyData?.months?.map((m) => m.monthName) || [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ],
    datasets: [
      {
        label: 'Income',
        data: yearlyData?.months?.map((m) => m.income) || [],
        backgroundColor: 'rgba(16, 185, 129, 0.85)',
        borderRadius: 4,
      },
      {
        label: 'Expense',
        data: yearlyData?.months?.map((m) => m.expense) || [],
        backgroundColor: 'rgba(239, 68, 68, 0.85)',
        borderRadius: 4,
      },
    ],
  };

  const handleTransactionSaved = () => {
    fetchDashboardData();
  };

  return (
    <div className="main-content">
      {/* Header with Title and Month/Year controls */}
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
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Overview of your financial performance and spending habits
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <select
            className="form-control"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            style={{ width: '130px' }}
          >
            {[
              'January',
              'February',
              'March',
              'April',
              'May',
              'June',
              'July',
              'August',
              'September',
              'October',
              'November',
              'December',
            ].map((m, idx) => (
              <option key={m} value={idx + 1}>
                {m}
              </option>
            ))}
          </select>

          <select
            className="form-control"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            style={{ width: '90px' }}
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsTxModalOpen(true)}
            className="btn btn-primary"
          >
            + Add Transaction
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Summary KPI Cards */}
      <div className="summary-grid">
        <SummaryCard
          title="Total Income"
          amount={monthlyData?.totalIncome || 0}
          variant="income"
          icon="↑"
        />
        <SummaryCard
          title="Total Expenses"
          amount={monthlyData?.totalExpense || 0}
          variant="expense"
          icon="↓"
        />
        <SummaryCard
          title="Net Balance"
          amount={monthlyData?.balance || 0}
          variant={
            (monthlyData?.balance || 0) >= 0 ? 'balance' : 'expense'
          }
          icon="$"
        />
        <SummaryCard
          title="Transactions"
          amount={monthlyData?.transactionCount || 0}
          variant="count"
          icon="#"
        />
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Yearly Bar Chart */}
        <div className="card">
          <div className="chart-header">
            <h3>Yearly Cashflow ({selectedYear})</h3>
            <span
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                fontWeight: 600,
              }}
            >
              Net Savings: ${yearlyData?.yearlyNetSavings?.toLocaleString() || 0}
            </span>
          </div>
          <div style={{ position: 'relative', height: '300px' }}>
            {loading ? (
              <div className="loading-center">
                <div className="spinner"></div>
              </div>
            ) : (
              <Bar
                data={barChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'top' },
                    tooltip: {
                      callbacks: {
                        label: (ctx) => ` $${ctx.raw.toLocaleString()}`,
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => `$${value}`,
                      },
                    },
                  },
                }}
              />
            )}
          </div>
        </div>

        {/* Monthly Pie Chart */}
        <div className="card">
          <div className="chart-header">
            <h3>Expenses by Category</h3>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              {monthlyData?.monthName} {selectedYear}
            </span>
          </div>
          <div
            style={{
              position: 'relative',
              height: '300px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {loading ? (
              <div className="spinner"></div>
            ) : monthlyData?.expenseBreakdown?.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                <p>No expenses recorded for this month.</p>
              </div>
            ) : (
              <Pie
                data={pieChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                      callbacks: {
                        label: (ctx) => {
                          const item =
                            monthlyData.expenseBreakdown[ctx.dataIndex];
                          return ` $${ctx.raw.toLocaleString()} (${
                            item?.percentage || 0
                          }%)`;
                        },
                      },
                    },
                  },
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            Recent Transactions
          </h3>
          <Link
            to="/transactions"
            style={{
              fontSize: '0.875rem',
              color: 'var(--primary)',
              fontWeight: 700,
            }}
          >
            View All Transactions →
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <p
            style={{
              textAlign: 'center',
              color: 'var(--text-muted)',
              padding: '2rem',
            }}
          >
            No transactions found. Click "+ Add Transaction" to start recording.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="transaction-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Note</th>
                  <th>Type</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx) => (
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        transaction={null}
        categories={categories}
        onSave={handleTransactionSaved}
        onOpenCategoryManager={() => {
          setIsTxModalOpen(false);
          setIsCatModalOpen(true);
        }}
      />

      <CategoryModal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
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

export default Dashboard;
