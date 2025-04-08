import Form from '@/app/ui/invoices/create-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchCustomers } from '@/app/lib/data';
 
export default async function Page() {
  const customers = await fetchCustomers();
 
  return (
    <main>
      {/* Breadcrumbs 컴포넌트 : 대시보드 내의 위치를 보여주는 네비게이션 요소로
      현재 invoices -> Create invoice라는 경로를 표시해 사용자가 현재 위치를 쉽게 파악할 수 있게함 */}
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          {
            label: 'Create Invoice',
            href: '/dashboard/invoices/create',
            active: true,
          },
        ]}
      />
      <Form customers={customers} />
    </main>
  );
}