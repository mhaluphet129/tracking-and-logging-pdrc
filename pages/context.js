import React, { createContext, useState } from "react";

export const SettingsContext = createContext();

function SettingsContextProvider(props) {
  let [visitHour, setVisitHour] = useState({ hour: 24, minute: 0 });
  return (
    <SettingsContext.Provider
      value={{
        setVisitHour,
        visitHour,
      }}
    >
      {props.children}
    </SettingsContext.Provider>
  );
}

export default SettingsContextProvider;
