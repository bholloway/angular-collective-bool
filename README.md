# angular-multiton-reduce

An Angular 1.x model composed from a collection of dynamic multiton values

## Installation

Requires [browserify](http://browserify.org/) or similar npm-based build system.

In the command line:

```
npm install angular-multiton-reduce --save
```

In your angular composition define a variable and an associated reduce function:

```javascript
angular.module('myModule', [])
  .factory('myUnion', require('angular-collective-boolean')(Array.prototype.some));
```

You may create as many angular entities as you like in this fashion.

## Usage

Presuming a `myUnion` that reduces using `Array.prototype.some` per the example above.

Any property may be set on any instance at any time.

```javascript
function fooController($scope, myUnion) {

  // get an instance with some key that represents this context
  var model = myUnion.getInstance('controller.foo');
  
  // set any property at any time
  model.myProperty = true;
  ...
  model.myProperty = false;
}
```

The collective value may be queried by invoking the injectable `myUnion` as a function and specifying the field name, in this case `myProperty`.

```javascript
function barController($scope, myBoolean) {
  
  // scope property is true when any instance is true
  Object.defineProperty($scope, 'myProperty', {
    get: myUnion('myProperty')
  }
  
  // watch expression fires when any instance is true
  $scope.$watch(myUnion('myProperty'), function onChange(value) {
    console.log('union of all values has changed to', value);
  });
}
```

### Reduce function

Every time the getter is invoked, the respective field is sampled across all instances and the result is collected into an Array. The Array is [reduced](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce) using the `reduceFn` as callback.

A special case is made for `Array.prototype.some` and `Array.prototype.every`. These are invoked using the value Array as the invocation `this`.

The order of values in the Array is consistent with the order in which instances are created. All values are equal, there is no way to determine which value is from which instance.

### Create function

An optional `createFn` may be supplied which will create the instance each time a unique `getInstance()` call is made.

The default `createFn` will create a simple `Object`.

Currently the `createFn` may *not* use angular injectables.

## Limitations

Relies on angular change detection. There is no [observable](https://en.wikipedia.org/wiki/Observer_pattern).