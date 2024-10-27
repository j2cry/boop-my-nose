import React, { useState, useRef, useEffect } from "react";
import { useCookies } from "react-cookie";
import io from "socket.io-client";
import Splash, { SplashType } from "../Splash/Splash";
import {
    logo, info, replay, boopCat1, boopCat2, ouchCat, skeleton, githubLogo
} from "../svg";
import "./app.css";


interface ImageResponse {
    id: string
    image: ArrayBuffer
    error?: string
}

interface ImageData {
    id: string
    data: string
}

interface ImageScale {
    x: number
    y: number
}


const socket = io(import.meta.env.MODE === "development" ? ":5252" : "")


function App() {
    const [cookies, setCookie] = useCookies(["score", "visited"])
    const [splash, setSplash] = useState<React.ReactNode>(<></>)
    const [image64, setImage64] = useState<ImageData>({id: "", data: ""})
    const [imageScale, setImageScale] = useState<ImageScale>({x: 1, y: 1})
    const [score, setScore] = useState<number>(0)
    const loadRef = useRef(false)

    // receive new image
    const receiveNewImage = async (response: ImageResponse) => {
        if (response.error) {
            setSplash(<Splash
                type={SplashType.ERROR}
                message={`Error occured: ${response.error}; please, contact the developer`}
            />)
            return
        }
        const image = String.fromCharCode(...new Uint8Array(response.image))
        // const image = (new TextDecoder()).decode(buffer) // another approach
        setImage64({id: response.id, data: image})
    }
    // update image scales
    const onImageLoad = (e: React.BaseSyntheticEvent) => {
        setImageScale({
            x: e.currentTarget.naturalWidth / e.currentTarget.offsetWidth,
            y: e.currentTarget.naturalHeight / e.currentTarget.offsetHeight,
        })
    }
    // image click handler
    const onImageClick = (e: React.BaseSyntheticEvent<MouseEvent, any, any>) => {
        setSplash(<Splash type={SplashType.LOADING} message="" />)
        const rect = e.currentTarget.getBoundingClientRect()
        const point = {
            x: Math.floor(imageScale.x * (e.nativeEvent.clientX - rect.left)),
            y: Math.floor(imageScale.y * (e.nativeEvent.clientY - rect.top))
        }
        socket.emit("click", {id: image64.id, ...point}, (klass: number) => {
            switch (klass) {
                // ouch!
                case 1: {
                    setSplash(<Splash
                        type={SplashType.ERROR}
                        message={<img src={ouchCat} className="info-logo dark" alt="info-logo" />}
                    />)
                    setScore(score - 1)
                    break
                }
                // boop!
                case 2: {
                    const boopCats = [boopCat1, boopCat2]
                    const randomIndex = Math.floor(Math.random() * boopCats.length);
                    setScore(score + 1)
                    setSplash(<Splash
                        type={SplashType.SUCCESS}
                        message={<img src={boopCats[randomIndex]} className="info-logo dark" alt="info-logo" />}
                    />)
                    break
                }
                // miss
                default:
                    setSplash(<Splash
                        message={<img src={skeleton} className="info-logo light" alt="info-logo" />}
                    />)
            }
            setTimeout(() => {
                setSplash(<></>)
            }, 600)
            // socket.emit("new-image", receiveNewImage)
        })
        socket.emit("new-image", receiveNewImage)
    }
    // resect scoring
    const resetScore = () => {
        setScore(0)
    }
    // show information splash
    const showInfo = () => {
        setSplash(<Splash
            message="Just boop a cats nose. Not an eye."
            onClick={() => setSplash(<></>)}
        />)
    }
    // request on page open
    if (!loadRef.current) {
        loadRef.current = true
        // on first visit
        if (!cookies.visited) {
            setCookie("visited", true, {sameSite: true})
            showInfo()
        }
        socket.emit("new-image", receiveNewImage)
        if (cookies.score)
            setScore(cookies.score)
    }
    // on score changed
    useEffect(() => {
        setCookie("score", score, {sameSite: true})
    }, [score])
    // render component
    return (
        <>
            <header>
                <img src={logo} className="main-logo" alt="logo" />
                <div className="center-panel">Boopscore: {score}</div>
                <div className="right-panel">
                    <img src={info} className="header-logo light" onClick={showInfo} alt="info" />
                    <img src={replay} className="header-logo light" onClick={resetScore} alt="info" />
                </div>
            </header>
            <main>
                <img src={`data:image/png;base64, ${image64.data}`}
                    className="boop-image"
                    onClick={onImageClick}
                    onLoad={onImageLoad}
                    alt="image"
                />
            </main>
            <footer>
                <a href="https://github.com/j2cry/boop-my-nose"
                    className="src-link"
                    target="_blank"
                >
                <img src={githubLogo} className="footer-logo"/>
                GitHub
                </a>
            </footer>
            {splash}
        </>
    )
}

export default App
