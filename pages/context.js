import React, { createContext, useEffect, useState, useRef } from "react";
import moment from "moment";
import axios from "axios";
import io from "socket.io-client";
import { message } from "antd";
import { isBrowser } from "react-device-detect";
import { Profiler, InvisibleTimer } from "./assets/utilities";

let socket;

export const SettingsContext = createContext();

function SettingsContextProvider(props) {
  const [visitHour, setVisitHour] = useState();
  const [openProfile, setOpenProfile] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [visitorWithTimer, setVisitorWithTimer] = useState();

  let titleRef = useRef();

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

    (async () => {
      let res = await axios.get("/api/visit", {
        params: { mode: "visit-with-timers" },
      });
      if (res.data.status == 200) setVisitorWithTimer(res.data.data);
    })();
  }, []);

  //sockets
  useEffect(() => {
    fetch("/api/socket").finally(() => {
      socket = io();

      socket.on("open-profile", async (id) => {
        if (id != null && !openProfile) {
          let res = await axios.get("/api/visitor", {
            params: { id, mode: "get-visitor" },
          });
          if (res.data.status == 200) {
            setProfileData(res.data.data);
            if (!openProfile) setOpenProfile(true);
          } else message.error("Error on scanning the QR code");
        }
      });
    });
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        setVisitHour,
        visitHour,
        setOpenProfile,
        setProfileData,
        titleRef,
      }}
    >
      <InvisibleTimer visitorWithTimer={visitorWithTimer} />
      {isBrowser && (
        <Profiler
          openModal={openProfile}
          setOpenModal={setOpenProfile}
          data={profileData}
        />
      )}

      {props.children}
    </SettingsContext.Provider>
  );
}

export default SettingsContextProvider;
