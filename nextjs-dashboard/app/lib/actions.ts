'use server' // use server 선언을 통해 이 파일에 있는 함수들은 서버 전용 함수임이 명시.

import {z} from 'zod'; // zod 라이브러리
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
}