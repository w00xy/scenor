import React, {JSX} from "react";
import "./MainMenuBody.scss"

interface MainMenuBodyProps{
    children: React.ReactNode;
}

export function MainMenuBody({ children }: MainMenuBodyProps): JSX.Element {
    return(
        <div className="MainMenuBody">
            {children}
        </div>
    )
}
