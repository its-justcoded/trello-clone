import {z} from "zod";

export const SignupSchema = z.object({
    email:z.string().email(),
    password:z.string().min(6).max(10)
})

export const LoginSchema = z.object({
    email:z.string().email(),
    password:z.string().min(6).max(10)
})

