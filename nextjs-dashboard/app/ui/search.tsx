'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {useDebouncedCallback} from 'use-debounce'

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams(); // ☆ 현재 URL에 있는 쿼리파라미터를 가져옴
  const pathname = usePathname(); // ○ 현재 페이지의 경로 (ex:/dashbord/invoices)를 받아옴
  const {replace} = useRouter(); // ○ useRouter의 replace 메소드 사용하여 URL을 변경함

    const handleSearch = useDebouncedCallback((term) => { // ◎ useDebouncedCallback으로 handleSearch를 감싸서 300ms 동안 입력이 없으면 실행 
      console.log(`검색중... ${term}`);
      const params = new URLSearchParams(searchParams); // ☆ URLSearchParams API를 사용하여 쿼리파라미터들을 조작
      if(term) { // ☆ 만약 입력값이 있다면 
        params.set('query', term); //☆ quer라는 파라미터에 그 값을 세팅하고 
      }else{ //☆ 입력값이 비어있다면
        params.delete('query'); //☆ 해당 파라미터를 삭제
      }
      // ○ URL을 변경하는 replace 메소드를 사용하여 업데이트된 쿼리 파라미터가 포함된 새 URL (ex: /dashbord/invoices?query=lee)로 변경한다.
      replace(`${pathname}? ${params.toString()}`) // // ○ 이때 페이지 전체가 새로고침 되지 않고 클라이언트 사이드에서 URL만 업데이트됨
    }, 300); // ◎ 300ms 동안 입력이 없으면 실행되도록 설정
      //☆ 이렇게 업데이트된 쿼리 스트링은 useRouter와 usepathname 훅을 사용하여
      //☆ 삭제 URL에 반영할 수 있게 되는데 이로 인해 사용자가 검색한 내용이
      //☆ 그대로 남게되어 새로고침하거나 링크를 공유할 때도 검색 상태가 유지된다.
      // ○ 즉 이 작업은 사용자의 검색 상태 URL에 반영하여 사용자가 페이지를 새로고침하거나 링크를 공유할 때 현재 검색 상태를 유지한다.
    
    
  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
        // ● URL의 쿼리 파라미터에서 검색어를 가져와서, 이를 입력 필드의 기본값으로 사용하는 것
        defaultValue={searchParams.get('query')?.toString()} // ● 사용자가 링크를 공유하거나 페이지를 새로고침해도 입력창에 이전 검색어가 그대로 표시함
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
