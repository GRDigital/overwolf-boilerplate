/* eslint-disable */
type Transformer<A,B> = {
	'@@transducer/step': <I,R>(r: A, a: *) => R,
	'@@transducer/init': () => A,
	'@@transducer/result': (result: *) => B
}

declare module ramda {
	declare export type UnaryFn<A,R> = (a: A) => R;
	declare export type BinaryFn<A,B,R> = ((a: A, b: B) => R) & ((a:A) => (b: B) => R);
	declare export type UnarySameTypeFn<T> = UnaryFn<T,T>
	declare export type BinarySameTypeFn<T> = BinaryFn<T,T,T>
	declare export type NestedObject<T> = { [k: string]: T | NestedObject<T> }
	declare export type UnaryPredicateFn<T> = (T) => boolean
	declare export type BinaryPredicateFn<T> = (x:T, y:T) => boolean
	declare export type BinaryPredicateFn2<T,S> = (x:T, y:S) => boolean

	declare export interface ObjPredicate {
		(value: any, key: string): boolean;
	}

	declare export type CurriedFunction2<T1, T2, R> =
		& ((T1) => (T2) => R)
		& ((T1, T2) => R)

	declare export type CurriedFunction3<T1, T2, T3, R> =
		& ((T1) => CurriedFunction2<T2, T3, R>)
		& ((T1, T2) => (T3) => R)
		& ((T1, T2, T3) => R)

	declare export type CurriedFunction4<T1, T2, T3, T4, R> =
		& ((T1) => CurriedFunction3<T2, T3, T4, R>)
		& ((T1, T2) => CurriedFunction2<T3, T4, R>)
		& ((T1, T2, T3) => (T4) => R)
		& ((T1, T2, T3, T4) => R)

	declare export type CurriedFunction5<T1, T2, T3, T4, T5, R> =
		& ((T1) => CurriedFunction4<T2, T3, T4, T5, R>)
		& ((T1, T2) => CurriedFunction3<T3, T4, T5, R>)
		& ((T1, T2, T3) => CurriedFunction2<T4, T5, R>)
		& ((T1, T2, T3, T4) => (T5) => R)
		& ((T1, T2, T3, T4, T5) => R)

	declare export type CurriedFunction6<T1, T2, T3, T4, T5, T6, R> =
		& ((T1) => CurriedFunction5<T2, T3, T4, T5, T6, R>)
		& ((T1, T2) => CurriedFunction4<T3, T4, T5, T6, R>)
		& ((T1, T2, T3) => CurriedFunction3<T4, T5, T6, R>)
		& ((T1, T2, T3, T4) => CurriedFunction2<T5, T6, R>)
		& ((T1, T2, T3, T4, T5) => (T6) => R)
		& ((T1, T2, T3, T4, T5, T6) => R)

	declare export type Curry =
		& (<T1, T2, TResult>((a: T1, b: T2) => TResult) => CurriedFunction2<T1,T2, TResult>)
		& (<T1, T2, T3, TResult>((a: T1, b: T2, c: T3) => TResult) => CurriedFunction3<T1,T2, T3, TResult>)
		& (<T1, T2, T3, T4, TResult>((a: T1, b: T2, c: T3, d: T4) => TResult) => CurriedFunction4<T1,T2, T3, T4, TResult>)
		& (<T1, T2, T3, T4, T5, TResult>((a: T1, b: T2, c: T3, d: T4, e: T5) => TResult) => CurriedFunction5<T1,T2, T3, T4, T5, TResult>)
		& (<T1, T2, T3, T4, T5, T6, TResult>((a: T1, b: T2, c: T3, d: T4, e: T5, f: T6) => TResult) => CurriedFunction6<T1,T2, T3, T4, T5, T6, TResult>)

	declare export type Filter =
		& (<K,V,T:$ReadOnlyArray<V>|{[key:K]:V}>(UnaryPredicateFn<V>, xs:T) => T)
		& (<K,V,T:$ReadOnlyArray<V>|{[key:K]:V}>(UnaryPredicateFn<V>) => (xs:T) => T)

	declare export class Monad<T> {
		chain: Function
	}

	declare export class Semigroup<T> {}

	declare export class Chain {
		chain<T,V: Monad<T>|$ReadOnlyArray<T>>((a:T) => V, x: V): V;
		chain<T,V: Monad<T>|$ReadOnlyArray<T>>((a:T) => V): (x: V) => V;
	}

	declare export class GenericContructor<T> {
		constructor(T): GenericContructor<any>
	}

	declare export class GenericContructorMulti {
		constructor(...args: $ReadOnlyArray<any>): GenericContructor<any>
	}


	/**
	* DONE:
	* Function*
	* List*
	* Logic
	* Math
	* Object*
	* Relation
	* String
	* Type
	*/

	declare export var compose: $Compose;
	declare export var pipe: $ComposeReverse;
	declare export var curry: Curry;
	declare export function curryN(length: number, (...args: $ReadOnlyArray<any>) => any): Function

	// *Math
	declare export var add: CurriedFunction2<number,number,number>;
	declare export var inc: UnaryFn<number,number>;
	declare export var dec: UnaryFn<number,number>;
	declare export var mean: UnaryFn<$ReadOnlyArray<number>,number>;
	declare export var divide: CurriedFunction2<number,number,number>
	declare export var mathMod: CurriedFunction2<number,number,number>;
	declare export var median: UnaryFn<$ReadOnlyArray<number>,number>;
	declare export var modulo: CurriedFunction2<number,number,number>;
	declare export var multiply: CurriedFunction2<number,number,number>;
	declare export var negate: UnaryFn<number,number>;
	declare export var product: UnaryFn<$ReadOnlyArray<number>,number>;
	declare export var subtract: CurriedFunction2<number,number,number>;
	declare export var sum: UnaryFn<$ReadOnlyArray<number>,number>;

	// Filter
	declare export var filter: Filter;
	declare export var reject: Filter;

	// *String
	declare export var match: CurriedFunction2<RegExp,string,$ReadOnlyArray<string|void>>;
	declare export var replace: CurriedFunction3<RegExp|string,string,string,string>;
	declare export var split: CurriedFunction2<RegExp|string,string,$ReadOnlyArray<string>>
	declare export var test: CurriedFunction2<RegExp,string,boolean>
	declare export function toLower(a: string): string;
	declare export function toString(a: any): string;
	declare export function toUpper(a: string): string;
	declare export function trim(a: string): string;

	// *Type
	declare export function is<T>(t: T): (v: any) => boolean;
	declare export function is<T>(t: T, v: any): boolean;
	declare export var propIs: CurriedFunction3<any,string,Object,boolean>;
	declare export function type(x: ?any): string;
	declare export function isArrayLike(x: any): boolean;
	declare export function isNil(x: ?any): boolean;

	// *List
	declare export function adjust<T>((a: T) => T): (index: number) => (src: $ReadOnlyArray<T>) => $ReadOnlyArray<T>;
	declare export function adjust<T>((a: T) => T, index: number): (src: $ReadOnlyArray<T>) => $ReadOnlyArray<T>;
	declare export function adjust<T>((a: T) => T, index: number, src: $ReadOnlyArray<T>): $ReadOnlyArray<T>;

	declare export function all<T>(UnaryPredicateFn<T>, $ReadOnlyArray<T>): boolean;
	declare export function all<T>(UnaryPredicateFn<T>): ($ReadOnlyArray<T>) => boolean;

	declare export function any<T>(UnaryPredicateFn<T>, $ReadOnlyArray<T>): boolean;
	declare export function any<T>(UnaryPredicateFn<T>): ($ReadOnlyArray<T>) => boolean;

	declare export function aperture<T>(n: number, $ReadOnlyArray<T>): $ReadOnlyArray<$ReadOnlyArray<T>>;
	declare export function aperture<T>(n: number): ($ReadOnlyArray<T>) => $ReadOnlyArray<$ReadOnlyArray<T>>;

