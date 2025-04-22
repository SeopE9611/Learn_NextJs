import { authConfig } from "@/auth.config";
import NextAuth from "next-auth";

// 미들웨어: 본격적인 처리(페이지 렌더링, API 응답 등) 전에
// 요청을 가로채서 검사·변경·통제하는 역할을 한다. (보안 검색대 같은 역할)

// Next.js에서의 미들웨어
// middleware.ts 한 파일로 인증과 리다이렉트, 헤더 조작등을 처리함
// NextAuth.js의 auth 함수를 미들웨어로 연결하면
// 로그인 상태에 따라 대시보드 접근 차단이나 자동 리다이렉트를 할 수 있다.

// NextAuth(authConfig).auth: NextAuth.js가 내부적으로 만든 미들웨어 함수를 꺼내와서 모든 요청에 대한 인증 검사기로 사용한다.
// 즉 이 함수가 모든 요청을 가로채서 세션(auth) 정보를 확인해줌
export default NextAuth(authConfig).auth;

export const config = {
  // api, 정적파일, 이미지 제외한 모든 경로에 미들웨어 적용
  // 모든 페이지 요청에 대해 auth 검사를 수행
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'] // matcher로 어떤 경로에 미들웨어를 적용할 지를 결정함
}