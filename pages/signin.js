import { useState } from 'react';
import AnimatePage from '../components/AnimatePage';
import { setToStorage } from '../helper/localStorage';
import Router from "next/router";

function signin() {

    const [name, setName] = useState('');


    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
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
                <div className='form-container py-12 px-10 w-7/12 rounded-md'>
                    <div className='mb-2 font-medium '>
                        Enter your name
                    </div>
                    <div className='d-block'>
                        <input
                            type='text'
                            className='text-black font-medium w-full p-2 rounded-sm'
                            onKeyPress={handleKeyPress}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>

                </div>

            </div>
        </AnimatePage>
    )
}

export default signin