import eEnum from '../src/index'

describe('eEnum', () => {

  describe('base', () => {
    test('should create an Enum object with key-value pairs', () => {
      const data = {
        A: { code: 1, label: 'Option A' },
        B: { code: 2, label: 'Option B' },
        C: { code: 3, label: 'Option C' },
      };
  
      const enumObject = eEnum(data);
  
      expect(enumObject.A.code).toEqual(1);
      expect(enumObject.B.label).toEqual('Option B');
      expect(enumObject.C.$eq(3)).toBe(true);
      expect(enumObject.C.$in(['A', 'B'])).toBe(false);
      expect(enumObject.C.$in(['A', 'B', 'C'])).toBe(true);
      expect(enumObject.C.$is('A')).toBe(false);
      expect(enumObject.C.$is('C')).toBe(true);
      expect(enumObject[1]?.label).toEqual('Option A');
    });

    test('should throw an error if using built-in properties', () => {
      expect(() => eEnum({$list: { code: 1 }})).toThrowError('The built-in property "$list" cannot be used!');
      expect(() => eEnum({$map: { code: 1 }})).toThrowError('The built-in property "$map" cannot be used!');
      expect(() => eEnum({$options: { code: 1 }})).toThrowError('The built-in property "$options" cannot be used!');
    });

    test('should throw an error if code is not specified', () => {
      const data = {
        A: { label: 'Option A' },
      };
  
      expect(() => eEnum(data as any)).toThrowError('Code must be specified!');
    });

    test('should throw an error if a code has been used', () => {
      const data = {
        A: { code: 1 },
        B: { code: 1 },
      };
  
      expect(() => eEnum(data)).toThrowError('The code "1" has been used!');
    });
  })

  describe('$list', () => {
    test('should return a list of Enum items', () => {
      const data = {
        A: { code: 1 },
        B: { code: 2 },
        C: { code: 3 },
      };
  
      const enumObject = eEnum(data);
      const list = enumObject.$list();
  
      expect(list.length).toBe(3);
      expect(list[0].$is('A')).toBe(true);
      expect(list[1].$in(['B', 'C'])).toBe(true);
      expect(list[2].$eq(3)).toBe(true);
    });

    test('should sort enum items in ascending order based on $sort property', () => {
      const data = {
        item1: { code: 'item1', $sort: 2 },
        item2: { code: 'item2', $sort: 1 },
        item3: { code: 'item3', $sort: 3 },
      };
      const enumInstance = eEnum(data);
  
      const sortedList = enumInstance.$list();
      expect(sortedList).toHaveLength(3);
      expect(sortedList[0].code).toBe('item2');
      expect(sortedList[1].code).toBe('item1');
      expect(sortedList[2].code).toBe('item3');
    });

    test('should exclude specified items from the list', () => {
      const data = {
        item1: { code: 'item1' },
        item2: { code: 'item2' },
        item3: { code: 'item3' },
      };
      const enumInstance = eEnum(data);
  
      const excludes: (keyof typeof data)[] = ['item2'];
      const sortedList = enumInstance.$list(excludes);
      expect(sortedList).toHaveLength(2);
      expect(sortedList[0].code).toBe('item1');
      expect(sortedList[1].code).toBe('item3');

      const enumData = eEnum({
        item1: { code: 'item1', $exclude: true },
        item2: { code: 'item2' },
        item3: { code: 'item3' },
      });
      const list = enumData.$list();
      expect(list).toHaveLength(2);
      expect(list[0].code).toBe('item2');
      expect(list[1].code).toBe('item3');
    });
  });

  describe('$map', () => {
    test('should return a mapped array based on Enum items', () => {
      const data = {
        A: { code: 1 },
        B: { code: 2 },
        C: { code: 3 },
      };
  
      const enumObject = eEnum(data);
      const mappedArray = enumObject.$map(item => item.code);
  
      expect(mappedArray).toEqual([1, 2, 3]);
    });

    test('should exclude specified items when mapping', () => {
      const data = {
        item1: { code: 'item1' },
        item2: { code: 'item2' },
        item3: { code: 'item3' },
      };
      const enumInstance = eEnum(data);
  
      const excludes: (keyof typeof data)[] = ['item2'];
      const mapper = (item: any) => item.code;
      const mappedList = enumInstance.$map(mapper, excludes);
  
      expect(mappedList).toHaveLength(2);
      expect(mappedList[0]).toBe('item1');
      expect(mappedList[1]).toBe('item3');

      const enumData = eEnum({
        item1: { code: 'item1', $exclude: true },
        item2: { code: 'item2' },
        item3: { code: 'item3' },
      });
      const list = enumData.$map(mapper);
      expect(list).toHaveLength(2);
      expect(list[0]).toBe('item2');
      expect(list[1]).toBe('item3');
    });
  })

  describe('$options', () => {
    test('should return options array based on Enum items', () => {
      const data = {
        A: { code: 1, label: 'Option A' },
        B: { code: 2, label: 'Option B' },
        C: { code: 3 },
      };
  
      const enumObject = eEnum(data);
      const optionsArray = enumObject.$options();
  
      expect(optionsArray).toEqual([
        { value: 1, label: 'Option A' },
        { value: 2, label: 'Option B' },
        { value: 3, label: '3' },
      ]);
    });

    test('should exclude specified items when generating options', () => {
      const data = {
        item1: { code: 'item1', label: 'Item 1' },
        item2: { code: 'item2', label: 'Item 2' },
        item3: { code: 'item3', label: 'Item 3' },
      };
      const enumInstance = eEnum(data);
  
      const excludes: (keyof typeof data)[] = ['item2'];
      const options = enumInstance.$options(excludes);
      expect(options).toHaveLength(2);
      expect(options[0]).toEqual({ value: 'item1', label: 'Item 1' });
      expect(options[1]).toEqual({ value: 'item3', label: 'Item 3' });

      const enumData = eEnum({
        item1: { code: 'item1', $exclude: true },
        item2: { code: 'item2' },
        item3: { code: 'item3' },
      });
      const list = enumData.$options();
      expect(list).toHaveLength(2);
      expect(list[0].value).toBe('item2');
      expect(list[1].value).toBe('item3');
    });
  })
});