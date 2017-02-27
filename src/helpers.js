
export function trans(input, transformation) {
    return transduce(
        input,
        saveReduce,
        transformation
    );
}

export function reduce(input, reduce, init) {
    return transduce(
        input,
        reduceValuesReduce(
            reduce,
            init
        )
    )
}

export function createTransduceWithConvert(transducer, convertor) {
    return (...args) => {
        const data = transducer(...args);
        return convertor(data);
    }
}

export const transduceToArray = createTransduceWithConvert(
    transduce,
    mapToArrayConvertor
);

export const transduceToSet = createTransduceWithConvert(
    transduce,
    mapToSetConvertor
);

export const transduceToObject = createTransduceWithConvert(
    transduce,
    mapToObjectConvertor
)

export const transduceToImmutableMap = createTransduceWithConvert(
    transduce,
    mapToImmutableMapConvertor
)

export const transduceToImmutableList = createTransduceWithConvert(
    transduce,
    mapToImmutableListConvertor
)

// more support for Object
export function transduceObjectToObject(object, ...rest) {
    return transduceToObject(
        objectToMapConvertor(object),
        ...rest
    )
}
