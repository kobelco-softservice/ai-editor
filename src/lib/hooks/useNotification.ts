// src/lib/hooks/useNotification.ts
import { useState, useCallback } from "react";
import { v4 as uuidv4 } from 'uuid';

// useNotification.ts
interface Notification {
    id: string;
    message: string;
  }
  
  export const useNotification = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
  
    const addNotification = useCallback((message: string) => {
      const id = uuidv4(); 
      setNotifications(prev => [...prev, { id, message }]);
      
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 3000);
    }, []);
  
    return {
      notifications,
      addNotification
    };
  };