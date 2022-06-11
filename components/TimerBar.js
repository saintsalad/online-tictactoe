import { useState, useEffect } from 'react'

function TimerBar({ left, start, secs, matchDone }) {

    const [width, setWidth] = useState(100)
    // const [isStart, setIsStart] = useState(start);

    useEffect(() => {



        let id = null;
        if (start && !matchDone) {
            id = setInterval(() => {
                frame();
            }, 100);

            const frame = () => {
                if (width <= 0) {
                    clearInterval(id);
                } else {
                    setWidth(w => w - 0.1 * (100 / secs));
                }
            }
        } else if (matchDone) {
            setWidth(100);
        }

        return () => {
            clearInterval(id);
        };
    }, [start, width, secs, matchDone]);




    return (
        <div className="timerbar"
            style={{
                width: '100%',
                backgroundColor: 'rgb(221 221 221 / 25%)',
                borderRadius: '20px',
                direction: left || 'rtl'
            }}>
            <div className="bar bg-gradient-to-tr  from-[#F7B12D] via-[#FA8247] to-[#FC585D]"
                style={{
                    width: width + '%',
                    borderRadius: '20px',
                    height: '4px'
                }}></div>
        </div>
    )
}

export default TimerBar