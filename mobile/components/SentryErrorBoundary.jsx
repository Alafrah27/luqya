/**
 * SentryErrorBoundary Component for Luqya Chat App
 * 
 * A wrapper component that catches React render errors and:
 * - Displays a user-friendly CrashScreen fallback
 * - Captures errors to Sentry with full context
 * - Provides retry mechanism to recover from crashes
 */

import * as Sentry from '@sentry/react-native';
import CrashScreen from './ui/CrashScreen';
import { addBreadcrumb } from '../lib/sentry';

/**
 * Custom fallback component for Sentry.ErrorBoundary
 * @param {Object} props - Sentry fallback props
 * @param {Error} props.error - The captured error
 * @param {string} props.componentStack - React component stack trace
 * @param {Function} props.resetError - Function to reset the error boundary
 */
function FallbackComponent({ error, componentStack, resetError }) {
    // Add breadcrumb when crash screen is shown
    addBreadcrumb('error', 'Crash screen displayed', {
        errorMessage: error?.message,
    });

    // Handle retry - reset error boundary
    const handleRetry = () => {
        addBreadcrumb('ui', 'User clicked retry on crash screen');
        resetError();
    };

    return <CrashScreen onRetry={handleRetry} error={error} />;
}

/**
 * SentryErrorBoundary - Wraps children with Sentry error boundary
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to protect
 */
export default function SentryErrorBoundary({ children }) {
    /**
     * Called before error is sent to Sentry
     * Use this to add extra context or filter errors
     */
    const handleBeforeCapture = (scope, error, componentStack) => {
        // Add component stack as extra data
        scope.setExtra('componentStack', componentStack);
        scope.setTag('error.type', 'react-render');
        scope.setTag('error.boundary', 'SentryErrorBoundary');

        // Add breadcrumb for the crash
        addBreadcrumb('error', 'React render crash captured', {
            errorName: error?.name,
            errorMessage: error?.message,
        });
    };

    return (
        <Sentry.ErrorBoundary
            fallback={FallbackComponent}
            beforeCapture={handleBeforeCapture}
            showDialog={false} // Don't show Sentry's default feedback dialog
        >
            {children}
        </Sentry.ErrorBoundary>
    );
}

/**
 * Higher-order component version for wrapping individual screens
 * Usage: export default withSentryBoundary(MyScreen)
 */
export function withSentryBoundary(WrappedComponent, displayName) {
    function WithBoundary(props) {
        return (
            <SentryErrorBoundary>
                <WrappedComponent {...props} />
            </SentryErrorBoundary>
        );
    }

    WithBoundary.displayName = displayName ||
        `withSentryBoundary(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

    return WithBoundary;
}
