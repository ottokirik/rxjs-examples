import { Subject, scan, startWith, shareReplay, fromEvent, map } from 'rxjs';

// REDUX
const initState = {
  count: 0,
};

const handlers = {
  INC: (state) => ({ ...state, count: state.count + 1 }),
  DEC: (state) => ({ ...state, count: state.count - 1 }),
  ADD: (state, action) => ({ ...state, count: state.count + action.payload }),
  DEFAULT: (state) => state,
};

const reducer = (state = initState, action) => {
  const handler = handlers[action.type] || handlers['DEFAULT'];
  return handler(state, action);
};

const createStore = (reducer) => {
  const sub$ = new Subject();

  const store$ = sub$.pipe(
    startWith({ type: '__INIT__' }),
    scan(reducer, undefined),
    shareReplay(1)
  );

  store$.dispatch = (action) => sub$.next(action);

  return store$;
};

const store$ = createStore(reducer);

// END REDUX
// LISTENERS

const createListener = (node) =>
  fromEvent(node, 'click')
    .pipe(
      map((e) => ({
        type: e.target.dataset.action,
        payload: Number(e.target.dataset?.payload),
      }))
    )
    .subscribe((action) => store$.dispatch(action));

createListener(document.getElementById('inc'));
createListener(document.getElementById('dec'));
createListener(document.getElementById('add'));

// END LISTENERS

const display = document.getElementById('display');
store$.subscribe((state) => (display.innerHTML = JSON.stringify(state, null, 2)));
