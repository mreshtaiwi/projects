import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

function App() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Listen for the 'receiveNotification' event
    socket.on('receiveNotification', (notification) => {
      setNotifications((prevNotifications) => [...prevNotifications, notification]);
    });

    return () => {
      // Clean up the event listener when the component unmounts
      socket.off('receiveNotification');
    };
  }, []);

  const sendNotification = () => {
    const notification = {
      message: 'New notification',
      timestamp: Date.now(),
    };

    // Emit the 'sendNotification' event to the server
    socket.emit('sendNotification', notification);
  };

  return (
    <div>
      <h1>Notification System</h1>
      <button onClick={sendNotification}>Send Notification</button>
      <ul>
        {notifications.map((notification, index) => (
          <li key={index}>
            {notification.message} - {notification.timestamp}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
