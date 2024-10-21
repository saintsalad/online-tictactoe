'use client'

import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import Link from "next/link";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import AnimatePage from "../components/AnimatePage";

const FormSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
});
export default function SignIn({onSignIn }) {
    const router = useRouter();
    /*const [record, setRecord] = useState({
        wins: 0,
        loses: 0,
        draws: 0,
        total: 0,
        winRate: 0
    });*/
    const form = useForm({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            username: '',
            password: '',
        },
    });
    /*useEffect(() => {
        // Check if the user is already signed in
        const storedName = getFromStorage('player-name');
        if (storedName) {
            router.push('/');
        }
    }, [router]);*/
    const onSubmit = async (values) => {
        const signInData = await signIn('credentials', {
            username: values.username,
            password: values.password,
            redirect: false,
        });

        if (signInData?.error) {
            toast.error("Login or password is invalid.",{
                style: {
                    background: '#fd4747',
                    color: '#fff',
                },
                duration: 2000,
                action:  {
                    label: "Retry",
                    onClick: () => {
                        form.reset();
                    }
                }
            });
        } else {
            /*const storedName = getFromStorage('player-name');
            const storedPassword = getFromStorage('password');
            if (values.username === storedName && values.password === storedPassword) {
                const storedRecord = JSON.parse(getFromStorage('player-record')) || record;
                setRecord(storedRecord);*/
                
            
            if (onSignIn) onSignIn();
            toast.success("Login Success.",{
                style: {
                    background: '#28fb72',
                    color: '#fff',
                },
                duration: 2000,
            });
            router.push('/');
        }
    };
    return (
        <>
            <AnimatePage>
                <div className="bg-[url('/index.jpg')] bg-cover bg-center min-h-screen">
                    <div className="bg-white bg-opacity-90 p-6 h-screen flex flex-col justify-between">
                        <div className='flex-grow flex items-center justify-center'>
                            <div className='bg-purple-300 p-8 rounded-lg border-4 border-black shadow-xl w-full max-w-md flex flex-col items-center'>
                                <div className='text-3xl text-black font-bold mb-6 text-center'>
                                    Login
                                </div>
                                <Form {...form} >
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-md space-y-4">
                                        <div className="space-y-4">
                                            <FormField
                                                control={form.control}
                                                name="username"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel className="block text-black text-lg font-bold mb-2">Username</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                className=" p-2 border-2 border-black rounded text-black"
                                                                placeholder="Username" {...field} />
                                                        </FormControl>
                                                        <FormMessage/>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="password"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel className="block text-black text-lg font-bold mb-2">Password</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                className="w-full p-2 border-2 border-black rounded text-black"
                                                                type="password"
                                                                placeholder="Enter your password"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage/>
                                                    </FormItem>
                                                )}
                                            />
                                            <div
                                                className='footer d-block w-full flex xs:justify-center justify-end mt-5'>
                                                <Button type="submit"
                                                        className='bg-rose-400 px-4 py-2 font-bold text-white rounded-lg border-4 border-black shadow-xl transform hover:scale-110 hover:bg-rose-500 transition duration-200'>
                                                    Sign in
                                                </Button>
                                            </div>
                                        </div>
                                    </form>
                                </Form>
                                <div className="space-y-2">
                                    <p className="text-center text-sm text-gray-600 mt-2">
                                        If you don&apos;t have an account, please&nbsp;
                                        <Link href="signup" className="text-blue-500 hover:underline">Sign up</Link>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </AnimatePage>
        </>
);
}   