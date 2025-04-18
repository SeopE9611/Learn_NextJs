'use client'

import { CustomerField } from '@/app/lib/definitions';
import Link from 'next/link';
import {
  CheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { createInvoice, State } from '@/app/lib/actions';
import { useActionState } from 'react';

export default function Form({ customers }: { customers: CustomerField[] }) {

  const initialState : State = {message: null, errors:{}, values:{}}; // (14장 ▶) 초기 상태 정의: 에러 메시지와 전역 메시지 // (번외) values:{} 는 사용자가 입력한 값을 저장하기 위한 객체로, 검증에 실패한 경우에도 사용자가 입력한 값을 유지하기 위해 사용됨
  const [state, formAction] = useActionState(createInvoice, initialState) // ▶ useActionState 훅을 사용하여 서버 액션과 상태를 연결함

  return (
    <form action={formAction} >
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Customer Name */}
        <div className="mb-4">
          <label htmlFor="customer" className="mb-2 block text-sm font-medium">
            Choose customer
          </label>
          <div className="relative">
            <select
              key={state.values?.customerId ?? '__init__'} // (번외) key 값으로 state.values?.customerId를 사용하여 선택된 고객이 변경될 때마다 컴포넌트가 리렌더링되도록 함
              id="customer"
              name="customerId"
              className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              defaultValue={state.values?.customerId??''} // (번외) 마운트 될 때 state.values?.customerId로 초기값을 설정함
              aria-describedby='customer-error'
            >
              <option value="" disabled>
                Select a customer
              </option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
            <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
          
          <div id = 'customer-error' aria-live='polite' aria-atomic='true'>  {/* ▶ 고객 선택 오류 메시지, aria-live는 스크린 리더에게 이 영역이 동적으로 업데이트 됨을 알림, aria-atomic은 이 영역의 내용 전체가 하나의 단위로 취급되어 일부가 변경되어도 전체 내용이 다시 스크린 리더가 읽도록 함 */}
            {state.errors?.customerId && // ▶ 고객 선택 오류 메시지가 있을 경우에만 표시
              state.errors.customerId.map((error: string)=> ( // ▶ errors.customerId는 string 배열이므로 map을 사용하여 각 오류 메시지를 반복함 (map은 배열을 순회하면서 각 요소에 대해 함수를 실행하고 새로운 배열을 반환함) 
                <p className='mt-2 text-sm text-red-500' key={error}> {/* ▶ key 값에 error를 사용하여 각 오류 메시지에 고유한 키를 부여함 */}
                  {error} {/* ▶ 오류 메시지 출력 */}
                </p>
              ))
            }
          </div>
        </div>

        {/* Invoice Amount */}
        <div className="mb-4">
          <label htmlFor="amount" className="mb-2 block text-sm font-medium">
            Choose an amount
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                placeholder="Enter USD amount"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                aria-describedby='amount-error'
                defaultValue={state.values?.amount ?? ''} // 
              />
              <CurrencyDollarIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
            <div id = 'amount-error' aria-live='polite' aria-atomic='true'>
              {state.errors?.amount && 
                state.errors.amount.map((error: string) => ( // amount라고 해서 타입이 number가 아니라 string 이여야한다. 왜냐하면 actions파일에서 amount?: string[] 로 선언했기 때문에 콜백인자를 string으로 처리해야한다.
                  <p className='mt-2 text-sm text-red-500' key={error}>
                    {error}
                  </p>
                ))
              }
            </div>
          </div>
        </div>

        {/* Invoice Status */}
        <fieldset>
          <legend className="mb-2 block text-sm font-medium">
            Set the invoice status
          </legend>
          <div className="rounded-md border border-gray-200 bg-white px-[14px] py-3">
            <div className="flex gap-4">
              <div className="flex items-center">
                <input
                  id="pending"
                  name="status"
                  type="radio"
                  value="pending"
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                  aria-describedby='status-error'
                  defaultChecked={state.values?.status === 'pending'} // 
                />
                <label
                  htmlFor="pending"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600"
                >
                  Pending <ClockIcon className="h-4 w-4" />
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="paid"
                  name="status"
                  type="radio"
                  value="paid"
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                  aria-describedby='status-error'
                  defaultChecked={state.values?.status === 'paid'}
                />
                <label
                  htmlFor="paid"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-medium text-white"
                >
                  Paid <CheckIcon className="h-4 w-4" />
                </label>
              </div>
            </div>
          </div>
          <div id= 'status-error' aria-live='polite' aria-atomic='true'>
                {state.errors?.status && 
                  state.errors.status.map((error: string) => (
                    <p className='mt-2 text-sm text-red-500' key={error}>
                      {error}
                    </p>
                  ))}
              </div>
        </fieldset>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/invoices"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Create Invoice</Button>
      </div>
    </form>
  );
}
