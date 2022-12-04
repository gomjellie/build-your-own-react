// prettier-ignore
type TAG_NAMES = "object" | "a" | "abbr" | "address" | "area" | "article" | "aside" | "audio" | "b" | "base" | "bdi" | "bdo" | "big" | "blockquote" | "body" | "br" | "button" | "canvas" | "caption" | "center" | "cite" | "code" | "col" | "colgroup" | "data" | "datalist" | "dd" | "del" | "details" | "dfn" | "dialog" | "div" | "dl" | "dt" | "em" | "embed" | "fieldset" | "figcaption" | "figure" | "footer" | "form" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "head" | "header" | "hgroup" | "hr" | "html" | "i" | "iframe" | "img" | "input" | "ins" | "kbd" | "keygen" | "label" | "legend" | "li" | "link" | "main" | "map" | "mark" | "menu" | "menuitem" | "meta" | "meter" | "nav" | "noscript" | "ol" | "optgroup" | "option" | "output" | "p" | "param" | "picture" | "pre" | "progress" | "q" | "rp" | "rt" | "ruby" | "s" | "samp" | "slot" | "script" | "section" | "select" | "small" | "source" | "span" | "strong" | "style" | "sub" | "summary" | "sup" | "table" | "template" | "tbody" | "td" | "textarea" | "tfoot" | "th" | "thead" | "time" | "title" | "tr" | "track" | "u" | "ul" | "var" | "video" | "wbr" | "webview";

function createElement(
  type: TAG_NAMES,
  props: Record<string, any>,
  ...children: JSX.Element[]
): JSX.Element {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === 'object' ? child : createTextElement(child)
      ),
    },
    key: null,
  };
}

function createTextElement(text: string): JSX.Element {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: [],
    },
    key: null,
  };
}

let nextUnitOfWork: Fiber | null = null;

function workLoop(deadline: IdleDeadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  window.requestIdleCallback(workLoop);
}

window.requestIdleCallback(workLoop);

function performUnitOfWork(fiber: Fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  if (fiber.parent) {
    if ('appendChild' in fiber.parent.dom!) {
      fiber.parent.dom.appendChild(fiber.dom);
    }
  }

  const elements = fiber.props.children;
  let index = 0;
  let prevSibling: Fiber | null = null;

  while (index < elements.length) {
    const element = elements[index];

    const newFiber: Fiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
      child: null,
      sibling: null,
    };

    if (index === 0) {
      fiber.child = newFiber;
    } else {
      if (prevSibling) {
        prevSibling.sibling = newFiber;
      }
    }
    prevSibling = newFiber;
    index++;
  }

  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber: Fiber | null = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
  return null;
}

type Fiber = {
  type: TAG_NAMES | 'TEXT_ELEMENT';
  dom: Text | HTMLElement | null;
  parent: Fiber | null;
  child: Fiber | null;
  sibling: Fiber | null;
  props: {
    children: JSX.Element[];
  } & Record<string, any>;
};

function createDom(fiber: Fiber): Text | HTMLElement {
  const dom =
    fiber.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(fiber.type);
  const isProperty = (key: string) => key !== 'children';
  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach((name) => {
      (dom as any)[name] = fiber.props[name];
    });
  return dom;
}

function render(element: JSX.Element, container: HTMLElement) {
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element],
    },
    child: null,
    parent: null,
    sibling: null,
    type: 'div',
  };
}

const Didact = {
  createElement,
  render,
};

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

const container = document.getElementById('root') as HTMLElement;

Didact.render(element, container);

// ReactDOM.createRoot(document.createElement('div'));

// ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
//   element
// );
