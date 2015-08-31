/**
 * Create an angular factory for a model. The model consists of a getter create method with a <code>getInstance()</code>
 * method hanging off it. Properties assigned on any instance will be reduced by the given <code>reduceFn</code> in
 * order to determine the value returned by the getter.
 * @param {function} reduceFn A method that will be invoked with, and should reduce, an array of values
 * @param {function} [factoryFn] Optional factory method for multiton values
 * @returns {function} A method that creates a getter for a given field
 */
function angularMultitonReduce(reduceFn, factoryFn) {

  // validate reduceFn
  reduceFn = (typeof reduceFn === 'function') ? reduceFn : emptyReduceFn;
  factoryFn = (typeof factoryFn === 'function') ? factoryFn : defaultFactoryFn;

  // determine the invocation style
  var useThis = (reduceFn === Array.prototype.some) || (reduceFn === Array.prototype.every);

  // return value is the Angular 1.x factory method
  return /** @ngInject */ function factory($rootScope) {
    $rootScope.$on('$destroy', dispose);

    // instances are specific to this single instance
    var keys      = [],
        instances = [],
        removeFns = [];

    // create instance
    createGetter.getInstance = getInstance;
    createGetter.dispose = dispose;
    return createGetter;

    /**
     * Create a function that retrieves the value of the given field.
     * @param @param {string} field The field to consider
     * @returns {function} A getter for the given field
     */
    function createGetter(field) {
      return function getter() {

        // optimise iteration of instances to get value list
        var values = [];
        for (var i = 0; i < instances.length; i++) {
          values.push(instances[i][field]);
        }

        // invoke the reduce function with the value list
        return useThis ? reduceFn.call(values, Boolean) : values.reduce(reduceFn, undefined);
      };
    }

    /**
     * Get an instance whose value will be iterated whenever the getter is called.
     * @param {*} key Any value that uniquely identifies the instance
     * @returns {object} An object whose values will contribute to the reduce
     */
    function getInstance(key) {
      var index = keys.indexOf(key);
      if (index < 0) {

        // new index is the length before the update
        index = keys.length;

        // add the key
        keys.push(key);

        // add the value
        instances.push(factoryFn());

        // add the method that will remove it
        removeFns.push(removeInstance);
        if ('$on' in key) {
          key.$on('$destroy', removeInstance);
        }
      }
      return instances[index];

      function removeInstance() {
        var index = keys.indexOf(key);
        if (index >= 0) {
          keys.splice(index, 1);
          instances.splice(index, 1);
          removeFns.splice(index, 1);
        }
      }
    }

    /**
     * Remove all instances from the collection.
     */
    function dispose() {
      while (removeFns.length) {
        removeFns.pop().call();
      }
    }
  };
}

function emptyReduceFn() {
}

function defaultFactoryFn() {
  return {};
}

module.exports = angularMultitonReduce;