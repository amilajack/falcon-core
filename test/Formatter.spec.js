// @flow
import SqliteFormatter from '../src/formatters/SqliteFormatter';

const tabbedKeywords = [
  'AND',
  'BETWEEN',
  'CASE',
  'ELSE',
  'END',
  'ON',
  'OR',
  'OVER',
  'WHEN'
];

const untabbedKeywords = [
  'FROM',
  'GROUP BY',
  'HAVING',
  'JOIN',
  'CROSS JOIN',
  'INNER JOIN',
  'LEFT JOIN',
  'RIGHT JOIN',
  'ORDER BY',
  'WHERE',
  'WITH',
  'SET'
];

const unchangedKeywords = [
  'IN',
  'ALL',
  'AS',
  'ASC',
  'DESC',
  'DISTINCT',
  'EXISTS',
  'NOT',
  'NULL',
  'LIKE'
];

describe('Formatters', () => {
  const numSpaces = 2;

  it('should format basic sqlite statement', () => {
    expect(SqliteFormatter('SELECT * FROM users')).toMatchSnapshot();
  });

  it('formatting a full SELECT query', () => {
    expect(
      SqliteFormatter(
        'SELECT a.b, c.d FROM a JOIN b on a.b = c.d WHERE a.b = 1 AND c.d = 1',
        numSpaces
      )
    ).toMatchSnapshot();
  });

  it('formatting a full UPDATE query', () => {
    expect(
      SqliteFormatter('UPDATE a SET a.b = 1, a.c = 2 WHERE a.d = 3', numSpaces)
    ).toMatchSnapshot();
  });

  it('formatting a full DELETE query', () => {
    expect(
      SqliteFormatter('DELETE FROM a WHERE a.b = 1 AND a.c = 2', numSpaces)
    ).toMatchSnapshot();
  });

  describe('SqliteFormatter', () => {
    describe('formatting of tabbed keywords', () => {
      tabbedKeywords.forEach(word => {
        it(`formatting of '${word}'`, () => {
          expect(SqliteFormatter(`foo ${word} bar`, 2)).toMatchSnapshot();
        });
      });
    });

    describe('formatting of untabbed keywords', () => {
      untabbedKeywords.forEach(word => {
        it(`formatting of '${word}'`, () => {
          expect(SqliteFormatter(`foo ${word} bar`, 2)).toMatchSnapshot();
        });
      });
    });

    describe('formatting of unchanged keywords', () => {
      unchangedKeywords.forEach(word => {
        it(`formatting of '${word}'`, () => {
          expect(SqliteFormatter(`foo ${word} bar`, 2)).toMatchSnapshot();
        });
      });
    });

    describe('SELECTs', () => {
      it("formatting of 'SELECT'", () => {
        expect(SqliteFormatter('SELECT foo bar', 2)).toMatchSnapshot();
      });
      it("formatting of ' SELECT'", () => {
        expect(SqliteFormatter(' SELECT foo bar', 2)).toMatchSnapshot();
      });
      it("formatting of '(SELECT'", () => {
        expect(SqliteFormatter('foo (SELECT bar', 2)).toMatchSnapshot();
      });
      it("formatting of '( SELECT'", () => {
        expect(SqliteFormatter('foo ( SELECT bar', 2)).toMatchSnapshot();
      });
      it("formatting of ') SELECT'", () => {
        expect(SqliteFormatter('foo) SELECT bar', 2)).toMatchSnapshot();
      });
      it("formatting of ')SELECT'", () => {
        expect(SqliteFormatter('foo)SELECT bar', 2)).toMatchSnapshot();
      });
      it('Formatting when selecting multiple fields', () => {
        expect(SqliteFormatter('SELECT foo, bar, baz', 2)).toMatchSnapshot();
      });
    });

    describe('UPDATEs', () => {
      it("formatting of 'UPDATE'", () => {
        expect(SqliteFormatter('UPDATE foo bar', 2)).toMatchSnapshot();
      });
      it("formatting of ' UPDATE'", () => {
        expect(SqliteFormatter(' UPDATE foo bar', 2)).toMatchSnapshot();
      });
    });

    describe('DELETEs', () => {
      it("formatting of 'DELETE'", () => {
        expect(SqliteFormatter('DELETE foo bar', 2)).toMatchSnapshot();
      });
      it("formatting of ' DELETE'", () => {
        expect(SqliteFormatter(' DELETE foo bar', 2)).toMatchSnapshot();
      });
    });

    describe('special case keywords', () => {
      it("formatting of 'THEN'", () => {
        expect(SqliteFormatter('foo THEN bar', 2)).toMatchSnapshot();
      });
      it("formatting of 'UNION'", () => {
        expect(SqliteFormatter('foo UNION bar', 2)).toMatchSnapshot();
      });
      it("formatting of 'USING'", () => {
        expect(SqliteFormatter('foo USING bar', 2)).toMatchSnapshot();
      });
    });

    describe('nested queries', () => {
      it('formatting of single nested query', () => {
        expect(
          SqliteFormatter('SELECT foo FROM (SELECT bar FROM baz)', 2)
        ).toMatchSnapshot();
      });

      it('formatting of multiple nested queries', () => {
        expect(
          SqliteFormatter(
            'SELECT foo FROM (SELECT bar FROM (SELECT baz FROM quux))',
            2
          )
        ).toMatchSnapshot();
      });
    });
  });
});
