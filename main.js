(function($, doc) {
  'use strict';

  var app = (function() {
    var typesGame = [];
    var games = [];
    var game = {};

    return {
      init: function init() {
        this.gamesInfo();
        this.initEvents();
      },

      initEvents() {
        $('[data-js="button-add"]').on('click', this.handleSubmit);
        $('[data-js="button-clear-game"]').on('click', this.clearGame);
        $('[data-js="button-complete-game"]').on('click', this.completeGame);
      },
      
      gamesInfo: function gamesInfo() {
        var ajax = new XMLHttpRequest();
        ajax.open('GET', 'games.json', true);
        ajax.send();
        ajax.addEventListener('readystatechange', this.getGamesInfo, false);
      },

      getGamesInfo: async function getGamesInfo() {
        if (!app.isReady.call(this)) {
          return;
        }

        var data = JSON.parse(this.responseText);

        await data.types.map((item) => {
          typesGame.push({
            name: item.type,
            description: item.description,
            range: item.range,
            price: item.price,
            maxNumber: item["max-number"],
            color: item.color,
            selected: false,
          });
        })

        app.defineInitialButtonGameSelected();
      },

      defineInitialButtonGameSelected: function defineInitialButtonGameSelect() {
        app.createButtonsGames();
        typesGame[0].selected = true;
        app.createNumbers();
      },

      findGameOnArray: function findGameOnArray(name) {
        typesGame.map((item) => {
          if(item.name === name) {
            return item.selected = true;
          } else {
            return item.selected = false;
          }
        })
        app.createNumbers();

      },

      setGameSelected: function setGameSelected() {
        var gameSelected;
        typesGame.map((item) => {
          if(item.selected === true) {
            gameSelected = item;
          }
        })

        return gameSelected;
      },

      createButtonsGames: function createButtonsGames() {
        var $gamesType = $('[data-js="games-type"]').get();
        const $fragment = doc.createDocumentFragment();

        typesGame.forEach((item, index) => {
          var $game = doc.createElement('button');
          var name = `button-game${index+1}`;
          $game.textContent = item.name;
          $game.addEventListener('click', () => app.findGameOnArray(item.name), false);
          $game.setAttribute('data-js', name);
          $fragment.appendChild($game);
          $gamesType.appendChild($fragment);
        })

        app.gamesStyleDefault();
      },

      createNumbers: function createNumbers() {
        var $gameName = $('[data-js="game-name"]').get();
        var $gameDescription = $('[data-js="game-description"]').get(); 
        var $betItems = $('[data-js="bet-items"]').get();
        const $fragment = doc.createDocumentFragment();

        var name = app.setGameSelected().name;
        $betItems.innerText = '';
        app.createGamesStyleWhenSelected(app.setButtonSelected().getAttribute('data-js'));
        app.createGameObject();

        $gameName.textContent = `FOR ${name.toUpperCase()}`;
        $gameDescription.textContent = app.setGameSelected().description;

        for(var i = 0;i < game.size;i++) {
          var $number = doc.createElement('button');
          $number.setAttribute('class', 'bet-item');
          $number.setAttribute('data-js', 'bet-item');
          $number.textContent = i + 1;
          $number.addEventListener('click', app.selectNumber, false);

          $fragment.appendChild($number);
        }

        $betItems.appendChild($fragment);
      },

      handleSubmit: function handleSubmit(e) {
        e.preventDefault();
        app.addGameToCart();
      },

      clearGame: function clearGame() {
        if (app.setGameSelected() === undefined) {
          return alert('Escolha um jogo!');
        } 
        app.paintingAllNumberButtons('#ADC0C4');
        game.numbers = [];
      },

      addGameToCart: function addGameToCart() {
        if (app.isThisGameAlreadyFullOnArray()) {
          app.removeSpanEmptyCart();

          game.numbers.sort((a, b) => a - b);
          games.push(game);
          app.createGameOnCart();
        } else {
          var missing = game.maxNumber - game.numbers.length;
          missing === 1 
            ? alert(`Está faltando ${missing} número para escolher!`)
            : alert(`Está faltando ${missing} números para escolher!`)
        }
      },

      removeSpanEmptyCart: function removeSpanEmptyCart() {
        if(games.length === 0) {
          var $cartItems = $('[data-js="cart-items"]').get();
          $cartItems.innerText = '';
        }
      },

      addSpanEmptyCart: function addSpanEmptyCart() {
        if(games.length === 0) {
          var $cartItems = $('[data-js="cart-items"]').get();
          var $fragment = doc.createDocumentFragment();
          var $span = doc.createElement('span');
          $span.setAttribute('class', 'empty-cart');
          $span.textContent = 'Empty cart!';

          $fragment.appendChild($span);
          $cartItems.appendChild($fragment);
        }
      },

      createGameOnCart: function createGameOnCart() {
        var $cart = $('[data-js="cart-items"]').get();
        const $fragment = doc.createDocumentFragment();
        var $bet = doc.createElement('div');
        var $mark = doc.createElement('div');
        var $buttonDelete = doc.createElement('button');
        var $spanIcon = doc.createElement('span');
        var $icon = doc.createElement('i');
        var $div = doc.createElement('div');
        var $pNumbers = doc.createElement('p');
        var $pName = doc.createElement('p');
        var $spanPrice = doc.createElement('span');

        $spanIcon.style.fontSize = '23px';
        $mark.style.backgroundColor = app.getColorGame();
        $pName.style.color = app.getColorGame();
        $bet.setAttribute('class', 'bet');
        $icon.setAttribute('class', 'far fa-trash-alt');
        $div.setAttribute('class', 'bet-info')
        $mark.setAttribute('class', 'mark');
        $pNumbers.setAttribute('class', 'bet-numbers');
        $pName.setAttribute('class', 'bet-name');

        var formatNumbersArray = game.numbers.toString().replace(/,/g, ', ');
        var formatPrice = game.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
       
        $pNumbers.textContent = formatNumbersArray;
        $spanPrice.textContent = formatPrice;
        $pName.textContent = game.name;

        $spanIcon.appendChild($icon);
        $buttonDelete.appendChild($spanIcon);
        $buttonDelete.addEventListener('click', this.removeItemOnCart, false);

        $pName.appendChild($spanPrice);
        $div.appendChild($mark);
        $div.appendChild($pNumbers);
        $div.appendChild($pName);
        $bet.appendChild($buttonDelete);
        $bet.appendChild($div);
        $fragment.appendChild($bet);
        $cart.appendChild($fragment);

        app.totalPrice();  
        app.clearGame();
      },

      totalPrice: function totalPrice() {
        var $spanTotalPrice = $('[data-js="span-price-total"]').get();

        var result = games.reduce(function(total, item) { 
          return total + item.price;
        }, 0)

        var formatResult = result.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        return $spanTotalPrice.textContent = formatResult;
      },

      completeGame: function completeGame() {
        app.clearGame();

        for(var i = 0; i < game.maxNumber;i++) {
          var randomNumber = Math.round(Math.random() * (game.size - 1) + 1);

          while(game.numbers.includes(randomNumber)) {
            randomNumber = Math.round(Math.random() * (game.size - 1) + 1);
          }

          game.numbers.push(+randomNumber);
        }

        app.paintingAllNumberButtons(app.getColorGame());
      },

      getColorGame: function getColorGame() {
        var color;
        typesGame.map((item) => {
          if(item.selected) {
            color = item.color;
          }
        })
        return color;
      },

      removeItemOnCart: function removeItemOnCart() {
        var child = this.parentNode;
        var parent = this.parentNode.parentNode;
        var index = Array.prototype.indexOf.call(parent.children, child);

        games.splice(index, 1);
        app.totalPrice();
        app.addSpanEmptyCart();

        return this.parentNode.remove();
      },

      createGameObject: function createGameObject() {
        game = {
          name: app.setGameSelected().name,
          numbers: [],
          size: app.setGameSelected().range,
          price: app.setGameSelected().price,
          maxNumber: app.setGameSelected().maxNumber
        }
      },

      selectNumber: function selectNumber() {
        if(app.isThisNumberAlreadyOnArray(+this.textContent)) {
          var index = game.numbers.indexOf(+this.textContent);
          game.numbers.splice(index, 1);
          app.paintingNumberButton(this, '#ADC0C4');
          return;
        } 
        
        else if (!app.isThisGameAlreadyFullOnArray() && !app.isThisNumberAlreadyOnArray(this.textContent)) {
          game.numbers.push(+this.textContent);
        } 
        
        else {
          alert('Você já escolheu a quantidade máxima de números. Limpe o jogo ou adicione ao carrinho.')
        }

        app.paintingAllNumberButtons(app.getColorGame());
      },

      setButtonSelected: function setButtonSelected() {
        var $game;
        typesGame.map((item, index) => {
          if(item.selected) {
            var name = `button-game${index+1}`;
            $game = doc.querySelector(`[data-js="${name}"]`);
          }
        })
        return $game;
      },

      createGamesStyle: function createGamesStyle(buttonName, arr) {
        buttonName.style.borderColor = arr.color;
        buttonName.style.color = arr.color;
        buttonName.style.backgroundColor = '#FFFFFF';
      },

      gamesStyleDefault: function gamesStyleDefault() {
        typesGame.map((item, index) => {
          var name = `button-game${index+1}`;
          var $game = doc.querySelector(`[data-js="${name}"]`);
          app.createGamesStyle($game, item);
        })
      },

      createGamesStyleWhenSelected: function createGamesStyleWhenSelected(buttonName) {
        app.gamesStyleDefault();

        var $buttonSelected = $(`[data-js=${buttonName}]`).get();
        var name = $buttonSelected.innerText;

        typesGame.map((item) => {
          if(item.name === name) {
            $buttonSelected.style.backgroundColor = item.color;
            $buttonSelected.style.color = '#FFFFFF';
          }
        })
      },

      paintingNumberButton: function paintingNumberButton(button, color) {
        return button.style.backgroundColor = color;
      },

      paintingAllNumberButtons: function paintingAllNumberButtons(color) {
        game.numbers.map((number) => {
          $('[data-js="bet-item"]').map((item) => {
            if(+number === +item.textContent) {
              app.paintingNumberButton(item, color);
            } 
          })
        });
      },

      isThisNumberAlreadyOnArray: function isThisNumberAlreadyOnArray(number) {
        var repeated = false;
        game.numbers.map((num) => {
          if(+num === +number) {
            repeated = true;
          }
        })
        return repeated;
      },

      isThisGameAlreadyFullOnArray: function isThisGameAlreadyFullOnArray() {
        return game.numbers.length === game.maxNumber;
      },

      isReady: function isReady() {
        return this.readyState === 4 && this.status === 200;
      },
    };
  })();

  app.init();
})(window.DOM, document);