import { InterestMode } from '@/types';

/**
 * Calculate total amount payable given principal, rate, and interest mode.
 */
export function calculateTotalAmount(
  principal: number,
  interestRate: number,
  interestMode: InterestMode,
): number {
  if (interestMode === InterestMode.Simple) {
    return principal + (principal * interestRate) / 100;
  }
  // Compound interest (single period)
  return principal * Math.pow(1 + interestRate / 100, 1);
}

/**
 * Calculate the amount per term (daily/weekly/monthly installment).
 */
export function calculateAmountPerTerm(
  totalAmount: number,
  termCount: number,
): number {
  if (termCount <= 0) return 0;
  return totalAmount / termCount;
}
