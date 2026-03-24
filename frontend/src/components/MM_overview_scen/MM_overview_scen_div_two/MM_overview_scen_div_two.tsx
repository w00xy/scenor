import {JSX} from "react"
import "./MM_overview_scen_div_two.scss"

import VectorOne from "../../../assets/MM_Vectors-pages/Vector_One.svg?react"
import VectorTwo from "../../../assets/MM_Vectors-pages/Vector_Two.svg?react"


interface MM_overview_scen_div_twoProps{
    count: string;
    current_page: string;
}

export function MM_overview_scen_div_two({ count, current_page }: MM_overview_scen_div_twoProps): JSX.Element{
    return(
        <div className="MM_overview_scen_div_two">
            <h1>Всего {count}</h1>
            <div>
                <VectorOne />
                <p>{current_page}</p>
                <VectorTwo />
            </div>
        </div>
    )
}