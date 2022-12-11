import React, { useEffect, useState, useCallback } from "react";
import moment from "moment";
import { Progress } from "antd";
const Timer = ({ startDate, endDate, end }) => {
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

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Progress
        type="dashboard"
        percent={(
          100 -
          (seconds /
            moment
              .duration(moment(endDate).diff(moment(startDate)))
              .asSeconds()) *
            100
        ).toFixed(1)}
        status="active"
        strokeColor={{
          "0%": "#108ee9",
          "100%": "#87d068",
        }}
        strokeWidth={10}
      />
      {new Date(seconds * 1000).toISOString().slice(11, 19)}
    </div>
  );
};

export default Timer;
