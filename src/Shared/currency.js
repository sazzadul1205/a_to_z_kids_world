export const toBDTAmount = (value) => Number(String(value).replace(/[^0-9.-]/g, '')) || 0;

export const formatBDT = (amount) => `৳${toBDTAmount(amount).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
