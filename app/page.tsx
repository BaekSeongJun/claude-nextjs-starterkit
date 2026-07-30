import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const stack = [
  "Next.js 16",
  "TypeScript",
  "Tailwind CSS v4",
  "shadcn/ui",
  "react-hook-form",
  "zod",
]

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="flex flex-col items-start gap-4">
        <Badge>빠른 시작</Badge>
        <h1 className="text-3xl font-bold tracking-tight">모던 웹 스타터킷</h1>
        <p className="max-w-2xl text-muted-foreground">
          다크모드, 반응형 네비게이션, 폼 검증까지 미리 갖춘 Next.js 스타터킷입니다.
        </p>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/login">로그인 폼 데모 보기</Link>
          </Button>
        </div>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stack.map((name) => (
          <Card key={name}>
            <CardHeader>
              <CardTitle className="text-base">{name}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              프로젝트에 이미 구성되어 있습니다.
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
