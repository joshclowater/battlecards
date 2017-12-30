import Vue from 'vue';
import Card from '@/components/card';

describe('Card.vue', () => {
  it('should render correct contents', () => {
    const Constructor = Vue.extend(Card);
    const card = new Constructor({
      propsData: {
        card: {
          name: 'test-card-name',
          attributes: {
            attack: 100,
            defense: 200,
          },
        },
      },
    }).$mount();
    expect(card.$el.textContent)
      .to.contain('test-card-name')
      .to.contain('Atk: 100')
      .to.contain('Def: 200');
  });
});
