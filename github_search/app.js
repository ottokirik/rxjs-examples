import {
  fromEvent,
  map,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  mergeMap,
  tap,
  catchError,
  EMPTY,
  filter,
} from 'rxjs';
import { ajax } from 'rxjs/ajax';

const url = 'https://api.github.com/search/users?q=';

const searchInput = document.getElementById('search');
const result = document.getElementById('result');

const searchStream$ = fromEvent(searchInput, 'input').pipe(
  map((event) => event.target.value),
  debounceTime(500),
  distinctUntilChanged(),
  tap(() => {
    result.innerHTML = '';
  }),
  filter((value) => value.trim()),
  switchMap((value) => {
    return ajax.getJSON(`${url}${value}`).pipe(catchError((err) => EMPTY));
  }),
  map((response) => response.items),
  mergeMap((items) => items)
);

searchStream$.subscribe((user) => {
  const html = `
      <div class="card">
        <div class="card-image">
          <img src="${user?.avatar_url}" />
          <span class="card-title">${user?.login}</span>
        </div>
        <div class="card-action">
          <a href="${user?.html_url}" target="_blank">Открыть github</a>
        </div>
      </div>
      `;

  result.insertAdjacentHTML('beforeend', html);
});
