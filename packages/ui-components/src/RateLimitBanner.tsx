// Rate Limit (429) banner component
import React from 'react';

export type RateLimitBannerProps = {
  retryAfter?: number; // seconds
  onDismiss?: () => void;
};

export function RateLimitBanner({ retryAfter, onDismiss }: RateLimitBannerProps) {
  const [countdown, setCountdown] = React.useState(retryAfter || 0);

  React.useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  return (
    <div
      role="alert"
      className="bg-red-50 border-l-4 border-red-400 p-4 mb-4"
      data-testid="rate-limit-banner"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">Rate Limit Exceeded</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>
              You've made too many requests. Please wait{' '}
              {countdown > 0 ? (
                <span className="font-semibold">{countdown} seconds</span>
              ) : (
                'a moment'
              )}{' '}
              before trying again.
            </p>
          </div>
          {onDismiss && (
            <div className="mt-4">
              <button
                type="button"
                onClick={onDismiss}
                className="text-red-800 px-3 py-1.5 text-sm font-medium hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

