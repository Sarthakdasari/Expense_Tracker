import React from 'react';

const SummaryCard = ({ title, amount, variant = 'balance', icon }) => {
  const formattedAmount =
    typeof amount === 'number'
      ? `$${amount.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : amount;

  return (
    <div className={`summary-card summary-${variant}`}>
      <div className="summary-info">
        <h4>{title}</h4>
        <div className="amount">{formattedAmount}</div>
      </div>
      <div className="summary-icon">{icon}</div>
    </div>
  );
};

export default SummaryCard;
