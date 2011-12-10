var vows         = require('vows')
  , assert       = require('assert')
  , xmlrpcParser = require('../lib/xmlrpc-parser.js')

vows.describe('XML-RPC Parser').addBatch({
  //////////////////////////////////////////////////////////////////////
  // Test parseMethodResponse functionality
  //////////////////////////////////////////////////////////////////////
  'A parseMethodResponse call' : {
    // Test Array
    'with an Array param' : {
      topic: function() {
        var xml = '<methodResponse><params>'
          + '<param><value><array><data><value><int>178</int></value><value><string>testString</string></value></data></array></value></param>'
          + '</params></methodResponse>'
        xmlrpcParser.parseMethodResponse(xml, this.callback)
        xmlrpcParser.close()
      }
    , 'contains an array of arrays' : function (error, value) {
        assert.isNull(error)
        assert.isArray(value, 'array')
        assert.deepEqual(value, [178, 'testString'])
      }
    }
  , 'with an empty Array param' : {
      topic: function() {
        var xml = '<methodResponse><params>'
          + '<param><value><array><data></data></array></value></param>'
          + '</params></methodResponse>'
        xmlrpcParser.parseMethodResponse(xml, this.callback)
        xmlrpcParser.close()
      }
    , 'contains an empty array' : function (error, value) {
        assert.isNull(error)
        assert.isArray(value, 'array')
        assert.deepEqual(value, [])
      }
    }
  , 'with a nested Array param' : {
      topic: function() {
        var xml = '<methodResponse><params>'
          + '<param><value><array><data><value><int>178</int></value><value><string>testLevel1String</string></value><value><array><data><value><string>testString</string></value><value><int>64</int></value></data></array></value></data></array></value></param>'
          + '</params></methodResponse>'
        xmlrpcParser.parseMethodResponse(xml, this.callback)
        xmlrpcParser.close()
      }
    , 'contains an array of arrays' : function (error, value) {
        assert.isNull(error)
        assert.isArray(value, 'array')
        assert.deepEqual(value, [178, 'testLevel1String', ['testString', 64]])
      }
    }
  , 'with a nested Array param and values after the nested array' : {
      topic: function() {
        var xml = '<methodResponse><params>'
          + '<param><value><array><data><value><int>178</int></value><value><string>testLevel1String</string></value><value><array><data><value><string>testString</string></value><value><int>64</int></value></data></array></value><value><string>testLevel1StringAfter</string></value></data></array></value></param>'
          + '</params></methodResponse>'
        xmlrpcParser.parseMethodResponse(xml, this.callback)
        xmlrpcParser.close()
      }
    , 'contains an array of arrays' : function (error, value) {
        assert.isNull(error)
        assert.isArray(value, 'array')
        assert.deepEqual(value, [178, 'testLevel1String', ['testString', 64], 'testLevel1StringAfter'])
      }
    }
    // Test Boolean
  , 'with a true Boolean param' : {
      topic: function() {
        var xml = '<methodResponse><params>'
          + '<param><value><boolean>1</boolean></value></param>'
          + '</params></methodResponse>'
        xmlrpcParser.parseMethodResponse(xml, this.callback)
        xmlrpcParser.close()
      }
    , 'contains an array with a true value' : function (error, value) {
        assert.isNull(error)
        assert.typeOf(value, 'boolean')
        assert.strictEqual(value, true)
      }
    }
  , 'with a false Boolean param' : {
      topic: function() {
        var xml = '<methodResponse><params>'
          + '<param><value><boolean>0</boolean></value></param>'
          + '</params></methodResponse>'
        xmlrpcParser.parseMethodResponse(xml, this.callback)
        xmlrpcParser.close()
      }
    , 'contains an array with a false value' : function (error, value) {
        assert.isNull(error)
        assert.typeOf(value, 'boolean')
        assert.strictEqual(value, false)
      }
    }
    // Test DateTime
  , 'with a Datetime param' : {
      topic: function() {
        var xml = '<methodResponse><params>'
          + '<param><value><dateTime.iso8601>20120608T11:35:10</dateTime.iso8601></value></param>'
          + '</params></methodResponse>'
        xmlrpcParser.parseMethodResponse(xml, this.callback)
        xmlrpcParser.close()
      }
    , 'contains the Date object' : function (error, value) {
        assert.isNull(error)
        assert.typeOf(value, 'date')
        assert.deepEqual(value, new Date(2012, 05, 08, 11, 35, 10))
      }
    }
    // Test Base64
  , 'with a Base64 param' : {
      topic: function() {
        var xml = '<methodResponse><params>'
          + '<param><value><base64>dGVzdGluZw==</base64></value></param>'
          + '</params></methodResponse>'
        xmlrpcParser.parseMethodResponse(xml, this.callback)
        xmlrpcParser.close()
      }
    , 'contains the base64 encoded string' : function (error, value) {
        assert.isNull(error)
        assert.isObject(value)
        assert.deepEqual(value, new Buffer('dGVzdGluZw==', 'base64'))
      }
    }
    // Test Double
  , 'with a positive Double param' : {
      topic: function() {
        var xml = '<methodResponse><params>'
          + '<param><value><double>4.11</double></value></param>'
          + '</params></methodResponse>'
        xmlrpcParser.parseMethodResponse(xml, this.callback)
        xmlrpcParser.close()
      }
    , 'contains the positive double' : function (error, value) {
        assert.isNull(error)
        assert.isNumber(value)
        assert.strictEqual(value, 4.11)
      }
    }
  , 'with a negative Double param' : {
      topic: function() {
        var xml = '<methodResponse><params>'
          + '<param><value><double>-4.2221</double></value></param>'
          + '</params></methodResponse>'
        xmlrpcParser.parseMethodResponse(xml, this.callback)
        xmlrpcParser.close()
      }
    , 'contains the positive double' : function (error, value) {
        assert.isNull(error)
        assert.isNumber(value)
        assert.strictEqual(value, -4.2221)
      }
    }
    // Test Fault
  , 'with a fault' : {
      topic: function() {
        var xml = '<methodResponse><fault>'
          + '<value><struct><member><name>faultCode</name><value><int>4</int></value></member><member><name>faultString</name><value><string>Too many parameters.</string></value></member></struct></value>'
          + '</fault></methodResponse>'
        xmlrpcParser.parseMethodResponse(xml, this.callback)
        xmlrpcParser.close()
      }
    , 'contains the error object' : function (error, value) {
        assert.isObject(error)
        assert.instanceOf(error, Error)
        // Avoids Deep Equal of error because stack includes local paths
        assert.include(error, 'stack')
        assert.strictEqual(error.message, 'Too many parameters.')
        assert.strictEqual(error.faultString, 'Too many parameters.')
        assert.strictEqual(error.faultCode, 4)
      }
    }
  , 'with an empty fault' : {
      topic: function() {
        var xml = '<?xml version="1.0"?><methodResponse><fault>'
          + '<value/>'
          + '</fault></methodResponse>'
        xmlrpcParser.parseMethodResponse(xml, this.callback)
        xmlrpcParser.close()
      }
    , 'contains the error object' : function (error, value) {
        assert.isObject(error)
        assert.instanceOf(error, Error)
        assert.include(error, 'stack')
      }
    }
    // Test Integer
  , 'with a positive Int param' : {
      topic: function() {
        var xml = '<methodResponse><params>'
          + '<param><value><int>4</int></value></param>'
          + '</params></methodResponse>'
        xmlrpcParser.parseMethodResponse(xml, this.callback)
        xmlrpcParser.close()
      }
    , 'contains the positive integer' : function (error, value) {
        assert.isNull(error)
        assert.isNumber(value)
        assert.strictEqual(value, 4)
      }
    }
  , 'with a positive I4 param' : {
      topic: function() {
        var xml = '<methodResponse><params>'
          + '<param><value><i4>6</i4></value></param>'
          + '</params></methodResponse>'
        xmlrpcParser.parseMethodResponse(xml, this.callback)
        xmlrpcParser.close()
      }
    , 'contains the positive integer' : function (error, value) {
        assert.isNull(error)
        assert.isNumber(value)
        assert.strictEqual(value, 6)
      }
    }
  , 'with a positive I8 param' : {
      topic: function() {
        var xml = '<methodResponse><params>'
          + '<param><value><i8>6</i8></value></param>'
          + '</params></methodResponse>'
        xmlrpcParser.parseMethodResponse(xml, this.callback)
        xmlrpcParser.close()
      }
    , 'contains the positive integer' : function (error, value) {
      assert.isNull(error)
      assert.isNumber(value)
      assert.strictEqual(value, 6)
    }
  }
  , 'with a negative Int param' : {
      topic: function() {
        var xml = '<methodResponse><params>'
          + '<param><value><int>-14</int></value></param>'
          + '</params></methodResponse>'
        xmlrpcParser.parseMethodResponse(xml, this.callback)
        xmlrpcParser.close()
      }
    , 'contains the negative integer' : function (error, value) {
        assert.isNull(error)
        assert.isNumber(value)
        assert.strictEqual(value, -14)
      }
    }
  , 'with a negative I4 param' : {
      topic: function() {
        var xml = '<methodResponse><params>'
          + '<param><value><i4>-26</i4></value></param>'
          + '</params></methodResponse>'
        xmlrpcParser.parseMethodResponse(xml, this.callback)
        xmlrpcParser.close()
      }
    , 'contains the negative integer' : function (error, value) {
        assert.isNull(error)
        assert.isNumber(value)
        assert.strictEqual(value, -26)
      }
    }
  , 'with a negative I8 param' : {
      topic: function() {
        var xml = '<methodResponse><params>'
          + '<param><value><i8>-26</i8></value></param>'
          + '</params></methodResponse>'
        xmlrpcParser.parseMethodResponse(xml, this.callback)
        xmlrpcParser.close()
      }
    , 'contains the negative integer' : function (error, value) {
        assert.isNull(error)
        assert.isNumber(value)
        assert.strictEqual(value, -26)
      }
    }
  , 'with a Int param of 0' : {
      topic: function() {
        var xml = '<methodResponse><params>'
          + '<param><value><int>0</int></value></param>'
          + '</params></methodResponse>'
        xmlrpcParser.parseMethodResponse(xml, this.callback)
        xmlrpcParser.close()
      }
    , 'contains the value 0' : function (error, value) {
        assert.isNull(error)
        assert.isNumber(value)
        assert.strictEqual(value, 0)
      }
    }
  , 'with a I4 param of 0' : {
      topic: function() {
        var xml = '<methodResponse><params>'
          + '<param><value><i4>0</i4></value></param>'
          + '</params></methodResponse>'
        xmlrpcParser.parseMethodResponse(xml, this.callback)
        xmlrpcParser.close()
      }
    , 'contains the value 0' : function (error, value) {
        assert.isNull(error)
        assert.isNumber(value)
        assert.deepEqual(value, 0)
      }
    }
  , 'with a I8 param of 0' : {
      topic: function() {
        var xml = '<methodResponse><params>'
          + '<param><value><i8>0</i8></value></param>'
          + '</params></methodResponse>'
        xmlrpcParser.parseMethodResponse(xml, this.callback)
        xmlrpcParser.close()
      }
    , 'contains the value 0' : function (error, value) {
        assert.isNull(error)
        assert.isNumber(value)
        assert.deepEqual(value, 0)
      }
    }
    // Test String
  , 'with a String param' : {
      topic: function() {
        var xml = '<methodResponse><params>'
          + '<param><value><string>testString</string></value></param>'
          + '</params></methodResponse>'
        xmlrpcParser.parseMethodResponse(xml, this.callback)
        xmlrpcParser.close()
      }
    , 'contains the string' : function (error, value) {
        assert.isNull(error)
        assert.isString(value)
        assert.strictEqual(value, 'testString')
      }
    }
  , 'with an empty String param' : {
      topic: function() {
        var xml = '<methodResponse><params>'
          + '<param><value><string/></value></param>'
          + '</params></methodResponse>'
        xmlrpcParser.parseMethodResponse(xml, this.callback)
        xmlrpcParser.close()
      }
    , 'contains the empty string' : function (error, value) {
        assert.isNull(error)
        assert.isString(value)
        assert.strictEqual(value, '')
      }
    }
    // Test Struct
  , 'with a Struct param' : {
      topic: function() {
        var xml = '<methodResponse><params>'
          + '<param><value><struct><member><name>the-Name</name><value><string>testValue</string></value></member></struct></value></param>'
          + '</params></methodResponse>'
        xmlrpcParser.parseMethodResponse(xml, this.callback)
        xmlrpcParser.close()
      }
    , 'contains the object' : function (error, value) {
        assert.isNull(error)
        assert.isObject(value)
        assert.deepEqual(value, { 'the-Name': 'testValue'})
      }
    }
  , 'with a Struct param and whitespace after the name element' : {
      topic: function() {
        var xml = '<methodResponse><params>'
          + '<param><value><struct><member><name>the-Name</name>    \n<value><string>testValue</string></value></member></struct></value></param>'
          + '</params></methodResponse>'
        xmlrpcParser.parseMethodResponse(xml, this.callback)
        xmlrpcParser.close()
      }
    , 'contains the object' : function (error, value) {
        assert.isNull(error)
        assert.isObject(value)
        assert.deepEqual(value, { 'the-Name': 'testValue'})
      }
    }
  , 'with a nested Struct param' : {
      topic: function() {
        var xml = '<methodResponse><params>'
          + '<param><value><struct><member><name>theName</name><value><string>testValue</string></value></member><member><name>anotherName</name><value><struct><member><name>nestedName</name><value><string>nestedValue</string></value></member></struct></value></member><member><name>lastName</name><value><string>Smith</string></value></member></struct></value></param>'
          + '</params></methodResponse>'
        xmlrpcParser.parseMethodResponse(xml, this.callback)
        xmlrpcParser.close()
      }
    , 'contains the objects' : function (error, value) {
        assert.isNull(error)
        assert.isObject(value)
        assert.deepEqual(value, { theName: 'testValue', anotherName: {nestedName: 'nestedValue' }, lastName: 'Smith'})
      }
    }
    // The grinder
  , 'with a mix of everything' : {
      topic: function() {
        var xml = '<methodResponse><params>'
          + '<param><value><array><data>'
            + '<value><struct><member><name>theName</name><value><string>testValue</string></value></member><member><name>anotherName</name><value><struct><member><name>nestedName</name><value><string>nestedValue</string></value></member></struct></value></member><member><name>lastName</name><value><string>Smith</string></value></member></struct></value>'
            + '<value><array><data>'
              + '<value><struct><member><name>yetAnotherName</name><value><double>1999.26</double></value></member></struct></value>'
              + '<value><string>moreNested</string></value>'
            + '</data></array></value>'
          + '</data></array></value></param>'
          + '</params></methodResponse>'
        xmlrpcParser.parseMethodResponse(xml, this.callback)
        xmlrpcParser.close()
      }
    , 'contains the objects' : function (error, value) {
        assert.isNull(error)
        assert.isArray(value)
          var expected = [
            { theName: 'testValue', anotherName: {nestedName: 'nestedValue' }, lastName: 'Smith' }
          , [
              { yetAnotherName: 1999.26}
            , 'moreNested'
            ]
          ]
        assert.deepEqual(value, expected)
      }
    }
    // Valid XML, invalid XML-RPC
  , 'with valid XML but invalid XML-RPC' : {
      topic: function() {
        var xml = '<?xml version="1.0" encoding="iso-8859-1"?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'
          + '<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">'
          + ' <head>'
          + '  <title>401 - Unauthorized</title>'
          + ' </head>'
          + ' <body>'
          + '  <h1>401 - Unauthorized</h1>'
          + ' </body>'
          + '</html>'
        xmlrpcParser.parseMethodResponse(xml, this.callback)
        xmlrpcParser.close()
      }
    , 'contains the error object' : function (error, value) {
        assert.isObject(error)
        assert.instanceOf(error, Error)
        assert.strictEqual(error.message, 'Invalid method response.')
      }
    }
    // Invalid XML
  , 'with invalid XML' : {
      topic: function() {
        var xml = '<html xmlns="http://www.w3.org/1999/xhtml">'
          + ' <head>'
          + '  <title>401 - Unauthorized</title>'
          + ' </head>'
          + ' <body>'
          + '  <h1>401 - Unauthorized</h1>'
          + '  <br>'
          + ' </body>'
          + '</html>'
        xmlrpcParser.parseMethodResponse(xml, this.callback)
        xmlrpcParser.close()
      }
    , 'contains the error object' : function (error, value) {
        assert.isObject(error)
        assert.instanceOf(error, Error)
        assert.strictEqual(error.message, 'Invalid method response.')
      }
    }
  // ROS (Robot Operating System) example
  , 'with a response that ROS would give' : {
      topic: function() {
        var xml = '<?xml version=\'1.0\'?><methodResponse><params><param><value><array><data><value><int>1</int></value><value><string>current system state</string></value><value><array><data><value><array><data><value><array><data><value><string>/rosout_agg</string></value><value><array><data><value><string>/rosout</string></value></data></array></value></data></array></value></data></array></value><value><array><data><value><array><data><value><string>/rosout</string></value><value><array><data><value><string>/rosout</string></value></data></array></value></data></array></value></data></array></value><value><array><data><value><array><data><value><string>/rosout/set_logger_level</string></value><value><array><data><value><string>/rosout</string></value></data></array></value></data></array></value><value><array><data><value><string>/rosout/get_loggers</string></value><value><array><data><value><string>/rosout</string></value></data></array></value></data></array></value></data></array></value></data></array></value></data></array></value></param></params></methodResponse>'
        xmlrpcParser.parseMethodResponse(xml, this.callback)
        xmlrpcParser.close()
      }
    , 'contains the objects' : function (error, value) {
        assert.isNull(error)
        assert.isArray(value)
        var expected = [1, 'current system state', [[['/rosout_agg', ['/rosout']]], [['/rosout', ['/rosout']]], [['/rosout/set_logger_level', ['/rosout']], ['/rosout/get_loggers', ['/rosout']]]]]
        assert.deepEqual(value, expected)
      }
    }
  , 'with a response that ROS would give (includes new lines)' : {
      topic: function() {
        var xml = ['<?xml version=\'1.0\'?>'
          , '<methodResponse>'
          , '<params>'
          , '<param>'
          , '<value><array><data>'
          , '<value><int>1</int></value>'
          , '<value><string>current system state</string></value>'
          , '<value><array><data>'
          , '<value><array><data>'
          , '<value><array><data>'
          , '<value><string>/rosout_agg</string></value>'
          , '<value><array><data>'
          , '<value><string>/rosout</string></value>'
          , '</data></array></value>'
          , '</data></array></value>'
          , '</data></array></value>'
          , '<value><array><data>'
          , '<value><array><data>'
          , '<value><string>/rosout</string></value>'
          , '<value><array><data>'
          , '<value><string>/rosout</string></value>'
          , '</data></array></value>'
          , '</data></array></value>'
          , '</data></array></value>'
          , '<value><array><data>'
          , '<value><array><data>'
          , '<value><string>/rosout/set_logger_level</string></value>'
          , '<value><array><data>'
          , '<value><string>/rosout</string></value>'
          , '</data></array></value>'
          , '</data></array></value>'
          , '<value><array><data>'
          , '<value><string>/rosout/get_loggers</string></value>'
          , '<value><array><data>'
          , '<value><string>/rosout</string></value>'
          , '</data></array></value>'
          , '</data></array></value>'
          , '</data></array></value>'
          , '</data></array></value>'
          , '</data></array></value>'
          , '</param>'
          , '</params>'
          , '</methodResponse>'
          ].join('\n')
        xmlrpcParser.parseMethodResponse(xml, this.callback)
        xmlrpcParser.close()
      }
    , 'contains the objects' : function (error, value) {
        assert.isNull(error)
        assert.isArray(value)
        var expected = [1, 'current system state', [[['/rosout_agg', ['/rosout']]], [['/rosout', ['/rosout']]], [['/rosout/set_logger_level', ['/rosout']], ['/rosout/get_loggers', ['/rosout']]]]]
        assert.deepEqual(value, expected)
      }
    }
  }

  //////////////////////////////////////////////////////////////////////
  // Test parseMethodCall functionality
  //////////////////////////////////////////////////////////////////////
, 'A parseMethodCall call' : {
    // Test Array
    'with a Array param' : {
      topic: function() {
        var xml = '<methodCall><methodName>testArrayMethod</methodName><params>'
          + '<param><value><array><data><value><string>val1</string></value><value><int>99</int></value></data></array></value></param>'
          + '<param><value><array><data><value><array><data><value><boolean>0</boolean></value></data></array></value></data></array></value></param>'
          + '</params></methodCall>'
        xmlrpcParser.parseMethodCall(xml, this.callback)
        xmlrpcParser.close()
      }
    , 'contains method name and arrays' : function (error, method, params) {
        assert.isNull(error)
        assert.isString(method)
        assert.strictEqual(method, 'testArrayMethod')
        assert.isArray(params)
        assert.deepEqual(params, [['val1', 99], [[false]]])
      }
    }
    // Test Boolean
  , 'with a Boolean param' : {
      topic: function() {
        var xml = '<methodCall><methodName>testBooleanMethod</methodName><params>'
          + '<param><value><boolean>1</boolean></value></param>'
          + '</params></methodCall>'
        xmlrpcParser.parseMethodCall(xml, this.callback)
        xmlrpcParser.close()
      }
    , 'contains method name and a true boolean value' : function (error, method, params) {
        assert.isNull(error)
        assert.isString(method)
        assert.strictEqual(method, 'testBooleanMethod')
        assert.isArray(params)
        assert.deepEqual(params, [true])
      }
    }
    // Test DateTime
  , 'with a DateTime param' : {
      topic: function() {
        var xml = '<methodCall><methodName>testDateTimeMethod</methodName><params>'
          + '<param><value><dateTime.iso8601>20000608T09:35:10</dateTime.iso8601></value></param>'
          + '</params></methodCall>'
        xmlrpcParser.parseMethodCall(xml, this.callback)
        xmlrpcParser.close()
      }
    , 'contains method name and the DateTime object' : function (error, method, params) {
        assert.isNull(error)
        assert.isString(method)
        assert.strictEqual(method, 'testDateTimeMethod')
        assert.isArray(params)
        assert.deepEqual(params, [new Date(2000, 05, 08, 09, 35, 10)])
      }
    }
    // Test Base64
  , 'with a Base64 param' : {
      topic: function() {
        var xml = '<methodCall><methodName>testBase64Method</methodName><params>'
          + '<param><value><base64>dGVzdGluZw==</base64></value></param>'
          + '</params></methodCall>'
        xmlrpcParser.parseMethodCall(xml, this.callback)
        xmlrpcParser.close()
      }
    , 'contains the method name and the base64 Buffer object' : function (error, method, params) {
        assert.isNull(error)
        assert.isString(method)
        assert.strictEqual(method, 'testBase64Method')
        assert.isArray(params)
        assert.deepEqual(params, [new Buffer('dGVzdGluZw==', 'base64')])
      }
    }
    // Test Double
  , 'with a Double param' : {
      topic: function() {
        var xml = '<methodCall><methodName>testDoubleMethod</methodName><params>'
          + '<param><value><double>1.22</double></value></param>'
          + '<param><value><double>4.26</double></value></param>'
          + '</params></methodCall>'
        xmlrpcParser.parseMethodCall(xml, this.callback)
        xmlrpcParser.close()
      }
    , 'contains method name and multiple double values' : function (error, method, params) {
        assert.isNull(error)
        assert.isString(method)
        assert.strictEqual(method, 'testDoubleMethod')
        assert.isArray(params)
        assert.deepEqual(params, [1.22, 4.26])
      }
    }
    // Test Int
  , 'with a Integer param' : {
      topic: function() {
        var xml = '<methodCall><methodName>testIntegerMethod</methodName><params>'
          + '<param><value><int>1</int></value></param>'
          // Not a typo, making sure converts the double to an int when
          // parsing
          + '<param><value><int>2.26</int></value></param>'
          + '</params></methodCall>'
        xmlrpcParser.parseMethodCall(xml, this.callback)
        xmlrpcParser.close()
      }
    , 'contains method name and multiple Integer values' : function (error, method, params) {
        assert.isNull(error)
        assert.isString(method)
        assert.strictEqual(method, 'testIntegerMethod')
        assert.isArray(params)
        assert.deepEqual(params, [1, 2])
      }
    }
    // Test String
  , 'with a String param' : {
      topic: function() {
        var xml = '<methodCall><methodName>testStringMethod</methodName><params>'
          + '<param><value><string>testString</string></value></param>'
          + '</params></methodCall>'
        xmlrpcParser.parseMethodCall(xml, this.callback)
        xmlrpcParser.close()
      }
    , 'contains method name and the String' : function (error, method, params) {
        assert.isString(method)
        assert.strictEqual(method, 'testStringMethod')
        assert.isArray(params)
        assert.deepEqual(params, ['testString'])
      }
    }
  , 'with multiple String params' : {
      topic: function() {
        var xml = '<methodCall><methodName>testMultipleStringMethod</methodName><params>'
          + '<param><value><string>testString1</string></value></param>'
          + '<param><value><string>testString2</string></value></param>'
          + '<param><value><string>testString3</string></value></param>'
          + '</params></methodCall>'
        xmlrpcParser.parseMethodCall(xml, this.callback)
        xmlrpcParser.close()
      }
    , 'contains method name and the Strings' : function (error, method, params) {
        assert.isNull(error)
        assert.isString(method)
        assert.strictEqual(method, 'testMultipleStringMethod')
        assert.isArray(params)
        assert.deepEqual(params, ['testString1', 'testString2', 'testString3'])
      }
    }
  , 'with a multiline String param' : {
      topic: function() {
        var xml = '<methodCall><methodName>testMultilineStringParam</methodName><params>'
          + '<param><value><string>test\n\n&lt;test&gt;</string></value></param>'
          + '</params></methodCall>'
        xmlrpcParser.parseMethodCall(xml, this.callback)
        xmlrpcParser.close()
      }
    , 'contains the multiline string' : function (error, method, params) {
        assert.isNull(error)
        assert.isString(method)
        assert.strictEqual(method, 'testMultilineStringParam')
        assert.isArray(params)
        assert.deepEqual(params, ['test\n\n<test>'])
      }
    }
  , 'with a String param and newlines in xml' : {
      topic: function() {
        var xml = ['<?xml version=\'1.0\'?>'
          , '<methodCall>'
          , '<methodName>getPublications</methodName>'
          , '<params>'
          , '<param>'
          , '<value><string>/ohyeah</string></value>'
          , '</param>'
          , '</params>'
          , '</methodCall>'
          ].join('\n')
        xmlrpcParser.parseMethodCall(xml, this.callback)
        xmlrpcParser.close()
      }
    , 'contains method name and the String' : function (error, method, params) {
        assert.isNull(error)
        assert.isString(method)
        assert.strictEqual(method, 'getPublications')
        assert.isArray(params)
        assert.deepEqual(params, ['/ohyeah'])
      }
    }
    // Test Struct
  , 'with multiple Struct params' : {
      topic: function() {
        var xml = '<methodCall><methodName>testMultipleStructMethod</methodName><params>'
          + '<param><value><struct><member><name>theName</name><value><string>atestValue</string></value></member><member><name>anotherName</name><value><struct><member><name>nestedName2</name><value><string>nestedValue</string></value></member></struct></value></member><member><name>lastName</name><value><string>Smith</string></value></member></struct></value></param>'
          + '<param><value><struct><member><name>ima-name</name><value><string>testString</string></value></member></struct></value></param>'
          + '</params></methodCall>'
        xmlrpcParser.parseMethodCall(xml, this.callback)
        xmlrpcParser.close()
      }
    , 'contains method name and the objects' : function (error, method, params) {
        assert.isNull(error)
        assert.isString(method)
        assert.strictEqual(method, 'testMultipleStructMethod')
        assert.isArray(params)
        assert.deepEqual(params, [{ theName: 'atestValue', anotherName: {nestedName2: 'nestedValue' }, lastName: 'Smith'}, { 'ima-name': 'testString'}])
      }
    }
    // Valid XML, invalid XML-RPC
  , 'with valid XML but invalid XML-RPC' : {
      topic: function() {
        var xml = '<?xml version="1.0" encoding="iso-8859-1"?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'
          + '<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">'
          + ' <head>'
          + '  <title>401 - Unauthorized</title>'
          + ' </head>'
          + ' <body>'
          + '  <h1>401 - Unauthorized</h1>'
          + ' </body>'
          + '</html>'
        xmlrpcParser.parseMethodCall(xml, this.callback)
        xmlrpcParser.close()
      }
    , 'contains the error object' : function (error, value) {
        assert.isObject(error)
        assert.instanceOf(error, Error)
        assert.strictEqual(error.message, 'Invalid method call.')
      }
    }
    // Invalid XML
  , 'with invalid XML' : {
      topic: function() {
        var xml = '<html xmlns="http://www.w3.org/1999/xhtml">'
          + ' <head>'
          + '  <title>401 - Unauthorized</title>'
          + ' </head>'
          + ' <body>'
          + '  <h1>401 - Unauthorized</h1>'
          + '  <br>'
          + ' </body>'
          + '</html>'
        xmlrpcParser.parseMethodCall(xml, this.callback)
        xmlrpcParser.close()
      }
    , 'contains the error object' : function (error, value) {
        assert.isObject(error)
        assert.instanceOf(error, Error)
        assert.strictEqual(error.message, 'Invalid method call.')
      }
    }
  }

}).export(module)

