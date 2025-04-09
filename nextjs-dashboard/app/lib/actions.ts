'use server' // use server 선언을 통해 이 파일에 있는 함수들은 서버 전용 함수임이 명시.

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import postgres from 'postgres';
import {z} from 'zod'; // zod 라이브러리

const sql = postgres(process.env.POSTGRES_URL!,{ssl:'require'}) // postgres 라이브러리를 사용하여 데이터베이스 URL과 SSL 옵션을 사용하여 연결을 초기화함

const FromSchema = z.object({
  id: z.string(), 
  customerId: z.string(),
  amount: z.coerce.number(), // coerce는 string을 number로 변환해줌
  status: z.enum(['pending', 'paid']), // enum은 특정 값만 허용하는 타입을 정의할 수 있음 - 상태: pending 또는 paid만 허용
  date: z.string(),
});

// 저장할 인보이스 데이터는 id와 date가 없으므로 omit을 사용하여 새로운 스키마를 만듬
const CreateInvoice = FromSchema.omit({id:true, date:true}) // omit은 id와 date 필드를 제외한 나머지 필드들로 새로운 스키마를 만듬

export async function createInvoice(formData: FormData){
  // FormData 객체에서 필요한 필드의 값을 추출해서 객체로 만듬
  // 여기서 .get('필드이름') 메소드를 사용하여 각 데이터를 개별적으로 가져옴
  const {customerId, amount, status} = CreateInvoice.parse ({ // FormData에서 필드값을 추출하고 스키마로 검증(타입 변환 포함) 함
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  const amountInCents = amount * 100 // 금액을 센트 단위로 변환 (ex: $20.50-> 2050 센트)
  const date = new Date().toISOString().split('T')[0] // 현재 날짜를 ISO 형식(YYYY-MM-DD)로 변환
  // 콘솔 출력 결과, 전부 string으로 나옴 - 타입 변환 해줘야함 (zod 라이브러리 사용하기)
  // console.log(typeof rawFormData.customerId); 
  // console.log(typeof rawFormData.amount); 
  // console.log(typeof rawFormData.status); 

  // SQL 쿼리를 사용하여 새로운 인보이스를 데이터 베이스에 삽입
  // 템플릿 리터럴 안에 변수들을 안전하게 삽입함으로써 SQL 인젝션 공격을 예방할 수 있음
  await sql`
  INSERT INTO invoices (customer_id, amount, status, date)
  VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
`;
// revalidatePath 함수는 사용자의 브라우저에 캐시된 페이지를 무효화하고 서버에서 최신 데이터를 가져와서 페이지를 다시 렌더링함
revalidatePath('/dashboard/invoices') // 송장 페이지를 재검증하여 최신 상태로 업데이트

// redirect 함수는 캐시가 재검증된 후 사용자가 자동으로 /dashboard/invoices 페이지로 이동하게 하여 새로 생성된 인보이스가 목록 상단에 보이도록 하는 역할을 담당함
redirect('/dashboard/invoices') // 업데이트 후 사용자 송장 목록 페이지로 리다이렉트
}

// UpdateInvoice 함수는 송장을 업데이트하기위한 스키마를 정의함 (createInvoice와 비슷함)
const UpdateInvoice = FromSchema.omit({id:true, date:true}); 

// updateInvoice server Action : 첫번째 인자로 invoice id, 두번째로 폼데이터 받음
// 이말은 즉, updateInvoice 함수는 송장 id를 첫 번째 인자로 받고 나머지 인자는 FormData 객체로 받음.
// 이로 인해 updateInvoice 함수는 invoice.id를 사용하여 특정 송장을 업데이트 할 수 있게 됨
export async function updateInvoice(id:string, formData:FormData) {
 // 폼 데이터 추출 및 검증
 const {customerId, amount, status} = UpdateInvoice.parse({
  customerId: formData.get('customerId'),
  amount: formData.get('amount'),
  status: formData.get('status'),
 });
 
 // 금액을 센트 단위로 변환
 const amountInCents = amount * 100;

 await sql`
  UPDATE invoices --SQL 쿼리문
  SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status} -- 업데이트할 필드들
  WHERE id = ${id} -- 업데이트할 송장 id
 `

 // 캐시 재검증과 리다이렉트 처리
 revalidatePath('/dashboard/invoices') // 송장 페이지를 재검증하여 최신 상태로 업데이트
 redirect('/dashboard/invoices') // 업데이트 후 사용자 송장 목록 페이지로 리다이렉트
}