	declare export function append<E>(x: E, $ReadOnlyArray<E>): $ReadOnlyArray<E>
	declare export function append<E>(x: E): ($ReadOnlyArray<E>) => $ReadOnlyArray<E>

	declare export function prepend<E>(x: E, $ReadOnlyArray<E>): $ReadOnlyArray<E>
	declare export function prepend<E>(x: E): ($ReadOnlyArray<E>) => $ReadOnlyArray<E>

	declare export function concat<V,T:$ReadOnlyArray<V>|string>(T, T): T;
	declare export function concat<V,T:$ReadOnlyArray<V>|string>(T): (T) => T;

	declare export function contains<E: string, T: string>(E, T): boolean
	declare export function contains<E: string, T: string>(E): (T) => boolean
	declare export function contains<E, T:$ReadOnlyArray<E>>(E, T): boolean
	declare export function contains<E, T:$ReadOnlyArray<E>>(E): (T) => boolean

	declare export function drop<V,T:$ReadOnlyArray<V>|string>(n: number):(T) => T;
	declare export function drop<V,T:$ReadOnlyArray<V>|string>(n: number, T): T;

	declare export function dropLast<V,T:$ReadOnlyArray<V>|string>(n: number):(T) => T;
	declare export function dropLast<V,T:$ReadOnlyArray<V>|string>(n: number, T): T;

	declare export function dropLastWhile<V,T:$ReadOnlyArray<V>>(UnaryPredicateFn<V>): (xs:T) => T;
	declare export function dropLastWhile<V,T:$ReadOnlyArray<V>>(UnaryPredicateFn<V>, xs:T): T;

	declare export function dropWhile<V,T:$ReadOnlyArray<V>>(UnaryPredicateFn<V>): (xs:T) => T;
	declare export function dropWhile<V,T:$ReadOnlyArray<V>>(UnaryPredicateFn<V>, xs:T): T;

	declare export function dropRepeats<V,T:$ReadOnlyArray<V>>(xs:T): T;

	declare export function dropRepeatsWith<V,T:$ReadOnlyArray<V>>(BinaryPredicateFn<V>): (xs:T) => T;
	declare export function dropRepeatsWith<V,T:$ReadOnlyArray<V>>(BinaryPredicateFn<V>, xs:T): T;

	declare export function groupBy<T>((T) => string, $ReadOnlyArray<T>): {| [string]: $ReadOnlyArray<T> |};
	declare export function groupBy<T>((T) => string): ($ReadOnlyArray<T>) => {| [string]: $ReadOnlyArray<T> |};

	declare export function groupWith<T,V:$ReadOnlyArray<T>|string>(BinaryPredicateFn<T>, V): $ReadOnlyArray<V>
	declare export function groupWith<T,V:$ReadOnlyArray<T>|string>(BinaryPredicateFn<T>): (V) => $ReadOnlyArray<V>

	declare export function head<T,V:$ReadOnlyArray<T>>(V): ?T
	declare export function head<T,V:string>(V): V

	declare export function into<I,T,A:$ReadOnlyArray<T>,R:$ReadOnlyArray<*>|string|Object>(accum: R, xf: (a: A) => I, input: A): R
	declare export function into<I,T,A:$ReadOnlyArray<T>,R>(accum: Transformer<I,R>, xf: (a: A) => R, input: A): R

	declare export function indexOf<E>(x: E, $ReadOnlyArray<E>): number
	declare export function indexOf<E>(x: E): ($ReadOnlyArray<E>) => number

	declare export function indexBy<V,T:{[key: string]:*}>((T) => string): ($ReadOnlyArray<T>) => {[key: string]: T}
	declare export function indexBy<V,T:{[key: string]:*}>((T) => string, $ReadOnlyArray<T>): {[key: string]: T}

	declare export function insert<T>(index: number): (elem: T) => (src: $ReadOnlyArray<T>) => $ReadOnlyArray<T>
	declare export function insert<T>(index: number, elem: T): (src: $ReadOnlyArray<T>) => $ReadOnlyArray<T>
	declare export function insert<T>(index: number, elem: T, src: $ReadOnlyArray<T>): $ReadOnlyArray<T>

	declare export function insertAll<T,S>(index: number): (elem: $ReadOnlyArray<S>) => (src: $ReadOnlyArray<T>) => $ReadOnlyArray<S|T>
	declare export function insertAll<T,S>(index: number, elems: $ReadOnlyArray<S>): (src: $ReadOnlyArray<T>) => $ReadOnlyArray<S|T>
	declare export function insertAll<T,S>(index: number, elems: $ReadOnlyArray<S>, src: $ReadOnlyArray<T>): $ReadOnlyArray<S|T>

	declare export function join(x: string, $ReadOnlyArray<any>): string
	declare export function join(x: string): ($ReadOnlyArray<any>) => string

	declare export function last<T,V:$ReadOnlyArray<T>>(V): ?T
	declare export function last<T,V:string>(V): V

	declare export function none<T>(UnaryPredicateFn<T>, $ReadOnlyArray<T>): boolean;
	declare export function none<T>(UnaryPredicateFn<T>): ($ReadOnlyArray<T>) => boolean;

	declare export function nth<V,T:$ReadOnlyArray<V>>(i: number, T): ?V
	declare export function nth<V,T:$ReadOnlyArray<V>|string>(i: number): ((string) => string)&((T) => ?V)
	declare export function nth<T:string>(i: number, T):	T

	// declare export function find<V,O:{[key:string]:*},T:$ReadOnlyArray<V>|O>(UnaryPredicateFn<V>): (xs:T|O) => ?V|O;
	// declare export function find<V,O:{[key:string]:*},T:$ReadOnlyArray<V>|O>(UnaryPredicateFn<V>, xs:T|O): ?V|O;
	declare export function find<Item, Arr: $ReadOnlyArray<Item>>(UnaryPredicateFn<Item>, Arr): ?Item;
	declare export function find<Item, Arr: $ReadOnlyArray<Item>>(UnaryPredicateFn<Item>): (Arr) => ?Item;
	declare export function findLast<V,O:{[key:string]:*},T:$ReadOnlyArray<V>|O>(UnaryPredicateFn<V>): (xs:T|O) => ?V|O;
	declare export function findLast<V,O:{[key:string]:*},T:$ReadOnlyArray<V>|O>(UnaryPredicateFn<V>, xs:T|O): ?V|O;

	declare export function findIndex<K,V,T:$ReadOnlyArray<V>|{[key:K]:V}>(UnaryPredicateFn<V>): (xs:T) => number
	declare export function findIndex<K,V,T:$ReadOnlyArray<V>|{[key:K]:V}>(UnaryPredicateFn<V>, xs:T): number
	declare export function findLastIndex<K,V,T:$ReadOnlyArray<V>|{[key:K]:V}>(UnaryPredicateFn<V>): (xs:T) => number
	declare export function findLastIndex<K,V,T:$ReadOnlyArray<V>|{[key:K]:V}>(UnaryPredicateFn<V>, xs:T): number

	declare export function forEach<T,V>((T) => ?V, $ReadOnlyArray<T>): $ReadOnlyArray<T>
	declare export function forEach<T,V>((T) => ?V): ($ReadOnlyArray<T>) => $ReadOnlyArray<T>

	declare export function lastIndexOf<E>(x: E, $ReadOnlyArray<E>): number
	declare export function lastIndexOf<E>(x: E): ($ReadOnlyArray<E>) => number

	declare export function map<T,R>((T) => R, $ReadOnlyArray<T>): $ReadOnlyArray<R>;
	declare export function map<T,R>((T) => R): ($ReadOnlyArray<T>) => $ReadOnlyArray<R>;
	// declare export function map<T,R,S:{map:Function}>((T) => R, S): S;
	// declare export function map<T,R>((T) => R): (({[key: string]: T}) => {[key: string]: R}) & (($ReadOnlyArray<T>) => $ReadOnlyArray<R>)
	// declare export function map<T,R,S:{map:Function}>((T) => R): ((xs:S) => S) & ((S) => S)
	// declare export function map<T,R>((T) => R, {[key: string]: T}): {[key: string]: R}

