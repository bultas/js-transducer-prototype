

function transduce(input, reduce, transformator) {

    return [...input.entries()].reduce(
        transformator ? transformator(reduce) : reduce,
        new Map()
    );

}


// TRANSFORMATIONS

const mapTransformation = (transformator) => (reducing) => (result, kv) => reducing(result, transformator(kv));

const filterTransformation = (transformator) => (reducing) => (result, kv) => transformator(kv) ? reducing(result, kv) : result;


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

function mapToImmutableMapConvertor(map) {
    return Immutable.Map(map.entries())
}

function mapToImmutableListConvertor(map) {
    return Immutable.List(map.values())
}


// HELPERS

function createTransduceWithConvert(transducer, convertor) {
    return (...args) => {
        const data = transducer(...args);
        return convertor(data);
    }
}

const transduceToArray = createTransduceWithConvert(
    transduce,
    mapToArrayConvertor
);

const transduceToSet = createTransduceWithConvert(
    transduce,
    mapToSetConvertor
);

const transduceToObject = createTransduceWithConvert(
    transduce,
    mapToObjectConvertor
)

const transduceToImmutableMap = createTransduceWithConvert(
    transduce,
    mapToImmutableMapConvertor
)

const transduceToImmutableList = createTransduceWithConvert(
    transduce,
    mapToImmutableListConvertor
)

// more support for Object
function transduceObjectToObject(object, ...rest) {
    return transduceToObject(
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
// use simple Reduce function to save all transformed data
// Transformator argument is optional

const saveEntriesReduce = (result, [key, value]) => {
    return result.set(key, value);
}

console.log(
    transduce(
        map,
        saveEntriesReduce
    )
);

// Advanced TIP: You can customize reduce behavior with custom Reduce function passed to transduce
// Example: Array-style reduce helper to reduce value
const reduceValuesReduce = (reduce, init) => (result, [key, value]) => {
    const x = reduce(result.get(0) || init, value);
    return result.set(0, x)
}

console.log(
    transduce(
        arr,
        reduceValuesReduce(
            (result, value) => result + value,
            0
        )
    )
)

// You can transform all values in data input with mappers transformators

const stringifyMapperTransformator = mapTransformation(([key, value]) => [key, `${value}`]);

console.log(
    transduce(
        map,
        saveEntriesReduce,
        stringifyMapperTransformator
    )
)

// Or you can filter values in data input with filters transformators

const evenFilterTransformator = filterTransformation(([key, value]) => (value % 2) === 0);

console.log(
    transduce(
        map,
        saveEntriesReduce,
        evenFilterTransformator
    )
);

// Or you can compose these transformators

const filterAndMapTransformator = R.compose(evenFilterTransformator, stringifyMapperTransformator)

console.log(
    transduce(
        map,
        saveEntriesReduce,
        filterAndMapTransformator
    )
);

// You can put as input any iterable data type
// Results will be Map for default

console.log(
    transduce(
        arr,
        saveEntriesReduce,
        filterAndMapTransformator
    )
);

// Use mapToArrayConvertor to get ouput as same as input type

console.log(
    mapToArrayConvertor(
        transduce(
            arr,
            saveEntriesReduce,
            filterAndMapTransformator
        )
    )
);

// Or use transduceToArray helper to get array output directly

console.log(
    transduceToArray(
        arr,
        saveEntriesReduce,
        filterAndMapTransformator
    )
);

// You can get output in different output type

console.log(
    mapToSetConvertor(
        transduce(
            arr,
            saveEntriesReduce,
            filterAndMapTransformator
        )
    )
);

// Or simply use helper to get output type of choice

console.log(
    transduceToSet(
        arr,
        saveEntriesReduce,
        filterAndMapTransformator
    )
);


// We can handle even Objects
// But some conversions needed because Objects doesn't support iterable protocol

console.log(
    mapToObjectConvertor(
        transduce(
            objectToMapConvertor(obj),
            saveEntriesReduce,
            filterAndMapTransformator
        )
    )
);

// You can simplify this with transduceToObject Helper

console.log(
    transduceToObject(
        objectToMapConvertor(obj),
        saveEntriesReduce,
        filterAndMapTransformator
    )
);

// Or even more with Superman's Object helper

console.log(
    transduceObjectToObject(
        obj,
        saveEntriesReduce,
        filterAndMapTransformator
    )
);

// Works with Immutable JS

const immutableMap = Immutable.Map(obj);
const immutableList = Immutable.List(arr);


console.log(
    transduce(
        immutableMap,
        saveEntriesReduce,
        filterAndMapTransformator
    )
);

// If we want to return Immutable, we can simply create Immutable Type from iterator

console.log(
    Immutable.Map(
        transduce(
            immutableMap,
            saveEntriesReduce,
            filterAndMapTransformator
        ).entries()
    )
);

console.log(
    Immutable.List(
        transduce(
            immutableList,
            saveEntriesReduce,
            filterAndMapTransformator
        ).values()
    )
);

// And this can be simplified with some convertors

console.log(
    transduceToImmutableMap(
        immutableMap,
        saveEntriesReduce,
        filterAndMapTransformator
    )
);

console.log(
    transduceToImmutableList(
        immutableList,
        saveEntriesReduce,
        filterAndMapTransformator
    )
);

// Handy for React = get JSX like components from object

const convertToJSXComponentExample = mapTransformation(([key, value]) => {
    return [
        key,
        `<div key=${key}>${value}</div>`
    ]
});

console.log(
    transduceToArray(
        objectToMapConvertor(obj),
        saveEntriesReduce,
        convertToJSXComponentExample
    )
);

// After all these operations we have original data without any changes

console.log(map);
console.log(set);
console.log(arr);
console.log(obj);
