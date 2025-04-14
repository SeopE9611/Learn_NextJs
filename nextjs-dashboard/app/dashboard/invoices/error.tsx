'use client'; // 'use client'는 이 컴포넌트가 클라이언트에서 렌더링되어야 함을 나타냄

import { useEffect } from 'react';

// Error 라는 이름의 함수형 컴포넌트를 선언하고
// 이 컴포넌트는 발생한 에러 상황에 대한 정보를 받으며
// 사용자가 에러 상황에서 복구할 수 있도록 도와줌
export default function Error({ 
  // props의 구조분해 할당을 통해 함수의 매개변수로 error와 reset을 전달받음
  error, // 에러 객체를 전달받음
  reset  // 다시시도 버튼등을 눌렀을 때 호출할 수 있는 함수 (호출되면 에러 상태를 초기화하고 재렌더링함)
}: { 
  // 에러 객체는 기본 자바스크립트의 내장 Error 타입을 따르며, 선택적으로 digest 속성을 가질 수 있음 (string 타입)
  error: Error & { digest?: string };  // & 연산자를 통해 Error 타입과 { digest?: string } 타입의 속성을 모두 가진 객체를 나타냄
  // digest 속성은 에러 메시지나 에러에 대한 요약 정보를 압축해서 담을 수 있는 용도로 사용됨
  // 예를 들어 에러 메시지가 길거나 복잡한 경우, digest 속성을 사용하여 간단한 요약 정보를 제공할 수 있음

  reset: () => void  // reset은 매개변수가 없는 함수로 어떤 값을 반환하지 않는다는 의미의 void를 반환형으로 갖음
  // () => void에서 ()는 내부에는 함수가 받을 인자가 없음을 나타냄
  // void는 이 함수가 실행된 후에 특별한 반환값을 기대하지 않는다는 뜻
  // 즉 다시 시도 버튼이 클릭되면 reset 함수가 호출되고 에러상태를 초기화하거나 재렌더링하는 동작을 함
  // 반환 값이 void인 이유는 reset 함수가 에러를 처리하는 것이 아니라
  // 에러 상태를 초기화하고 다시 시도하는 동작을 수행하기 떄문임
}) {

  // 컴포넌트가 마운트된 후 또는 error 객체가 변경될 떄마다 실행됨
  useEffect(() => {
    // 에러를 외부 에러 리퐅팅 서비스에 전송할 수 있음
    console.error(error);
  }, [error]); // 의존성배열 두번째 인자인 error는 effect가 바뀔 때마다 실행되도록 명시(즉 새로운 에러가 발생할 떄마다 실행함)

  return (
    <main className="flex h-full flex-col items-center justify-center">
      <h2 className="text-center">Something went wrong!</h2>
      <button
        className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
        onClick={
          // Attempt to recover by trying to re-render the invoices route
          () => reset()
        }
      >
        Try again
      </button>
    </main>
  );
}
