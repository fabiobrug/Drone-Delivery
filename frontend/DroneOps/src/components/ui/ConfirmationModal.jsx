import React from "react";
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "warning", // warning, success, error
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircleIcon className="h-12 w-12 text-green-400" />;
      case "error":
        return <XCircleIcon className="h-12 w-12 text-red-400" />;
      default:
        return (
          <ExclamationTriangleIcon className="h-12 w-12 text-yellow-400" />
        );
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case "success":
        return "bg-green-600 hover:bg-green-700";
      case "error":
        return "bg-red-600 hover:bg-red-700";
      default:
        return "bg-yellow-600 hover:bg-yellow-700";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl transform transition-all duration-300 scale-100">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4">{getIcon()}</div>

          <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>

          <p className="text-gray-300 mb-6 leading-relaxed">{message}</p>

          <div className="flex space-x-3 w-full">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg transition-all duration-200 font-medium"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 ${getButtonColor()} disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg transition-all duration-200 font-medium flex items-center justify-center`}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processando...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
