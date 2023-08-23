// src/index.ts
var assign = function assign2() {
  const to = {};
  for (let index = 0; index < arguments.length; index++) {
    const nextSource = arguments[index];
    if (nextSource !== null && nextSource !== void 0) {
      for (const nextKey in nextSource) {
        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
          to[nextKey] = nextSource[nextKey];
        }
      }
    }
  }
  return to;
};
function isArray(obj) {
  return Object.prototype.toString.call(obj) === "[object Array]";
}
function includes(array, target) {
  for (let i = 0; i < array.length; i++) {
    if (array[i] === target) {
      return true;
    }
  }
  return false;
}
var buildInEnumKeys = ["$list", "$map", "$options"];
var buildInBuildItemKeys = ["$is", "$eq", "$in"];
function eEnum(data) {
  var _a, _b, _c;
  const keyRes = {};
  const codeRes = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = data[key];
      if (includes(buildInEnumKeys, key)) {
        throw new Error(`The built-in property "${key}" cannot be used!`);
      }
      if (!value || !("code" in value)) {
        throw new Error(`Code must be specified!`);
      }
      for (let i = 0; i < buildInBuildItemKeys.length; i++) {
        if (buildInBuildItemKeys[i] in value) {
          throw new Error(`The built-in property "${buildInBuildItemKeys[i]}" cannot be used!`);
        }
      }
      if (codeRes[value.code]) {
        throw new Error(`The code "${(_c = (_b = (_a = value.code) == null ? void 0 : _a.toString) == null ? void 0 : _b.call(_a)) != null ? _c : ""}" has been used!`);
      }
      const itemBuildIn = {
        $eq: (c) => c === value.code,
        $is: (k) => k === key,
        $in: (ks) => includes(ks, key)
      };
      const item = assign(value, itemBuildIn);
      keyRes[key] = item;
      codeRes[value.code] = item;
    }
  }
  const enumBuildIn = {
    $list(excludes = []) {
      const res = [];
      const excludesArr = isArray(excludes) ? excludes : [excludes];
      for (const key in keyRes) {
        if (Object.prototype.hasOwnProperty.call(keyRes, key)) {
          const value = keyRes[key];
          if (!value.$exclude && !value.$in(excludesArr)) {
            res.push(value);
          }
        }
      }
      return res.sort((a, b) => (a.$sort || 0) - (b.$sort || 0));
    },
    $map(fn, excludes = []) {
      if (typeof fn !== "function") {
        throw new Error("is not a function!");
      }
      const res = [];
      const list = this.$list(excludes);
      for (let i = 0; i < list.length; i++) {
        res.push(fn(list[i]));
      }
      return res;
    },
    $options(excludes = []) {
      return this.$map(
        (item) => ({ label: item.label || `${item.code}`, value: item.code }),
        excludes
      );
    }
  };
  return assign(keyRes, codeRes, enumBuildIn);
}
var src_default = eEnum;
export {
  src_default as default,
  eEnum
};
