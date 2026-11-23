// Проверяем правила игры отдельно от графики и аудио средствами встроенного Node.js.
const test = require('node:test');
const assert = require('node:assert/strict');
const { initialState, advanceState } = require('./game.js');
const item = (type, x = 300, y = 580) => ({ type, x, y, speed: 200, color: 0, rotation: 0 });
const ready = (items = []) => ({ ...initialState(), items, spawnIn: 100 });

test('Подарок даёт ровно 10 очков и удаляется после поимки', () => {
  const before = ready([item('gift')]);
  const after = advanceState(before, 0.2);
  assert.equal(after.score, 10);
  assert.equal(after.items.length, 0);
  assert.equal(advanceState(after, 0.2).score, 10);
  assert.equal(before.items[0].y, 580, 'Исходное состояние не меняется');
});

test('Снежок отнимает одно сердце; три попадания завершают раунд', () => {
  let state = ready();
  for (let count = 1; count <= 3; count++) {
    state = advanceState({ ...state, items: [item('snow')] }, 0.2);
    assert.equal(state.lives, 3 - count);
    assert.equal(state.score, 0);
  }
  assert.equal(state.ended, true);
});

test('Пропущенный подарок и далёкий снежок не штрафуют', () => {
  const state = advanceState(ready([item('gift', 50, 735), item('snow', 50)]), 0.2);
  assert.equal(state.score, 0);
  assert.equal(state.lives, 3);
  assert.equal(state.items.length, 1);
});

test('Корзина не выходит за границы при касании и клавиатурном управлении', () => {
  assert.equal(advanceState(ready(), 1, { targetX: -100 }).basketX, 58);
  assert.equal(advanceState(ready(), 1, { targetX: 900 }).basketX, 542);
  assert.equal(advanceState(ready(), 2, { direction: -1 }).basketX, 58);
});

test('Быстрый подарок не пролетает сквозь корзину', () => {
  const state = advanceState(ready([{ ...item('gift'), y: 550, speed: 1000 }]), 0.2);
  assert.equal(state.score, 10);
});

test('Раунд заканчивается на 60 секундах, после конца счёт и время заморожены', () => {
  const state = advanceState(ready(), 61);
  assert.equal(state.remaining, 0);
  assert.equal(state.elapsed, 60);
  assert.equal(state.ended, true);
  const next = advanceState({ ...state, items: [item('gift')] }, 1);
  assert.equal(next.score, 0);
  assert.equal(next.remaining, 0);
});

test('Повторная инициализация возвращает полный новый раунд', () => {
  const state = initialState();
  assert.equal(state.score, 0);
  assert.equal(state.remaining, 60);
  assert.equal(state.lives, 3);
  assert.equal(state.ended, false);
  assert.deepEqual(state.items, []);
});
