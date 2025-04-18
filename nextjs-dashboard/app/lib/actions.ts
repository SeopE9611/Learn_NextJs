'use server'; // use server 선언을 통해 이 파일에 있는 함수들은 서버 전용 함수임이 명시.

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import postgres from 'postgres';
import { z } from 'zod'; // zod 라이브러리

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' }); // postgres 라이브러리를 사용하여 데이터베이스 URL과 SSL 옵션을 사용하여 연결을 초기화함

const FromSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: '소비자를 선택하세요' // (14장 ▶) 유효하지 않은 타입일 경우 오류 메시지 출력
  }),
  amount: z.coerce
  .number() // coerce는 string을 number로 변환해줌
  .gt(0, { message: '금액은 0보다 커야 합니다'}), // ▶ .gt는 greater than의 약자로, 0보다 큰 값만 허용하도록 설정함
  status: z.enum(['pending', 'paid'], { // enum은 특정 값만 허용하는 타입을 정의할 수 있음 - 상태: pending 또는 paid만 허용
    invalid_type_error: '송장 상태를 선택하세요', // ▶ 유효하지 않은 타입일 경우 오류 메시지 출력
  }),
  date: z.string(),
});

export type State = { // ▶ State 타입 정의
  errors?: { //▶ errors는 선택적 필드로, 오류 메시지를 담을 수 있음
    customerId?: string[]; //▶ 고객 ID에 대한 오류 메시지 (string 배열)
    amount?: string[]; //▶ 금액에 대한 오류 메시지 (string 배열)
    status?: string[]; //▶ 상태에 대한 오류 메시지 (string 배열)
  }; //▶ 각 필드가 string 배열을 선언된 이유는 한 필드에 여러 개의 오류 메시지를 동시에 담을 수 있기 때문
  message?: string | null; //▶ 폼 제출 결과에 따라 성공 또는 오류 메시지를 단일 문자열로 저장하도록 함. 그리고 값이 없을 경우를 대비해서 null도 허용하는 선택적 타입
  values?: { // (번외) values는 사용자가 입력한 값을 저장하기 위한 객체로, 검증에 실패한 경우에도 사용자가 입력한 값을 유지하기 위해 사용됨
    customerId?: string;
    amount?: string;
    status?: string;
  }
}

// 저장할 인보이스 데이터는 id와 date가 없으므로 omit을 사용하여 새로운 스키마를 만듬
const CreateInvoice = FromSchema.omit({ id: true, date: true }); // omit은 id와 date 필드를 제외한 나머지 필드들로 새로운 스키마를 만듬

export async function createInvoice(prevState: State, formData: FormData) { //▶ prevState는 이전 상태를 나타내며, formData는 사용자가 제출한 폼 데이터를 나타냄 , 인자 순서에 대해서는 일반적으로 이전 상태를 먼저 받고 그 다음에 새로운 데이터가 오는 패턴이 일반적임
  // FormData 객체에서 필요한 필드의 값을 추출해서 객체로 만듬
  // 여기서 .get('필드이름') 메소드를 사용하여 각 데이터를 개별적으로 가져옴
  // const { customerId, amount, status } = CreateInvoice.parse({
    // FormData에서 필드값을 추출하고 스키마로 검증(타입 변환 포함) 함

    const validatedFields = CreateInvoice.safeParse({ // ▶ safeParse는 검증을 수행하고 결과를 반환함
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) { // ▶ 검증에 실패한 경우
    return {
      errors: validatedFields.error.flatten().fieldErrors, //▶ 검증 오류를 평탄화하여 errors 객체에 저장함 
      message: '폼 검증에 실패했습니다', //▶ 오류 메시지 저장
      values: { // (번외) 검증에 실패한 경우에도 사용자가 입력한 값을 유지하기 위한 values 객체를 만듬
        customerId: formData.get('customerId') as string,  //(번외) as string은 타입 단언으로, formData.get('customerId')의 반환값이 string임을 보장함
        amount: formData.get('amount') as string,
        status: formData.get('status') as string,
      }
    }
  }

  const { customerId, amount, status} = validatedFields.data; //▶ 검증에 성공한 경우, validatedFields.data를 사용하여 각 필드의 값을 추출함

  const amountInCents = amount * 100; // 금액을 센트 단위로 변환 (ex: $20.50-> 2050 센트)
  const date = new Date().toISOString().split('T')[0]; // 현재 날짜를 ISO 형식(YYYY-MM-DD)로 변환
  // 콘솔 출력 결과, 전부 string으로 나옴 - 타입 변환 해줘야함 (zod 라이브러리 사용하기)
  // console.log(typeof rawFormData.customerId);
  // console.log(typeof rawFormData.amount);
  // console.log(typeof rawFormData.status);

  try {
    // SQL 쿼리를 사용하여 새로운 인보이스를 데이터 베이스에 삽입
    // 템플릿 리터럴 안에 변수들을 안전하게 삽입함으로써 SQL 인젝션 공격을 예방할 수 있음
    await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    console.log(error);
  }

  // revalidatePath 함수는 사용자의 브라우저에 캐시된 페이지를 무효화하고 서버에서 최신 데이터를 가져와서 페이지를 다시 렌더링함
  revalidatePath('/dashboard/invoices'); // 송장 페이지를 재검증하여 최신 상태로 업데이트

  // redirect 함수는 캐시가 재검증된 후 사용자가 자동으로 /dashboard/invoices 페이지로 이동하게 하여 새로 생성된 인보이스가 목록 상단에 보이도록 하는 역할을 담당함
  redirect('/dashboard/invoices'); // 업데이트 후 사용자 송장 목록 페이지로 리다이렉트
}

// UpdateInvoice 함수는 송장을 업데이트하기위한 스키마를 정의함 (createInvoice와 비슷함)
const UpdateInvoice = FromSchema.omit({ id: true, date: true });

// updateInvoice server Action : 첫번째 인자로 invoice id, 두번째로 폼데이터 받음
// 이말은 즉, updateInvoice 함수는 송장 id를 첫 번째 인자로 받고 나머지 인자는 FormData 객체로 받음.
// 이로 인해 updateInvoice 함수는 invoice.id를 사용하여 특정 송장을 업데이트 할 수 있게 됨
export async function updateInvoice(id: string, formData: FormData) {
  // 폼 데이터 추출 및 검증
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  // 금액을 센트 단위로 변환
  const amountInCents = amount * 100;

  try {
    await sql`
  UPDATE invoices --SQL 쿼리문
  SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status} -- 업데이트할 필드들
  WHERE id = ${id} -- 업데이트할 송장 id
  `;
  } catch (error) {
    console.log(error);
  }

  // 캐시 재검증과 리다이렉트 처리
  revalidatePath('/dashboard/invoices'); // 송장 페이지를 재검증하여 최신 상태로 업데이트
  redirect('/dashboard/invoices'); // 업데이트 후 사용자 송장 목록 페이지로 리다이렉트
}

export async function deleteInvoice(id: string) {
  // throw new Error('송장 삭제에 실패했습니다.');

  await sql`
  -- 전달 받은 id를 사용하여 SQL DELETE 쿼리를 실행
    DELETE FROM invoices -- 삭제할 송장 테이블
    WHERE id = ${id} -- 삭제할 송장 id
  `;

  revalidatePath('/dashboard/invoices'); // 삭제 후, 송장 페이지를 재검증하여 최신 데이터를 반영
}