	declare export type AccumIterator<A,B,R> = (acc: R, x: A) => [R,B]
	declare export function mapAccum<A,B,R>(AccumIterator<A,B,R>, acc: R, $ReadOnlyArray<A>): [R, $ReadOnlyArray<B>];
	declare export function mapAccum<A,B,R>(AccumIterator<A,B,R>): (acc: R, $ReadOnlyArray<A>) => [R, $ReadOnlyArray<B>];

	declare export function mapAccumRight<A,B,R>(AccumIterator<A,B,R>, acc: R, $ReadOnlyArray<A>): [R, $ReadOnlyArray<B>];
	declare export function mapAccumRight<A,B,R>(AccumIterator<A,B,R>): (acc: R, $ReadOnlyArray<A>) => [R, $ReadOnlyArray<B>];

	declare export function intersperse<E>(x: E, $ReadOnlyArray<E>): $ReadOnlyArray<E>
	declare export function intersperse<E>(x: E): ($ReadOnlyArray<E>) => $ReadOnlyArray<E>

	declare export function pair<A,B>(a:A, b:B): [A,B]
	declare export function pair<A,B>(a:A): (b:B) => [A,B]

	declare export function partition<K,V,T:$ReadOnlyArray<V>|{[key:K]:V}>(UnaryPredicateFn<V>, xs:T): [T,T]
	declare export function partition<K,V,T:$ReadOnlyArray<V>|{[key:K]:V}>(UnaryPredicateFn<V>): (xs:T) => [T,T]

	declare export function pluck<Obj, Key: $Keys<Obj>, Val: $ElementType<Obj, Key>>(Key): ($ReadOnlyArray<Obj>) => $ReadOnlyArray<Val>
	declare export function pluck<Obj, Key: $Keys<Obj>, Val: $ElementType<Obj, Key>>(Key, $ReadOnlyArray<Obj>): $ReadOnlyArray<Val>
	declare export function pluck<T, K: number>(K): ($ReadOnlyArray<T>) => $ReadOnlyArray<$ElementType<T, K>>
	declare export function pluck<T, K: number>(K, $ReadOnlyArray<T>): $ReadOnlyArray<$ElementType<T, K>>

	declare export var range: CurriedFunction2<number,number,$ReadOnlyArray<number>>;

	declare export function remove<T>(from: number): ((to: number) => (src: $ReadOnlyArray<T>) => $ReadOnlyArray<T>) & ((to: number, src: $ReadOnlyArray<T>) => $ReadOnlyArray<T>)
	declare export function remove<T>(from: number, to: number): (src: $ReadOnlyArray<T>) => $ReadOnlyArray<T>
	declare export function remove<T>(from: number, to: number, src: $ReadOnlyArray<T>): $ReadOnlyArray<T>

	declare export function repeat<T>(T, times: number): $ReadOnlyArray<T>
	declare export function repeat<T>(T): (times: number) => $ReadOnlyArray<T>

	declare export function slice<V,T:$ReadOnlyArray<V>|string>(from: number): ((to: number) => (src: T) => T) & ((to: number, src: T) => T)
	declare export function slice<V,T:$ReadOnlyArray<V>|string>(from: number, to: number): (src: T) => T
	declare export function slice<V,T:$ReadOnlyArray<V>|string>(from: number, to: number, src: T): T

	declare export function sort<V,T:$ReadOnlyArray<V>>((a:V, b:V) => number, xs:T): T
	declare export function sort<V,T:$ReadOnlyArray<V>>((a:V, b:V) => number): (xs:T) => T

	declare export function times<T>((i: number) => T, n: number): $ReadOnlyArray<T>
	declare export function times<T>((i: number) => T): (n: number) => $ReadOnlyArray<T>

	// declare export function take<V,T:$ReadOnlyArray<V>|string>(n: number, T): T;
	// declare export function take<V,T:$ReadOnlyArray<V>|string>(n: number):(T) => T;
	declare export function take<V, T: $ReadOnlyArray<V>>(n: 0, T): [];
	declare export function take<V, T: $ReadOnlyArray<V>>(n: 1, T): [V];
	declare export function take<V, T: $ReadOnlyArray<V>>(n: 2, T): [V, V];
	declare export function take<V, T: $ReadOnlyArray<V>>(n: 3, T): [V, V, V];
	declare export function take<V, T: $ReadOnlyArray<V>>(n: 4, T): [V, V, V, V];
	declare export function take<V, T: $ReadOnlyArray<V>>(n: 5, T): [V, V, V, V, V];
	declare export function take<V, T: $ReadOnlyArray<V>>(n: 6, T): [V, V, V, V, V, V];
	declare export function take<V, T: $ReadOnlyArray<V>>(n: 7, T): [V, V, V, V, V, V, V];
	declare export function take<V, T: $ReadOnlyArray<V>>(n: 8, T): [V, V, V, V, V, V, V, V];
	declare export function take<V, T: $ReadOnlyArray<V>>(n: 9, T): [V, V, V, V, V, V, V, V, V];
	declare export function take<V, T: $ReadOnlyArray<V>>(n: 10, T): [V, V, V, V, V, V, V, V, V, V];
	declare export function take<V, T: $ReadOnlyArray<V>>(n: 11, T): [V, V, V, V, V, V, V, V, V, V, V];
	declare export function take<V, T: $ReadOnlyArray<V>>(n: 12, T): [V, V, V, V, V, V, V, V, V, V, V, V];
	declare export function take<V, T: $ReadOnlyArray<V>>(n: 13, T): [V, V, V, V, V, V, V, V, V, V, V, V, V];
	declare export function take<V, T: $ReadOnlyArray<V>>(n: 14, T): [V, V, V, V, V, V, V, V, V, V, V, V, V, V];
	declare export function take<V, T: $ReadOnlyArray<V>>(n: 15, T): [V, V, V, V, V, V, V, V, V, V, V, V, V, V, V];
	declare export function take<V, T: $ReadOnlyArray<V>>(n: 16, T): [V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V];
	declare export function take<V, T: $ReadOnlyArray<V>>(n: 17, T): [V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V];
	declare export function take<V, T: $ReadOnlyArray<V>>(n: 18, T): [V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V];
	declare export function take<V, T: $ReadOnlyArray<V>>(n: 19, T): [V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V];
	declare export function take<V, T: $ReadOnlyArray<V>>(n: 20, T): [V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V];
	declare export function take<V, T: $ReadOnlyArray<V>>(n: 0): (T) => [];
	declare export function take<V, T: $ReadOnlyArray<V>>(n: 1): (T) => [V];
	declare export function take<V, T: $ReadOnlyArray<V>>(n: 2): (T) => [V, V];
	declare export function take<V, T: $ReadOnlyArray<V>>(n: 3): (T) => [V, V, V];
	declare export function take<V, T: $ReadOnlyArray<V>>(n: 4): (T) => [V, V, V, V];
	declare export function take<V, T: $ReadOnlyArray<V>>(n: 5): (T) => [V, V, V, V, V];
	declare export function take<V, T: $ReadOnlyArray<V>>(n: 6): (T) => [V, V, V, V, V, V];
	declare export function take<V, T: $ReadOnlyArray<V>>(n: 7): (T) => [V, V, V, V, V, V, V];
	declare export function take<V, T: $ReadOnlyArray<V>>(n: 8): (T) => [V, V, V, V, V, V, V, V];
	declare export function take<V, T: $ReadOnlyArray<V>>(n: 9): (T) => [V, V, V, V, V, V, V, V, V];
	declare export function take<V, T: $ReadOnlyArray<V>>(n: 10): (T) => [V, V, V, V, V, V, V, V, V, V];
	declare export function take<V, T: $ReadOnlyArray<V>>(n: 11): (T) => [V, V, V, V, V, V, V, V, V, V, V];
	declare export function take<V, T: $ReadOnlyArray<V>>(n: 12): (T) => [V, V, V, V, V, V, V, V, V, V, V, V];
	declare export function take<V, T: $ReadOnlyArray<V>>(n: 13): (T) => [V, V, V, V, V, V, V, V, V, V, V, V, V];
	declare export function take<V, T: $ReadOnlyArray<V>>(n: 14): (T) => [V, V, V, V, V, V, V, V, V, V, V, V, V, V];
	declare export function take<V, T: $ReadOnlyArray<V>>(n: 15): (T) => [V, V, V, V, V, V, V, V, V, V, V, V, V, V, V];
	declare export function take<V, T: $ReadOnlyArray<V>>(n: 16): (T) => [V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V];
	declare export function take<V, T: $ReadOnlyArray<V>>(n: 17): (T) => [V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V];
	declare export function take<V, T: $ReadOnlyArray<V>>(n: 18): (T) => [V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V];
	declare export function take<V, T: $ReadOnlyArray<V>>(n: 19): (T) => [V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V];
	declare export function take<V, T: $ReadOnlyArray<V>>(n: 20): (T) => [V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V];

