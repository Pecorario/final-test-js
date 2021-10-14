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
        games.push(game); // ta enviando duplicado e sobrescrevendo o antigo
        console.log('Novo jogo adicionado: ', games);
        // app.clearGame(); ta limpando antes de dar o push no games
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
        console.log('Array sortido: ', game.numbers);
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

      createButtonsGames: function createButtonsGames() {
        var $gamesType = $('[data-js="games-type"]').get();
        const $fragment = doc.createDocumentFragment();

        // dá pra fazer isso de forma dinâmica?
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

        var name = this.innerText;
        var size, description, price, maxNumber;

        app.createGamesStyleWhenSelected(this.getAttribute('data-js'));
        app.findGameOnArray(name);
        
        typesGame.map((item) => {
          if(item.name === name) {
            description = item.description;
            size = item.range;
            price = item.price;
            maxNumber = item.maxNumber;
          }
        })

        game = {
          name: name,
          numbers: [],
          size: size,
          price: price,
          maxNumber: maxNumber
        };

        console.log('game: ', game);

        $gameName.textContent = `FOR ${name.toUpperCase()}`;
        $gameDescription.textContent = description;

        var $betItems = $('[data-js="bet-items"]').get();
        $betItems.innerText = '';
        const $fragment = doc.createDocumentFragment();

        for(var i = 0;i < size;i++) {
          var $number = doc.createElement('button');
          $number.setAttribute('class', 'bet-item');
          $number.setAttribute('data-js', 'bet-item');

          $number.textContent = i + 1;

          $number.addEventListener('click', app.selectNumber, false);
          $fragment.appendChild($number);
        }

        $betItems.appendChild($fragment);
      },

      selectNumber: function selectNumber() {
        if(app.isThisNumberAlreadyOnArray(this.textContent)) {
          app.paintingNumberButton(this, '#ADC0C4');
          game.numbers.splice(game.numbers.indexOf(this.textContent), 1);
          return;
        } 
        
        else if (!app.isThisGameAlreadyFullOnArray() && !app.isThisNumberAlreadyOnArray(this.textContent)) {
          console.log('Dei um push');
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
        console.log('limpar o jogo', game);
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