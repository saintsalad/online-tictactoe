import { useState, useEffect } from 'react';

export default function GameStartIntroModal(props) {
    const [open, setOpen] = useState(false);
    const [countdown, setCoutdown] = useState(5);

    useEffect(() => {
        let myInterval = null;

        setOpen(props.open);

        if (open) {
            myInterval = setInterval(() => {
                if (countdown > 0) {
                    setCoutdown(countdown - 1);
                }
            }, 1000);
        } else {
            setCoutdown(5);
        }
        return () => clearInterval(myInterval);
    }, [countdown, props, open]);

    return (
        <>
            {open &&
                (
                    <div className='bg-white bg-opacity-5 backdrop-blur-sm z-10 fixed justify-center flex items-center h-screen w-screen transition-opacity'>
                        <div className='text-4xl font-semibold animate-heartbeating'>{countdown}</div>
                    </div>
                )
            }
        </>
    )
}
