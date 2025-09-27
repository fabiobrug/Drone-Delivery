import React, { useState, useEffect } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

const Notification = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animar entrada
    const timer = setTimeout(() => setIsVisible(true), 100);

    // Auto-remover após 5 segundos
    const autoCloseTimer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(autoCloseTimer);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(notification.id), 300);
  };

  const getIcon = () => {
    switch (notification.type) {
      case "success":
        return <CheckCircleIcon className="w-6 h-6 text-green-400" />;
      case "error":
        return <XCircleIcon className="w-6 h-6 text-red-400" />;
      case "warning":
        return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400" />;
      default:
        return <InformationCircleIcon className="w-6 h-6 text-blue-400" />;
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case "success":
        return "bg-green-900/90 border-green-700";
      case "error":
        return "bg-red-900/90 border-red-700";
      case "warning":
        return "bg-yellow-900/90 border-yellow-700";
      default:
        return "bg-blue-900/90 border-blue-700";
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div
        className={`${getBgColor()} border rounded-lg p-4 shadow-lg backdrop-blur-sm`}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">{getIcon()}</div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-white">
              {notification.title}
            </h3>
            <p className="mt-1 text-sm text-gray-300">{notification.message}</p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <span className="sr-only">Fechar</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notification;
