import Form from '@/app/ui/invoices/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchCustomers, fetchInvoiceById } from '@/app/lib/data';
import { notFound } from 'next/navigation';

export default async function Page(props: {params: Promise<{id: string}>}) { // 객체 리터렁 타입 사용하며 props 매개 변수는 객체이고 그 객체는 params라는 키를 가지고있으며 params의 타입은 string이다. 즉 promise로 비동기 약속하고 각 송장 id의 타입은 문자열.
  const params = await props.params;
  const id = params.id;
  const [invoice, customers] = await Promise.all([ // 두 개의 비동기 함수 호출을 Promise.all안에 넣고 배열 안의 모든 프로미스가 병렬적으로 실행되도록 하며 모두 완료 될때 까지 기다림. 즉 두 비동기 작업을 동시에 시작하여 더 빠른 응답 시간을 얻을 수 있다.
    fetchInvoiceById(id), // id는 동적 라우트에서 가져온 특정 송장의 고유 아이디임. 함수에 id를 전달함으로써 어떤 송장을 가져올지 정확하게 지정할 수 있다.
    fetchCustomers(), // 특정 고객이아니라 전체 고객 목록을 가져오므로 인자로 별도의 식별자가 필요하지 않음
  ])

  if (!invoice) { // 송장 데이터가 없을 경우 에러 페이지를 표시함
    notFound(); // next/navigation 모듈에서 제공하는 notFound() 함수를 호출하여 404 페이지를 표시함 
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          {
            label: 'Edit Invoice',
            href: `/dashboard/invoices/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form invoice={invoice} customers={customers} />
    </main>
  );
}