	declare export function takeLast<V,T:$ReadOnlyArray<V>|string>(n: number, T): T;
	declare export function takeLast<V,T:$ReadOnlyArray<V>|string>(n: number):(T) => T;

	declare export function takeLastWhile<V,T:$ReadOnlyArray<V>>(UnaryPredicateFn<V>, xs:T): T;
	declare export function takeLastWhile<V,T:$ReadOnlyArray<V>>(UnaryPredicateFn<V>): (xs:T) => T;

	declare export function takeWhile<V,T:$ReadOnlyArray<V>>(UnaryPredicateFn<V>, xs:T): T;
	declare export function takeWhile<V,T:$ReadOnlyArray<V>>(UnaryPredicateFn<V>): (xs:T) => T;

	declare export function unfold<T,R>((seed: T) => [R, T]|boolean): (seed: T) => $ReadOnlyArray<R>
	declare export function unfold<T,R>((seed: T) => [R, T]|boolean, seed: T): $ReadOnlyArray<R>

	declare export function uniqBy<T,V>((T) => V): ($ReadOnlyArray<T>) => $ReadOnlyArray<T>
	declare export function uniqBy<T,V>((T) => V, $ReadOnlyArray<T>): $ReadOnlyArray<T>

	declare export function uniqWith<T>(BinaryPredicateFn<T>): ($ReadOnlyArray<T>) => $ReadOnlyArray<T>
	declare export function uniqWith<T>(BinaryPredicateFn<T>, $ReadOnlyArray<T>): $ReadOnlyArray<T>

	declare export function update<T>(index: number): ((elem: T) => (src: $ReadOnlyArray<T>) => $ReadOnlyArray<T>) & ((elem: T, src: $ReadOnlyArray<T>) => $ReadOnlyArray<T>)
	declare export function update<T>(index: number, elem: T): (src: $ReadOnlyArray<T>) => $ReadOnlyArray<T>
	declare export function update<T>(index: number, elem: T, src: $ReadOnlyArray<T>): $ReadOnlyArray<T>

	// TODO `without` as a transducer
	declare export function without<T>($ReadOnlyArray<T>, src: $ReadOnlyArray<T>): $ReadOnlyArray<T>
	declare export function without<T>($ReadOnlyArray<T>): (src: $ReadOnlyArray<T>) => $ReadOnlyArray<T>

	declare export function xprod<T,S>($ReadOnlyArray<T>, ys: $ReadOnlyArray<S>): $ReadOnlyArray<[T,S]>
	declare export function xprod<T,S>($ReadOnlyArray<T>): (ys: $ReadOnlyArray<S>) => $ReadOnlyArray<[T,S]>

	declare export function zip<T,S>($ReadOnlyArray<T>, ys: $ReadOnlyArray<S>): $ReadOnlyArray<[T,S]>
	declare export function zip<T,S>($ReadOnlyArray<T>): (ys: $ReadOnlyArray<S>) => $ReadOnlyArray<[T,S]>

	declare export function zipObj<T:string,S>($ReadOnlyArray<T>, ys: $ReadOnlyArray<S>): {[key:T]:S}
	declare export function zipObj<T:string,S>($ReadOnlyArray<T>): (ys: $ReadOnlyArray<S>) => {[key:T]:S}

	declare export type Nested$ReadOnlyArray<T> = $ReadOnlyArray<T | Nested$ReadOnlyArray<T>>
	declare export function flatten<T>(Nested$ReadOnlyArray<T>): $ReadOnlyArray<T>;

	declare export function fromPairs<T,V>(pair: $ReadOnlyArray<[T,V]>): {[T]:V};

	declare export function init<T,V:$ReadOnlyArray<T>|string>(V): V;

	declare export function length(string): number;
	declare export function length<T>($ReadOnlyArray<T>): number;

	declare export function mergeAll(objs: $ReadOnlyArray<{[key: string]: any}>):{[key: string]: any};

	declare export function reverse<T,V:$ReadOnlyArray<T>|string>(V): V;

	declare export function reduce<A, B>((acc: A, elem: B) => A): ((init: A, $ReadOnlyArray<B>) => A) & ((init: A) => ($ReadOnlyArray<B>) => A);
	declare export function reduce<A, B>((acc: A, elem: B) => A, init: A): ($ReadOnlyArray<B>) => A;
	declare export function reduce<A, B>((acc: A, elem: B) => A, init: A, $ReadOnlyArray<B>): A;

	declare export function reduceBy<A, B>((acc: B, elem: A) => B):
	((acc: B) => ((keyFn:(elem: A) => string) => ($ReadOnlyArray<A>) => {[key: string]: B}) & ((keyFn:(elem: A) => string, $ReadOnlyArray<A>) => {[key: string]: B}))
	& ((acc: B, keyFn:(elem: A) => string) => ($ReadOnlyArray<A>) => {[key: string]: B})
	& ((acc: B, keyFn:(elem: A) => string, $ReadOnlyArray<A>) => {[key: string]: B})
	declare export function reduceBy<A, B>((acc: B, elem: A) => B, acc: B):
	((keyFn:(elem: A) => string) => ($ReadOnlyArray<A>) => {[key: string]: B})
	& ((keyFn:(elem: A) => string, $ReadOnlyArray<A>) => {[key: string]: B})
	declare export function reduceBy<A, B>((acc: B, elem: A) => B, acc: B, keyFn:(elem: A) => string): ($ReadOnlyArray<A>) => {[key: string]: B};
	declare export function reduceBy<A, B>((acc: B, elem: A) => B, acc: B, keyFn:(elem: A) => string, $ReadOnlyArray<A>): {[key: string]: B};

	declare export function reduceRight<A, B>((acc: A, elem: B) => A): ((init: A, $ReadOnlyArray<B>) => A) & ((init: A) => ($ReadOnlyArray<B>) => A);
	declare export function reduceRight<A, B>((acc: A, elem: B) => A, init: A): ($ReadOnlyArray<B>) => A;
	declare export function reduceRight<A, B>((acc: A, elem: B) => A, init: A, $ReadOnlyArray<B>): A;

	declare export function scan<A, B>((acc: A, elem: B) => A): ((init: A, $ReadOnlyArray<B>) => A) & ((init: A) => ($ReadOnlyArray<B>) => A);
	declare export function scan<A, B>((acc: A, elem: B) => A, init: A): ($ReadOnlyArray<B>) => A;
	declare export function scan<A, B>((acc: A, elem: B) => A, init: A, $ReadOnlyArray<B>): A;

	declare export function splitAt<V,T:$ReadOnlyArray<V>|string>(i: number, T): [T,T];
	declare export function splitAt<V,T:$ReadOnlyArray<V>|string>(i: number): (T) => [T,T];
	declare export function splitEvery<V,T:$ReadOnlyArray<V>|string>(i: number, T): $ReadOnlyArray<T>;
	declare export function splitEvery<V,T:$ReadOnlyArray<V>|string>(i: number): (T) => $ReadOnlyArray<T>;
	declare export function splitWhen<V,T:$ReadOnlyArray<V>>(UnaryPredicateFn<V>, xs:T): [T,T];
	declare export function splitWhen<V,T:$ReadOnlyArray<V>>(UnaryPredicateFn<V>): (xs:T) => [T,T];

