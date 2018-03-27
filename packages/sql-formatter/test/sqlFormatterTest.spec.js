import sqlFormatter from './../src';

describe('sqlFormatter', () => {
  it('throws error when unsupported language parameter specified', () => {
    expect(() => {
      sqlFormatter.format('SELECT *', { language: 'blah' });
    }).toThrow('Unsupported SQL dialect: blah');
  });
});
