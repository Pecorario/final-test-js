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

      handleSubmit: function handleSubmit(e) {
        e.preventDefault();
        app.addGameToCart();
      },

      addGameToCart: function addGameToCart() {
        games.push(game);
        console.log('Novo jogo adicionado: ', games);
        // app.clearGame(); //ta limpando antes de dar o push no games

        app.createGameOnCart();
      },

      createGameOnCart: function createGameOnCart() {
        var $cart = $('[data-js="cart-items"]').get();

        const $fragment = doc.createDocumentFragment();
        var $bet = doc.createElement('div');
        var $buttonDelete = doc.createElement('button');
        var $spanIcon = doc.createElement('span');
        var $icon = doc.createElement('i');
        var $div = doc.createElement('div');
        var $pNumbers = doc.createElement('p');
        var $pName = doc.createElement('p');
        var $spanPrice = doc.createElement('span');

        $spanIcon.style.fontSize = '23px';
        $bet.setAttribute('class', 'bet');
        $icon.setAttribute('class', 'far fa-trash-alt');
        $pNumbers.setAttribute('class', 'bet-numbers');
        $pName.setAttribute('class', 'bet-name');
      
        switch (game.name) {
          case 'Lotofácil': 
          $div.setAttribute('class', 'bet-info mark-lotofacil');
          break;
          case 'Mega-Sena': 
          $div.setAttribute('class', 'bet-info mark-megasena');
          break;
          case 'Quina': 
          $div.setAttribute('class', 'bet-info mark-quina');
          break;
        }

        var formatNumbersArray = game.numbers.toString().replace(/,/g, ', ');
        var formatPrice = game.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
       
        $pNumbers.textContent = formatNumbersArray;
        $spanPrice.textContent = `${formatPrice}`;
        $pName.textContent = game.name;

        $spanIcon.appendChild($icon);
        $buttonDelete.appendChild($spanIcon);
        $buttonDelete.addEventListener('click', this.removeItemOnCart, false);

        $pName.appendChild($spanPrice);
        $div.appendChild($pNumbers);
        $div.appendChild($pName);

        $bet.appendChild($buttonDelete);
        $bet.appendChild($div);

        $fragment.appendChild($bet);
        $cart.appendChild($fragment);

        app.totalPrice();  
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

          game.numbers.push(randomNumber);
        }

        app.findGameOnArray(game.name);
        app.paintingAllNumberButtons(app.getColorGame());
      },

      findGameOnArray: function findGameOnArray(name) {
        typesGame.map((item) => {
          if(item.name === name) {
            return item.selected = true;
          } else {
            return item.selected = false;
          }
        })
      },

      setGameSelected: function setGameSelected() {
        var gameSelected;
        typesGame.map((item) => {
          if(item.selected === true) {
            return gameSelected = item;
          }
        })

        return gameSelected;
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

        app.createButtonsGames();
      },

      isReady: function isReady() {
        return this.readyState === 4 && this.status === 200;
      },

      removeItemOnCart: function removeItemOnCart() {
        var child = this.parentNode;
        var parent = this.parentNode.parentNode;
        var index = Array.prototype.indexOf.call(parent.children, child);

        games.splice(index, 1);
        app.totalPrice();
        return this.parentNode.remove();
      },

      createButtonsGames: function createButtonsGames() {
        var $gamesType = $('[data-js="games-type"]').get();
        const $fragment = doc.createDocumentFragment();

        var $game1 = doc.createElement('button');
        var $game2 = doc.createElement('button');
        var $game3 = doc.createElement('button');

        $game1.textContent = typesGame[0].name;
        $game1.addEventListener('click', this.createNumbers, false);
        $game1.setAttribute('data-js', 'button-game1');

        $game2.textContent = typesGame[1].name;
        $game2.addEventListener('click', this.createNumbers, false);
        $game2.setAttribute('data-js', 'button-game2');

        $game3.textContent = typesGame[2].name;
        $game3.addEventListener('click', this.createNumbers, false);
        $game3.setAttribute('data-js', 'button-game3');

        $fragment.appendChild($game1);
        $fragment.appendChild($game2);
        $fragment.appendChild($game3);

        $gamesType.appendChild($fragment);
        app.gamesStyleDefault();
      },

      createNumbers: function createNumbers() {
        var $gameName = $('[data-js="game-name"]').get();
        var $gameDescription = $('[data-js="game-description"]').get(); 
        var $betItems = $('[data-js="bet-items"]').get();
        const $fragment = doc.createDocumentFragment();
        var name = this.innerText;

        $betItems.innerText = '';
        app.createGamesStyleWhenSelected(this.getAttribute('data-js'));
        app.findGameOnArray(name);
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
        if(app.isThisNumberAlreadyOnArray(this.textContent)) {
          app.paintingNumberButton(this, '#ADC0C4');
          game.numbers.splice(game.numbers.indexOf(this.textContent), 1);
          return;
        } 
        
        else if (!app.isThisGameAlreadyFullOnArray() && !app.isThisNumberAlreadyOnArray(this.textContent)) {
          game.numbers.push(this.textContent);
        } 
        
        else {
          alert('Você já escolheu a quantidade máxima de números. Limpe o jogo ou adicione ao carrinho.')
        }

        app.paintingAllNumberButtons(app.getColorGame());
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

      clearGame: function clearGame() {
        app.paintingAllNumberButtons('#ADC0C4');
        game.numbers = [];
      },

      gamesStyleDefault: function gamesStyleDefault() {
        var $game1 = $('[data-js="button-game1"]').get();
        var $game2 = $('[data-js="button-game2"]').get();
        var $game3 = $('[data-js="button-game3"]').get();

        app.createGamesStyle($game1, typesGame[0]);
        app.createGamesStyle($game2, typesGame[1]);
        app.createGamesStyle($game3, typesGame[2]);
      },

      createGamesStyle: function createGamesStyle(buttonName, arr) {
        buttonName.style.borderColor = arr.color;
        buttonName.style.color = arr.color;
        buttonName.style.backgroundColor = '#FFFFFF';
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
    };
  })();

  app.init();
})(window.DOM, document);