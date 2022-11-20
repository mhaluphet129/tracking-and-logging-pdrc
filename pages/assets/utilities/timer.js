import React, { useEffect, useState, useCallback } from "react";
import moment from "moment";
const Timer = ({ endDate, reload, end }) => {
  let [seconds, setSeconds] = useState(
    moment.duration(moment(endDate).diff(moment())).asSeconds()
  );

  const countTimer = useCallback(() => {
    if (seconds > 0) setSeconds(seconds - 1);
  }, [seconds]);

  useEffect(() => {
    if (seconds > 0) setTimeout(countTimer, 1000);
    else {
      setSeconds(0);
      end();
    }
  }, [seconds, countTimer]);

  return new Date(seconds * 1000).toISOString().slice(11, 19);
};

export default Timer;
