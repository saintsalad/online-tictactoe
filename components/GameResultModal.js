import { Fragment, useRef, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FlagIcon } from '@heroicons/react/outline';
import { EmojiHappyIcon } from '@heroicons/react/outline';
import { EmojiSadIcon } from '@heroicons/react/outline';
import { XIcon } from '@heroicons/react/outline';
import { RefreshIcon } from '@heroicons/react/outline';
import { v4 as uuidv4 } from 'uuid';

export default function GameResultModal(props) {
    const [open, setOpen] = useState(false);
    const [win, setWin] = useState(null);
    const [modalMsg, setModalMsg] = useState('');
    const [modalDesc, setModalDesc] = useState('');
    const MODAl_DESC = 'If you wish to have a rematch, please click <b>Play Again</b>.';
    const isDisable = useRef(false);

    useEffect(() => {
        setWin(props.win);
        setOpen(props.open);
        if (props.win != null) {
            setModalMsg(props.win ? 'You Win!' : 'You Lose!')
            setOpen(props.open);
            setModalDesc(props.modalDesc ? props.modalDesc : MODAl_DESC);
        } else if (props.open && props.win === null) {
            setModalMsg('Draw!');
            setOpen(props.open);
            setModalDesc(props.modalDesc ? props.modalDesc : MODAl_DESC);
        }
    }, [props]);



    const playAgain = () => {
        if (!isDisable.current) {
            props.clickPlayAgain();
            isDisable.current = true;

            setTimeout(() => {
                isDisable.current = false
            }, 1000);
        } else {
            console.log(isDisable.current);
        }
    }

    const exit = () => {
        if (!isDisable.current) {
            props.clickExit();
            isDisable.current = true;

            setTimeout(() => {
                isDisable.current = false
            }, 1000);
        } else {
            console.log(isDisable.current);
        }
    }

    const RenderEmoji = () => {
        const comp = [];
        if (win === true) {
            comp.push(
                <div key={uuidv4()} className="mx-auto bg-opacity-20 flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10 md:mx-0 md:h-10 md:w-10 lg:mx-0 lg:h-10 lg:w-10">
                    <EmojiHappyIcon className="h-6 w-6 text-green-300" aria-hidden="true" />
                </div>);
            return comp;
        } else if (win === false) {
            comp.push(
                <div key={uuidv4()} className="mx-auto bg-opacity-20 flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10 md:mx-0 md:h-10 md:w-10 lg:mx-0 lg:h-10 lg:w-10">
                    <EmojiSadIcon className="h-6 w-6 text-red-300" aria-hidden="true" />
                </div>);
            return comp;
        } else if (open && win === null) {
            comp.push(
                <div key={uuidv4()} className="mx-auto bg-opacity-20 flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10 md:mx-0 md:h-10 md:w-10 lg:mx-0 lg:h-10 lg:w-10">
                    <FlagIcon className="h-6 w-6 text-blue-300" aria-hidden="true" />
                </div>);
            return comp;
        } else {
            comp.push(
                <div key={uuidv4()} className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-transparent sm:mx-0 sm:h-10 sm:w-10">
                </div>);
            return comp;
        }

    }

    return (
        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="fixed  z-10 inset-0 overflow-y-auto" onClose={() => { }}>
                <div className="xs:flex items-center justify-center min-h-screen px-4 text-center block p-0">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-in duration-800"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-out duration-800"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Dialog.Overlay className="fixed inset-0 bg-white bg-opacity-10 transition-opacity" />
                    </Transition.Child>

                    {/* This element is to trick the browser into centering the modal contents. */}
                    <span className="hidden sm:inline-block sm:align-middle sm:h-screen md:inline-block md:align-middle md:h-screen lg:inline-block lg:align-middle lg:h-screen" aria-hidden="true">
                        &#8203;
                    </span>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-100"
                        enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        enterTo="opacity-100 translate-y-0 sm:scale-100"
                        leave="ease-in duration-100"
                        leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                        leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    >
                        <div className="xs:min-w-full bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-10 relative inline-block  rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full md:my-8 md:max-w-lg md:w-full  lg:my-8 lg:max-w-lg lg:w-full">
                            <div className="bg-transparent px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex align-middle items-center md:flex  lg:flex">
                                    <RenderEmoji />
                                    <div className="mt-3 xs:mt-1 xs:mb-6 content-center sm:mt-0 sm:ml-4 sm:text-left md:text-left md:ml-4 md:mt-0 lg:text-left lg:ml-4 lg:mt-0 xs:text-center">
                                        <Dialog.Title as="h3" className="text-2xl leading-6 font-medium text-white text-opacity-90">
                                            {modalMsg}
                                        </Dialog.Title>
                                        {/* <div className="mt-2">
                                            <p className="text-sm text-white text-opacity-80">
                                                <span dangerouslySetInnerHTML={{ __html: modalDesc }}></span>
                                            </p>
                                        </div> */}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-transparent px-4 py-3 xs:flex xs:flex-row-reverse sm:flex-row-reverse sm:px-6 sm:flex md:flex-row-reverse md:px-6 md:flex lg:flex-row-reverse lg:px-6 lg:flex xs:justify-center">
                                <button
                                    type="button"
                                    className="inline-flex bg-gradient-shadow relative justify-center rounded-md border-0 shadow-sm h-fit p-2 bg-gradient-to-tr from-[#F7B12D] via-[#FA8247] to-[#FC585D] text-base font-medium text-white hover:opacity-80 focus:outline-none focus:ring-4 focus:ring-offset-0 focus:ring-[#f7b02d39] sm:ml-3 sm:w-auto md:ml-3 md:w-auto lg:ml-3 lg:w-auto " title='Play Again'
                                    onClick={() => playAgain()}>
                                    <RefreshIcon className="h-7 w-7 text-white text-opacity-90" aria-hidden="true" />
                                </button>
                                <button
                                    type="button"
                                    className="mt-3 inline-flex justify-center rounded-md  backdrop-blur-md shadow-sm h-fit p-2 bg-white bg-opacity-10 text-base font-medium text-white text-opacity-90 hover:bg-opacity-20 focus:outline-none focus:ring-4 focus:ring-offset-0 focus:ring-[#ffffff20] sm:mt-0 md:ml-3 md:w-auto md:mt-0 lg:ml-3 lg:w-auto lg:mt-0 sm:ml-3 sm:w-auto  xs:mt-0 xs:mr-3" title='Exit'
                                    onClick={() => exit()}>
                                    <XIcon className="h-7 w-7 text-white text-opacity-90" aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition.Root>
    )
}
