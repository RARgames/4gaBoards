/* eslint-disable no-console */
import { getIsHyperDXEnabled, trackHyperDXAction } from './hyperdx-init';

const formatConsoleArgs = (args) => args.map((arg) => (arg instanceof Error ? `${arg.name}: ${arg.message}` : String(arg))).join(' ');

// HyperDX - console error and warning interception for tracking
export const setupConsoleTracking = () => {
  const originalError = console.error;
  const originalWarn = console.warn;

  console.error = (...args) => {
    originalError.apply(console, args);
    if (!getIsHyperDXEnabled()) return;

    trackHyperDXAction('console.error', {
      message: formatConsoleArgs(args),
      timestamp: new Date().toISOString(),
    });
  };

  console.warn = (...args) => {
    originalWarn.apply(console, args);
    if (!getIsHyperDXEnabled()) return;

    trackHyperDXAction('console.warning', {
      message: formatConsoleArgs(args),
      timestamp: new Date().toISOString(),
    });
  };
};

export default {
  setupConsoleTracking,
};
