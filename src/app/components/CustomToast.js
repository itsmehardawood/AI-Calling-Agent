"use client";
import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

const CustomToast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle size={24} className="text-green-500" />,
    error: <XCircle size={24} className="text-red-500" />,
    warning: <AlertCircle size={24} className="text-yellow-500" />,
    info: <AlertCircle size={24} className="text-blue-500" />,
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
  };

  const textColors = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800',
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] animate-slideIn">
      <div className={`${bgColors[type]} border rounded-lg shadow-lg p-4 min-w-[300px] max-w-[500px] flex items-start gap-3`}>
        <div className="flex-shrink-0 mt-0.5">
          {icons[type]}
        </div>
        <div className="flex-1">
          <p className={`${textColors[type]} font-medium text-sm`}>
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className={`${textColors[type]} hover:opacity-70 transition-opacity flex-shrink-0`}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default CustomToast;
