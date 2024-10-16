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
                <div className='signin grid place-items-center font-sans max-w-4xl mx-auto h-screen'>
                        <div className='pt-9 pb-6 px-10 xs:px-8 xs:w-11/12 
                        sm:w-10/12 w-7/12 md:7/12 rounded-md'>
                            <div className='mb-2 text-2xl font-bold'>
                                Login
                            </div>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="username"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="font-bold">Username</FormLabel>
                                                    <FormControl>
                                                        <Input 
                                                            className="text-black" 
                                                            placeholder="Username" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="font-bold">Password</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            className="text-black"
                                                            type="password"
                                                            placeholder="Enter your password"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className='footer d-block w-full flex xs:justify-center justify-end mt-5'>
                                            <Button type="submit" className='bg-gradient-shadow relative rounded-full xs:w-full px-7 py-2 bg-gradient-to-tr from-[#F7B12D] via-[#FA8247] to-[#FC585D] text-base font-medium text-white hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-offset-0 focus:ring-[#f7b02d39]'>
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
            </AnimatePage>
        </>
    );
}   