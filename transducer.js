

function reduce(input, transformator, initialValue = null) {

    let response = new Map(initialValue);

    for (kv of input.entries()) {
        response = transformator((result, [key, value]) => {
            return result.set(key, value);
        })(response, kv)
    }

    return response;

}


// REDUCERS

const mapReducer = (f) => (reducing) => (result, input) => reducing(result, f(input));

const filterReducer = (predicate) => (reducing) => (result, input) => predicate(input) ? reducing(result, input) : result;


// CONVERTORS

function mapToSetConvertor(map) {
    return new Set(map.values())
}

function mapToArrayConvertor(map) {
    return Array.from(map.values());
}

function mapToObjectConvertor(map) {
    let obj = Object.create(null);
    for (let [k,v] of map) {
        // We don’t escape the key '__proto__'
        // which can cause problems on older engines
        obj[k] = v;
    }
    return obj;
}

function objectToMapConvertor(object) {
    return new Map(
        Object.entries(object)
    );
}

function mapToImmutableMap(map) {
    return Immutable.Map(map.entries())
}

function mapToImmutableList(map) {
    return Immutable.List(map.values())
}


// HELPERS

function createReduceWithConvertor(reduce, convertor) {
    return (...args) => {
        const data = reduce(...args);
        return convertor(data);
    }
}

// Higher-order helpers

const reduceToArray = createReduceWithConvertor(
    reduce,
    mapToArrayConvertor
);

const reduceToSet = createReduceWithConvertor(
    reduce,
    mapToSetConvertor
);

const reduceToObject = createReduceWithConvertor(
    reduce,
    mapToObjectConvertor
)

const reduceToImmutableMap = createReduceWithConvertor(
    reduce,
    mapToImmutableMap
)

const reduceToImmutableList = createReduceWithConvertor(
    reduce,
    mapToImmutableList
)

// More helpers to support Object data type

function reduceObjectToObject(object, ...rest) {
    return reduceToObject(
        objectToMapConvertor(object),
        ...rest
    )
}


// PLAYGROUND

const arr = [ 1, 2, 3 ];
const map = new Map([ ['id1', 1], ['id2', 2], ['id3', 3] ]);
const set = new Set([1, 2, 3]);

const obj = {'key1': 1, 'key2': 2, 'key3': 3};


// The most basic usage is where input and output is Map.

console.log(
    reduce(map, (value) => value)
);

// You can transform all values in data input with mappers transformators

const stringifyMapperTransformator = mapReducer(([key, value]) => [key, `${value}`]);

console.log(
    reduce(map, stringifyMapperTransformator)
)

// Or you can filter values in data input with filters transformators

const evenFilterTransformator = filterReducer(([key, value]) => (value % 2) === 0);

console.log(
    reduce(map, evenFilterTransformator)
);

// Or you can compose these transformators

const filterAndMapTransformator = R.compose(evenFilterTransformator, stringifyMapperTransformator)

console.log(
    reduce(
        map,
        filterAndMapTransformator
    )
);

// You can put as input any iterable data type
// Results will be Map for default

console.log(
    reduce(arr, filterAndMapTransformator)
);

// Use mapToArrayConvertor to get ouput as same as input type

console.log(
    mapToArrayConvertor(
        reduce(arr, filterAndMapTransformator)
    )
);

// Or use reduceToArray helper to get array output directly

console.log(
    reduceToArray(arr, filterAndMapTransformator)
);

// You can get output in different output type

console.log(
    mapToSetConvertor(
        reduce(arr, filterAndMapTransformator)
    )
);

// Or simply use helper to get output type of choice

console.log(
    reduceToSet(arr, filterAndMapTransformator)
);


// We can handle even Objects
// But some conversions needed because Objects doesn't support iterable protocol

console.log(
    mapToObjectConvertor(
        reduce(
            objectToMapConvertor(obj),
            filterAndMapTransformator
        )
    )
);

// You can simplify this with reduceToObject Helper

console.log(
    reduceToObject(
        objectToMapConvertor(obj),
        filterAndMapTransformator
    )
);

// Or even more with Superman's Object helper

console.log(
    reduceObjectToObject(
        obj,
        filterAndMapTransformator
    )
);

// Works with Immutable JS

const immutableMap = Immutable.Map(obj);
const immutableList = Immutable.List(arr);


console.log(
    reduce(
        immutableMap,
        filterAndMapTransformator
    )
);

// If we want to return Immutable, we can simply create Immutable Type from iterator

console.log(
    Immutable.Map(
        reduce(
            immutableMap,
            filterAndMapTransformator
        ).entries()
    )
);

console.log(
    Immutable.List(
        reduce(
            immutableList,
            filterAndMapTransformator
        ).values()
    )
);

// And this can be simplified with some convertors

console.log(
    reduceToImmutableMap(
        immutableMap,
        filterAndMapTransformator
    )
);

console.log(
    reduceToImmutableList(
        immutableList,
        filterAndMapTransformator
    )
);

// Handy for React = get JSX like components from object

const convertToJSXComponentExample = mapReducer(([key, value]) => {
    return [
        key,
        `<div key=${key}>${value}</div>`
    ]
});

console.log(
    reduceToArray(
        objectToMapConvertor(obj),
        convertToJSXComponentExample
    )
);

// You can pass initial value to reduce function
// TODO why we need it? remove?

console.log(
    reduce(
        map,
        filterAndMapTransformator,
        new Map([ ['initialValue', 10] ])
    )
);

// After all these operations we have original data without any changes

console.log(map)
console.log(set)
console.log(arr)
console.log(obj)