	declare export function tail<T,V:$ReadOnlyArray<T>|string>(V): V;

	declare export function transpose<T>($ReadOnlyArray<$ReadOnlyArray<T>>): $ReadOnlyArray<$ReadOnlyArray<T>>;

	declare export function uniq<T>($ReadOnlyArray<T>): $ReadOnlyArray<T>;

	declare export function unnest<T>($ReadOnlyArray<$ReadOnlyArray<T>>): $ReadOnlyArray<T>;

	declare export function zipWith<T,S,R>((a: T, b: S) => R): (($ReadOnlyArray<T>, ys: $ReadOnlyArray<S>) => $ReadOnlyArray<R>) & (($ReadOnlyArray<T> ) => (ys: $ReadOnlyArray<S>) => $ReadOnlyArray<R>)
	declare export function zipWith<T,S,R>((a: T, b: S) => R, $ReadOnlyArray<T>): (ys: $ReadOnlyArray<S>) => $ReadOnlyArray<R>;
	declare export function zipWith<T,S,R>((a: T, b: S) => R, $ReadOnlyArray<T>, ys: $ReadOnlyArray<S>): $ReadOnlyArray<R>;

	// *Relation
	declare export function equals<T>(T): (T) => boolean;
	declare export function equals<T>(T, T): boolean;

	declare export function eqBy<A,B>((x: A) => B, x: A, y: A): boolean;
	declare export function eqBy<A,B>((x: A) => B, x: A): (y: A) => boolean;
	declare export function eqBy<A,B>((x: A) => B): ((x: A, y: A) => boolean) & ((x: A) => (y: A) => boolean);

	// declare export function propEq(prop: string): ((val: *, o: {[k:string]: *}) => boolean) & ((val: *) => (o: {[k:string]: *}) => boolean)
	// declare export function propEq(prop: string, val: *): (o: {[k:string]: *}) => boolean;
	// declare export function propEq(prop: string, val: *, o: {[k:string]:*}): boolean;
	declare export function propEq<Obj, Key: $Keys<Obj>, Val: $ElementType<Obj, Key>>(key: Key): CurriedFunction2<Val, Obj, boolean>;
	declare export function propEq<Obj, Key: $Keys<Obj>, Val: $ElementType<Obj, Key>>(key: Key, val: Val): (obj: Obj) => boolean;
	declare export function propEq<Obj, Key: $Keys<Obj>, Val: $ElementType<Obj, Key>>(key: Key, val: Val, obj: Obj): boolean;

	declare export function pathEq(path: $ReadOnlyArray<string>): ((val: any, o: Object) => boolean) & ((val: any) => (o: Object) => boolean);
	declare export function pathEq(path: $ReadOnlyArray<string>, val: any): (o: Object) => boolean;
	declare export function pathEq(path: $ReadOnlyArray<string>, val: any, o: Object): boolean;

	declare export function clamp<T:number|string|Date>(min: T):
		((max: T) => (v: T) => T) & ((max: T, v: T) => T);
	declare export function clamp<T:number|string|Date>(min: T, max: T): (v: T) => T;
	declare export function clamp<T:number|string|Date>(min: T, max: T, v: T): T;

	declare export function countBy<T>((T) => string): (list: $ReadOnlyArray<T>) => {[key: string]: number};
	declare export function countBy<T>((T) => string, list: $ReadOnlyArray<T>): {[key: string]: number};

	declare export function difference<T>(xs1: $ReadOnlyArray<T>): (xs2: $ReadOnlyArray<T>) => $ReadOnlyArray<T>;
	declare export function difference<T>(xs1: $ReadOnlyArray<T>, xs2: $ReadOnlyArray<T>): $ReadOnlyArray<T>;

	declare export function differenceWith<T>(BinaryPredicateFn<T>): ((xs1: $ReadOnlyArray<T>) => (xs2: $ReadOnlyArray<T>) => $ReadOnlyArray<T>) & ((xs1: $ReadOnlyArray<T>, xs2: $ReadOnlyArray<T>) => $ReadOnlyArray<T>);
	declare export function differenceWith<T>(BinaryPredicateFn<T>, xs1: $ReadOnlyArray<T>): (xs2: $ReadOnlyArray<T>) => $ReadOnlyArray<T>;
	declare export function differenceWith<T>(BinaryPredicateFn<T>, xs1: $ReadOnlyArray<T>, xs2: $ReadOnlyArray<T>): $ReadOnlyArray<T>;

	declare export function eqBy<T>((T) => T, T, T): boolean;
	declare export function eqBy<T>((T) => T): (T, T) => boolean;
	declare export function eqBy<T>((T) => T, T): (T) => boolean;
	declare export function eqBy<T>((T) => T): (T) => (T) => boolean;

	declare export function gt<T>(T): (T) => boolean;
	declare export function gt<T>(T, T): boolean;

	declare export function gte<T>(T): (T) => boolean;
	declare export function gte<T>(T, T): boolean;

	declare export function identical<T>(T): (T) => boolean;
	declare export function identical<T>(T, T): boolean;

	declare export function intersection<T>(x: $ReadOnlyArray<T>, y: $ReadOnlyArray<T>): $ReadOnlyArray<T>;
	declare export function intersection<T>(x: $ReadOnlyArray<T>): (y: $ReadOnlyArray<T>) => $ReadOnlyArray<T>;

	declare export function intersectionWith<T>(BinaryPredicateFn<T>): ((x: $ReadOnlyArray<T>, y: $ReadOnlyArray<T>) => $ReadOnlyArray<T>) & ((x: $ReadOnlyArray<T>) => (y: $ReadOnlyArray<T>) => $ReadOnlyArray<T>);
	declare export function intersectionWith<T>(BinaryPredicateFn<T>, x: $ReadOnlyArray<T>): (y: $ReadOnlyArray<T>) => $ReadOnlyArray<T>;
	declare export function intersectionWith<T>(BinaryPredicateFn<T>, x: $ReadOnlyArray<T>, y: $ReadOnlyArray<T>): $ReadOnlyArray<T>;

	declare export function lt<T>(T): (T) => boolean;
	declare export function lt<T>(T, T): boolean;

	declare export function lte<T>(T): (T) => boolean;
	declare export function lte<T>(T, T): boolean;

	declare export function max<T>(T): (T) => T;
	declare export function max<T>(T, T): T;

	declare export function maxBy<T,V>((T) => V): ((T, T) => T) & ((T) => (T) => T);
	declare export function maxBy<T,V>((T) => V, T): (T) => T;
	declare export function maxBy<T,V>((T) => V, T, T): T;

	declare export function min<T>(T): (T) => T;
	declare export function min<T>(T, T): T;

	declare export function minBy<T,V>((T) => V): ((T, T) => T) & ((T) => (T) => T);
	declare export function minBy<T,V>((T) => V, T): (T) => T;
	declare export function minBy<T,V>((T) => V, T, T): T;

	// TODO: sortBy: Started failing in v38...
	declare export function sortBy<T,V>((T) => V): (x: $ReadOnlyArray<T>) => $ReadOnlyArray<T>;
	declare export function sortBy<T,V>((T) => V, x: $ReadOnlyArray<T>): $ReadOnlyArray<T>;

	declare export function symmetricDifference<T>(x: $ReadOnlyArray<T>): (y: $ReadOnlyArray<T>) => $ReadOnlyArray<T>;
	declare export function symmetricDifference<T>(x: $ReadOnlyArray<T>, y: $ReadOnlyArray<T>): $ReadOnlyArray<T>;

