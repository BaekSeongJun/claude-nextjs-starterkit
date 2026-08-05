// 클라이언트 사이드 로컬 스토리지 기반 인증 (데모용)

export interface StoredUser {
  email: string
  password: string
  createdAt: string
}

const USERS_STORAGE_KEY = "demo_users"
const CURRENT_USER_KEY = "demo_current_user"

export function getAllStoredUsers(): StoredUser[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(USERS_STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

export function getUserByEmail(email: string): StoredUser | undefined {
  const users = getAllStoredUsers()
  return users.find((u) => u.email === email)
}

export function registerUser(email: string, password: string): { success: boolean; error?: string } {
  if (getUserByEmail(email)) {
    return { success: false, error: "이미 가입된 이메일입니다." }
  }

  const users = getAllStoredUsers()
  const newUser: StoredUser = {
    email,
    password,
    createdAt: new Date().toISOString(),
  }
  users.push(newUser)
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
  return { success: true }
}

export function loginUser(email: string, password: string): { success: boolean; error?: string } {
  const user = getUserByEmail(email)
  if (!user) {
    return { success: false, error: "가입되지 않은 이메일입니다." }
  }
  if (user.password !== password) {
    return { success: false, error: "비밀번호가 일치하지 않습니다." }
  }

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
  return { success: true }
}

export function logoutUser(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(CURRENT_USER_KEY)
  }
}

export function getCurrentUser(): StoredUser | null {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem(CURRENT_USER_KEY)
  return stored ? JSON.parse(stored) : null
}
