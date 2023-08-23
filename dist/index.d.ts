type Key = string | number | symbol;
type Keys<T> = T extends infer U ? keyof U : never;
type UnionValue<T> = {
    [key in Keys<T>]: T extends {
        [k in key]: infer V;
    } ? V : undefined;
};
type EnumData<C> = {
    code: C;
    label?: string;
    /** 用于获取列表的排序 */
    $sort?: number;
    /** `$list` `$map` `$options` 是否默认排除 */
    $exclude?: boolean;
    [key: Key]: unknown;
};
type EnumItemBuild<K, C> = {
    $is(key?: K): boolean;
    $in(keys: K[]): boolean;
    $eq(code?: C): boolean;
};
type EnumItem<C, D, O> = EnumItemBuild<keyof O, C> & D;
type EnumBuildIn<C, D, O> = {
    $list(this: Enum<C, D, O>, excludes?: keyof O | (keyof O)[]): EnumItem<C, D, O>[];
    $map<R>(this: Enum<C, D, O>, fn: (item: EnumItem<C, D, O>) => R, excludes?: keyof O | (keyof O)[]): R[];
    $options(this: Enum<C, D, O>, excludes?: keyof O | (keyof O)[]): {
        value: GetEnumCodeType<O>;
        label: string;
    }[];
};
type EnumKeyRes<C, O> = {
    [key in keyof O]: EnumItem<C, O[key], O>;
};
type EnumCodeRes<O> = {
    [key: Key]: undefined | UnionValue<O[Keys<O>]>;
};
type Enum<C, D, O> = EnumBuildIn<C, D, O> & EnumKeyRes<C, O> & EnumCodeRes<O>;
export type GetEnumCodeType<T> = T extends Enum<any, any, infer O> ? O extends Record<Key, EnumData<infer C>> ? C : never : never;
export declare function eEnum<C, D extends EnumData<C>, const O extends Record<Key, D>>(data: O): Enum<C, D, O>;
export default eEnum;
