import React, { createContext, useContext, useState } from "react";
import Notification from "../components/ui/Notification";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: "info",
      title: "Notificação",
      message: "",
      ...notification,
    };

    setNotifications((prev) => [...prev, newNotification]);
    return id;
  };

  const removeNotification = (id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  const showSuccess = (message, title = "Sucesso!") => {
    return addNotification({
      type: "success",
      title,
      message,
    });
  };

  const showError = (message, title = "Erro!") => {
    return addNotification({
      type: "error",
      title,
      message,
    });
  };

  const showWarning = (message, title = "Atenção!") => {
    return addNotification({
      type: "warning",
      title,
      message,
    });
  };

  const showInfo = (message, title = "Informação") => {
    return addNotification({
      type: "info",
      title,
      message,
    });
  };

  return (
    <NotificationContext.Provider
      value={{
        addNotification,
        removeNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
      }}
    >
      {children}

      {/* Render notifications */}
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
        />
      ))}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};
