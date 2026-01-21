# GitHub Pages + Firebase 연동 프로젝트

초기 화면은 GitHub의 정적 호스팅(Pages)을 사용하고, 데이터 처리는 Google Firebase(Firestore)를 사용하는 웹 애플리케이션입니다.

## 🚀 시작하기

### 1단계: Firebase 프로젝트 생성 및 설정
1. [Firebase Console](https://console.firebase.google.com/)에 접속하여 프로젝트를 생성합니다.
2. 프로젝트 개요 페이지에서 **웹 아이콘(</>)**을 클릭하여 앱을 추가합니다.
   - 앱 닉네임을 입력하고 등록합니다.
3. **SDK 설정 및 구성** 단계에서 `const firebaseConfig = { ... }` 부분을 복사합니다.
4. 이 프로젝트의 `firebase-config.js` 파일을 열고, 복사한 내용을 붙여넣어 `firebaseConfig` 객체를 수정합니다.
5. Firebase 콘솔 왼쪽 메뉴에서 **Build > Firestore Database**로 이동합니다.
6. **데이터베이스 만들기**를 클릭합니다.
7. **모드**는 테스트를 위해 '테스트 모드에서 시작'을 선택하거나, 규칙을 적절히 설정합니다.
   - 예시 규칙 (모든 사람에게 읽기/쓰기 허용 - 주의: 실제 서비스 배포 시 변경 필요):
     ```
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /{document=**} {
           allow read, write: if true;
         }
       }
     }
     ```

### 2단계: 로컬에서 테스트
1. VS Code 등의 에디터에서 `index.html`을 엽니다.
2. 'Live Server' 확장 기능 등을 사용하여 열거나, 브라우저로 직접 엽니다.
3. 이름과 내용을 입력하고 전송하여 리스트에 뜨는지 확인합니다.

### 3단계: GitHub에 업로드 (GitHub Pages)
1. GitHub 리포지토리를 생성합니다.
2. 코드를 업로드합니다.
3. GitHub 리포지토리의 **Settings > Pages**로 이동합니다.
4. **Source**에서 `main` (또는 `master`) 브랜치를 선택하고 Save합니다.
5. 잠시 후 상단에 표시되는 URL(`https://[아이디].github.io/[리포지토리명]`)로 접속하면 배포된 페이지를 볼 수 있습니다.