	declare export function symmetricDifferenceWith<T>(BinaryPredicateFn<T>): ((x: $ReadOnlyArray<T>) => (y: $ReadOnlyArray<T>) => $ReadOnlyArray<T>) & ((x: $ReadOnlyArray<T>, y: $ReadOnlyArray<T>) => $ReadOnlyArray<T>);
	declare export function symmetricDifferenceWith<T>(BinaryPredicateFn<T>, x: $ReadOnlyArray<T>): (y: $ReadOnlyArray<T>) => $ReadOnlyArray<T>;
	declare export function symmetricDifferenceWith<T>(BinaryPredicateFn<T>, x: $ReadOnlyArray<T>, y: $ReadOnlyArray<T>): $ReadOnlyArray<T>;

	declare export function union<T>(x: $ReadOnlyArray<T>): (y: $ReadOnlyArray<T>) => $ReadOnlyArray<T>;
	declare export function union<T>(x: $ReadOnlyArray<T>, y: $ReadOnlyArray<T>): $ReadOnlyArray<T>;

	declare export function unionWith<T>(BinaryPredicateFn<T>): ((x: $ReadOnlyArray<T>) => (y: $ReadOnlyArray<T>) => $ReadOnlyArray<T>) & (x: $ReadOnlyArray<T>, y: $ReadOnlyArray<T>) => $ReadOnlyArray<T>;
	declare export function unionWith<T>(BinaryPredicateFn<T>, x: $ReadOnlyArray<T>): (y: $ReadOnlyArray<T>) => $ReadOnlyArray<T>;
	declare export function unionWith<T>(BinaryPredicateFn<T>, x: $ReadOnlyArray<T>, y: $ReadOnlyArray<T>): $ReadOnlyArray<T>;

	// *Object
	declare export function assoc<Obj, Key: $Keys<Obj>, Val: $ElementType<Obj, Key>>(key: Key): CurriedFunction2<Val, Obj, Obj>;
	declare export function assoc<Obj, Key: $Keys<Obj>, Val: $ElementType<Obj, Key>>(key: Key, val: Val): (obj: Obj) => Obj;
	declare export function assoc<Obj, Key: $Keys<Obj>, Val: $ElementType<Obj, Key>>(key: Key, val: Val, obj: Obj): Obj;

	declare export function assocPath<T,S>(key: $ReadOnlyArray<string>, ...args: $ReadOnlyArray<void>):
		((val: T) => (src: {[k:string]:S}) => {[k:string]:S|T})
		& ((val: T) => (src: {[k:string]:S}) => {[k:string]:S|T});
	declare export function assocPath<T,S>(key: $ReadOnlyArray<string>, val:T, ...args: $ReadOnlyArray<void>): (src: {[k:string]:S}) => {[k:string]:S|T};
	declare export function assocPath<T,S>(key: $ReadOnlyArray<string>, val:T, src: {[k:string]:S}): {[k:string]:S|T};

	declare export function clone<T>(src: T): $Shape<T>;

	// TODO: $Diff idk?
	declare export function dissoc<Obj, Key: $Keys<Obj>, Val: $ElementType<Obj, Key>>(key: Key, obj: Obj): Obj;

	// declare export function dissoc<T>(key: string, ...args: $ReadOnlyArray<void>):
	//     ((val: T) => (src: {[k:string]:T}) => {[k:string]:T}) & ((val: T, src: {[k:string]:T}) => {[k:string]:T});
	// declare export function dissoc<T>(key: string, val:T, ...args: $ReadOnlyArray<void>): (src: {[k:string]:T}) => {[k:string]:T};
	// declare export function dissoc<T>(key: string, val: T, src: {[k:string]:T}): {[k:string]:T};

	declare export function dissocPath<T>(key: $ReadOnlyArray<string>, ...args: $ReadOnlyArray<void>):
		((val: T) => (src: {[k:string]:T}) => {[k:string]:T})
		& ((val: T) => (src: {[k:string]:T}) => {[k:string]:T});
	declare export function dissocPath<T>(key: $ReadOnlyArray<string>, val:T, ...args: $ReadOnlyArray<void>): (src: {[k:string]:T}) => {[k:string]:T};
	declare export function dissocPath<T>(key: $ReadOnlyArray<string>, val:T, src: {[k:string]:T}): {[k:string]:T};

	// TODO: Started failing in v31... (Attempt to fix below)
	// declare type __UnwrapNestedObjectR<T, U, V: NestedObject<(t: T) => U>> = U
	// declare type UnwrapNestedObjectR<T> = UnwrapNestedObjectR<*, *, T>
	//
	// declare function evolve<R, T: NestedObject<(x:any) => R>>(T): (src: NestedObject<any>) => UnwrapNestedObjectR<T>;
	// declare function evolve<R: NestedObject<(x:any) => R>>(T, src: NestedObject<any>): UnwrapNestedObjectR<T>;

	declare export function eqProps(key: string, ...args: $ReadOnlyArray<void>):
	((o1: Object) => (o2: Object) => boolean)
	& ((o1: Object, o2: Object) => boolean);
	declare export function eqProps(key: string, o1: Object, ...args: $ReadOnlyArray<void>): (o2: Object) => boolean;
	declare export function eqProps(key: string, o1: Object, o2: Object): boolean;

	declare export function has(key: string, o: Object): boolean;
	declare export function has(key: string):(o: Object) => boolean;

	declare export function hasIn(key: string, o: Object): boolean;
	declare export function hasIn(key: string): (o: Object) => boolean;

	// TODO:
	// declare export function invert(o: Object): {[k: string]: $ReadOnlyArray<string>};
	// declare export function invertObj(o: Object): {[k: string]: string};
	declare export function invert<T>(o: T): any;
	declare export function invertObj<T>(o: T): any;

	declare export function keys<T>(T): $ReadOnlyArray<$Keys<T>>;

	/* TODO
	lens
	lensIndex
	lensPath
	lensProp
	*/

	declare export function mapObjIndexed<A,B>((val: A, key: string, o: Object) => B, o: {[key: string]: A}): {[key: string]: B};
	declare export function mapObjIndexed<A,B>((val: A, key: string, o: Object) => B, ...args: $ReadOnlyArray<void>): (o: {[key: string]: A}) => {[key: string]: B};

	declare export function merge<A,B>(o1: A): (o2: B) => {| ...$Exact<A>, ...$Exact<B> |};
	declare export function merge<A,B>(o1: A, o2: B): {| ...$Exact<A>, ...$Exact<B> |};
	// declare export function mergeDeepRight<A,B>(o1: A, o2: B): {| ...$Exact<A>, ...$Exact<B> |};
	declare export function mergeDeepRight<A,B>(A, B): A & B;

	declare export function mergeAll<T>(os: $ReadOnlyArray<{[k:string]:T}>): {[k:string]:T};

	// declare export function mergeWith<T,S,R,A:{[k:string]:T},B:{[k:string]:S}>((v1: T, v2: S) => R):
	// ((o1: A) => (o2: B) => A & B) & ((o1: A, o2: B) => A & B);
	// declare export function mergeWith<T,S,R,A:{[k:string]:T},B:{[k:string]:S}>((v1: T, v2: S) => R, o1: A, o2: B): A & B;
	// declare export function mergeWith<T,S,R,A:{[k:string]:T},B:{[k:string]:S}>((v1: T, v2: S) => R, o1: A): (o2: B) => A & B;

	// declare export function mergeWithKey<T,S,R,A:{[k:string]:T},B:{[k:string]:S}>((key: $Keys<A&B>, v1: T, v2: S) => R):
	// ((o1: A) => (o2: B) => A & B) & ((o1: A, o2: B) => A & B);
	// declare export function mergeWithKey<T,S,R,A:{[k:string]:T},B:{[k:string]:S}>((key: $Keys<A&B>, v1: T, v2: S) => R, o1: A, o2: B): A & B;
	// declare export function mergeWithKey<T,S,R,A:{[k:string]:T},B:{[k:string]:S}>((key: $Keys<A&B>, v1: T, v2: S) => R, o1: A): (o2: B) => A & B;

	declare export function objOf<T>(key: string): (val: T) => {[key: string]: T};
	declare export function objOf<T>(key: string, val: T): {[key: string]: T};

