import type { NextAuthConfig } from 'next-auth';
 
//NextAuth.js의 설정을 정의하는 객체
export const authConfig = {
  pages: { // 로그인 페이지 URL
    // 로그인 페이지 URL을 '/login'으로 설정
    signIn: '/login', 
  },
  callbacks: { // 인증 관련 콜백 함수
    authorized({ auth, request: { nextUrl } }) { // authorized 콜백 함수는 사용자가 인증되었는지 확인하는 함수, auth는 인증 정보, nextUrl은 요청 URL을 나타냄
      // auth?.user는 auth 객체가 존재할 때만 user 속성을 참조하도록 하는 안전한 접근 방식
      const isLoggedIn = !!auth?.user; // auth?.user가 존재하면 true, 아니면 false , !!는 falsy 값을 boolean으로 변환하는 방법

      // 대시보드 페이지인지 확인하는 방법, nextUrl.pathname은 요청 URL의 경로를 나타냄
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard') // startsWith는 문자열이 특정 문자열로 시작하는지 확인하는 메소드

      // 대시보드 페이지에 접근할 때는 로그인 여부에 따라 true 또는 false를 반환
      if (isOnDashboard) { // 대시보드 페이지에 접근할 때
        return isLoggedIn; // 로그인 여부에 따라 true 또는 false를 반환 안했으면 false -> 로그인 페이지로 리다이렉트
      }else if(isLoggedIn) { // 로그인 상태에서 대시보드 페이지가 아닌 다른 페이지에 접근할 때
        return Response.redirect(new URL('/dashboard', nextUrl)); // 대시보드 페이지로 리다이렉트
      }
      return true; // 대시보드 페이지가 아닌 다른 페이지(로그인화면, 공개 페이지 등)에 접근할 때는 true를 반환
    },
  },
  providers:[], // 인증 제공자 설정, 인증 수단이 없으므몰 빈 배열로 설정(인증 수단이 없는 상태) (추후 Credentials, OAth등 추가 필요)
} satisfies NextAuthConfig; // satisfies는 TypeScript의 타입 단언으로, authConfig 객체가 NextAuthConfig 타입을 만족하는지 확인하는 방법