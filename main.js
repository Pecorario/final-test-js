(function($, doc) {
  'use strict';

  var app = (function() {
    var typesGame = [];
    var games = [];
    var game = {}

    return {
      init: function init() {
        this.gamesInfo();
        this.initEvents();
      },

      initEvents() {
        $('[data-js="button-add"]').on('click', this.handleSubmit);
        $('[data-js="button-clear-game"]').on('click', this.clearGame);
      },

      handleSubmit: function handleSubmit(e) {
        e.preventDefault();
        games.push(game);
        console.log('Novo jogo adicionado: ', games);
        app.clearGame();
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
            active: false,
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
        this.createGamesStyle($game1, typesGame[0]);

        $game2.textContent = typesGame[1].name;
        $game2.addEventListener('click', this.createNumbers, false);
        $game2.setAttribute('data-js', 'button-game2');
        this.createGamesStyle($game2, typesGame[1]);
        

        $game3.textContent = typesGame[2].name;
        $game3.addEventListener('click', this.createNumbers, false);
        $game3.setAttribute('data-js', 'button-game3');
        this.createGamesStyle($game3, typesGame[2]);

        $fragment.appendChild($game1);
        $fragment.appendChild($game2);
        $fragment.appendChild($game3);

        $gamesType.appendChild($fragment);
      },

      createNumbers: function createNumbers() {
        var $gameName = $('[data-js="game-name"]').get();
        var $gameDescription = $('[data-js="game-description"]').get();

        var name = this.innerText;
        var size, description, price, maxNumber;

        app.createGamesStyleWhenSelected(this.getAttribute('data-js'));
        
        typesGame.map((item) => {
          if(item.name === name) {
            price = item.price;
            size = item.range;
            description = item.description;
            maxNumber = item.maxNumber;
            item.selected = true;
          } else {
            item.selected = false;
          }
        })

        game.name = name;
        game.numbers = [];
        game.size = size;
        game.price = price;

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
        console.log('cheguei no select number');
        var color;

        typesGame.map((item) => {
          if(item.selected) {
            color = item.color;
          }
        })

        game.numbers.push(this.textContent);
        this.style.backgroundColor = color;
      },

      clearGame: function clearGame() {
        game.numbers.map((number) => {
          $('[data-js="bet-item"]').map((item) => {
            if(number === item.textContent) {
              item.style.backgroundColor = '#ADC0C4';
            } 
          })
        });
        
        game.numbers = [];
        console.log('limpar o jogo', game);
      },

      createGamesStyle: function createGamesStyle(buttonName, arr) {
        buttonName.style.borderColor = arr.color;
        buttonName.style.color = arr.color;
        buttonName.style.backgroundColor = '#FFFFFF';
      },

      createGamesStyleWhenSelected: function createGamesStyleWhenSelected(buttonName) {
        var $game1 = $('[data-js="button-game1"]').get();
        var $game2 = $('[data-js="button-game2"]').get();
        var $game3 = $('[data-js="button-game3"]').get();

        this.createGamesStyle($game1, typesGame[0]);
        this.createGamesStyle($game2, typesGame[1]);
        this.createGamesStyle($game3, typesGame[2]);

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