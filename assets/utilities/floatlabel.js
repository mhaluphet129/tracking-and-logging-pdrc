import React, { useState } from "react";

export default function FloatLabel(props) {
  const [focus, setFocus] = useState(false);
  const { children, label, value, style, bool } = props;

  const labelClass =
    focus || (value && value.length !== 0) || bool
      ? "label label-float"
      : "label";

  return (
    <div
      className="float-label"
      onBlur={() => setFocus(false)}
      onFocus={() => setFocus(true)}
      style={style}
    >
      {children}
      <label className={labelClass} style={{ color: "#aaa" }}>
        {label}
      </label>
    </div>
  );
}
