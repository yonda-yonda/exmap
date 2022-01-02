import * as React from "react";
import { useOl } from "~/hooks/useOl";

export const Contact = (): React.ReactElement => {
  const ol = useOl();
  return (
    <div>
      <h1>Contact</h1>
      <div
        ref={ol.ref}
        style={{
          width: "100%",
          height: "480px",
        }}
      />
    </div>
  );
};
