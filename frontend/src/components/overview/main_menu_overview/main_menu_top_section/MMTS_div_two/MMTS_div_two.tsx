import React, { JSX } from "react";
import "./MMTS_div_two.scss";
import { MMTS_d2_component } from "./MMTS_d2_component/MMTS_d2_component";

export function MMTS_div_two(): JSX.Element {
  return (
    <div className="MMTS_div_two">
      <MMTS_d2_component
        text="Успешных операций"
        value="0"
        color="#34C759"
        borderRadius="6px 0px 0px 6px"
      />
      <MMTS_d2_component text="Провалено операций" value="0" color="#FF4B33" />
      <MMTS_d2_component text="Процент провалов" value="0%" color="white" />
      <MMTS_d2_component
        text="Время выполнения (сред.)"
        value="0s"
        color="white"
        borderRadius="0px 6px 6px 0px"
      />
    </div>
  );
}
