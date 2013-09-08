makeClass = function (methodNames) {
    return function (type, methods) {
        /*
         * for each method name required for admittance in to this type class,
         * extend the types prototype with the provided method.
         *
         * methodNames: [String], required for admittance to this type class
         * type:        Function, the type constructor
         * methods:     { String: Function }, map from method name to instance
         *              method
         */
        _.each(methodNames, function (methodName) {
            if (!methods[methodName]) {
                throw new Error ("must implement " + methodName);
            }
            type.prototype[methodName] = methods[methodName];
            type[methodName] = methods[methodName];
        });
    };
};

K = function (a) { return function () { return a; }; };

Constructor = function(f) {
    /*
     * Thanks to LoopRecur for this constructor function
     * https://github.com/loop-recur/typeclasses/blob/master/support/types.js
     */
    var x = function(){
        if(!(this instanceof x)){
            var inst = new x();
            f.apply(inst, arguments);
            return inst;
        }
        f.apply(this, arguments);
    };
    return x;
};

Functor = makeClass(['fmap']);
fmap = function (f, a) { return a.fmap(f, a); };

Monoid = makeClass(['mempty', 'mappend']);
unit = function (a) { return a.mempty(); };
mappend = function (a0, a1) { return a0.mappend(a0, a1); };
prod = mappend;
mconcat = function (as) { return as.reduce(prod, unit(as[0])); };
combine = mconcat;

Monoid(Array, {
    mempty: K([]),
    mappend: function (a, b) { return a.concat(b); }
});
