import { LoginForm } from "@/components/forms/login-form"

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-6 text-2xl font-bold">로그인</h1>
      <LoginForm />
    </div>
  )
}
