import {JSX} from "react"
import "./MM_overview_scen_div_two.scss"

import VectorOne from "../../../../../assets/navigation/VectorOne.svg?react"
import VectorTwo from "../../../../../assets/navigation/VectorTwo.svg?react"


interface MM_overview_scen_div_twoProps{
    count: number;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function MM_overview_scen_div_two({ count, currentPage, totalPages, onPageChange }: MM_overview_scen_div_twoProps): JSX.Element{
    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    return(
        <div className="MM_overview_scen_div_two">
            <h1>Всего {count}</h1>
            <div>
                <button 
                    onClick={handlePrevious} 
                    disabled={currentPage === 1}
                    className="pagination-arrow"
                >
                    <VectorOne />
                </button>
                <p>{currentPage}</p>
                <button 
                    onClick={handleNext} 
                    disabled={currentPage >= totalPages}
                    className="pagination-arrow"
                >
                    <VectorTwo />
                </button>
            </div>
        </div>
    )
}