	declare export function omit<T:Object>(keys: $ReadOnlyArray<$Keys<T>>): (val: T) => Object;
	declare export function omit<T:Object>(keys: $ReadOnlyArray<$Keys<T>>, val: T): Object;

	// TODO over

	// declare export function path<V,A:?NestedObject<V>>(p: $ReadOnlyArray<string>): (o: A) => ?V;
	// declare export function path<V,A:?NestedObject<V>>(p: $ReadOnlyArray<string>, o: A): ?V;
	declare export function path<V>(p: $ReadOnlyArray<string>, o: { ... }): ?V;

	declare export function pathOr<T,V,A:NestedObject<V>>(or: T):
	((p: $ReadOnlyArray<string>) => (o: ?A) => V|T)
	& ((p: $ReadOnlyArray<string>, o: ?A) => V|T);
	declare export function pathOr<T,V,A:NestedObject<V>>(or: T, p: $ReadOnlyArray<string>): (o: ?A) => V|T;
	declare export function pathOr<T,V,A:NestedObject<V>>(or: T, p: $ReadOnlyArray<string>, o: ?A): V|T;

	declare export function pick<A>(keys: $ReadOnlyArray<string>): (val: {[key:string]: A}) => {[key:string]: A};
	declare export function pick<A>(keys: $ReadOnlyArray<string>, val: {[key:string]: A}): {[key:string]: A};

	declare export function pickAll<A>(keys: $ReadOnlyArray<string>): (val: {[key:string]: A}) => {[key:string]: ?A};
	declare export function pickAll<A>(keys: $ReadOnlyArray<string>, val: {[key:string]: A}): {[key:string]: ?A};

	declare export function pickBy<A>(BinaryPredicateFn2<A,string>): (val: {[key:string]: A}) => {[key:string]: A};
	declare export function pickBy<A>(BinaryPredicateFn2<A,string>, val: {[key:string]: A}): {[key:string]: A};

	declare export function project<T>(keys: $ReadOnlyArray<string>): (val: $ReadOnlyArray<{[key:string]: T}>) => $ReadOnlyArray<{[key:string]: T}>;
	declare export function project<T>(keys: $ReadOnlyArray<string>, val: $ReadOnlyArray<{[key:string]: T}>): $ReadOnlyArray<{[key:string]: T}>;

	declare export function prop<O: Object, Key: $Keys<O>, T: $ElementType<O, Key>>(key: Key): (o: O) => T;
	declare export function prop<O: Object, Key: $Keys<O>, T: $ElementType<O, Key>>(key: Key, o: O): T;

	declare export function propOr<T,V,A:{[k:string]:V}>(or: T):
	((p: $Keys<A>) => (o: A) => V|T)
	& ((p: $Keys<A>, o: A) => V|T);
	declare export function propOr<T,V,A:{[k:string]:V}>(or: T, p: $Keys<A>): (o: A) => V|T;
	declare export function propOr<T,V,A:{[k:string]:V}>(or: T, p: $Keys<A>, o: A): V|T;

	declare export function keysIn(o: Object): $ReadOnlyArray<string>;

	declare export function props<T,O:{[k:string]:T}>(keys: $ReadOnlyArray<$Keys<O>>): (o: O) => $ReadOnlyArray<?T>;
	declare export function props<T,O:{[k:string]:T}>(keys: $ReadOnlyArray<$Keys<O>>, o: O): $ReadOnlyArray<?T>;

	// TODO set

	// declare export function toPairs<T,O: $ReadOnly<{[k:string]:T}>>(o: O): $ReadOnlyArray<[$Keys<O>, T]>;
	declare export function toPairs<Key, Value, Obj: $ReadOnly<{ [Key]: Value, ... }>>(obj: Obj): $ReadOnlyArray<[Key, Value]>;

	declare export function toPairsIn<T,O:{[k:string]:T}>(o: O): $ReadOnlyArray<[string, T]>;


	declare export function values<T>(T): $ReadOnlyArray<$Values<T>>;

	declare export function valuesIn<T,O:{[k:string]:T}>(o: O): $ReadOnlyArray<T|any>;

	declare export function where<T>(predObj: {[key: string]: UnaryPredicateFn<T>}): (o: {[k:string]:T}) => boolean;
	declare export function where<T>(predObj: {[key: string]: UnaryPredicateFn<T>}, o: {[k:string]:T}): boolean;

	declare export function whereEq<T,S,O:{[k:string]:T},Q:{[k:string]:S}>(predObj: O): (o: $Shape<O&Q>) => boolean;
	declare export function whereEq<T,S,O:{[k:string]:T},Q:{[k:string]:S}>(predObj: O, o: $Shape<O&Q>): boolean;

	// TODO view

	// *Function
	declare export var __: *;

	declare export var T: (_: any) => boolean;
	declare export var F: (_: any) => boolean;

	declare export function addIndex<A,B>(((A) => B, $ReadOnlyArray<A>) => $ReadOnlyArray<B>): ((A, number) => B) => ($ReadOnlyArray<A>) => $ReadOnlyArray<B>;
	// declare export function addIndex<A,B>(iterFn:((x:A) => B, $ReadOnlyArray<A>) => $ReadOnlyArray<B>): ((x: A, idx: number, $ReadOnlyArray<A>) => B, $ReadOnlyArray<A>) => $ReadOnlyArray<B>;

	declare export function always<T>(T): (x: any) => T;

	declare export function ap<T,V>(fns: $ReadOnlyArray<(T) => V>): ($ReadOnlyArray<T>) => $ReadOnlyArray<V>;
	declare export function ap<T,V>(fns: $ReadOnlyArray<(T) => V>, $ReadOnlyArray<T>): $ReadOnlyArray<V>;

	declare export function apply<T,V>((...args: $ReadOnlyArray<T>) => V): ($ReadOnlyArray<T>) => V;
	declare export function apply<T,V>((...args: $ReadOnlyArray<T>) => V, $ReadOnlyArray<T>): V;

	declare export function applySpec<S,V,T:NestedObject<(...args: $ReadOnlyArray<V>) => S>>(spec: T): (...args: $ReadOnlyArray<V>) => NestedObject<S>;

	declare export function binary<T>((...args: $ReadOnlyArray<any>) => T): (x: any, y: any) => T;

	declare export function bind<T>((...args: $ReadOnlyArray<any>) => any, thisObj: T): (...args: $ReadOnlyArray<any>) => any;

	declare export function call<T,V>((...args: $ReadOnlyArray<V>) => T, ...args: $ReadOnlyArray<V>): T;

	declare export function comparator<T>(BinaryPredicateFn<T>): (x:T, y:T) => number;

	// TODO add tests
	declare export function construct<T>(ctor: Class<GenericContructor<T>>): (T) => GenericContructor<T>;

	// TODO add tests
	declare export function constructN<T>(n: number, ctor: Class<GenericContructorMulti<any>>): (...args: any) => GenericContructorMulti<any>;

	// TODO make less generic
	declare export function converge(after: Function, fns: $ReadOnlyArray<Function>): Function;

	declare export function empty<T>(T): T;

	declare export function flip<A,B,TResult>((arg0: A, arg1: B) => TResult): CurriedFunction2<B,A,TResult>;
	declare export function flip<A,B,C,TResult>((arg0: A, arg1: B, arg2: C) => TResult): (( arg0: B, arg1: A) => (arg2: C) => TResult) & (( arg0: B, arg1: A, arg2: C) => TResult);
	declare export function flip<A,B,C,D,TResult>((arg0: A, arg1: B, arg2: C, arg3: D) => TResult): ((arg1: B, arg0: A) => (arg2: C, arg3: D) => TResult) & ((arg1: B, arg0: A, arg2: C, arg3: D) => TResult);
	declare export function flip<A,B,C,D,E,TResult>((arg0: A, arg1: B, arg2: C, arg3: D, arg4:E) => TResult): ((arg1: B, arg0: A) => (arg2: C, arg3: D, arg4: E) => TResult) & ((arg1: B, arg0: A, arg2: C, arg3: D, arg4: E) => TResult);

