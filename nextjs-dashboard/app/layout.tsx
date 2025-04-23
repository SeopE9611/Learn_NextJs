import { inter } from '@/app/ui/fonts';
import '@/app/ui/global.css'
import { Metadata } from 'next';

export const metadata: Metadata = { // 이 파일 아래에 속한 모든 페이지에 적용될 기본 메타데이터
  title: { 
    template:'%s | 섭이의 대시보드 만들기 (Next.js)', // 각 페이지별 title 값이 %s 자리에 들어감
    default: '섭이의 대시보드 만들기 (next.js)',  // 페이지별 제목이 없을 때 사용
  },
  description: '이 프로젝트는 next.js로 만들었습니다.',
  metadataBase: new URL('https://next-learn-dashboard.vercel.sh'), // 상대 경로로 지정된 메타 데이터의 기준이 되는 베이스 URL
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
