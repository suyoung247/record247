## 📖 CONTENTS

1. [프로젝트 소개](#프로젝트-소개)
2. [Motivation](#motivation)
3. [핵심 기능과 흐름](#핵심-기능과-흐름)
4. [누구나 EPUB을 올리면, 브라우저에서 바로 읽을 수 있도록](#누구나-epub을-올리면-브라우저에서-바로-읽을-수-있도록)
5. [하이라이트 / 메모 기능 흐름](#하이라이트-메모-기능-흐름)
6. [하이라이트 중복 저장 방지 및 툴바 위치 보정](#하이라이트-중복-저장-방지-및-툴바-위치-보정)
7. [구조 설계 & 기술 스택](#구조-설계-기술-스택)
8. [구현하며 배운 점들](#구현하며-배운-점들)

## 1. 프로젝트 소개

**record247**은 사용자가 EPUB 전자책을 읽으며 메모와 하이라이트를 남길 수 있는 웹 기반 독서 도우미입니다.

## 2. Motivation

우리는 책을 읽으며 중요한 문장에 밑줄을 긋고, 메모를 남깁니다.
하지만 정작 그 메모를 **다시 꺼내보는 일은 거의 없습니다.**
그 이유는, 메모를 다시 보기 위해
**직접 앱을 열고, 책을 찾고, 페이지를 뒤지는 번거로움**이 따르기 때문입니다.
결국 기록은 **한 번 쓰이고 잊히는 일회성 행동**으로 끝나기 쉽습니다.
이 프로젝트는 바로 그 불편함을 해결하기 위해 시작됐습니다.

> **“메모를 내가 찾지 않아도, 메모가 나를 찾아오게 만들자.”**

기록이 반복적으로 떠오르고,
자연스럽게 **기억의 일부가 되는 경험**을 만드는 것이 이 프로젝트의 목표입니다.

## 3. 핵심 기능과 흐름

**EPUB**은 다양한 디지털 기기에서 쉽게 읽을 수 있도록 설계된 전자책 파일 형식으로, 텍스트, 이미지, 스타일(HTML/CSS), 메타데이터 등을 포함하며 전자책 리더 소프트웨어나 하드웨어에서 사용됩니다.

사용자는 직접 `.epub` 전자책 파일을 업로드하고, 브라우저에서 바로 읽을 수 있습니다.
이 핵심 기능은 다음과 같은 흐름으로 작동합니다:

1. **파일 업로드**
   사용자가 EPUB 파일을 업로드합니다.

2. **서버 유효성 검사 및 저장**
   Firebase Functions에서 파일을 ZIP으로 해석한 뒤,
   `mimetype`, `container.xml`, `content.opf` 등 핵심 구조를 검사합니다.
   유효한 경우 Firebase Storage에 저장됩니다.

3. **Signed URL 발급**
   저장된 파일에 대해 일정 시간 동안 유효한 **서명된 접근 URL**을 생성해
   클라이언트에 전달합니다.

4. **epub.js로 렌더링**
   클라이언트는 전달받은 URL을 `epub.js`에 전달해
   브라우저 내에서 전자책을 렌더링합니다.

5. **읽기 위치 및 메모 저장**
   사용자의 독서 위치(CFI)와 하이라이트, 메모는 로컬에 즉시 저장되며,
   이후 주기적으로 서버와 동기화됩니다.

## 4. 누구나 EPUB을 올리면, 브라우저에서 바로 읽을 수 있도록

**레코드247**에서는 사용자가 올린 EPUB 파일을 웹 브라우저에서 안정적으로 렌더링하기 위해 총 세 단계로 작업을 진행합니다.

### 4-1. EPUB 구조 유효성 검사

**레코드247**에서는 EPUB 파일을 안정적으로 렌더링하기 위해 **클라이언트와 서버에서 이중 유효성 검사**를 도입했습니다. 기존 시스템에서는 비정상적인 EPUB 파일을 업로드했을 때, 렌더링 실패나 서버 오류가 발생할 수 있었고, 사용자에게 적절한 오류 메시지를 제공하지 못해 즉각적인 대응이 어려웠습니다.

해결책은 **클라이언트에서 EPUB 파일을 미리 검증**하여 문제가 있을 경우 즉시 오류 메시지를 안내하고, 서버 리소스를 낭비하지 않도록 처리하는 방식이었습니다. 서버에서는 검증된 파일만을 처리하여 안정적인 렌더링을 보장합니다. 이를 통해 **비정상 EPUB 파일을 사전에 필터링**하고, **렌더링 오류 없이 안정적인 UX**를 제공할 수 있었습니다.

🔍 **문제: 확장자만 `.epub`이면 정말 전자책일까?**

`.epub` 파일은 사실상 **ZIP 압축 파일**이며, 내부에 메타 정보(XML), 본문(.xhtml), 이미지, 스타일(CSS) 등이 포함되어야 합니다. 하지만 현실에서는 `.txt`, `.pdf` 파일의 확장자만 `.epub`으로 바꾸거나, 구조가 비정상인 EPUB을 업로드하는 경우가 많습니다. 이때:

- `epub.js`는 내부 파일을 파싱하지 못해 렌더링에 실패
- 화면이 하얗게 보이며, 콘솔에도 에러가 없어 디버깅이 어려움
- 사용자는 앱이 고장났다고 오해함

**해결 방법**:

1. **클라이언트 검사** (업로드 시점):
   `JSZip`을 사용해 `mimetype` 파일과 `META-INF/container.xml` 파일 존재 여부를 확인합니다.

   ```js
   const mimetypeFile = zip.file('mimetype');
   const hasMimetypeText =
     mimetypeFile &&
     (await mimetypeFile.async('text')).trim() === 'application/epub+zip';
   ```

2. **서버 검사** (Firebase Functions):
   서버에서는 파일을 ZIP으로 해제하고, `container.xml`을 파싱하여 `.opf` 경로를 확인한 후, `.opf` 파일이 존재하고, 그 안에 `spine`, `manifest` 등의 정보가 있는지 검사합니다.

   ```js
   const zip = await JSZip.loadAsync(req.body);
   const containerXml = await zip.file('META-INF/container.xml')?.async('text');
   const parsed = await parseStringPromise(containerXml);
   ```

---

### 4-2. 서버에 저장하고, URL로 접근 가능하게

정상적인 EPUB 구조라 하더라도, 렌더링을 위해서는 내부 리소스에 접근 가능한 **웹 URL**이 필요합니다. 초기에는 Blob URL 방식으로 구현했지만, 이 방식에는 다음과 같은 제약이 있었습니다:

- 새로 고침 시 파일이 사라짐
- 기기 간 동기화가 불가능
- 메모와 하이라이트가 EPUB 파일과 연결되지 않음

📌 이런 상황은 \*\*“책은 사라졌는데 메모만 남은 상태”\*\*를 만들어 UX를 망치게 됩니다.

#### 🔄 전환 배경: Firebase 도입

이를 해결하기 위해 **Firebase Functions + Storage** 조합을 도입했습니다. 필요한 조건은 다음과 같았습니다:

- EPUB 파일을 일정 기간 저장할 수 있는 공간
- URL 접근이 가능하지만, 보안을 위한 만료 기능 포함

#### 🛠 구현 방식

**Firebase Functions**:

- EPUB 구조 검사
- 유효한 경우 Firebase Storage에 저장
- 일정 시간 동안 유효한 Signed URL 생성 및 전달

**Firebase Storage**:

- EPUB 저장소로 사용
- Signed URL을 통해 **보안 + 접근성**을 동시에 만족

```js
const [url] = await getDownloadURL(fileRef, {
  expires: Date.now() + 1000 * 60 * 60 * 2, // 2시간 유효
});
```

**클라이언트 처리**:

- Signed URL을 `epub.js`에 전달해 렌더링
- 책 정보(`bookId`, `title`, `url`, `CFI`)를 `localStorage`에 저장
- 새로 고침 또는 앱 재실행 시에도 이어 읽기 가능

#### 결과

- **보안**: URL은 일정 시간 후 자동 만료
- **접근성**: 브라우저에서 바로 요청 가능한 HTTP URL
- **UX**: 책 재업로드 없이 지속적 독서 가능

---

### 4-3. epub.js로 직접 렌더링

처음엔 `react-reader`를 사용했지만, **iframe sandbox 보안 제약**으로 인해 메모, 하이라이트 등 핵심 기능이 작동하지 않았습니다.

#### 🔍 문제: iframe에서 스크립트 실행 차단

- 이벤트 핸들러(`on("rendered")`, `on("selected")`) 작동 안 함
- 목차 이동, 하이라이트, 위치 저장 등 기능 전부 실패
- 콘솔 로그:

```js
Blocked script execution in 'about:srcdoc' because the document's frame is sandboxed...
```

📌 `sandbox` 속성은 보안을 위해 iframe 내부의 JavaScript 실행을 제한합니다.

#### 🛠 해결: epub.js 직접 사용

iframe을 제거하고, `epub.js`의 `renderTo()` 메서드를 이용해 직접 DOM에 렌더링하는 방식으로 전환했습니다.

```js
const book = ePub(url);
const rendition = book.renderTo('viewer', {
  width: '100%',
  height: '100%',
  manager: 'default',
});
rendition.display();
```

이 방식은 다음 장점이 있습니다:

- iframe 미사용 → sandbox 제약 없음
- 이벤트 정상 작동: `selected`, `rendered`, `relocated`
- 폰트 크기, 테마, 하이라이트 등 커스터마이징 가능

#### 결과

- **기능 안정성 확보**: 목차 이동, CFI 기반 메모, 위치 복원 등 정상 작동
- **기능 확장성 향상**: 다크 모드, 모바일 대응, 메타데이터 추출 가능

## 5. 하이라이트 / 메모 기능 흐름

### 5-1. 빠른 사용자 반응을 위한 Optimistic UI 전략

사용자가 텍스트를 드래그해 하이라이트하거나 메모를 남기는 기능은 매우 중요한 사용자 경험 요소입니다. 그러나 실제 구현에서는 **빠른 UI 반응성과 데이터 정합성**을 동시에 만족시키는 것이 핵심 과제였습니다.

> 사용자는 "클릭했는데 반응이 없다"거나 "한참 뒤에 반영되는" UI를 참기 어렵습니다. 저장 여부보다는 즉각적인 반응을 기대하는 경향이 강합니다.

이러한 기대에 부응하기 위해 **Optimistic UI (낙관적 업데이트)** 방식을 채택했습니다. 사용자가 조작을 발생시키면 **즉시 UI에 반영**하고, 이후에 백엔드 저장을 시도하는 방식입니다. 특히 느린 네트워크 환경에서도 매끄럽고 반응성 좋은 사용자 경험을 제공할 수 있었습니다.

#### 기존 구조의 문제점

- 사용자가 하이라이트나 메모 입력을 하면 바로 Firestore에 저장 요청 → 저장 성공 후 epub.js에 렌더링
- **저장 실패 시**: UI는 반영되었지만 서버에는 데이터가 없어서 **데이터 정합성 문제**가 발생
- **저장 응답 지연 시**: UI 반영이 느려짐 → 사용자 불만
- 같은 위치(CFI)에 여러 요청이 발생 → 중복 데이터 생성 가능

> CFI(Canonical Fragment Identifier)는 전자책 내 특정 위치를 안정적으로 가리키는 식별자입니다. HTML DOM이 아닌 EPUB 구조 기준이기 때문에 디바이스와 화면 크기에 영향을 받지 않습니다.

#### 개선된 구조: 클라이언트 상태 우선, 서버 지연 동기화

- 상태 관리는 클라이언트에서 `zustand`를 사용하여 처리
- 사용자가 조작하면 즉시 epub.js에 렌더링하여 **빠르게 시각적 반응 제공**
- 백엔드 저장은 **5초 후 지연 실행** 또는 앱 종료 시 일괄 처리
- 저장 완료 시 해당 상태에 `synced: true`로 마킹하여 **서버 동기화 여부 추적**

```js
// 사용자가 텍스트를 드래그하고 하이라이트 선택 시:
addHighlight({
  id: uuid(),
  cfi: selectedCfi,
  color: selectedColor,
  memo: '',
  synced: false,
});

// 1) 즉시 epub.js에 시각적 하이라이트 반영
applyHighlight(highlight, rendition);

// 2) 5초 후 Firestore 저장 시도
setTimeout(() => {
  const { synced, ...data } = highlight;
  saveHighlightToFirestore(data);
  markAsSynced(highlight.id);
}, 5000);
```

📌 `synced: false → true` 플래그를 통해, 서버 저장 여부를 명확하게 구분하고 UI/데이터 정합성을 유지합니다.

#### 결과

- **즉각적인 UI 반응 제공** → 사용자 만족도 향상
- **비동기 저장 처리** → 느린 네트워크에서도 자연스러운 UX 유지
- **중복 요청 방지 및 정합성 유지**
- **앱 재시작 시 Firestore → zustand → epub.js 재렌더링 흐름 구성 가능**

---

### 5-2. 안정적 데이터 저장을 위한 Debounce 기반 자동 동기화

사용자의 하이라이트나 메모 입력을 서버에 실시간으로 저장하는 구조에서 발생할 수 있는 문제들을 해결하기 위해 **Debounce 기반 자동 저장** 방식을 설계했습니다.

#### 핵심 전략

- `zustand`의 상태 중 `synced: false` 항목만 감지
- 사용자의 입력이 멈추고 **5초 이상 변화가 없을 때만** Firestore 저장 실행
- 저장 성공 시 `synced: true`로 마킹하거나, 로컬 ID를 Firestore ID로 교체

#### 자동 저장 훅 흐름 예시

```js
useEffect(() => {
  const unsynced = highlights.filter((h) => !h.synced);
  if (unsynced.length === 0) return;

  if (timer.current) clearTimeout(timer.current);

  timer.current = setTimeout(() => {
    unsynced.forEach((note) => {
      if (note.id) {
        updateNote.mutate({ id: note.id, update: note });
      } else {
        addNote.mutate(note, {
          onSuccess: (saved) => {
            removeHighlight(note.id);
            updateHighlight(saved.id, { ...note, id: saved.id, synced: true });
          },
        });
      }
    });
  }, 5000);
}, [highlights]);
```

📌 이 방식은 빠른 사용자 입력을 방해하지 않으면서도, 서버 저장의 신뢰성과 정합성을 유지할 수 있습니다.

#### 결과

| 항목          | 개선 전 구조                         | 개선 후 (debounce 저장 구조)       |
| ------------- | ------------------------------------ | ---------------------------------- |
| 저장 타이밍   | 입력 즉시 저장                       | 5초 이상 입력 변화 없을 때 저장    |
| 중복 저장     | CFI 기준 중복 발생 가능              | `synced` 기반 병합 및 중복 제거    |
| UI 반응성     | 저장 지연 시 UX 저하                 | 즉시 반응, 저장은 비동기           |
| 서버 트래픽   | 매 입력마다 요청                     | 저장 요청 횟수 최소화              |
| 새로고침 복원 | 저장 실패 시 데이터 유실 가능성 있음 | `localStorage` 기반 상태 유지 가능 |

## 6. 하이라이트 중복 저장 방지 및 툴바 위치 보정

### 6-1. 하이라이트 중복 저장 방지

사용자가 같은 텍스트를 여러 번 드래그하거나 페이지를 이동한 뒤 동일한 하이라이트를 다시 생성하는 경우, 중복 저장되는 문제를 해결하기 위해 **CFI**와 **text**를 기준으로 중복 여부를 체크했습니다. 이를 통해 **하이라이트 겹침 문제**를 해결할 수 있었습니다.

```js
const isDuplicate = store.highlights.some(
  (h) => h.cfi === cfi && h.text === text
);
if (isDuplicate) return;
```

#### 결과

- **중복 하이라이트 방지**: 동일한 텍스트와 위치를 기준으로 중복 여부를 체크하여 불필요한 저장을 방지합니다.
- **효율적인 저장**: 서버와 UI 상태 간 일관성을 유지할 수 있습니다.

---

### 6-2. 툴바 위치 보정

하이라이트된 텍스트를 클릭할 때 툴바가 정확히 그 위에 나타나도록 하기 위해 **CFI 위치 기반**으로 툴바 위치를 계산했습니다. 이를 통해 사용자가 하이라이트를 클릭할 때마다 툴바가 자연스럽게 나타나고, 더 이상 불편함 없이 작업을 계속할 수 있었습니다.

#### 해결 방법

```js
const position = getToolbarPositionFromCfi({ rendition, cfi, viewerRef });
```

위 함수를 통해:

1. `epub.js`의 `rendition` 객체를 통해 `CFI` 위치를 기반으로 DOM 요소를 찾습니다.
2. 해당 요소의 좌표를 `getClientRects()`로 계산한 후,
3. `iframe`의 위치를 합산하여 **전체 뷰어 기준 좌표**로 환산합니다.

#### 결과

- **툴바 위치 정확도 향상**: 툴바가 하이라이트된 텍스트 바로 위에 자연스럽게 나타나도록 보정됩니다.
- **사용자 경험 개선**: 편리한 UI 상호작용을 제공하여 사용자가 원활하게 작업을 계속할 수 있습니다.

## 7. 기술 스택 & 구조 설계

### 7- 1 기술 스택

### 프론트엔드

![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-1E4B56?style=flat-square&logo=zustand&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=flat-square&logo=react-router&logoColor=white)
![epub.js](https://img.shields.io/badge/epub.js-001B36?style=flat-square&logo=epub&logoColor=white)

### 백엔드

![Firebase Functions](https://img.shields.io/badge/Firebase_Functions-FFCA28?style=flat-square&logo=firebase&logoColor=white)
![Firebase Storage](https://img.shields.io/badge/Firebase_Storage-FFCA28?style=flat-square&logo=firebase&logoColor=white)
![JSZip](https://img.shields.io/badge/JSZip-2C4D57?style=flat-square&logo=zip&logoColor=white)
![React Query](https://img.shields.io/badge/React_Query-FF4154?style=flat-square&logo=react-query&logoColor=white)

### 개발 도구

![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=flat-square&logo=eslint&logoColor=white)
![Prettier](https://img.shields.io/badge/Prettier-F7B93E?style=flat-square&logo=prettier&logoColor=white)
![Husky](https://img.shields.io/badge/Husky-986DFF?style=flat-square&logo=husky&logoColor=white)
![Lint-Staged](https://img.shields.io/badge/Lint--Staged-FFB8B8?style=flat-square&logo=git&logoColor=white)

### 7-2 프로젝트 구조

### (1) 상태 관리 전략: 클라이언트 vs 서버의 명확한 분리

**record247** 프로젝트는 사용자의 하이라이트, 메모, 독서 위치 등 다양한 상태 데이터를 다룹니다. 이때 상태의 성격에 따라 클라이언트 상태는 `Zustand`, 서버 상태는 `React Query`로 명확하게 분리하여 관리했습니다.

- **클라이언트 상태 (Zustand)**

  - 선택된 텍스트, 툴바 알림 여부, 현재 보고 있는 책 ID 등
  - 주로 UI 인터랙션과 관련된 값이며, 즉각적인 반응성이 요구됩니다.
  - 상태 예시: `selectedText`, `highlightColor`, `toolbarState` 등

- **서버 상태 (React Query)**

  - Firestore에서 불러온 메모 및 하이라이트, 사용자 인증 정보 등
  - 원격 데이터와 동기화가 필요한 상태이며, 네트워크 요청과 관련됨
  - 비동기 fetch, 오류 처리, state 관리 등을 담당

### (2) Zustand를 선택한 이유

전역 상태 관리 라이브러리로 **Zustand**를 선택한 이유는 다음과 같습니다:

1. **UI 반응성을 최적화하는 관리 방식**

   - **record247** 프로젝트는 하이라이트, 선택된 문장, 메모 툴바 위치 등 **UI 기반의 인터랙션 상태**가 많습니다. 이 상태들은 **서버와의 연관 없이 빠른 반응 속도가 요구되며**, 이는 Zustand의 특성과 잘 맞아떨어집니다. 반면 `React Query`는 비동기 캐싱/페칭 중심이기 때문에 UI 중심의 상태 관리에 적합하지 않았습니다.

2. **간결하고 직관적인 사용법**

   - Zustand는 **경량화된 라이브러리**이면서도 **간단한 코드로 전역 상태를 관리**할 수 있어 프로젝트에 부담 없이 쉽게 적용할 수 있었습니다. 별도의 리듀서나 미들웨어 없이 상태를 정의하고, `useStore(state => state.selectedText)`처럼 필요한 값만 구독할 수 있어 불필요한 렌더링을 줄일 수 있었습니다.

3. **상태 유지 기능(persist)**

   - `persist` 미들웨어를 활용하여 상태를 **localStorage**에 저장하고, 페이지 새로 고침 후에도 상태를 유지할 수 있게 했습니다. 이는 **UI의 상태 변화**를 끊김 없이 유지하는 데 유리했습니다.

### (3) Storage & Server Functions 설계

- **Firebase Functions**에서는 업로드 된 EPUB 파일의 구조를 파싱하여 `mimetype`, `container.xml`, `content.opf` 파일을 검사합니다.
- 올바른 구조일 경우에만 `Firebase Storage`에 저장하고 **Signed URL**을 발급합니다.
- 클라이언트는 해당 URL을 이용해 **epub.js**로 콘텐츠를 읽고 렌더링합니다.

이 모든 과정은 **백엔드가 상태를 결정하지 않고, "허용/거절"만 판단하며 정적 URL을 발급하는 역할**에 집중되어 있습니다. 상태는 클라이언트가 제어하고, 서버는 그 상태를 백업하는 방식입니다.

### (4) 커스텀 훅 기반 관심사 분리

```js
  🗂️ hooks
   ㄴ 📁 useAuth.js
   ㄴ 📁 useAutoHighlightSync.js
   ㄴ 📁 useHighlightSync.js
   ㄴ 📁 useNote.js
```

## 8. 구현하며 배운 점들
