const NotificationManager = {
  NOTIFICATION_TYPES: {
    INFO: "info",
    WARNING: "warning",
    ERROR: "error",
  },

  showNotification(message, type = NOTIFICATION_TYPES.INFO) {
    let notificationContainer = document.getElementById(
      "notification-container"
    );

    if (!notificationContainer) {
      notificationContainer = this.createNotificationContainer();
      document.body.appendChild(notificationContainer);
    }

    const notification = this.createNotificationElement(message, type);
    notificationContainer.appendChild(notification);
    this.fadeInNotification(notification);
  },

  createNotificationContainer() {
    const container = document.createElement("div");
    container.id = "notification-container";
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      max-width: 300px;
    `;
    return container;
  },

  createNotificationElement(message, type) {
    const notification = document.createElement("div");
    notification.style.cssText = `
      background-color: ${this.getNotificationColor(type)};
      color: white;
      padding: 15px;
      margin-bottom: 10px;
      border-radius: 5px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      opacity: 0;
      transition: opacity 0.3s ease-in-out;
    `;
    notification.textContent = message;
    return notification;
  },

  getNotificationColor(type) {
    switch (type) {
      case this.NOTIFICATION_TYPES.WARNING:
        return "#ffcc00";
      case this.NOTIFICATION_TYPES.ERROR:
        return "#ff4444";
      default:
        return "#4CAF50";
    }
  },

  fadeInNotification(notification) {
    notification.offsetHeight; // Trigger reflow
    notification.style.opacity = "1";

    setTimeout(() => {
      this.fadeOutNotification(notification);
    }, 3000);
  },

  fadeOutNotification(notification) {
    notification.style.opacity = "0";
    setTimeout(() => {
      const container = notification.parentNode;
      container.removeChild(notification);

      if (container.children.length === 0) {
        document.body.removeChild(container);
      }
    }, 300);
  },
};

// Make it globally accessible
export default NotificationManager;
