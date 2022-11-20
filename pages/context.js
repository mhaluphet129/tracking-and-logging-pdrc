import { createContext } from "react";

export const SettingsContext = createContext();

function SettingsContextProvider(props) {
  function notifyAdmin() {
    alert(1);
  }
  return (
    <SettingsContext.Provider
      value={{
        notifyAdmin,
      }}
    >
      {props.children}
    </SettingsContext.Provider>
  );
}

export default SettingsContextProvider;
