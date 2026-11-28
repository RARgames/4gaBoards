const { expect } = require('chai');

const { toLabelColor } = require('../../utils/colorValidator');

describe('toLabelColor', () => {
  it('keeps a valid colour', () => {
    expect(toLabelColor('#123abc')).to.equal('#123abc');
  });

  it('maps Trello colour names, including dark and light variants', () => {
    expect(toLabelColor('green')).to.equal('#00c853');
    expect(toLabelColor('blue_dark')).to.equal('#109dc0');
  });

  it('maps colour names from older 4ga Boards exports', () => {
    expect(toLabelColor('lagoon-blue')).to.equal('#109dc0');
  });

  it('falls back to the default colour', () => {
    expect(toLabelColor('not-a-colour')).to.equal('#e04556');
    expect(toLabelColor(null)).to.equal('#e04556');
    expect(toLabelColor('constructor')).to.equal('#e04556');
  });
});
