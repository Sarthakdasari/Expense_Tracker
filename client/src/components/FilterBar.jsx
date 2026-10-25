import React from 'react';

const FilterBar = ({
  filters,
  onFilterChange,
  onResetFilters,
  categories,
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange(name, value);
  };

  return (
    <div className="filter-card">
      <div className="filter-grid">
        <div className="form-group" style={{ margin: 0 }}>
          <label>Search Notes</label>
          <input
            type="text"
            name="search"
            className="form-control"
            placeholder="Search notes..."
            value={filters.search}
            onChange={handleChange}
          />
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label>Type</label>
          <select
            name="type"
            className="form-control"
            value={filters.type}
            onChange={handleChange}
          >
            <option value="">All Types</option>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label>Category</label>
          <select
            name="category"
            className="form-control"
            value={filters.category}
            onChange={handleChange}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id || c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label>Start Date</label>
          <input
            type="date"
            name="startDate"
            className="form-control"
            value={filters.startDate}
            onChange={handleChange}
          />
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label>End Date</label>
          <input
            type="date"
            name="endDate"
            className="form-control"
            value={filters.endDate}
            onChange={handleChange}
          />
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label>Sort By</label>
          <select
            name="sortBy"
            className="form-control"
            value={filters.sortBy}
            onChange={handleChange}
          >
            <option value="date">Date</option>
            <option value="amount">Amount</option>
          </select>
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label>Order</label>
          <select
            name="sortOrder"
            className="form-control"
            value={filters.sortOrder}
            onChange={handleChange}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onResetFilters}
            style={{ width: '100%', height: '38px' }}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
