# JetBrains Roulette

룰렛 게임 애플리케이션

## 개발

```bash
npm install
npm run dev
```

## 빌드

```bash
npm run build
```

## Firebase 호스팅 배포

### 수동 배포

```bash
npm run deploy
```

### 자동 배포 설정 (GitHub Actions)

이 프로젝트는 GitHub Actions를 통해 자동 배포가 설정되어 있습니다. `main` 또는 `master` 브랜치에 push하면 자동으로 Firebase Hosting에 배포됩니다.

#### 설정 방법

1. **Firebase 토큰 생성**
   - 로컬 터미널에서 다음 명령 실행:
     ```bash
     firebase login:ci
     ```
   - 브라우저가 열리면 Google 계정으로 로그인하고 권한을 부여하세요
   - 터미널에 출력된 토큰을 복사하세요

2. **GitHub Secrets 설정**
   - GitHub 저장소로 이동
   - Settings > Secrets and variables > Actions
   - "New repository secret" 클릭
   - Name: `FIREBASE_TOKEN`
   - Secret: 앞서 생성한 토큰을 붙여넣기
   - "Add secret" 클릭

3. **자동 배포 확인**
   - `main` 또는 `master` 브랜치에 코드를 push하면 자동으로 배포가 시작됩니다
   - Actions 탭에서 배포 진행 상황을 확인할 수 있습니다

## 기술 스택

- React
- Vite
- Styled Components
- Firebase Hosting
