# Transducer
Transform and convert JS iterable data-structures

If you want to learn more about definition of Transducer you can find more in [Clojure documentation](https://clojure.org/reference/transducers)



## Data (input)

We have some data in different data-structures and we want to somehow transform it  

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


## Basic transduce

Now we have to tell to transduce method how we want to reduce data.

So for now we use simply Reduce method which save all transformed data to previous result  

    const saveEntriesReduce = (result, [key, value]) => {
        return result.set(key, value);
    };

    transduce(
        map,
        saveEntriesReduce
    );


*Advanced TIP: You can customize reduce behavior with custom Reduce function passed to transduce
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


## Transformators

TODO


## Transformation methods

We want to do basic transformations like **map** and **filter**


Lets start with **map** transformation.
So we prepare helper which can help us with these operation.

    const mapTransformation = (transformator) => (reducing) => (result, kv) => reducing(result, transformator(kv));


Then we can use this **map** helper to create basic **Transformator** which transform our input data

    const stringifyMapperTransformator = mapTransformation(
        ([key, value]) => [key, `${value}`]
    );

    transduce(
        map,
        saveEntriesReduce,
        stringifyMapperTransformator
    );


Next we want to use filter transformations
So prepare another helper which solve data filtering

    const filterTransformation = (transformator) => (reducing) => (result, kv) => transformator(kv) ? reducing(result, kv) : result;


Then we can use it same way how we used the map transformation helper and pass into our Transformator

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
