import { fromEvent, interval, map, scan, switchMap, takeWhile, tap } from 'rxjs';
import { dot, moveDot, resetDotSize, setTimerText, updateDot } from './dom-helper';

interface IState {
  score: number;
  intervalState: number;
}

// Поток таймер
const makeInterval = (value: IState) =>
  interval(value.intervalState).pipe(
    map((val) => 5 - val),
    tap<number>(setTimerText) // tap для сайд-эффектов
  );

const gameState: IState = { score: 0, intervalState: 500 };

const nextState = (acc: IState): IState => ({
  score: (acc.score += 1),
  intervalState: acc.score % 3 === 0 ? (acc.intervalState -= 50) : acc.intervalState,
});
const isNotGameOver = (intervalValue: number) => intervalValue >= 0;

const game$ = fromEvent(dot, 'mouseover').pipe(
  tap(moveDot),
  scan<Event, IState>(nextState, gameState), // scan для состояния между событиями
  tap((state) => updateDot(state.score)),
  switchMap(makeInterval),
  tap(resetDotSize),
  takeWhile(isNotGameOver)
);

game$.subscribe({ next: () => {}, error: () => {}, complete: () => setTimerText('Ouch!') });

// Запускаем игру, подписываемся на поток из события
// Если мышь над точкой, перемещаем точку, вычисляем новое состояние приложения
// Обновляем точку. в switchMap получаем стрим из интервала, предыдущий откидывается
// ОБновляем размер точки после перемещения
// Продолжаем пока таймер не равен 0
