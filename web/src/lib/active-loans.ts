import type { ActiveLoan } from '@/lib/app-model';

export type LoanProjection = {
  isPaidOff: boolean;
  monthsProjected: number;
  totalFuturePayment: number;
  totalFutureInterest: number;
  endingBalance: number;
};

export function projectActiveLoan(loan: ActiveLoan, maximumMonths = 600): LoanProjection {
  if (loan.remainingBalance <= 0 || loan.monthlyPayment <= 0) {
    return { isPaidOff: true, monthsProjected: 0, totalFuturePayment: 0, totalFutureInterest: 0, endingBalance: 0 };
  }

  const monthlyRate = Math.max(0, loan.annualRatePercent) / 100 / 12;
  let balance = loan.remainingBalance;
  let totalFuturePayment = 0;
  let totalFutureInterest = 0;

  for (let month = 1; month <= maximumMonths; month += 1) {
    const interest = balance * monthlyRate;
    const payment = Math.min(loan.monthlyPayment, balance + interest);
    balance = Math.max(0, balance + interest - payment);
    totalFuturePayment += payment;
    totalFutureInterest += interest;

    if (balance <= 0.01) {
      return {
        isPaidOff: true,
        monthsProjected: month,
        totalFuturePayment,
        totalFutureInterest,
        endingBalance: 0,
      };
    }
  }

  return {
    isPaidOff: false,
    monthsProjected: maximumMonths,
    totalFuturePayment,
    totalFutureInterest,
    endingBalance: balance,
  };
}

export function activeLoanProgress(loan: ActiveLoan) {
  if (loan.originalBalance <= 0) return 0;
  return Math.min(100, Math.max(0, ((loan.originalBalance - loan.remainingBalance) / loan.originalBalance) * 100));
}

export function formatLoanDuration(months: number) {
  if (months <= 0) return 'Paid off';
  const years = Math.floor(months / 12);
  const remainder = months % 12;
  if (years === 0) return `${remainder} mo`;
  return remainder === 0 ? `${years} yr` : `${years} yr ${remainder} mo`;
}