	declare export function identity<T>(T): T;

	declare export function invoker<A,B,C,D,O:{[k:string]: Function}>(arity: number, name: $Keys<O>): CurriedFunction2<A,O,D> & CurriedFunction3<A,B,O,D> & CurriedFunction4<A,B,C,O,D>

	declare export function juxt<T,S>(fns: $ReadOnlyArray<(...args: $ReadOnlyArray<S>) => T>): (...args: $ReadOnlyArray<S>) => $ReadOnlyArray<T>;

	// TODO lift

	// TODO liftN

	declare export function memoize<A,B,T:(...args: $ReadOnlyArray<A>) => B>(fn:T):T;

	declare export function nAry<T>(arity: number, (...args: $ReadOnlyArray<any>) => T): (...args: $ReadOnlyArray<any>) => T;

	declare export function nthArg<T>(n: number): (...args: $ReadOnlyArray<T>) => T;

	declare export function of<T>(T): $ReadOnlyArray<T>;

	declare export function once<A,B,T:(...args: $ReadOnlyArray<A>) => B>(fn:T):T;

	// TODO partial
	// TODO partialRight
	// TODO pipeK
	// TODO pipeP

	declare export function tap<T>((T) => any): (T) => T;
	declare export function tap<T>((T) => any, T): T;

	// TODO tryCatch

	declare export function unapply<T,V>(($ReadOnlyArray<T>) => V): (...args: $ReadOnlyArray<T>) => V;

	declare export function unary<T>((...args: $ReadOnlyArray<any>) => T): (x: any) => T;

	declare export var uncurryN:
		& (<A, B, C>(2, A => B => C) => (A, B) => C)
		& (<A, B, C, D>(3, A => B => C => D) => (A, B, C) => D)
		& (<A, B, C, D, E>(4, A => B => C => D => E) => (A, B, C, D) => E)
		& (<A, B, C, D, E, F>(5, A => B => C => D => E => F) => (A, B, C, D, E) => F)
		& (<A, B, C, D, E, F, G>(6, A => B => C => D => E => F => G) => (A, B, C, D, E, F) => G)
		& (<A, B, C, D, E, F, G, H>(7, A => B => C => D => E => F => G => H) => (A, B, C, D, E, F, G) => H)
		& (<A, B, C, D, E, F, G, H, I>(8, A => B => C => D => E => F => G => H => I) => (A, B, C, D, E, F, G, H) => I)

	//TODO useWith

	declare export function wrap<A,B,C,D,F:(...args: $ReadOnlyArray<A>) => B>(F, fn2: (F, ...args: $ReadOnlyArray<C>) => D): (...args: $ReadOnlyArray<A|C>) => D;

	// *Logic

	declare export function allPass<T>(fns: $ReadOnlyArray<(...args: $ReadOnlyArray<T>) => boolean>): (...args: $ReadOnlyArray<T>) => boolean;

	declare export function and(x: boolean): (y: boolean) => boolean;
	declare export function and(x: boolean, y: boolean): boolean;

	declare export function anyPass<T>(fns: $ReadOnlyArray<(...args: $ReadOnlyArray<T>) => boolean>): (...args: $ReadOnlyArray<T>) => boolean;

	declare export function both<T>(x: (...args: $ReadOnlyArray<T>) => boolean): (y: (...args: $ReadOnlyArray<T>) => boolean) => (...args: $ReadOnlyArray<T>) => boolean;
	declare export function both<T>(x: (...args: $ReadOnlyArray<T>) => boolean, y: (...args: $ReadOnlyArray<T>) => boolean): (...args: $ReadOnlyArray<T>) => boolean;

	declare export function complement<T>(x: (...args: $ReadOnlyArray<T>) => boolean): (...args: $ReadOnlyArray<T>) => boolean;

	declare export function cond<A,B>(fns: $ReadOnlyArray<[(...args: $ReadOnlyArray<A>) => boolean, (...args: $ReadOnlyArray<A>) => B]>): (...args: $ReadOnlyArray<A>) => B;


	declare export function defaultTo<T,V>(d: T): (x: ?V) => V|T;
	declare export function defaultTo<T,V>(d: T, x: ?V): V|T;

	declare export function either(x: (...args: $ReadOnlyArray<any>) => boolean): (y: (...args: $ReadOnlyArray<any>) => boolean) => (...args: $ReadOnlyArray<any>) => boolean;
	declare export function either(x: (...args: $ReadOnlyArray<any>) => boolean, y: (...args: $ReadOnlyArray<any>) => boolean): (...args: $ReadOnlyArray<any>) => boolean;

	declare export function ifElse<A,B,C>(cond:(...args: $ReadOnlyArray<A>) => boolean):
	((f1: (...args: $ReadOnlyArray<A>) => B) => (f2: (...args: $ReadOnlyArray<A>) => C) => (...args: $ReadOnlyArray<A>) => B|C)
	& ((f1: (...args: $ReadOnlyArray<A>) => B, f2: (...args: $ReadOnlyArray<A>) => C) => (...args: $ReadOnlyArray<A>) => B|C)
	declare export function ifElse<A,B,C>(
		cond:(...args: $ReadOnlyArray<any>) => boolean,
		f1: (...args: $ReadOnlyArray<any>) => B,
		f2: (...args: $ReadOnlyArray<any>) => C
	): (...args: $ReadOnlyArray<A>) => B|C;

	declare export function isEmpty(x:?$ReadOnlyArray<any>|Object|string): boolean;

	declare export function not(x:boolean): boolean;

	declare export function or(x: boolean, y: boolean): boolean;
	declare export function or(x: boolean): (y: boolean) => boolean;

	// TODO: pathSatisfies: Started failing in v39...
	// declare function pathSatisfies<T>(cond: (T) => boolean, path: $ReadOnlyArray<string>, o: NestedObject<T>): boolean;
	// declare function pathSatisfies<T>(cond: (T) => boolean, path: $ReadOnlyArray<string>): (o: NestedObject<T>) => boolean;
	// declare function pathSatisfies<T>(cond: (T) => boolean):
	// ((path: $ReadOnlyArray<string>) => (o: NestedObject<T>) => boolean)
	// & ((path: $ReadOnlyArray<string>, o: NestedObject<T>) => boolean)

	declare export function propSatisfies<T>(cond: (T) => boolean, prop: string, o: NestedObject<T>): boolean;
	declare export function propSatisfies<T>(cond: (T) => boolean, prop: string): (o: NestedObject<T>) => boolean;
	declare export function propSatisfies<T>(cond: (T) => boolean):
	((prop: string) => (o: NestedObject<T>) => boolean)
	& ((prop: string, o: NestedObject<T>) => boolean)

	declare export function unless<T,V,S>(pred: UnaryPredicateFn<T>):
	(((x: S) => V) => (T|S) => T|V)
	& (((x: S) => V, T|S) => T|V);
	declare export function unless<T,V,S>(pred: UnaryPredicateFn<T>, (x: S) => V): (T|S) => V|T;
	declare export function unless<T,V,S>(pred: UnaryPredicateFn<T>, (x: S) => V, T|S): T|V;

	declare export function until<T>(pred: UnaryPredicateFn<T>):
	(((T) => T) => (T) => T)
	& (((T) => T, T) => T);
	declare export function until<T>(pred: UnaryPredicateFn<T>, (T) => T): (T) => T;
	declare export function until<T>(pred: UnaryPredicateFn<T>, (T) => T, T): T;

	declare export function when<T,V,S>(pred: UnaryPredicateFn<T>):
	(((x: S) => V) => (T|S) => T|V)
	& (((x: S) => V, T|S) => T|V);
	declare export function when<T,V,S>(pred: UnaryPredicateFn<T>, (x: S) => V): (T|S) => V|T;
	declare export function when<T,V,S>(pred: UnaryPredicateFn<T>, (x: S) => V, T|S): T|V;

	declare export default void;
}
