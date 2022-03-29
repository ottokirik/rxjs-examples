import { fromEvent, map, pairwise, startWith, switchMap, takeUntil, withLatestFrom } from 'rxjs';

const clearButton = document.getElementById('clear-canvas');
clearButton.addEventListener('click', () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
});

const range = document.getElementById('range');
const color = document.getElementById('color');

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const rect = canvas.getBoundingClientRect();
const scale = window.devicePixelRatio;

canvas.width = rect.width * scale;
canvas.height = rect.height * scale;

context.scale(scale, scale);

const fromEventWithCanvas = (eventName) => fromEvent(canvas, eventName);
const createInputStream = (node) =>
  fromEvent(node, 'input').pipe(
    map((event) => event.target.value),
    startWith(node.value)
  );

// const mouseMove$ = fromEventWithCanvas('mousemove');
// const mouseDown$ = fromEventWithCanvas('mousedown');
// const mouseUp$ = fromEventWithCanvas('mouseup');
// const mouseOut$ = fromEventWithCanvas('mouseout');

const eventsForStream = ['mousemove', 'mousedown', 'mouseup', 'mouseout'];

const streamsObj$ = eventsForStream.reduce((acc, event) => {
  return { ...acc, [event]: fromEventWithCanvas(event) };
}, {});

// Стримы для отслеживания изменения толщины линии и цвета
const lineWidth$ = createInputStream(range);
const color$ = createInputStream(color);

// Рисуем при нажатии кнопки мышки.
// При нажатии кнопки мышки переключаемся на стрим движения мыши и уже рисуем линии

const paintStream$ = streamsObj$['mousedown'].pipe(
  // Получаем последнии значения из стримов и отдаем дальше
  withLatestFrom(lineWidth$, color$, (_, lineWidth, color) => ({ lineWidth, strokeStyle: color })),
  // Переключится на другой стрим
  switchMap((options) => {
    return streamsObj$['mousemove'].pipe(
      map((event) => ({ x: event.offsetX, y: event.offsetY, options })),
      pairwise(), // Объединяет предыдущее значение стрима и текущее, массив
      // Рисуем пока не начался другой стрим, в данном случае не отжата кнопка мыши или указатель не вышел за пределы канваса
      takeUntil(streamsObj$['mouseup']),
      takeUntil(streamsObj$['mouseout'])
    );
  })
);

paintStream$.subscribe(([from, to]) => {
  const {
    options: { lineWidth, strokeStyle },
  } = from;

  context.lineWidth = lineWidth;
  context.strokeStyle = strokeStyle;

  context.beginPath();
  context.moveTo(from.x, from.y);
  context.lineTo(to.x, to.y);
  context.stroke();
});
