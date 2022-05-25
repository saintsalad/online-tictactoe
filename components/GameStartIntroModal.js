import { Fragment, useRef, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FlagIcon } from '@heroicons/react/outline';
import { EmojiHappyIcon } from '@heroicons/react/outline';
import { EmojiSadIcon } from '@heroicons/react/outline';
import { v4 as uuidv4 } from 'uuid';

export default function GameStartIntroModal(props) {
    const [open, setOpen] = useState(false);
    const [countdown, setCoutdown] = useState(5);

    useEffect(() => {
        let myInterval = null;

        setOpen(props.open)

        if (open) {
            myInterval = setInterval(() => {
                if (countdown > 0) {
                    setCoutdown(countdown - 1);
                }
            }, 1000);
        }
        return () => clearInterval(myInterval);
    }, [countdown, props, open]);

    return (
        <>
            {open &&
                (
                    <div className='fixed justify-center flex items-center h-screen w-screen bg-gray-500 bg-opacity-50 transition-opacity'>
                        <div className='text-xl animate-heartbeating'>{countdown}</div>
                    </div>
                )
            }
        </>
    )
}
