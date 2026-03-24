import React from "react";
import { JSX } from "react";
import MM_SearchSVG from "../../../assets/MM_SearchSVG.svg?react";
import "./MM_overview_scen_div_one.scss";

interface MM_overview_scen_div_oneProps {
  placeholder: string;
  sortBy: string;
  onSortChange: (value: string) => void;
}

export function MM_overview_scen_div_one({
  placeholder,
  sortBy,
  onSortChange,
}: MM_overview_scen_div_oneProps): JSX.Element {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onSortChange(event.target.value);
  };

  return (
    <div className="MM_overview_scen_div_one">
      <div className="MM_input_wrapper">
        <MM_SearchSVG />
        <input type="text" placeholder={placeholder} />
      </div>

      <select value={sortBy} onChange={handleChange}>
        <option value="" disabled>
          Сортировать по
        </option>
        <option value="Name">По названию</option>
        <option value="Creation date">По дате создания</option>
        <option value="Update date">По дате обновления</option>
      </select>
    </div>
  );
}