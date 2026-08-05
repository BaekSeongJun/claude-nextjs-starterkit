"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
import { registerUser, getCurrentUser } from "@/lib/auth-storage"

export function SignupForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  })

  useEffect(() => {
    if (getCurrentUser()) {
      router.replace("/")
    }
  }, [router])

  async function onSubmit(values: SignupValues) {
    setIsLoading(true)
    try {
      const result = registerUser(values.email, values.password)
      if (result.success) {
        toast.success("회원가입되었습니다! 로그인해주세요.")
        form.reset()
        setTimeout(() => {
          router.push("/login")
        }, 800)
      } else {
        toast.error(result.error || "회원가입에 실패했습니다.")
        setIsLoading(false)
      }
    } catch (error) {
      toast.error("오류가 발생했습니다.")
      setIsLoading(false)
    }
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
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "가입 중..." : "회원가입하기"}
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
