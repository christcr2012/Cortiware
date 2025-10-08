// Payment Required (402) banner component
import React from 'react';

export type PaymentRequiredBannerProps = {
  invoice?: {
    amount_cents: number;
    memo?: string;
    due_date?: string;
  };
  onDismiss?: () => void;
  onPayNow?: () => void;
};

export function PaymentRequiredBanner({ invoice, onDismiss, onPayNow }: PaymentRequiredBannerProps) {
  if (!invoice) return null;

  const amountDollars = (invoice.amount_cents / 100).toFixed(2);

  return (
    <div
      role="alert"
      className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4"
      data-testid="payment-required-banner"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">Payment Required</h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Your account balance is insufficient. Please add ${amountDollars} to continue.
              {invoice.memo && <span className="block mt-1 text-xs">{invoice.memo}</span>}
            </p>
          </div>
          <div className="mt-4 flex gap-2">
            {onPayNow && (
              <button
                type="button"
                onClick={onPayNow}
                className="bg-yellow-800 text-white px-3 py-1.5 text-sm font-medium rounded hover:bg-yellow-900"
              >
                Add Funds
              </button>
            )}
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="text-yellow-800 px-3 py-1.5 text-sm font-medium hover:underline"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

