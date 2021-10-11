(function(doc) {
  'use strict';

  var app = (function() {
    return {
      init: function init() {
        console.log('app init');
        this.gamesInfo();
      },

      gamesInfo: function gamesInfo() {
        console.log('games info');

        var ajax = new XMLHttpRequest();
        ajax.open('GET', 'games.json', true);
        ajax.send();
        ajax.addEventListener('readystatechange', this.getGamesInfo, false);
      },

      getGamesInfo: function getGamesInfo () {
        if (!app.isReady.call(this)) {
          return;
        }

        var data = JSON.parse(this.responseText);
        console.log('data:', data);

        var types = [];

        data.types.map((item) => {
          types.push({
            name: item.type,
            description: item.description,
            range: item.range,
            price: item.price,
            maxNumber: item["max-number"],
            color: item.color
          });
        })

        console.log('types', types);
      },

      isReady: function isReady () {
        return this.readyState === 4 && this.status === 200;
      },
    };

  })();
  app.init();
})(document);