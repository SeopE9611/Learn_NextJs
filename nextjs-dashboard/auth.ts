import type { User } from "@/app/lib/definitions";
import { authConfig } from "@/auth.config";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from 'next-auth/providers/credentials'
import postgres from "postgres";
import { z } from "zod";

// auth.ts파일은 NextAuth.js 설정(authConfig)을 가져와서 "미들웨어용 auth 함수", 
// "서버 액션에서 사용하는 signIn, signOut 함수", 그리고 "이메일 + 비밀번호" 로그인 용 Credentials provider 설정을 모두 모아두는 곳이다.
// 또한 bcrypt를 사용한 비밀번호 검증 로직과 데이터베이스 조회 로직도 함께 정의한다.


// 1) 데이터 베이스 초기화
const sql = postgres(process.env.POSTGRES_URL!, {ssl: 'require'}) // 환경 변수에 설정된 DB URL을 이용해 연결한다.
// postgres: 라이브러리의 기본 함수로, 내부적으로 DB와 커넥션 풀(connection pool)을 생성한다. 반환된 sql 함수에 SQL 쿼리를 템플릿 리터럴 형태로 넘기면 자동으로 쿼리가 실행되어 결과를 돌려준다.
// process.env: Node.js 런타임이 제공하는 전역 객체중 하나로 OS 환경 변수들을 담고 있다.Next.js에서는 .env.local, .env 등에 정의한 변수를 빌드 시점에 이곳(process.env)에 주입한다.
// POSTGRES_URL: .env나 .env.local에 적어놓은 DB 접속 정보이다. 어디 서버에 어떤 DB에 어떤 사용자로 접속할지를 한줄로 표현한 스트링이다.
// ! : 타입스크립트 문법으로는 "이 변수는 절대 null이나 undefined가 아니다" 라고 컴파일러에게 확신을 주는 기호이다. 실제로는 이 값이 없으면 런타임 에러가 나기 때문에 반드시 .env에 POSTGRES_URL을 설정해줘야한다.
// { ssl: 'require' }: 두 번째 인자로 넘긴 옵션 객체이며 "반드시 SSL/TLS로 암호화된 연결을 사용하라" 라는 의미이다. 클라우드 환경(ex:Heroku Prostgres, AWs 등)에서는 보안상의 이유로 필수로 사용하는 경우가 많다.
// ※ 한줄 정리하자면 환경 변수에서 읽어온 DB 접속 URL로 postgre 함수를 호출해 SSL 암호회 연결 옵션과 함께 커넥션 풀을 만들고 그 결과로 나온 sql 함수를 앞으로 DB 쿼리용으로 사용하겠다는 설정.

// 2) getUserByEmail 함수 : users 테이블에서 email로 사용자 조회

async function getUserByEmail(email: string): Promise<User | undefined> { // async funtion 선언하여 호출시 Promise를 반환. 내부에서 await 사용하여 비동기 적용, 파라미터 email은 문자열 타입임을 명시하고 성공시 User 객체 반환, 실패시 undefined 반환.
  try{
// ────────────────────────────────────────────────────────────────────
// 태그드 템플릿 리터럴(tagged template literal) 사용 예시
//
// sql`…` 형태에서
//  - sql            : tag function 역할
//  - `…${expr}…`    : 템플릿 리터럴
//────────────────────────────────────────────────────────────────────
const users = await sql<User[]>`
  SELECT * FROM users      -- SELECT: 데이터 조회, *는 모든 컬럼
  WHERE email = ${email}   -- WHERE: 조건절, JS 변수 email 값을 바인딩
`;

    return users[0] // user 배열의 첫 번째 요소를 반환하며 배열이 비어있으면 undefined 반환 - 해당 이메일의 사용자가 없다는 의미
  } catch (error) { // 쿼리 실행중 예외 발생 시 catch함
    console.log('사용자 조회중 오류가 발생했습니다.', error)
    throw new Error('사용자 조회중 오류가 발생했습니다.') // 내부 에러를 감싸서 외부로 던짐. 호출 쪽에서는 이 메시지를 가진Error를 받을 수 있어, 사용자에게 노출할 메시지나 후속처리를 구분하기 쉬움.
  }
}

// 3) NextAuth 인스턴스 초기화
// auth: 미들웨어에서 사용할 함수
// signIn, signOut: 서버 액션에서 호출할 로그인/ 로그아웃 함수

// authConfig를 그대로 NextAuth에 넘긴뒤 auth(미들웨어), signIn, signOut 함수 추출
export const { auth, signIn, signOut} = NextAuth({
  ...authConfig,

  // CredenTials Provider 설정 : 사용자가 "이메일+비밀번호"로 로그인하도록 하는 Provider를 등록한다.
  // providers 배열에 다양한 OAuth(구글,깃허브등)나 Credentials처럼 직접 만든 로그인 폼을 나열 할 수 있다.
  providers:[
    // 인증 수단으로 이메일+비밀번호 방식을 사용하겠다는 설정
    Credentials({
      // 4-1) authorize 함수: 실제 로그인 검증 로직
      // credentials: email, password 객체 전달. 성공시 User 반환 실패시 null 반환
      async authorize(credentials){
        const parsed = z.object({
          email: z.string().email(), // email이 올바른 형태인지
          password: z.string().min(6), // 비번이 최소 6자 이상인지
        }).safeParse(credentials)
        if (!parsed.success) { // 입력 스키마가 맞지 않으면 인증 실패
          return null
        }

        const {email, password} = parsed.data

        // 4-1-2) DB에서 사용자 조회
        const user =await getUserByEmail(email)
        if(!user) {
          //  해당 이메일의 사용자가 없으면 인증 실패
          return null
        }

        // 4-1-3) bcrypt.compare로 비밀번호 해시 비교
        const passwordMath = await bcrypt.compare(password, user.password)
        if(!passwordMath) {
          // 비밀번호가 일치하지 않으면 인증 실패
          return null
        }

        // 4-1-4) 모든 검증 통과시 User 객체 반환 -> 세션에 저장됨
        return user
      } 
    }),
  ]
  
})