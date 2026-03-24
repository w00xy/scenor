import React, {JSX} from "react";
import "./MainMenuBody.scss"
import { MainMenuTopSection } from "../main_menu-top_section/MainMenuTopSection/MainMenuTopSection";

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
