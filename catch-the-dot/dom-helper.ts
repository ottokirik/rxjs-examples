const random = () => Math.random() * 500;
const elem = (id: string) => document.getElementById(id);
const setElementText = (elem: HTMLElement, text: string | number) =>
  (elem.innerHTML = text.toString());

const timer = elem('timer');
export const dot = elem('dot');

const getRandomColor = () => `#${Math.round(Math.random() * 0xffffff).toString(16)}`;

const setDotSize = (size: number | string) => {
  dot.style.height = `${size}px`;
  dot.style.width = `${size}px`;
};

export const updateDot = (score: number) => {
  if (score % 3 === 0) {
    dot.style.backgroundColor = getRandomColor();
  }

  setElementText(dot, score);
};

export const setTimerText = (text: string | number) => {
  setElementText(timer, text);
};

export const moveDot = () => {
  setDotSize(3);
  dot.style.transform = `translate(${random()}px, ${random()}px)`;
};

export const resetDotSize = () => {
  setDotSize(30);
};
