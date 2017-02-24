# Transducer

Transducer to transduce JS iterable data-structures

If you want to learn more about Transducer you should start in [Clojure documentation](https://clojure.org/reference/transducers)



## Data (input)

Imagine that we have some data in different data-structures and we want to somehow transform it  

    const arr = [ 1, 2, 3 ];
    const map = new Map([ ['id1', 1], ['id2', 2], ['id3', 3] ]);
    const set = new Set([1, 2, 3]);

    // ImmutableJS supported
    const immutableMap = Immutable.Map(obj);
    const immutableList = Immutable.List(arr);


## Introduce **transduce** method

This simple method can help us with our "multi-data-structure" transformations

In core of this method we save and manipulate data in Map format, so output will be always Map

    function transduce(input, reduce, transformator) {

        return [...input.entries()].reduce(
            transformator ? transformator(reduce) : reduce,
            new Map()
        );

    }


## Transduce reduce argument

Now we have to tell to transduce method how we want to reduce data.

For now we use simple reduce method which save all transformed data to previous result  

    const saveEntriesReduce = (result, [key, value]) => {
        return result.set(key, value);
    };

    transduce(
        map,
        saveEntriesReduce
    );


## Transformations methods

So now we can dive deeper and start transforming our data..  

Firstly we have to prepare *transformation methods* like **map** and **filter**

### Maping transformation

Lets start with **map transformation method**:

    const mapTransformation = (transformator) => (reducing) => (result, kv) => reducing(result, transformator(kv));


Then we can use this method to create basic **Transformator** which transform our input data

All what we need is call the **map transformation method** with some map logic

    const stringifyMapperTransformator = mapTransformation(
        ([key, value]) => [key, `${value}`]
    );

Then we can use our **Transformator** to transform our data.

    transduce(
        map,
        saveEntriesReduce,
        stringifyMapperTransformator
    );


### filter transformation

Next we want to use filter transformations  
So prepare another **transformation method** which solve data filtering

    const filterTransformation = (transformator) => (reducing) => (result, kv) => transformator(kv) ? reducing(result, kv) : result;


Then we can use it same way how we used our **map transformation method** and call it with some filtering logic

    const evenFilterTransformator = filterTransformation(
        ([key, value]) => (value % 2) === 0
    );

    transduce(
        map,
        saveEntriesReduce,
        evenFilterTransformator
    );


### Transformators composition

Both Transformators have same arguments so they can be easily composable.

    const filterAndMapTransformator = R.compose(
        evenFilterTransformator,
        stringifyMapperTransformator
    )

    transduce(
        map,
        saveEntriesReduce,
        filterAndMapTransformator
    );


## Cross Data-structures transformations

You can put **any Iterable data-structure** as *input* and apply same transformations and reducing regardless of input type

    transduce(
        map,
        saveEntriesReduce,
        filterAndMapTransformator
    );

Have same results as

    transduce(
        set,
        saveEntriesReduce,
        filterAndMapTransformator
    );

Or

    transduce(
        arr,
        saveEntriesReduce,
        filterAndMapTransformator
    );


## Convering output value

Sometime we just don't want get Map as output data-structure (default).
So you can solve it by using **covertors**. Which convert the *output* to required type

For example if you want to work with Array on the *input* as *output*, you have to use **convertor**

    function mapToArrayConvertor(map) {
        return Array.from(map.values());
    }

    mapToArrayConvertor(
        transduce(
            arr,
            saveEntriesReduce,
            filterAndMapTransformator
        )
    )

But you can go further and use Function Decorator (type of HOC) to create transduce which ouput desired data-strcture for default

    function createTransduceWithConvert(transducer, convertor) {
        return (...args) => {
            const data = transducer(...args);
            return convertor(data);
        }
    }

Now you can use this function and create transduce version which return Array data-structure for default

    const transduceToArray = createTransduceWithConvert(
        mapToArrayConvertor
    );

Then you can use it as same way how you use original **transduce** method

    transduceToArray(
        arr,
        saveEntriesReduce,
        filterAndMapTransformator
    );



## Immutability

Every original *input* data **will not be modified** in any way.

## Advanced reducing

You can customize reduce behavior with custom Reduce function passed to transduce

Example: Array-style reduce helper to reduce value*

    const reduceValuesReduce = (reduce, init) => (result, [key, value]) => {
        const x = reduce(result.get(0) || init, value);
        return result.set(0, x)
    };

    transduce(
        arr,
        reduceValuesReduce(
            (result, value) => result + value,
            0
        )
    );
