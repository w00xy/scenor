import React from "react";
import { JSX } from "react";
import MM_SearchSVG from "../../../../../assets/common/Search.svg?react";
import "./MM_overview_scen_div_one.scss";

interface MM_overview_scen_div_oneProps {
  placeholder: string;
  sortBy: string;
  onSortChange: (value: string) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  noUpdateDate?: boolean;
}

export function MM_overview_scen_div_one({
  placeholder,
  sortBy,
  onSortChange,
  searchValue = "",
  onSearchChange,
  noUpdateDate = false,
}: MM_overview_scen_div_oneProps): JSX.Element {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onSortChange(event.target.value);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange?.(event.target.value);
  };

  return (
    <div className="MM_overview_scen_div_one">
      <div className="MM_input_wrapper">
        <MM_SearchSVG />
        <input
          type="text"
          placeholder={placeholder}
          value={searchValue}
          onChange={handleSearchChange}
        />
      </div>

      <select value={sortBy} onChange={handleChange}>
        <option value="" disabled>
          Сортировать по
        </option>
        <option value="Name">По названию</option>
        <option value="Creation date">По дате создания</option>
        {!noUpdateDate && <option value="Update date">По дате обновления</option>}
      </select>
    </div>
  );
}
