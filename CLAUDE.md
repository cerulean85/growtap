# Concept
- 서비스명: 그로탭(GrowTap)

## 핵심 기능
- 실천 항목 등록
	- 개인별 맞춤 목표 설정 및 관리 기능.
- 간편 기록(탭 카운팅)
	- 복잡한 입력 없이 터치 한 번으로 실천 횟수 누적.
- 통계 리포트
	- 주간/월간 실천율을 직관적인 차트로 시각화하여 성취도 확인

## Tech Stack
- Next.js로 프로덕트 앱 구현 (react framework)
- neon db 사용 (postgresql)
- shadcn ui 사용 (react components)
- Tailwind CSS
- Auth 구현 (google)

## Implementation
- 회원가입, 로그인 구현
	- google 소셜 로그인
- 로그아웃 및 회원탈퇴 구현
	- 반드시 사용자의 확인을 받은 후 진행
	- DB에서 회원정보 삭제	
- 이용약관 및 개인정보처리방침 구현
	- 모바일 최적화 
- 소스코드는 한 파일에 500줄이 넘지 않도록 구현
- 디렉토리는 FSD (Feature Slice Directory) 구조를 사용할 것
- 아이콘으로는 이모지로 대충 떼우지 말 것
- 라이트 모드, 다크 모드 구현
	- 다크 모드는 블랙 계열로 구현
