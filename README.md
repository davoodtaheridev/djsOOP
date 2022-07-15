# djsoop
Abstract &amp; Interface functionality for Javascript

# How to Use

### How to use abstract

Assume we have 3 level class chain: A, B & C that A & B should be abstract

For making a class an abstract, should call `djsoop.Abstract()` method in the `class constructor` before `super()` with two parameters that the first parameter
must be the `class name` and the second parameter must be an array with `abstract method names` like this: `djsoop.Abstract(className, ['method1', 'method2', ...])`

At the highest level class must call `djsoop.Bootstrap(new.target)` in the `class constructor` and if the highest level class is an abstract itself, `djsoop.Abstract()`
must be called before `djsoop.Bootstrap(new.target)`

    class A {
      constructor() {
         djsoop.Abstract(A, ['method_A1']);
         djsoop.Bootstrap(new.target);
      }
    }

    class B extends A {
      constructor() {
        djsoop.Abstract(B, ['method_B1']);
        super();
      }
    }
    
    class C extends B {
       method_A1() {}
       method_B1() {}
    }

    new C();
    
### How to use interface

For making a class an iterface, should call `djsOOP.Interface()` method in the `class constructor` before `super()` with two parameters that the first parameter
must be the `class name` and the second parameter must be an array with `interface method names` like this: `djsoop.Interface(className, ['method1', 'method2', ...])`

At the highest level class, must call `djsoop.InterfaceBootstrap(new.target)` in the `class constructor` and `djsoop.Interface()`must be called
before `djsoop.InterfaceBootstrap(new.target)`

Then for each class that we want to implement this interface, we must call `djsOOP.Implements()` method in the `class constructor` of that class with two parameters 
that the first parameter must be the `class name` and the second parameter must be an array with `interface names` like this:
`djsoop.Implements(className, ['interface_name1', 'interface_name2', ...])`

    class Interface_A {
      constructor() {
        djsOOP.Interface(Interface_A, ['method_A1', 'method_A2']);
        djsOOP.InterfaceBootstrap(new.target);
      }
    }

    class A {
      constructor() {
        djsOOP.Implements(A, [Interface_A]);
        djsOOP.Bootstrap(new.target);
      }

      method_A1() {}
      method_A2() {}
      
    }

    class B extends A {}

    new B();
    
    
### How to use Abstract & Interface together
 
Previous rules of Abstract & Interface usage also applies here. Only thing to consider is that `djsOOP.Abstract()` must be called before `djsOOP.Implements()`
 
    class Interface_A {
      constructor() {
        djsOOP.Interface(Interface_A, ['method_A1', 'method_A2']);
        djsOOP.InterfaceBootstrap(new.target);
      }
    }

    class A {
      constructor() {
        djsOOP.Abstract(A);
        djsOOP.Implements(A, [Interface_A]);
        djsOOP.Bootstrap(new.target);
      }

      method_A1() {}
      method_A2() {}
    }

    class B extends A {}

    new B();
    
 
## Other rules

### Rule 1
Methods that are mentioned in `djsOOP.Abstract()` or `djsOOP.Interface()` must not have been defined in class body. For example following code throws an error:
  
    class A {
      constructor() {
        djsOOP.Abstract(A, ['method_A1']);
        djsOOP.Bootstrap(new.target);
      }
      
      method_A1() {}
    }
  
It throws error because when method_A1 is mentioned in `djsOOP.Abstract()`, it shouldn't have been defined in class body.

### Rule 2
This library can't detect methods that are defined with `this` keyword & `arrow functions` methods (that behind the scene are like methods that defined
with `this` keyword). Becuase they are not part of prototype chain.

So if you do the following you get an error that the method_A1 & method_A2 is not overridden.

    class A {
      constructor() {
        djsOOP.Abstract(A, ['method_A1','method_A2']);
        djsOOP.Bootstrap(new.target);
      }
    }

    class B extends A {
      constructor() {
        super();
        this.method_A1 = () => {};
      }

      method_A2 = () => {}
    }

    new B();
  
### Rule 3
Just like Java, interfaces only can extend an interface & an interface can only be extended with an interface.
Also interfaces can't have any methods in their body. Methods just have to be defined in `djsOOP.Interface()` second parameter as an array.

### Rule 4
Just remember that this library has 5 methods that all of them should be called before `super()`. Methods are the followings:
- djsOOP.Bootstrap()
- djsOOP.Abstract()
- djsOOP.InterfaceBootstrap()
- djsOOP.Interface()
- djsOOP.Implements()


### Rule 5
Method Names must not be the followings otherwise they will be ignored:
- constructor
- \_\_IS_ABSTRACT_\_
- \_\_IS_INTERFACE_\_
- \_\_ABSTRACT_METHODS_\_
- \_\_INTERFACE_METHODS_\_
- \_\_CORRESPONDING_ABSTRACT_METHODS_OWNERS_\_
- \_\_CORRESPONDING_INTERFACE_METHODS_OWNERS_\_

### Rule 6
Don't use in production.