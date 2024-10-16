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
            <div className="signin grid place-items-center font-sans max-w-4xl mx-auto h-screen">
                <div className="pt-9 pb-6 px-10 xs:px-8 xs:w-11/12 sm:w-10/12 w-7/12 md:7/12 rounded-md">
                    <div className="mb-2 text-2xl font-bold">Sign Up</div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold">Username</FormLabel>
                                        <FormControl>
                                            <Input className="text-black" placeholder="Enter your username" {...field} />
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
                                            <Input className="text-black" type="password" placeholder="Enter your password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold">Confirm Password</FormLabel>
                                        <FormControl>
                                            <Input className="text-black" type="password" placeholder="Confirm your password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="footer d-block w-full flex xs:justify-center justify-end mt-5">
                                <Button type="submit" className="bg-gradient-shadow relative rounded-full xs:w-full px-7 py-2 bg-gradient-to-tr from-[#F7B12D] via-[#FA8247] to-[#FC585D] text-base font-medium text-white hover:opacity-90">
                                    Submit
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </AnimatePage>
    );
}
