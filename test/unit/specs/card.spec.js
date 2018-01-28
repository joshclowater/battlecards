import Vuex from 'vuex';
import { shallow, createLocalVue } from '@vue/test-utils';
import Card from '@/client/components/card';

const localVue = createLocalVue();
localVue.use(Vuex);

const createWrapperWithStore = propsData =>
  shallow(Card, {
    propsData,
    store: new Vuex.Store(Object.assign({
      mutations: {
        SET_SELECTED_CARD: () => {},
      },
      getters: {
        isMyTurn: () => true,
        myPlayerHasSummoned: () => false,
        selectedCardId: () => undefined,
      },
    })),
    localVue,
  });

describe('card', () => {
  describe('monster', () => {
    const wrapper = createWrapperWithStore({
      card: {
        type: 'monster',
        name: 'test-monster-name',
        attributes: {
          attack: 100,
          defense: 200,
        },
      },
      cardField: 'myHand',
    });
    it('renders title', () => {
      expect(wrapper.find('.title').text())
        .to.equal('test-monster-name');
    });
    it('renders atk', () => {
      expect(wrapper.find('.atk').text())
        .to.equal('Atk: 100');
    });
    it('renders def', () => {
      expect(wrapper.find('.def').text())
        .to.equal('Def: 200');
    });
  });
  describe('trap', () => {
    const wrapper = createWrapperWithStore({
      card: {
        type: 'trap',
        name: 'test-trap-name',
        description: 'test description',
      },
      cardField: 'myHand',
    });
    it('renders title', () => {
      expect(wrapper.find('.title').text())
        .to.equal('test-trap-name');
    });
    it('renders description', () => {
      expect(wrapper.find('.description').text())
        .to.equal('test description');
    });
  });
});
