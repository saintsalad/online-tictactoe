import { useState, useEffect } from 'react';
import AnimatePage from '../components/AnimatePage';
import { getFromStorage, setToStorage } from '../helper/localStorage';
import Router from "next/router";

export default function Signin() {

    const [name, setName] = useState('');

    useEffect(() => {
        if (!(typeof getFromStorage('player-name') === 'undefined' ||
            getFromStorage('player-name') === null ||
            getFromStorage('player-name') === '')) {
            Router.push('/');
        }
    }, []);

    const handleSubmit = (event, action = '') => {
        if (event.key === 'Enter' || action === 'click') {
            if (!name.replace(/\s/g, '').length || name === '') {
                console.log('enter your name');
            } else {
                setToStorage('player-name', name);
                Router.push('/');
            }
        }
    }

    return (
        <AnimatePage>
            <div className='signin grid place-items-center font-sans max-w-4xl mx-auto h-screen'>
                <div className='form-container pt-9 pb-6 px-10 xs:px-8 xs:w-11/12 
                sm:w-10/12 w-7/12 md:7/12 rounded-md'>
                    <div className='mb-2 font-medium '>
                        Enter your name
                    </div>
                    <div className='d-block'>
                        <input
                            type='text'
                            className='text-black font-medium w-full p-2 rounded-sm'
                            onKeyPress={e => handleSubmit(e)}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>

                    <div className='footer d-block w-full flex xs:justify-center justify-end mt-5'>
                        <button onClick={e => handleSubmit(e, 'click')} className='rounded-full xs:w-full px-7 py-2  bg-gradient-to-tl from-[#F7B12D] via-[#FA8247] to-[#FC585D] text-base font-medium text-white hover:opacity-90 focus:outline-none focus:ring-0 focus:ring-offset-4 focus:ring-offset-transparent'>Submit</button>
                    </div>

                </div>

            </div>
        </AnimatePage>
    )
}