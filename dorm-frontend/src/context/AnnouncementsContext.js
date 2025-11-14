import React, { createContext, useContext, useState, useCallback } from 'react';

const AnnouncementsContext = createContext();

export const useAnnouncements = () => {
  const context = useContext(AnnouncementsContext);
  if (!context) {
    throw new Error('useAnnouncements must be used within an AnnouncementsProvider');
  }
  return context;
};

export const AnnouncementsProvider = ({ children }) => {
  const [announcementsUpdateTrigger, setAnnouncementsUpdateTrigger] = useState(0);

  const refreshAnnouncements = useCallback(() => {
    setAnnouncementsUpdateTrigger(prev => prev + 1);
  }, []);

  const value = {
    announcementsUpdateTrigger,
    refreshAnnouncements
  };

  return (
    <AnnouncementsContext.Provider value={value}>
      {children}
    </AnnouncementsContext.Provider>
  );
};