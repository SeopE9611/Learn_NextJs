'use client'
import { lusitana } from '@/app/ui/fonts';
import {
  AtSymbolIcon,
  KeyIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from './button';
import { useSearchParams } from 'next/navigation';
import { useActionState } from 'react';
import { authenticate } from '@/app/lib/actions';

export default function LoginForm() {
  const searchParams = useSearchParams(); // useSearchParams()를 호출해 URLSearchParams 객체를 받아온다. 이후 callbackUrl 파라미터를 꺼낼 때 사용함
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard' // callbackUrl 쿼리 파라미터를 읽어 로그인 후 해당 경로로 돌아가도록 한다. 쿼리가 없으면 /dashboard를 기본값으로 사용.

  // useActionState (authenticate, undefined) 호출로부터 3가지를 받는다.
  // 1. errorMessage: authenticate()가 반환한 에러 머시지 (string 또는 undefined)
  // 2. formAction: <form action={..}에 넣을 함수 (서버액션 호출 핸들러)
  // 3. isPendinf: 로그인 요청이 진행중일 때 true
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined, // prevState 용도로 전달할 초기값
  )
  return ( 
    // action 속성에 formAction을 지정하면 폼 제출 시 authenticate()가 호출됨
    <form action={formAction} className="space-y-3">
      <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
        <h1 className={`${lusitana.className} mb-3 text-2xl`}>
          Please log in to continue.
        </h1>
        <div className="w-full">
          <div>
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="email"
            >
              Email
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email address"
                required
              />
              <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
          <div className="mt-4">
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="password"
                type="password"
                name="password"
                placeholder="Enter password"
                required
                minLength={6}
              />
              <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
        </div>
        <input type="hidden" name="redirectTo" value={callbackUrl} /> {/* 숨겨진 input에 callbackUrl을 넣어 서버 액션으로 전달 */}
        <Button className="mt-4 w-full" aria-disabled={isPending}>
          Log in <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
        </Button>
        <div className="flex h-8 items-end space-x-1" aria-live='polite' aria-atomic='true'>
          {/* Add form errors here */}
          {errorMessage && (
            <>
              <ExclamationCircleIcon className='h-5 w-5 text-red-500' />
              <p className='text-sm text-red-500'>{errorMessage}</p>
            </>
          )}
        </div>
      </div>
    </form>
  );
}
