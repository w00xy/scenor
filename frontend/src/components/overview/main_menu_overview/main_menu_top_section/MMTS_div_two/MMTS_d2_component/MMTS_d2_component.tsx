import React, {JSX} from "react";
import "./MMTS_d2_component.scss"

interface MMTS_d2_componentProps{
    text: string;
    value: string;
    color?: string; 
    borderRadius?: string;
}

export function MMTS_d2_component({ text, value, color, borderRadius}: MMTS_d2_componentProps): JSX.Element {
    return(
        <div className="MMTS_d2_component" style={{borderRadius: borderRadius }}>
            <h1>{text}</h1>
            <p style={{ color }}>{value}</p>
        </div>
    )
}