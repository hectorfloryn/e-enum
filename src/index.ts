const assign: typeof Object.assign = function assign() {
  const to: Record<string, unknown> = {}
  for (let index = 0; index < arguments.length; index++) {
    const nextSource = arguments[index]
    if (nextSource !== null && nextSource !== void 0) {
      for (const nextKey in nextSource) {
        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
          to[nextKey] = nextSource[nextKey]
        }
      }
    }
  }
  return to
}

function isArray(obj: any) {
  return Object.prototype.toString.call(obj) === '[object Array]'
}

function includes(array: any[], target: any) {
  for (let i = 0; i < array.length; i++) {
    if (array[i] === target) {
      return true
    }
  }
  return false
}

type Key = string | number | symbol

type Keys<T> = T extends infer U ? keyof U : never

type UnionValue<T> = { [key in Keys<T>]: T extends { [k in key]: infer V } ? V : undefined }

type EnumData<C> = {
  code: C
  label?: string
  /** 用于获取列表的排序 */
  $sort?: number
  /** `$list` `$map` `$options` 是否默认排除 */
  $exclude?: boolean
  [key: Key]: unknown
}

type EnumItemBuild<K, C> = {
  $is(key?: K): boolean
  $in(keys: K[]): boolean
  $eq(code?: C): boolean
}

type EnumItem<C, D, O> = EnumItemBuild<keyof O, C> & D

type EnumBuildIn<C, D, O> = {
  $list(this: Enum<C, D, O>, excludes?: keyof O | (keyof O)[]): EnumItem<C, D, O>[]
  $map<R>(
    this: Enum<C, D, O>,
    fn: (item: EnumItem<C, D, O>) => R,
    excludes?: keyof O | (keyof O)[]
  ): R[]
  $options(
    this: Enum<C, D, O>,
    excludes?: keyof O | (keyof O)[]
  ): { value: GetEnumCodeType<O>; label: string }[]
}

type EnumKeyRes<C, O> = {
  [key in keyof O]: EnumItem<C, O[key], O>
}

type EnumCodeRes<O> = { [key: Key]: undefined | UnionValue<O[Keys<O>]> }

type Enum<C, D, O> = EnumBuildIn<C, D, O> & EnumKeyRes<C, O> & EnumCodeRes<O>

export type GetEnumCodeType<T> = T extends Enum<any, any, infer O>
  ? O extends Record<Key, EnumData<infer C>>
    ? C
    : never
  : never

const buildInEnumKeys: (keyof EnumBuildIn<any, any, any>)[] = ['$list', '$map', '$options']
const buildInBuildItemKeys: (keyof EnumItemBuild<any, any>)[] = ['$is', '$eq', '$in']

export function eEnum<C, D extends EnumData<C>, const O extends Record<Key, D>>(
  data: O
): Enum<C, D, O> {
  const keyRes: EnumKeyRes<C, O> = {} as unknown as EnumKeyRes<C, O>
  const codeRes: EnumCodeRes<O> = {} as unknown as EnumCodeRes<O>

  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = data[key]

      if (includes(buildInEnumKeys, key)) {
        throw new Error(`The built-in property "${key}" cannot be used!`)
      }

      if (!value || !('code' in value)) {
        throw new Error(`Code must be specified!`)
      }

      for (let i = 0; i < buildInBuildItemKeys.length; i++) {
        if (buildInBuildItemKeys[i] in value) {
          throw new Error(`The built-in property "${buildInBuildItemKeys[i]}" cannot be used!`)
        }
      }

      if (codeRes[value.code as Keys<O>]) {
        throw new Error(`The code "${value.code?.toString?.() ?? ''}" has been used!`)
      }

      const itemBuildIn: EnumItemBuild<keyof O, C> = {
        $eq: (c) => c === value.code,
        $is: (k) => k === key,
        $in: (ks) => includes(ks, key)
      }

      const item: EnumItem<C, O[typeof key], O> = assign(value, itemBuildIn)

      keyRes[key] = item
      codeRes[value.code as Keys<O>] = item as any
    }
  }

  const enumBuildIn: EnumBuildIn<C, D, O> = {
    $list(excludes = []) {
      const res: EnumItem<C, D, O>[] = []
      const excludesArr = (isArray(excludes) ? excludes : [excludes]) as (keyof O)[]

      for (const key in keyRes) {
        if (Object.prototype.hasOwnProperty.call(keyRes, key)) {
          const value = keyRes[key]
          if (!value.$exclude && !value.$in(excludesArr)) {
            res.push(value)
          }
        }
      }

      return res.sort((a, b) => (a.$sort || 0) - (b.$sort || 0))
    },
    $map(fn, excludes = []) {
      if (typeof fn !== 'function') {
        throw new Error('is not a function!')
      }
      const res: ReturnType<typeof fn>[] = []
      const list = this.$list(excludes)

      for (let i = 0; i < list.length; i++) {
        res.push(fn(list[i]))
      }

      return res
    },
    $options(excludes = []) {
      return this.$map(
        (item) => ({ label: item.label || `${item.code}`, value: item.code as GetEnumCodeType<O> }),
        excludes
      )
    }
  }

  return assign(keyRes, codeRes, enumBuildIn)
}

export default eEnum
