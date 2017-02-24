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
