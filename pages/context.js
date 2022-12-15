import React, { createContext, useEffect, useState } from "react";
import moment from "moment";
import axios from "axios";
import { message } from "antd";

export const SettingsContext = createContext();

function SettingsContextProvider(props) {
  let [visitHour, setVisitHour] = useState();

  useEffect(() => {
    (async () => {
      let { data } = await axios.get("/api/etc", {
        params: {
          mode: "get-visit-hour",
        },
      });
      if (data.status == 200)
        setVisitHour(
          moment(moment(data.data?.visitLimit).format("HH:mm"), "HH:mm")
        );
      else message.error("Error in context.");
    })();
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
