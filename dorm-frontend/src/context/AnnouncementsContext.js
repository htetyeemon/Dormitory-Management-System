import React, { createContext, useContext, useState } from 'react';

const AnnouncementsContext = createContext();

export const AnnouncementsProvider = ({ children }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [needsRefresh, setNeedsRefresh] = useState(false);

  const refreshAnnouncements = () => setNeedsRefresh(true);
  const clearRefreshFlag = () => setNeedsRefresh(false);

  return (
    <AnnouncementsContext.Provider value={{
      announcements,
      setAnnouncements,
      needsRefresh,
      refreshAnnouncements,
      clearRefreshFlag
    }}>
      {children}
    </AnnouncementsContext.Provider>
  );
};

export const useAnnouncements = () => useContext(AnnouncementsContext);