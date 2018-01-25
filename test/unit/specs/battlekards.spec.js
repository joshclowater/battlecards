import Vuex from 'vuex';
import { shallow, createLocalVue } from '@vue/test-utils';
import BattleKards from '@/client/components/battlekards';

const localVue = createLocalVue();
localVue.use(Vuex);

const createWrapperWithStore = store =>
  shallow(BattleKards, {
    store: new Vuex.Store(Object.assign(store, {
      mutations: {
        SET_IS_LANDSCAPE: () => {},
      },
      actions: {
        initiateGame: () => {},
      },
    })),
    localVue,
  });

describe('Battlekards', () => {
  it('renders correctly when gameStatus is undefined', () => {
    const wrapper = createWrapperWithStore({
      state: {
        gameStatus: undefined,
      },
    });

    expect(wrapper.find('#battlekards').text())
      .to.equal('Connecting to server...');
  });

  it('renders correctly when gameStatus is "waitingForAnotherPlayer"', () => {
    const wrapper = createWrapperWithStore({
      state: {
        gameStatus: 'waitingForAnotherPlayer',
      },
    });

    expect(wrapper.find('#battlekards').text())
      .to.equal('Waiting for another player to join...');
  });

  it('renders correctly when gameStatus is "gameOverWin"', () => {
    const wrapper = createWrapperWithStore({
      state: {
        gameStatus: 'gameOverWin',
      },
    });

    expect(wrapper.find('#battlekards').text())
      .to.contain('You won!');
  });

  it('renders correctly when gameStatus is "gameOverLose"', () => {
    const wrapper = createWrapperWithStore({
      state: {
        gameStatus: 'gameOverLose',
      },
    });

    expect(wrapper.find('#battlekards').text())
      .to.contain('You lost...');
  });
});
