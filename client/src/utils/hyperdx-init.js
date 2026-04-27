/* eslint-disable no-console */
import HyperDX from '@hyperdx/browser';
import { propagation } from '@opentelemetry/api';
import { CompositePropagator, W3CTraceContextPropagator, W3CBaggagePropagator } from '@opentelemetry/core';

import Config from '../constants/Config';

let isHyperDXEnabled = false;

const DEFAULT_TRACE_PROPAGATION_TARGETS = [/^https?:\/\/localhost:\d+(\/|$)/i, /^\/api\//i];

const parseRegex = (value) => {
  if (!value) return null;

  const match = value.match(/^\/(.+)\/([a-z]*)$/i);
  if (!match) return null;

  try {
    return new RegExp(match[1], match[2]);
  } catch {
    return null;
  }
};

const buildTracePropagationTargets = (target) => {
  const parsed = parseRegex(target);
  return parsed ? [...DEFAULT_TRACE_PROPAGATION_TARGETS, parsed] : DEFAULT_TRACE_PROPAGATION_TARGETS;
};

export const getIsHyperDXEnabled = () => isHyperDXEnabled;

// Initialize HyperDX monitoring and observability (after fetchCoreSettingsPublic)
export const initializeHyperDX = async (enabled, apiKey, service, tracePropagationTargets, url, format) => {
  if (!enabled || !apiKey || !tracePropagationTargets || !url) return;

  try {
    HyperDX.init({
      apiKey,
      service,
      url,
      format,
      tracePropagationTargets: buildTracePropagationTargets(tracePropagationTargets),
      consoleCapture: false,
      advancedNetworkCapture: false,
      maskAllInputs: true,
      maskAllText: true,
      otelResourceAttributes: {
        version: Config.VERSION,
      },
      // FIXME remove mouseup, mousedown, mouseinteraction
    });

    propagation.setGlobalPropagator(
      new CompositePropagator({
        propagators: [new W3CTraceContextPropagator(), new W3CBaggagePropagator()],
      }),
    );

    isHyperDXEnabled = true;
  } catch (error) {
    console.error('[HyperDX] Failed to initialize:', error);
  }
};

// Set user information for session tracking (after user auth)
export const setHyperDXUserInfo = (userId, userEmail, username) => {
  if (!isHyperDXEnabled) return;

  try {
    HyperDX.setGlobalAttributes({
      userId,
      userEmail,
      username,
    });
  } catch (error) {
    console.error('[HyperDX] Failed to set user info:', error);
  }
};

const ALLOWED_ACTIONS = new Set(['console.error', 'console.warning']);
// Track a custom action/event
export const trackHyperDXAction = (actionName, metadata = {}) => {
  if (!isHyperDXEnabled) return;
  if (!ALLOWED_ACTIONS.has(actionName) && !actionName.endsWith('__FAILURE')) return;

  try {
    HyperDX.addAction(actionName, metadata);
  } catch (error) {
    console.error('[HyperDX] Failed to track action:', error);
  }
};

export default {
  initializeHyperDX,
  setHyperDXUserInfo,
  trackHyperDXAction,
};
