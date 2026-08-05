import {z} from "zod";

export const SignupSchema = z.object({
    email:z.string().email(),
    password:z.string().min(6).max(10)
})

export const LoginSchema = z.object({
    email:z.string().email(),
    password:z.string().min(6).max(10)
})

export const createOrgSchema = z.object({
    name:z.string(),
    description:z.string()
})

export const UpdateOrgSchema = z.object({
    name:z.string().min(1,"name is required"),
    description:z.string()
})

export const SectionSchema =z.object({
    title:z.string(),
    boardId :z.string()
})

export const UpdateSectionSchema = z.object({
    title:z.string(),
    boardId:z.string()
})

export const IssueSchema = z.object({
    title:z.string(),
    description:z.string(),
    sectionId:z.string(),
    boardId:z.string()
})

export const UpdateIssueSchema = z.object({
    title:z.string(),
    description:z.string(),
    sectionId:z.string(),
    boardId:z.string()
})

export const BoardSchema = z.object({
    title:z.string(),
    orgId:z.string()
})

export const UpdateBoardSchema = z.object({
    title:z.string(),
    orgId:z.string()
})



