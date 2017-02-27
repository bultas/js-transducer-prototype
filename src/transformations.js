
export const mapTransformation = (transformator) => (reducing) => (result, kv) => reducing(result, transformator(kv));

export const filterTransformation = (transformator) => (reducing) => (result, kv) => transformator(kv) ? reducing(result, kv) : result;
