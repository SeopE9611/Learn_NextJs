'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSearchParams } from 'next/navigation';

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams(); // 현재 URL에 있는 쿼리파라미터를 가져옴

  function handleSearch(term: string) {
    // console.log(term);
    const params = new URLSearchParams(searchParams); // URLSearchParams API를 사용하여 쿼리파라미터들을 조작
    if(term) { // 만약 입력값이 있다면 
      params.set('query', term); //quer라는 파라미터에 그 값을 세팅하고 
    }else{ // 입력값이 비어있다면
      params.delete('query'); // 해당 파라미터를 삭제
    }
    // 이렇게 업데이트된 쿼리 스트링은 useRouter와 usepathname 훅을 사용하여
    // 삭제 URL에 반영할 수 있게 되는데 이로 인해 사용자가 검색한 내용이
    // 그대로 남게되어 새로고침하거나 링크를 공유할 때도 검색 상태가 유지된다.
  }
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
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
