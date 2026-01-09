export * from "./lrc";
export * from "./player";

/**
 * 简易版 clsx 实现
 * clsx(
  'base',
  isActive && 'active',
  ['a', 'b'],
  { highlight: count > 3 }
)
 */
export function clsx(...args: any[]): string {
  const classes: string[] = [];

  args.forEach((arg) => {
    if (!arg) return;

    if (typeof arg === "string" || typeof arg === "number") {
      classes.push(String(arg));
    } else if (Array.isArray(arg)) {
      classes.push(clsx(...arg));
    } else if (typeof arg === "object") {
      Object.entries(arg).forEach(([key, value]) => {
        if (value) classes.push(key);
      });
    }
  });

  return classes.join(" ");
}

// 判断值是否为 null 或 undefined
export function isNil(value: any): value is null | undefined {
  return value === null || value === undefined;
}

// 类似 lodash 的 uniqBy 方法
export function uniqBy<T, K = any>(arr: readonly T[], iteratee: ((item: T) => K) | keyof T): T[] {
  if (!Array.isArray(arr) || arr.length === 0) return [];

  const getKey: (item: T) => K =
    typeof iteratee === "function" ? (iteratee as (item: T) => K) : (item) => (item as any)[iteratee as string] as K;

  const seen = new Map<K, boolean>();
  const res: T[] = [];

  for (const item of arr) {
    const key = getKey(item);
    // Map uses SameValueZero for keys (NaN 等特殊情况也能处理)
    if (!seen.has(key)) {
      seen.set(key, true);
      res.push(item);
    }
  }

  return res;
}
