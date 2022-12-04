import React from 'react';
import type { ReactHTML } from 'react';

React.createElement;

type HTML_TYPES = keyof ReactHTML;

function createElement(
  type: HTML_TYPES,
  props: any[],
  ...children: any[]
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
  type: HTML_TYPES | 'TEXT_ELEMENT';
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
  const isProperty = (key: any) => key !== 'children';
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
