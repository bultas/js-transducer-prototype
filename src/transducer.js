
export function transduce(input, reduce, transformator) {

    return [...input.entries()].reduce(
        transformator ? transformator(reduce) : reduce,
        new Map()
    );

}
