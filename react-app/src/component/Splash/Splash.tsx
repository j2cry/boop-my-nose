import React from "react";
import "./splash.css";
import { animals } from "../svg.ts"


interface SplashProps {
    type?: SplashType
    message: string | React.ReactNode
    onClick?: () => void
}

export enum SplashType {
    INFO = "",
    SUCCESS = "splash-success",
    ERROR = "splash-error",
    LOADING = "splash-loading"
}


const Splash: React.FC<SplashProps> = ({type = SplashType.INFO, message, onClick}) => {
    const randomIndex = Math.floor(Math.random() * animals.length);
    return (
        <div className={"splash " + type} onClick={onClick}>
            {type === SplashType.LOADING ? <img src={animals[randomIndex]} className="info-logo light"/>: <></>}
            <b>{message}</b>
        </div>
    )
}


export default Splash
