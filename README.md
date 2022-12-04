# build-your-own-react
Fully Typed Little React

[build-your-own-react](https://bluewings.github.io/build-your-own-react/) 를 vite + ts 환경에서 구현한 내용입니다.

JSX 표현식을 아래처럼 `@jsx` 주석으로 PRAGMA 설정을 해줘서 JSX파서가 `Didact.createElement`를 실행하도록 설정했습니다.

```tsx
/**
 * @jsxRuntime classic
 * @jsx Didact.createElement
 **/
const element = (
  <div id="foo">
    <a>bar</a>
    <div>
      <div>hello world</div>
    </div>
    <b />
  </div>
);
```

[main.tsx](/src/main.tsx)에 모든 구현이 있습니다
