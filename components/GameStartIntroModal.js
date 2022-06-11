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
                    <div className='z-10 fixed justify-center flex items-center h-screen w-screen bg-gray-500 bg-opacity-50 transition-opacity'>
                        <div className='text-xl animate-heartbeating'>{countdown}</div>
                    </div>
                )
            }
        </>
    )
}
