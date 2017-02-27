
export const saveReduce = (result, [key, value]) => {
    return result.set(key, value);
};

export const reduceValuesReduce = (reduce, init) => (result, [key, value]) => {
    const x = reduce(result.get(0) || init, value);
    return result.set(0, x)
};
