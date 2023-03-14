'use strict';

//States
const GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardsMatchFailed: 'CardMatchFailed',
  CardsMatched: 'CardsMatched',
  GameFinished: 'GameFinished',
};

const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png', // 梅花
];

const view = {
  //花色和數字決定跟HTML輸出
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1);
    const symbol = Symbols[Math.floor(index / 13)];

    return `<p>${number}</p>
    <img
      src="${symbol}"
      alt=""
    />
    <p>${number}</p>`;
  },

  //卡背輸出
  getCardElement(index) {
    return `<div data-index="${index}" class="card back"></div>`;
  },

  //1,11,12,13數字變化字母A,J,Q,K輸出
  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A';
      case 11:
        return 'J';
      case 12:
        return 'Q';
      case 13:
        return 'K';
      default:
        return number;
    }
  },

  //初始卡片輸出
  displayCards(indexes) {
    const rootElement = document.querySelector('#cards');
    rootElement.innerHTML = indexes
      .map((index) => this.getCardElement(index))
      .join('');
  },

  //翻牌輸出
  flipCards(...cards) {
    cards.map((card) => {
      if (card.classList.contains('back')) {
        card.classList.remove('back');
        card.innerHTML = this.getCardContent(Number(card.dataset.index));
        return;
      }

      card.classList.add('back');
      card.innerHTML = null;
    });
  },

  pairCards(...cards) {
    cards.map((card) => {
      card.classList.add('paired');
    });
  },

  renderScore(score) {
    document.querySelector('.score').textContent = `Score: ${score}`;
  },

  renderTriedTimes(times) {
    document.querySelector(
      '.tried'
    ).textContent = `You've tried: ${times} times`;
  },

  appendWrongAnimation(...cards) {
    cards.map((card) => {
      card.classList.add('wrong');
      card.addEventListener(
        'animationend',
        (e) => {
          card.classList.remove('wrong');
        },
        { once: true }
      );
    });
  },

  showGameFinished() {
    const div = document.createElement('div');
    div.classList.add('completed');
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `;
    const header = document.querySelector('#header');
    header.before(div);
  },
};

//產生打入數字的array並打亂排列順序
const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys());

    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1));
      [number[index], number[randomIndex]] = [
        number[randomIndex],
        number[index],
      ];
    }

    return number;
  },
};

//Model
const model = {
  revealedCards: [],

  isRevealedCardsMatched() {
    return (
      this.revealedCards[0].dataset.index % 13 ===
      this.revealedCards[1].dataset.index % 13
    );
  },

  score: 0,

  triedTimes: 0,
};

//Control
const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

  //卡片初始輸出
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52));
  },

  //依照不同遊戲狀態, 做不同行為
  dispatchCardAction(card) {
    if (!card.classList.contains('back')) {
      return;
    }

    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card);
        model.revealedCards.push(card);
        this.currentState = GAME_STATE.SecondCardAwaits;
        break;

      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes);

        view.flipCards(card);
        model.revealedCards.push(card);

        if (model.isRevealedCardsMatched()) {
          //配對正確
          view.renderScore((model.score += 10));
          this.currentState = GAME_STATE.CardsMatched;
          view.pairCards(...model.revealedCards);
          model.revealedCards = [];
          if (model.score === 260) {
            console.log('showGameFinished');
            this.currentState = GAME_STATE.GameFinished;
            view.showGameFinished(); // 加在這裡
            return;
          }
          this.currentState = GAME_STATE.FirstCardAwaits;
        } else {
          //配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed;
          view.appendWrongAnimation(...model.revealedCards);
          setTimeout(this.resetCards, 1000);
        }
        console.log(model.isRevealedCardsMatched());
        break;
    }
    console.log('this.currentState', this.currentState);
    console.log(
      'revealedCards',
      model.revealedCards.map((card) => card.dataset.index)
    );
  },

  resetCards() {
    view.flipCards(...model.revealedCards);
    model.revealedCards = [];
    controller.currentState = GAME_STATE.FirstCardAwaits;
  },
};

//初始輸出
controller.generateCards();

console.log(utility.getRandomNumberArray(5));

//Node List, 翻牌監聽器
document.querySelectorAll('.card').forEach((card) =>
  card.addEventListener('click', (event) => {
    controller.dispatchCardAction(card);
  })
);
