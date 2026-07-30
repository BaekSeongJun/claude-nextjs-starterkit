"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { loginSchema, type LoginValues } from "@/lib/validations/login"

export function LoginForm() {
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  function onSubmit(values: LoginValues) {
    console.log(values)
    toast.success("로그인 폼 검증 성공 (데모)")
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Field>
        <FieldLabel>이메일</FieldLabel>
        <FieldContent>
          <Input
            type="email"
            placeholder="you@example.com"
            {...form.register("email")}
          />
          <FieldError errors={form.formState.errors.email ? [form.formState.errors.email] : undefined} />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel>비밀번호</FieldLabel>
        <FieldContent>
          <Input type="password" {...form.register("password")} />
          <FieldError errors={form.formState.errors.password ? [form.formState.errors.password] : undefined} />
        </FieldContent>
      </Field>

      <Button type="submit" className="w-full">
        로그인
      </Button>
    </form>
  )
}
