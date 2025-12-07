'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { registerSchema, RegisterInput } from "@/lib/databaseValidation";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Image from "next/image";

export default function RegisterScreen() {
    const router = useRouter()
    const [globalError, setGlobalError] = useState("");

    const form = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            nama: "",
            email: "",
            role: "Murid",
            password: "",
            confirmPassword: "",
        }
    })

    async function onSubmit (data: RegisterInput) {
        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                data.email,
                data.password
            )

            const user = userCredential.user;

            const userData = {
                uid: user.uid,
                nama: data.nama,
                role: data.role,
                tanggalLahir: data.tanggalLahir,
                email: data.email,
            };

            await setDoc(doc(db, "users", userData.uid), userData);
            console.log("Login Berhasil")
            router.push('/login')
        } catch (e: any) {
            console.error("Firebase Error:", e)
            setGlobalError(e.message);
        }
    }

    return (
        <div className="flex justify-center items-center h-screen mt-15 mb-15">
            <div className="flex flex-col gap-10 px-21 py-21 shadow-[0_0_20px_rgba(0,0,0,0.15)] w-209">
                <div className="text-center leading-none">
                    <h1 className="text-blue-base font-bold text-h3">Create New Account</h1>
                </div>
                <Form {...form}>
                    <form
                        className="flex flex-col justify-center items-center gap-12"
                        onSubmit={form.handleSubmit(onSubmit, (errors) => {
                            console.log("GAGAL VALIDASI:", errors)
                        })}
                    >
                        <div className="flex flex-col gap-5 w-full">
                            <FormField
                                control={form.control}
                                name="nama"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input 
                                                placeholder="Nama Lengkap"
                                                variant={"auth"}
                                                icon={<Image 
                                                    src={"/user.png"}
                                                    alt="User"
                                                    width={500}
                                                    height={500}
                                                    className="w-9 h-9"
                                                />}
                                                {...field} 
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih peranmu disini" />
                                                </SelectTrigger>
                                            </FormControl>

                                            <SelectContent>
                                                <SelectItem value="Guru">Guru</SelectItem>
                                                <SelectItem value="Murid">Murid</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField 
                                control={form.control}
                                name="tanggalLahir"
                                render={({ field }) => (
                                    <FormItem>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        className="flex justify-between rounded-[20px] bg-addition-blue-30 px-8 py-4 h-19 text-b6 text-addition-blue-80 font-bold hover:bg-addition-blue-30"
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "PPP")
                                                        ) : (
                                                            <span>Pilih tanggal lahir</span>
                                                        )}
                                                        <Image 
                                                            src={"/calendar.png"}
                                                            alt="Calendar"
                                                            width={500}
                                                            height={500}
                                                            className="w-9 h-9"
                                                        />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent>
                                                <Calendar 
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date > new Date() || date < new Date("1900-01-01")
                                                    }
                                                    autoFocus
                                                    captionLayout="dropdown"
                                                    startMonth={new Date(1900, 0)}
                                                    endMonth={new Date()}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input 
                                                placeholder="Email"
                                                variant={"auth"}
                                                icon={<Image 
                                                    src={"/email.png"}
                                                    alt="Email"
                                                    width={500}
                                                    height={500}
                                                    className="w-9 h-9"
                                                />}
                                                {...field} 
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="telepon"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input 
                                                placeholder="No Telepon"
                                                variant={"auth"}
                                                icon={<Image 
                                                    src={"/phone.png"}
                                                    alt="Telepon"
                                                    width={500}
                                                    height={500}
                                                    className="w-9 h-9"
                                                />}
                                                {...field} 
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-center items-start gap-5">
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    placeholder="Password"
                                                    variant={"auth"}
                                                    icon={<Image 
                                                        src={"/password.png"}
                                                        alt="Password"
                                                        width={500}
                                                        height={500}
                                                        className="w-9 h-9"
                                                    />}
                                                    type="password" 
                                                    {...field} 
                                                />
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
                                            <FormControl>
                                                <Input
                                                    placeholder="Confirm Password"
                                                    variant={"auth"}
                                                    icon={<Image 
                                                        src={"/password.png"}
                                                        alt="Confirm Password"
                                                        width={500}
                                                        height={500}
                                                        className="w-9 h-9"
                                                    />}
                                                    type="password"
                                                    {...field} 
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {globalError && (
                            <p>
                                Error: {globalError}
                            </p>
                        )}

                        <Button
                            type="submit"
                            disabled={form.formState.isSubmitting}
                        >
                            {form.formState.isSubmitting ? "Sedang Mendaftar..." : "Daftar Sekarang"}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}