import React, { createContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import moment from "moment";

export const SettingsContext = createContext();

function SettingsContextProvider(props) {
  let [visitHour, setVisitHour] = useState();

  useEffect(() => {
    if (Cookies.get("currentUser") != undefined)
      setVisitHour(moment(JSON.parse(Cookies.get("currentUser"))?.visitLimit));
  }, []);

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
