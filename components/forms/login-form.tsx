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
import { loginSchema, type LoginValues } from "@/lib/validations/login"
import { loginUser, getCurrentUser } from "@/lib/auth-storage"

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  useEffect(() => {
    if (getCurrentUser()) {
      router.replace("/")
    }
  }, [router])

  async function onSubmit(values: LoginValues) {
    setIsLoading(true)
    try {
      const result = loginUser(values.email, values.password)
      if (result.success) {
        toast.success("로그인되었습니다!")
        form.reset()
        setTimeout(() => {
          router.push("/")
        }, 800)
      } else {
        toast.error(result.error || "로그인에 실패했습니다.")
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
        <CardTitle>로그인</CardTitle>
        <CardDescription>이메일과 비밀번호를 입력해주세요.</CardDescription>
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
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "로그인 중..." : "로그인하기"}
              </Button>
              <FieldDescription className="text-center">
                계정이 없으신가요? <Link href="/signup">회원가입</Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
