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

1. **Firebase Service Account 키 생성**
   - [Firebase Console](https://console.firebase.google.com/) 접속
   - 프로젝트 설정 > 서비스 계정 탭으로 이동
   - "새 비공개 키 생성" 클릭하여 JSON 파일 다운로드

2. **GitHub Secrets 설정**
   - GitHub 저장소로 이동
   - Settings > Secrets and variables > Actions
   - "New repository secret" 클릭
   - Name: `FIREBASE_SERVICE_ACCOUNT`
   - Value: 다운로드한 JSON 파일의 전체 내용을 복사하여 붙여넣기
   - "Add secret" 클릭

3. **자동 배포 확인**
   - `main` 또는 `master` 브랜치에 코드를 push하면 자동으로 배포가 시작됩니다
   - Actions 탭에서 배포 진행 상황을 확인할 수 있습니다

## 기술 스택

- React
- Vite
- Styled Components
- Firebase Hosting
