import Pagination from '@/app/ui/invoices/pagination';
import Search from '@/app/ui/search';
import Table from '@/app/ui/invoices/table';
import { CreateInvoice } from '@/app/ui/invoices/buttons';
import { lusitana } from '@/app/ui/fonts';
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';
 
export default async function Page(props: {
  // 아래 코드의 선언부는 Next.js의 서버 컴포넌트에서 사용하는 패턴 중 하나
  searchParams?: Promise<{ // searchParams가 있을 수도 없을 수도 있음 / 이 프로퍼티는 Promise 객체이므로 즉 실제 값은 나중에(resolve) 받아지며 비동기적(async)으로 처리됨
    // Promise가 해결되면 객체 형태의 값이 반환되며 이 객체는 두 개의 선택적 속성(query, page)를 포함
    query?: string; // URL에 있는 검색어를 나타내며 선택적 속성임(문자열일수도 없을수도)
    page?: string; // URL에 포함된 페이지 번호를 나타내며 문자열 형태로 전달됨
  }>
  
  

}) {
  // props로 전달된 searchParams를 기다려서 값을 추출함 (promise가 resolve될 때까지 기다림)
  const searchParams = await props.searchParams; // (이 값은 Promise로 전달되므로 await 키워드를 사용해 값을 얻음)
  
  // query와 currentPage 변수는 URL에 검색어(query)와 번호(page)가 있을 경우 이를 추출함
  // URL에 query 파라미터가 없다면 기본값으로 빈 문자열을 사용 
  const query = searchParams?.query || ''; 
  // URL에 page 파라미터가 없다면 기본 페이지 번호를 1로 사용
  const currentPage = Number(searchParams?.page) || 1; 
  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Invoices</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search invoices..." />  {/* search 컴포넌트는 클라이언트 컴포넌트이며 URL을 조작하는 역할을 함 */}
        <CreateInvoice />
      </div>
      {/* Suspense 컴포넌트를 사용하여 데이터 로딩 시 스켈레톤 UI를 보여줌 */}
      {/* key를 query와 currentPage로 설정하여 이 값들이 변경되면 Suspensr가 다시 랜더링됨*/}
       <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
       {/* Table 컴포넌트에 현재 검색어(query)와 페이지 번호 (currentPage)를 전달 */}
        <Table query={query} currentPage={currentPage} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        {/* <Pagination totalPages={totalPages} /> */}
      </div>
    </div>
  );
}