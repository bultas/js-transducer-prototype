# Transducer

Transducer to transduce JS iterable data-structures

If you want to learn more about Transducer you should start in [Clojure documentation](https://clojure.org/reference/transducers)



## Data (input)

Imagine that we have some data in different data-structures and we want to somehow transform it  

    const dataAsArray = [ 1, 2, 3 ];
    const dataAsMap = new Map([ ['id1', 1], ['id2', 2], ['id3', 3] ]);
    const dataAsSet = new Set([1, 2, 3]);

    // ImmutableJS supported
    const dataAsimmutableMap = Immutable.Map(obj);
    const dataAsimmutableList = Immutable.List(dataAsArray);


## **transduce** method

*transduce* method can help us with our "multi-data-structure" transformations

In core of this method we save state in Map data-structure, so default output will be Map

    function transduce(input, reduce, transformator) {

        return [...input.entries()].reduce(
            transformator ? transformator(reduce) : reduce,
            new Map()
        );

    }


## Reduce

Now we have to tell to transduce method how we want to reduce data.

For now we use simple reduce method which save all transformed data to previous result  

    const reduce = (result, [key, value]) => {
        return result.set(key, value);
    };

    transduce(
        dataAsMap,
        reduce
    );


## Transformator

Now we can dive deeper and start transforming our data..  

1. We have to prepare *transformation methods* like **map** and **filter**   
2. We have to call the *transfomation method* with *transformation logic* to create final **Transformator**

### Maping transformations

Lets start with **map transformation method**

    const mapTransformation = (transformator) => (reducing) => (result, kv) => reducing(result, transformator(kv));


Then call this method with some *transformation logic*

    const stringifyTransformator = mapTransformation(
        ([key, value]) => [key, `${value}`]
    );

Finally we can use our **Transformator** to transform data.

    transduce(
        dataAsMap,
        reduce,
        stringifyTransformator
    );


### Filter transformations

If we want another behavior like filtering data, we have to create another type of **transformation method**

    const filterTransformation = (transformator) => (reducing) => (result, kv) => transformator(kv) ? reducing(result, kv) : result;


Then use it same way how we used **map transformation method**. Call it with logic to create **Transformator**

    const filterEvenTransformator = filterTransformation(
        ([key, value]) => (value % 2) === 0
    );


Finally you can filter your data

    transduce(
        dataAsMap,
        reduce,
        filterEvenTransformator
    );


### Transformators composition

Both Transformators have same arguments so they can be easily composable.

    const filterAndMapTransformator = R.compose(
        filterEvenTransformator,
        stringifyTransformator
    )

    transduce(
        dataAsMap,
        reduce,
        filterAndMapTransformator
    );


## Multi Data-structures transformations

You can put **any Iterable data-structure** as *input* and apply same transformations

    transduce(
        dataAsMap,
        reduce,
        filterAndMapTransformator
    );

Have same results as

    transduce(
        dataAsSet,
        reduce,
        filterAndMapTransformator
    );

Or

    transduce(
        dataAsArray,
        reduce,
        filterAndMapTransformator
    );


## Converting output value

Sometime we just don't want get Map as output data-structure (default).
So you can solve it by using **covertors**.

**Convert** is just simple function which get output and convert it to desired data-structure.

For example if you want to work with Array on the *input* as *output*, you have to use **convertor**

    function mapToArrayConvertor(map) {
        return Array.from(map.values());
    }

    mapToArrayConvertor(
        transduce(
            dataAsArray,
            reduce,
            filterAndMapTransformator
        )
    )

But you can go further and use Function Decorator (type of HOC) to create transduce with desired data-structure ouput

    function createTransduceWithConvert(transducer, convertor) {
        return (...args) => {
            const data = transducer(...args);
            return convertor(data);
        }
    }

For example create transduce version which return Array data-structure

    const transduceToArray = createTransduceWithConvert(
        mapToArrayConvertor
    );

Then you can use it as same way how you used original **transduce** method

    transduceToArray(
        dataAsArray,
        reduce,
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
        dataAsArray,
        reduceValuesReduce(
            (result, value) => result + value,
            0
        )
    );
