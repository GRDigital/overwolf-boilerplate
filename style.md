## No exceptions
Never throw exceptions unless it's to silence Flow in cases where something impossible may happen. Handle errors by returning `Error | T` and checking at callsite with `instanceof Error` or a helper method.
### Rationale
Exceptions obfuscate the function's true signature. Moreso, most exceptions aren't actually exceptional - a failed network request or a file you can't read are expected outcomes. Do, however, `try {} catch (e) {}` functions which may throw exceptions.
## No classes
Classes are completely unnecessary in javascript. Prefer functions that operate on arguments. If you really have to bind data and logic - use simple tables with methods. React Components are an exception, but do not build inheritance chains off them.
### Rationale
Too long and complex to lay it out here, but feel free to google critique of practical OOP. Alan Kay's vision of OOP isn't bad, if maybe unfit for general purpose software. The C++/Java/C# version, which javascript is mimicking for no reason but comp-sci trends, is complete garbage.
#### Exception
I'm kind of on the fence still, but it could be useful to just create empty objects with `const foo = new EmptyClass()` so you could do `foo instanceof EmptyClass` later.
## Arrow functions everywhere
Use `() => { ... }` syntax function definition everywhere.
### Rationale
The new syntax is more readable, less verbose and doesn't alter the meaning of `this`. If you're not using classes, you should never need `this` ever anyway.
## Prefer pure functions and immutable everything
Unless absolutely necessary, always use maximum strictness exact type definitions in Flow (e.g. `$ReadOnlyArray`, `{| +foo: T1, +bar: T2 |}`, `const`, etc). Prefer iife to declaring a variable with `let` and assigning it later. Prefer returning new objects/arrays to mutating existing ones.
### Rationale
While not always practical, especially if dealing with IO, third party libs, canvas, etc, such approach makes it infinitely easier to reason about, localise and fix bugs.
## Avoid new
Many classes and libraries let you use `Foo()` syntax in place of `new Foo()`.
### Rationale
There's no reason to use weird special syntax instead of just calling a function that just returns an object. `new` in C++ and the like allocates memory and calls constructor, but it is meaningless in JS.
## Use exact package version in package.json
No `^1.2.3`, no `~1.2.3`, only `1.2.3`;
### Rationale
There's no moderation on `npm` and no guarantee of adherence to semver. On multiple occasions patch versions have broken builds.
## Avoid stateful modules
Avoid using mutable file-scope variables. Prefer returning functions which explicitly return module state, on which various module functions operate if necessary.
### Rationale
`import` statement order isn't set in stone (and it shouldn't be), modules may be imported by multiple child workers in context of a parent process and accidentally end up sharing state, you might want to do some kind of a reset and be unable to due to module users holding references to mutable properties, etc.
#### Exception
Entry points are ok. State has to be stored somewhere after all. It's ok to create a module state in an entry point file and reexport it.
