/**
 * Make a mixer to mix two values and make a getter,
 * which can get a mixed value at any rate later.
 */
export function makeMixer(fromValue, toValue) {
    let fromType = typeof fromValue;
    // Mix arrays.
    if (Array.isArray(fromValue)) {
        return makeArrayMixer(fromValue, toValue);
    }
    // Mix numbers.
    else if (fromType === 'number') {
        return makeNumericMixer(fromValue, toValue);
    }
    // Mix plain object.
    else if (fromType === 'object') {
        // Mix mixable object like Vector or Point.
        if ('mix' in fromValue && typeof fromValue.mix === 'function') {
            return makeMixableMixer(fromValue, toValue);
        }
        // Mix each properties of an object.
        else {
            return makeObjectMixer(fromValue, toValue);
        }
    }
    // Not mixable.
    else {
        throw new Error(`"${fromValue}" is not able to mix with "${toValue}"!`);
    }
}
function makeArrayMixer(fromValue, toValue) {
    let mixers = fromValue.map(function (f, index) {
        let mixer = makeMixer(f, toValue[index]);
        return mixer;
    });
    return function (rate) {
        return mixers.map(mixer => mixer(rate));
    };
}
function makeNumericMixer(fromValue, toValue) {
    return function (rate) {
        return mix(fromValue, toValue, rate);
    };
}
/** Linear interpolation betweens `a` and `b`, `bRate` specifies the rate of `b`. */
function mix(a, b, bRate) {
    return a * (1 - bRate) + b * bRate;
}
function makeMixableMixer(fromValue, toValue) {
    return function (rate) {
        return fromValue.mix(toValue, rate);
    };
}
function makeObjectMixer(fromValue, toValue) {
    let keys = Object.keys(fromValue);
    let mixers = {};
    for (let key of keys) {
        let v1 = fromValue[key];
        let v2 = toValue[key];
        mixers[key] = makeMixer(v1, v2);
    }
    return function (rate) {
        let o = {};
        for (let key of keys) {
            o[key] = mixers[key](rate);
        }
        return o;
    };
}
