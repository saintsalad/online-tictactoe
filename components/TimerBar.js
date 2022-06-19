import { useState, useEffect } from 'react'

function TimerBar({ left, start, secs, matchDone, timer }) {

    const [width, setWidth] = useState(100)
    // const [isStart, setIsStart] = useState(start);

    useEffect(() => {

        if (start && !matchDone) {
            setWidth((100 / secs) * timer);
        }

        if (matchDone) {
            setWidth(100);
        }

    }, [start, timer, secs, matchDone])

    return (
        <div className="timerbar"
            style={{
                width: '100%',
                backgroundColor: 'rgb(221 221 221 / 25%)',
                borderRadius: '20px',
                direction: left || 'rtl'
            }}>
            <div className="bg-gradient-shadow relative bar bg-gradient-to-tr  from-[#F7B12D] via-[#FA8247] to-[#FC585D]"
                style={{
                    width: width + '%',
                    borderRadius: '20px',
                    height: '3px'
                }}></div>
        </div>
    )
}

export default TimerBar