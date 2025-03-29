
export function formatCurrency(amount: number | string | null | undefined, decimals = 2): string {
  if (amount === null || amount === undefined) return '$0.00';
  
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
}
