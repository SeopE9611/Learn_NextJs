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
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
