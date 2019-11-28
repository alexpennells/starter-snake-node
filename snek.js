const snek = {
  start: () => {
    return {
      color: '#ff3377',
      headType: 'silly',
      tailType: 'bolt',
    };
  },

  move: (request) => {
    return {
      move: 'down',
    };
  },

  end: () => {
    return {};
  },
}

module.exports = {
  snek,
}

