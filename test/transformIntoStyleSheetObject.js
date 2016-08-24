import assert from 'assert';
import { parse } from 'babylon';
import transform from '../src/transformIntoStyleSheetObject';

describe('transformIntoStyleSheetObject', () => {
  function getExprAndCode(source) {
		var code = 'var _ =' + source;
		var expr = parse('var _ =' + source).program.body[0].declarations[0].init;

		return { code: code, expr: expr };
  }

  function testValidInput(input, expected, context) {
    var exprAndCode = getExprAndCode(input);

    assert.deepEqual(transform(exprAndCode.expr, context, exprAndCode.code), expected);
  }

  function testInvalidInput(input, message) {
    var exprAndCode = getExprAndCode(input);

    assert.throws(() => {
      transform(exprAndCode.expr, void 0, exprAndCode.code);
    }, message || assert.AssertionError);
  }

  it('transforms valid input properly', () => {
    testValidInput('{}', {});
    testValidInput('function() { return {} }', {});
    testValidInput('()=>{ return {} }', {});
    testValidInput('()=>( {} )', {});


    testValidInput('{ foo: {} }', { foo: {} });
    testValidInput('function() { return { foo: {} } }', { foo: {} });
    testValidInput('()=>{ return { foo: {} } }', { foo: {} });
    testValidInput('()=>({ foo: {} })', { foo: {} });


    testValidInput('{ "foo foo": {} }', { 'foo foo': {} });
    testValidInput('function() { return { "foo foo": {} } }', { 'foo foo': {} });
    testValidInput('()=>{ return { "foo foo": {} } }', { 'foo foo': {} });
    testValidInput('()=>({ "foo foo": {} })', { 'foo foo': {} });


    testValidInput('{ foo: { bar: 123 } }', { foo: { bar: 123 } });
    testValidInput('function() { return { foo: { bar: 123 } } }', { foo: { bar: 123 } });
    testValidInput('()=>{ return { foo: { bar: 123 } } }', { foo: { bar: 123 } });
    testValidInput('()=>({ foo: { bar: 123 } })', { foo: { bar: 123 } });


    testValidInput('{ foo: { bar: "baz" } }', { foo: { bar: 'baz' } });
    testValidInput('function() { return { foo: { bar: "baz" } } }', { foo: { bar: 'baz' } });
    testValidInput('()=>{ return { foo: { bar: "baz" } } }', { foo: { bar: 'baz' } });
    testValidInput('()=>({ foo: { bar: "baz" } })', { foo: { bar: 'baz' } });


    testValidInput('{ foo: { bar: baz } }', { foo: { bar: 'BAZ' } }, { baz: 'BAZ' });
    testValidInput('function(context) { return { foo: { bar: context.baz } } }', { foo: { bar: 'BAZ' } }, { baz: 'BAZ' });
    testValidInput('(context)=>{ return { foo: { bar: context.baz } } }', { foo: { bar: 'BAZ' } }, { baz: 'BAZ' });
    testValidInput('(context)=>({ foo: { bar: context.baz } })', { foo: { bar: 'BAZ' } }, { baz: 'BAZ' });


    testValidInput('{ foo: { bar: "baz" + "bam" } }', { foo: { bar: 'bazbam' } });
    testValidInput('function() { return { foo: { bar: "baz" + "bam" } } }', { foo: { bar: 'bazbam' } });
    testValidInput('()=>{ return { foo: { bar: "baz" + "bam" } } }', { foo: { bar: 'bazbam' } });
    testValidInput('()=>({ foo: { bar: "baz" + "bam" } })', { foo: { bar: 'bazbam' } });


    testValidInput('{ foo: { bar: baz + " " + bam } }', { foo: { bar: 'BAZ BAM' } }, { baz: 'BAZ', bam: 'BAM' });
    testValidInput('function(context) { return { foo: { bar: context.baz + " " + context.bam } } }', { foo: { bar: 'BAZ BAM' } }, { baz: 'BAZ', bam: 'BAM' });
    testValidInput('(context)=>{ return { foo: { bar: context.baz + " " + context.bam } } }', { foo: { bar: 'BAZ BAM' } }, { baz: 'BAZ', bam: 'BAM' });
    testValidInput('(context)=>({ foo: { bar: context.baz + " " + context.bam } })', { foo: { bar: 'BAZ BAM' } }, { baz: 'BAZ', bam: 'BAM' });
    testValidInput('context=>({ foo: { bar: context.baz + " " + context.bam } })', { foo: { bar: 'BAZ BAM' } }, { baz: 'BAZ', bam: 'BAM' });


    testValidInput('{ foo: { bar: a * (b + c) + "px" } }', { foo: { bar: '14px' } }, { a: 2, b: 3, c: 4 });
    testValidInput('function(context) { return { foo: { bar: context.a * (context.b + context.c) + "px" } } }', { foo: { bar: '14px' } }, { a: 2, b: 3, c: 4 });
    testValidInput('(context)=>{ return { foo: { bar: context.a * (context.b + context.c) + "px" } } }', { foo: { bar: '14px' } }, { a: 2, b: 3, c: 4 });
    testValidInput('(context)=>({ foo: { bar: context.a * (context.b + context.c) + "px" } })', { foo: { bar: '14px' } }, { a: 2, b: 3, c: 4 });
    testValidInput('context=>({ foo: { bar: context.a * (context.b + context.c) + "px" } })', { foo: { bar: '14px' } }, { a: 2, b: 3, c: 4 });


    testValidInput('{ foo: { bar: a.b } }', { foo: { bar: 'c' } }, { a: { b: 'c' } });
    testValidInput('function(context) { return { foo: { bar: context.a.b } } }', { foo: { bar: 'c' } }, { a: { b: 'c' } });
    testValidInput('(context)=>{ return { foo: { bar: context.a.b } } }', { foo: { bar: 'c' } }, { a: { b: 'c' } });
    testValidInput('(context)=>({ foo: { bar: context.a.b } })', { foo: { bar: 'c' } }, { a: { b: 'c' } });
    testValidInput('context=>({ foo: { bar: context.a.b } })', { foo: { bar: 'c' } }, { a: { b: 'c' } });


    testValidInput('{ foo: { content: " " } }', { foo: { content: " " } });
    testValidInput('function() { return { foo: { content: " " } } }', { foo: { content: " " } });
    testValidInput('()=>{ return { foo: { content: " " } } }', { foo: { content: " " } });
    testValidInput('()=>({ foo: { content: " " } })', { foo: { content: " " } });


    testValidInput('{ ["foo"]: {} }', { foo: {} });
    testValidInput('function() { return { ["foo"]: {} } }', { foo: {} });
    testValidInput('()=>{ return { ["foo"]: {} } }', { foo: {} });
    testValidInput('()=>({ ["foo"]: {} })', { foo: {} });


    testValidInput('{ undefined: {} }', { undefined: {} });
    testValidInput('function() { return { undefined: {} } }', { undefined: {} });
    testValidInput('()=>{ return { undefined: {} } }', { undefined: {} });
    testValidInput('()=>({ undefined: {} })', { undefined: {} });


    testValidInput(`{
      foo: {
        'bar': 'baz',
        bam: 123
      },

      'test 1': {
        test2: {
          'test 3': {
            test4: 'test5'
          }
        },

        'test 6': 'test 7',

        test8: {
          'test 9': 'test 10'
        }
      }
    }`, {
      foo: {
        'bar': 'baz',
        bam: 123
      },
      'test 1': {
        test2: {
          'test 3': {
            test4: 'test5'
          }
        },
        'test 6': 'test 7',
        test8: {
          'test 9': 'test 10'
        }
      }
    });

    testValidInput(`(context)=>({
      foo: {
        'bar': 'baz',
        bam: 123
      },

      'test 1': {
        test2: {
          'test 3': {
            test4: 'test5'
          }
        },

        'test 6': 'test 7',

        test8: {
          'test 9': 'test 10'
        }
      }
    })`, {
      foo: {
        'bar': 'baz',
        bam: 123
      },
      'test 1': {
        test2: {
          'test 3': {
            test4: 'test5'
          }
        },
        'test 6': 'test 7',
        test8: {
          'test 9': 'test 10'
        }
      }
    });

    testValidInput(`context=>{

      const { __ios__, __android__, env } = context;

      const buttonSize = 100;
      let marginList = [10,8,10,8];

      if( __ios__ ) {
        marginList = marginList.map( v=> v - 2 );
      }

      return {
        button: {
          width: buttonSize,
          margin: marginList.map( v=>v+'px' ).join(' '),
          color: __android__ ? 'red' : 'blue',
          border: env === 'development' ? '2px solid red' : 'none'
        },
      };
    }`, {
      button: {
        width: 100,
        margin: '8px 6px 8px 6px',
        color: 'blue',
        border: 'none',
      }
    }, {
      __ios__: true,
      __android__: false,
      env: 'production',
    });

    testValidInput(`context=>{

      const { min } = context;
      function max(a, b) {
        return a > b ? a : b;
      }

      return {
        button: {
          width: max( 100, 90 ),
          height: min( 50, 40 ),
        },
      };
    }`, {
      button: {
        width: 100,
        height: 40,
      }
    }, {
      min: function( a, b ) {
        return a < b ? a : b;
      }
    });
  });

  it('throws on invalid input', () => {
    testInvalidInput('"foo"',     /must be a object expression or function expression/);
    testInvalidInput('123',       /must be a object expression or function expression/);
    testInvalidInput('[]',        /must be a object expression or function expression/);
    testInvalidInput('true',      /must be a object expression or function expression/);
    testInvalidInput('false',     /must be a object expression or function expression/);
    testInvalidInput('null',      /must be a object expression or function expression/);
    testInvalidInput('undefined', /must be a object expression or function expression/);

    testInvalidInput('{ foo: "bar" }',  /top-level value must be a object expression/);
    testInvalidInput('{ foo: [] }',     /top-level value must be a object expression/);

    testInvalidInput('{ foo: { bar: null } }',  /value must be a string or number/);
    testInvalidInput('{ foo: { bar: true } }',  /value must be a string or number/);
    testInvalidInput('{ foo: { bar: false } }', /value must be a string or number/);
    testInvalidInput('{ foo: { bar: null } }',  /value must be a string or number/);
    testInvalidInput('{ foo: { bar: "" } }',    /string value cannot be blank/);
    testInvalidInput('{ foo: { bar: "  " } }',  /string value cannot be blank/);

    testInvalidInput('{ foo: { bar: [] } }',              /unexpected/);
    testInvalidInput('{ foo: { bar: Math.PI } }',         /unexpected/);
    testInvalidInput('{ foo: { bar: undefined } }',       /unexpected/);
    testInvalidInput('{ foo: { bar: missing + "bam" } }', /unexpected/);
    testInvalidInput('{ foo: { bar: baz[0] } }',          /unexpected/);

    testInvalidInput('{ [null]: {} }',  /key must be a string or identifier/);
    testInvalidInput('{ [123]: {} }',   /key must be a string or identifier/);
    testInvalidInput('{ [true]: {} }',  /key must be a string or identifier/);
    testInvalidInput('{ [false]: {} }', /key must be a string or identifier/);
  });
});