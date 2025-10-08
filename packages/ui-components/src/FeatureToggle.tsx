// Feature toggle component and hook
import React from 'react';

// In-memory feature flags (can be replaced with DB/config lookup)
const featureFlags = new Map<string, boolean>();

export function setFeatureFlag(key: string, enabled: boolean) {
  featureFlags.set(key, enabled);
}

export function useFeatureFlag(key: string, defaultValue = false): boolean {
  const [enabled, setEnabled] = React.useState(() => featureFlags.get(key) ?? defaultValue);

  React.useEffect(() => {
    const checkFlag = () => {
      const current = featureFlags.get(key) ?? defaultValue;
      if (current !== enabled) setEnabled(current);
    };
    const interval = setInterval(checkFlag, 1000);
    return () => clearInterval(interval);
  }, [key, defaultValue, enabled]);

  return enabled;
}

export type FeatureToggleProps = {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function FeatureToggle({ feature, children, fallback = null }: FeatureToggleProps) {
  const enabled = useFeatureFlag(feature);
  return <>{enabled ? children : fallback}</>;
}

