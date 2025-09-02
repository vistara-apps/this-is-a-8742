import React, { useState, useEffect, createContext, useContext } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

// Toast types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Toast context
const ToastContext = createContext({
  showToast: () => {},
  hideToast: () => {},
});

/**
 * Toast Provider component
 * Manages the state and display of toast notifications
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Show a new toast notification
  const showToast = (message, type = TOAST_TYPES.INFO, duration = 5000) => {
    const id = Date.now().toString();
    const newToast = { id, message, type, duration };
    
    setToasts(prevToasts => [...prevToasts, newToast]);
    
    // Auto-hide toast after duration
    if (duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, duration);
    }
    
    return id;
  };

  // Hide a toast notification by ID
  const hideToast = (id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      
      {/* Toast container */}
      <div className="fixed bottom-0 right-0 p-4 z-50 flex flex-col gap-2 max-w-md w-full">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => hideToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

/**
 * Hook to use the toast functionality
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
};

/**
 * Individual Toast component
 */
const Toast = ({ id, message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);
    
    return () => clearTimeout(timer);
  }, []);

  // Get icon based on toast type
  const getIcon = () => {
    switch (type) {
      case TOAST_TYPES.SUCCESS:
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case TOAST_TYPES.ERROR:
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case TOAST_TYPES.WARNING:
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case TOAST_TYPES.INFO:
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  // Get background color based on toast type
  const getBackgroundColor = () => {
    switch (type) {
      case TOAST_TYPES.SUCCESS:
        return 'bg-green-500/10';
      case TOAST_TYPES.ERROR:
        return 'bg-red-500/10';
      case TOAST_TYPES.WARNING:
        return 'bg-yellow-500/10';
      case TOAST_TYPES.INFO:
      default:
        return 'bg-blue-500/10';
    }
  };

  // Handle close with animation
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div 
      className={`gradient-card rounded-lg p-4 flex items-start gap-3 shadow-lg transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${getBackgroundColor()}`}
    >
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>
      
      <div className="flex-grow">
        <div className="text-white">{message}</div>
      </div>
      
      <button 
        onClick={handleClose}
        className="flex-shrink-0 p-1 hover:bg-white/10 rounded-full transition-colors"
      >
        <X className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  );
};

export default Toast;

