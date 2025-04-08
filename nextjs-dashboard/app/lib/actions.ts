'use server' // use server 선언을 통해 이 파일에 있는 함수들은 서버 전용 함수임이 명시.

export async function createInvoice(formData: FormData){
  // FormData 객체에서 필요한 필드의 값을 추출해서 객체로 만듬
  // 여기서 .get('필드이름') 메소드를 사용하여 각 데이터를 개별적으로 가져옴
  const rawFormData = {
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  };
  // 콘솔 출력 결과, 전부 string으로 나옴 - 타입 변환 해줘야함 (zod 라이브러리 사용하기)
  console.log(typeof rawFormData.customerId); 
  console.log(typeof rawFormData.amount); 
  console.log(typeof rawFormData.status); 
}