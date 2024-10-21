'use client';

import AnimatePage from '../components/AnimatePage';
import { useRouter } from "next/navigation";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

const FormSchema = z
    .object({
        username: z.string().min(1, 'Username is required').max(20),
        password: z
            .string()
            .min(1, 'Password is required')
            .min(8, 'Password must have at least 8 characters'),
        confirmPassword: z.string().min(1, 'Password confirmation is required'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        path: ['confirmPassword'],
        message: 'Password do not match',
    });

export default function Signup() {
    const router = useRouter();
    const form = useForm({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            username: '',
            password: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (values) => {
        const response = await fetch('/api/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: values.username,
                password: values.password,
            })
        });

        if (response.ok) {
            toast.success("You have successfully registered!", {
                style: {
                    background: '#28fb72',
                    color: '#fff',
                },
                duration: 2000,
            });
            router.push('/signin'); // Redirect to sign-in page after successful signup
        } else {
            toast.error("Signup failed! Try again.", {
                style: {
                    background: '#fd4747',
                    color: '#fff',
                },
                duration: 2000,
            });
        }
    };

    return (
        <AnimatePage>
            <div className="bg-[url('/index.jpg')] bg-cover bg-center min-h-screen">
                <div className="bg-white bg-opacity-90 p-6 h-screen flex flex-col justify-between">
                    <div className='flex-grow flex items-center justify-center'>
                        <div className='bg-purple-300 p-8 rounded-lg border-4 border-black shadow-xl w-full max-w-md flex flex-col items-center'>
                            <div className="text-3xl text-black font-bold mb-6 text-center">Sign Up</div>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-md space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="username"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel className="block text-black text-lg font-bold mb-2">Username</FormLabel>
                                                <FormControl>
                                                    <Input className="text-black p-2 border-2 border-black rounded"
                                                           placeholder="Enter your username" {...field} />
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
                                                    <Input className="text-black p-2 border-2 border-black rounded" type="password"
                                                           placeholder="Enter your password" {...field} />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel className="block text-black text-lg font-bold mb-2">Confirm Password</FormLabel>
                                                <FormControl>
                                                    <Input className="text-black p-2 border-2 border-black rounded" type="password"
                                                           placeholder="Confirm your password" {...field} />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                    <div className="footer d-block w-full flex xs:justify-center justify-end mt-5">
                                        <Button type="submit"
                                                className="bg-rose-400 px-4 py-2 font-bold text-white rounded-lg border-4 border-black shadow-xl transform hover:scale-110 hover:bg-rose-500 transition duration-200">
                                            Submit
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </div>
                    </div>
                </div>
            </div>
        </AnimatePage>
    );
}
