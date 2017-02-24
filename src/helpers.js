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
