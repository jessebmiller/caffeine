var VTables = {};

var typeKey = function (entity) {
    if (typeof entity ==='number' || entity === Number) {
        return "_number";
    } else if (typeof entity === 'string' || entity === String) {
        return "_string";
    } else if (entity === false || entity === true || entity === Boolean) {
        return "_boolean";
    } else if (typeof entity._typeKey === 'string') {
        return entity._typeKey;
    } else if (entity instanceof Array || entity === Array) {
        return "_array";
    } else if (entity instanceof Function && entity !== Object ||
               entity === Function) {
        return "_function";
    } else if (entity instanceof Object || entity === Object) {
        return "_object";
    } else {
        console.log(entity);
        throw new Error ("entity is not typed");
    }
};

vtable = function (className, obj) {
    return VTables[className][typeKey(obj)];
};

makeClass = function (className, methodNames) {
    VTables[className] = VTables[className] || {};
    function mkClass (type, vtable) {
        /*
         * for each method name required for admittance in to this type class,
         * extend the types prototype with the provided method.
         *
         * methodNames: [String], required for admittance to this type class
         * type:        Function, the type constructor
         * methods:     { String: Function }, map from method name to instance
         *              method
         */
        var typeKey = '';
        if (type === Number) {
            typeKey = "_number";
        } else if (type === String) {
            typeKey = "_string";
        } else if (type === Boolean) {
            typeKey = "_boolean";
        } else if (type === Array) {
            typeKey = "_array";
        } else if (type === Object) {
            typeKey = "_object";
        } else if (type === Function) {
            typeKey = "_function";
        }else if (type.prototype._typeKey !== undefined) {
            typeKey = type.prototype._typeKey;
        } else {
            /* for custom type constructors, extend the prototype with a random
             * type key
             */
            typeKey = String(Math.random());
            type.prototype._typeKey = typeKey;
        }
        VTables[className][typeKey] = vtable;
    };
    mkClass.v = VTables.className;
    return mkClass;
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

Functor = makeClass("Functor", ['fmap']);
fmap = function (f, a) { return vtable("Functor", a).fmap(f, a); };

Monoid = makeClass("Monoid", ['mempty', 'mappend']);
mappend = function (a0, a1) { return vtable("Monoid", a0).mappend(a0, a1); };
mempty = function (a) { return vtable("Monoid", a).mempty(); };
mconcat = function (as) { return as.reduce(mappend, mempty(as[0])); };

Sum = makeClass("Sum", ['unit', 'plus']);
plus = function (a0, a1) { return vtable("Sum", a0).plus(a0, a1); };
sumUnit = function (a) { return vtable("Sum", a).unit(); };
sum = function (as) { return functional.reduce(plus, sumUnit(as[0]), as); };

Product = makeClass("Product", ['unit', 'times']);
times = function (a0, a1) { return vtable("Product", a0).times(a0, a1); };
prodUnit = function (a) { return vtable("Product", a).unit(); };
prod = function (as) { return functional.reduce(times, prodUnit(as[0]), as); };

Functor(Number, { fmap: function (f, n) { return f(n); }});
Functor(String, { fmap: function (f, s) { return f(s); }});
Functor(Boolean, { fmap: function (f, b) { return f(b); }});
Functor(Array, { fmap: functional.map });
Functor(Object, { fmap: function (f, o) {
    /* apply the function to each [Key, Value] pair from the Object */
    var pairs = _.pairs(o);
    var appliedPairs = functional.map(f, pairs);
    function extendObjectWithPair(o, p) {
        o[p[0]] = p[1];
        return o;
    }
    return functional.foldr(extendObjectWithPair, {}, appliedPairs);
}});

Monoid(Number, {
    /* Numbers under addition */
    mempty: K(0),
    mappend: function (a, b) { return a + b; }
});
Monoid(String, {
    /* Strings under concatination */
    mempty: K(''),
    mappend: function (a, b) { return a + b; }
});
Monoid(Boolean, {
    /* Booleans under or */
    mempty: K(false),
    mappend: function (a, b) { return a || b; }
});
Monoid(Array, {
    /* Arrays under concatination */
    mempty: K([]),
    mappend: function (a, b) { return a.concat(b); }
});
Monoid(Object, {
    /* Combine two Objects
     * return an object with the union of keys
     * if Object a and Object b both define the same key, the values from a and
     * b must be combinable. Set the value at that key to the combination of
     * the values
     *
     * Example:
     * {a: 0, b: 1} combined with {b: 2, c: 3} should be {a:0, b: 3, c: 3}
     */

    mempty: K({}),
    mappend: function (a, b) {
        var keys = _.union(_.keys(a), _.keys(b));
        var combined = {};
        function getValue(obj, key, other) {
            if (obj[key] === undefined) {
                return other[key];
            } else if (other[key] === undefined) {
                return obj[key];
            } else {
                return mappend(obj[key], other[key]);
            }
        }
        _.each(keys, function (key) {
            combined[key] = getValue(a, key, b);
        });
        return combined;
    }
});

Sum(Number, {
    /* numbers under addition */
    unit: K(0),
    plus: function (a, b) { return a + b; }
});

Product(Number, {
    /* Numbers under multiplication */
    unit: K(1),
    times: function (a, b) { return a * b; }
});
Product(Boolean, {
    /* Booleans under And */
    unit: K(false),
    times: function (a, b) { return a && b; }
});

