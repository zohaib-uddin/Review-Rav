import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, X, Check } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

export default function PushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Load saved notifications
    const saved = localStorage.getItem('ravenza_notifications');
    if (saved) {
      setNotifications(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ravenza_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications');
      return;
    }

    const permission = await Notification.requestPermission();
    setPermission(permission);

    if (permission === 'granted') {
      // Send welcome notification
      sendNotification(
        'Welcome to Ravenza!',
        'You will now receive updates about new arrivals and exclusive offers.',
        'success'
      );
    }
  };

  const sendNotification = (title: string, message: string, type: Notification['type'] = 'info') => {
    const notification: Notification = {
      id: Date.now().toString(),
      title,
      message,
      type,
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [notification, ...prev].slice(0, 20)); // Keep last 20

    // Show browser notification if permitted
    if (permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
      });
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        {permission === 'granted' ? <Bell size={20} /> : <BellOff size={20} />}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {showPanel && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowPanel(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full mt-2 right-0 w-96 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-[500px] overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold">Notifications</h3>
                  <p className="text-xs text-gray-500">
                    {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                  </p>
                </div>
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-black hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAll}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>

              {/* Permission Request */}
              {permission !== 'granted' && (
                <div className="p-4 bg-blue-50 border-b border-blue-100">
                  <p className="text-sm text-blue-900 mb-2">
                    Enable notifications to receive updates about new arrivals and exclusive offers.
                  </p>
                  <button
                    onClick={requestPermission}
                    className="w-full bg-black text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    Enable Notifications
                  </button>
                </div>
              )}

              {/* Notifications List */}
              <div className="overflow-y-auto max-h-[400px]">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Bell size={48} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => markAsRead(notification.id)}
                      className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          notification.read ? 'bg-gray-300' : 'bg-blue-500'
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-sm">{notification.title}</h4>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getNotificationColor(notification.type)}`}>
                              {notification.type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {notification.timestamp.toLocaleDateString()} at{' '}
                            {notification.timestamp.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper function to trigger notifications from other components
export function triggerNotification(title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body: message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
    });
  }
}
