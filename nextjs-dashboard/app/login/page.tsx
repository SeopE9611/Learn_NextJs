// 1) 이 파일을 만들면 브라우저에서 /login URL로 접속했을 때 이 컴포넌트가 렌더됩니다.
import AcmeLogo from '@/app/ui/acme-logo';
import LoginForm from '@/app/ui/login-form';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    // 2) 화면 전체를 flex로 가운데 정렬
    <main className="flex items-center justify-center md:h-screen">
      {/* 3) 최대 너비 400px 박스 안에 로고와 로그인 폼 배치 */}
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
        {/* 4) 상단 파란 배경에 로고 */}
        <div className="flex h-20 w-full items-end rounded-lg bg-blue-500 p-3 md:h-36">
          <div className="w-32 text-white md:w-36">
            <AcmeLogo />
          </div>
        </div>
        {/* 5) LoginForm은 URL 파라메터(callbackUrl)를 참조하므로 Suspense로 감싸서 '서버 액션 준비' 대기 */}
        {/* Suspense란 서버 컴포넌트에서 비동기 작업을 처리하는 방법으로, 서버 액션을 준비하는 동안 로딩 상태를 표시함
        ※서버 컴포넌트의 의미는 서버에서 렌더링된 HTML을 클라이언트에 전달하는 것을 의미함 
        ※ 서버 액션이란 서버에서 실행되는 함수로, 클라이언트에서 호출할 수 있음  */}
        {/* Suspense는 서버 컴포넌트에서만 사용 가능 */}
        {/* Login폼은 서버 액션을 사용하므로 Suspense로 감싸야 함 */}
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
