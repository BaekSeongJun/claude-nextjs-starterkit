"use client"

import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { signupSchema, type SignupValues } from "@/lib/validations/signup"

export function SignupForm() {
  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  })

  function onSubmit(values: SignupValues) {
    console.log(values)
    toast.success("회원가입 폼 검증 성공 (데모)")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>회원가입</CardTitle>
        <CardDescription>새 계정을 만들기 위해 정보를 입력해주세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
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

            <Field>
              <FieldLabel>비밀번호 확인</FieldLabel>
              <FieldContent>
                <Input type="password" {...form.register("confirmPassword")} />
                <FieldError errors={form.formState.errors.confirmPassword ? [form.formState.errors.confirmPassword] : undefined} />
              </FieldContent>
            </Field>

            <Field>
              <Button type="submit" className="w-full">
                회원가입하기
              </Button>
              <FieldDescription className="text-center">
                이미 계정이 있으신가요? <Link href="/login">로그인</Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
