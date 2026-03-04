import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isAdmin } from './lib/admin'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        // 에러 지점 해결: value 매개변수 추가 및 전달
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options }) // 빈 값 전달
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // 1️⃣ 현재 로그인한 유저 정보 가져오기
  const { data: { user } } = await supabase.auth.getUser()

  // 2️⃣ 어드민 페이지 보안 로직
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // 로그인이 안 되어 있거나, 관리자 권한이 없는 경우
    const result = isAdmin(user?.email);

    if (!user || !result) {
      // 권한이 없으면 홈(/)으로 튕겨내기
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/login', '/signup'],
}