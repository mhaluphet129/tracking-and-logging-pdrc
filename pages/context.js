import React, { createContext, useEffect, useState, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import Cookies from "js-cookie";
import { message } from "antd";
import { isBrowser } from "react-device-detect";
import { Profiler, Settings } from "./assets/utilities";

let socket;

export const SettingsContext = createContext();

function SettingsContextProvider(props) {
  const [visitHour, setVisitHour] = useState();
  const [openProfile, setOpenProfile] = useState(false);
  const [profileData, setProfileData] = useState(null);

  let titleRef = useRef();

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
      {isBrowser && (
        <>
          {Cookies.get("loggedIn") != undefined && <Settings />}
          <Profiler
            openModal={openProfile}
            setOpenModal={setOpenProfile}
            data={profileData}
          />
        </>
      )}

      {props.children}
    </SettingsContext.Provider>
  );
}

export default SettingsContextProvider;
