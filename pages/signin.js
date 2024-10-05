import { useState, useEffect } from 'react';
import AnimatePage from '../components/AnimatePage';
import { getFromStorage, setToStorage } from '../helper/localStorage';
import Router from "next/router";
import { v4 as uuidv4 } from 'uuid';

export default function Signin() {

    const [myName, setMyName] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('')
    const [cpass, reEnter] = useState('')
    const [record, setMyRecords] = useState({
    wins: 0,
    loses: 0,
    draws: 0,
    total: 0,
    winRate: 0
  });

    useEffect(() => {
        // if (!(typeof getFromStorage('player-name') === 'undefined' ||
        //     getFromStorage('player-name') === null ||
        //     getFromStorage('player-name') === '')) {
        //     Router.push('/');
        // }
        // if(())
    }, []);

    const handleSubmit = (event, action = '') => {
        if (event.key === 'Enter' || action === 'click') {
            if (!name.replace(/\s/g, '').length || name === '' || password === '') {
                if(name === '' && password === '' && cpass === '')
                    alert('Can\'t leave all boxes blank!')
                else if(password === '')
                    alert('Please enter your password')
                else
                    alert('Please enter your username')
            }
            else if (typeof getFromStorage('name') === 'undefined' ||
                getFromStorage('name') === null ||
                getFromStorage('name') === '') {
                    alert('Username doesn\'t exist')
            }
            else{
                if(name === getFromStorage('player-name') && password === getFromStorage('password'))
                {
                    setMyName(getFromStorage('player-name'));
                    const record = JSON.parse(getFromStorage('player-record'));
                    setMyRecords(record);
                }
            }
            Router.push('/');
        }
    }

    return (
        <AnimatePage>
            <div className='signin grid place-items-center font-sans max-w-4xl mx-auto h-screen'>
                <div className='pt-9 pb-6 px-10 xs:px-8 xs:w-11/12 
                sm:w-10/12 w-7/12 md:7/12 rounded-md'>
                    <div className='mb-2 font-light text-lg'>
                        Enter your username
                    </div>
                    <div className='d-block'>
                        <input
                            type='text'
                            placeholder="Enter your username" required
                            className='text-black font-medium w-full p-2 rounded-sm'
                            onKeyPress={e => handleSubmit(e)}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>

                    <div className='mb-2 font-light text-lg'>
                        Enter your password
                    </div>
                    <div className='d-block'>
                        <input
                            type='password'
                            placeholder="Enter your password" required
                            className='text-black font-medium w-full p-2 rounded-sm'
                            onKeyPress={e => handleSubmit(e)}
                            onChange={e => setPassword(e.target.value)} 
                        />
                    </div>

                    <div className='footer d-block w-full flex xs:justify-center justify-end mt-5'>
                        <button onClick={e => handleSubmit(e, 'click')} className='bg-gradient-shadow relative rounded-full xs:w-full px-7 py-2 bg-gradient-to-tr from-[#F7B12D] via-[#FA8247] to-[#FC585D] text-base font-medium text-white hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-offset-0 focus:ring-[#f7b02d39]'>Submit</button>
                    </div>

                </div>

            </div>
        </AnimatePage>
    )
}