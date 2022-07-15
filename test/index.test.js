const chai = require('chai');
const expect = chai.expect;
const djsOOP = require('../index');

describe('Abstract', () => {

	describe('instantiation', () => {

		it('should not be able to instantiate the highest abstract super class', () => {
			expect( () => {
	
				class A {
					constructor() {
						djsOOP.Abstract(A, ['A_method1', 'A_method2']);
						djsOOP.Bootstrap(new.target);
					}
				}
	
				new A();
			} ).to.throw('A is abstract; cannot be instantiated');
		});
	
		it("should not be able to instantiate any other abstract sub class", () => {
			expect( () => {
	
				class A {
					constructor() {
						djsOOP.Bootstrap(new.target);
					}
				}
				
				class B extends A {}
	
				class C extends B {
					constructor() {
						djsOOP.Abstract(C, ['C_method1', 'C_method2']);
						super();
					}
				}
	
				class D extends C {
					constructor() {
						djsOOP.Abstract(D, ['D_method3']);
						super();
					}
				}
	
				class E extends D {}
	
				class F extends E {
					constructor() {
						djsOOP.Abstract(F, ['F_method5']);
						super();
					}
				}
				
				class G extends F {
					C_method2() {}
					C_method1() {}
					F_method5() {}
					D_method3() {}
				}
				
				class H extends G {}
				
				class I extends H {
					constructor() {
						djsOOP.Abstract(I);
						super();
					}
				}
				
				new I();
			} ).to.throw('I is abstract; cannot be instantiated');
		});

	});

	describe("abstract method can't have body", () => {

		it('should not be able to define abstract methods in class body', () => {
			expect( () => {
	
				class A {
					constructor() {
						djsOOP.Abstract(A, ['A_method1', 'A_method2']);
						djsOOP.Bootstrap(new.target);
					}

					A_method1() {}
				}
	
				new A();
			} ).to.throw(`abstract methods cannot have a body. Don't define "A_method1" method in the class, just pass it to "Abstract" function`);
		});

		it('should not be able to define abstract methods in class body #2', () => {
			expect(() => {

				class A {
					constructor() {
						djsOOP.Abstract(A, ['A_method1', 'A_method2']);
						djsOOP.Bootstrap(new.target);
					}

					A_method1() {}
				}

				class B extends A {
					constructor() {
						djsOOP.Abstract(B, ['B_method3', 'B_method4']);
						super();
					}

					B_method3() {}
				}

				class C extends B {}

				new C();

			}).to.throw(`abstract methods cannot have a body. Don't define "B_method3" method in the class, just pass it to "Abstract" function`);
		});

	});
	
	describe('override abstract methods', () => {

		it("should throw error when a class didn't override parent abstract methods", () => {
			expect( () => {
	
				class A {
					constructor() {
						djsOOP.Abstract(A, ['A_method1', 'A_method2']);
						djsOOP.Bootstrap(new.target);
					}
				}
				
				class B extends A {
					constructor() {
						super();
					}
				}
				
				new B();
			} ).to.throw('B is not abstract and does not override abstract method A_method1() in A');
		});
	
		it("should not throw any error when all of the abstract methods in the chain overridden in first non-abstract class", () => {
			expect( () => {
	
				class A {
					constructor() {
						djsOOP.Bootstrap(new.target);
					}
				}
				
				class B extends A {}
	
				class C extends B {
					constructor() {
						djsOOP.Abstract(C, ['C_method2', 'C_method1']);
						super();
					}
				}
	
				class D extends C {
					constructor() {
						djsOOP.Abstract(D, ['D_method3']);
						super();
					}
				}
	
				class E extends D {
					constructor() {
						djsOOP.Abstract(E, ['E_method4']);
						super();
					}
				}
	
				class F extends E {
					constructor() {
						djsOOP.Abstract(F, ['F_method5']);
						super();
					}
				}
				
				class G extends F {
					F_method5() {}
					C_method2() {}
					C_method1() {}
					D_method3() {}
					E_method4() {}
				}
				
				class H extends G {}
				
				class I extends H {}
				
				new I();
			} ).not.to.throw();
		});
	
	
		it("should not throw any error when abstract methods in the chain overridden before first non-abstract class. some in parent, some in grand-parent & etc ", () => {
			expect( () => {
	
				class A {
					constructor() {
						djsOOP.Bootstrap(new.target);
					}
				}
				
				class B extends A {}
	
				class C extends B {
					constructor() {
						djsOOP.Abstract(C, ['C_method2', 'C_method1']);
						super();
					}
				}
	
				class D extends C {
					constructor() {
						djsOOP.Abstract(D, ['D_method3']);
						super();
					}
				}
	
				class E extends D {
					constructor() {
						djsOOP.Abstract(E, ['E_method4']);
						super();
					}
					C_method2() {}
					C_method1() {}
				}
	
				class F extends E {
					constructor() {
						djsOOP.Abstract(F, ['F_method5']);
						super();
					}
					D_method3() {}
					E_method4() {}
				}
				
				class G extends F {
					F_method5() {}
				}
				
				class H extends G {}
				
				class I extends H {}
				
				new I();
			} ).not.to.throw();
		});
	
		it("should throw error when a non-abstract class didn't override parent & ancestor abstract methods. Error order is matters", () => {
			// should first throw error for F_method5
			expect( () => {
	
				class A {
					constructor() {
						djsOOP.Bootstrap(new.target);
					}
				}
				
				class B extends A {}
	
				class C extends B {
					constructor() {
						djsOOP.Abstract(C, ['C_method2', 'C_method1']);
						super();
					}
				}
	
				class D extends C {
					constructor() {
						djsOOP.Abstract(D, ['D_method3']);
						super();
					}
				}
	
				class E extends D {
					constructor() {
						djsOOP.Abstract(E, ['E_method4']);
						super();
					}
				}
	
				class F extends E {
					constructor() {
						djsOOP.Abstract(F, ['F_method5']);
						super();
					}
				}
				
				class G extends F {}
				
				class H extends G {}
				
				class I extends H {}
				
				new I();
			} ).to.throw('G is not abstract and does not override abstract method F_method5() in F');
		});
	
		it("should throw error when a an abstract class overridden all abstract methods in the chain & the first non-abstract class didn't override parent abstract methods", () => {
			expect( () => {
	
				class A {
					constructor() {
						djsOOP.Bootstrap(new.target);
					}
				}
				
				class B extends A {}
	
				class C extends B {
					constructor() {
						djsOOP.Abstract(C, ['C_method2', 'C_method1']);
						super();
					}
				}
	
				class D extends C {
					constructor() {
						djsOOP.Abstract(D, ['D_method3']);
						super();
					}
				}
	
				class E extends D {
					constructor() {
						djsOOP.Abstract(E, ['E_method4']);
						super();
					}
				}
	
				class F extends E {
					constructor() {
						djsOOP.Abstract(F, ['F_method5']);
						super();
					}
					C_method2() {}
					C_method1() {}
					D_method3() {}
					E_method4() {}
				}
				
				class G extends F {}
				
				class H extends G {}
				
				class I extends H {}
				
				new I();
			} ).to.throw('G is not abstract and does not override abstract method F_method5() in F');
		});
	
		it("should throw error when all abstract methods in the chain overridden in an abstract class & a non-abstract class override parent abstract methods except grand-parent abstract methods", () => {
			expect( () => {
	
				class A {
					constructor() {
						djsOOP.Bootstrap(new.target);
					}
				}
				
				class B extends A {}
	
				class C extends B {
					constructor() {
						djsOOP.Abstract(C, ['C_method2', 'C_method1']);
						super();
					}
				}
	
				class D extends C {
					constructor() {
						djsOOP.Abstract(D, ['D_method3']);
						super();
					}
				}
	
				class E extends D {
					constructor() {
						djsOOP.Abstract(E, ['E_method4']);
						super();
					}
				}
	
				class F extends E {
					constructor() {
						djsOOP.Abstract(F, ['F_method5']);
						super();
					}
					C_method2() {}
					C_method1() {}
					D_method3() {}
					// E_method4() {}
				}
				
				class G extends F {
					F_method5() {}
				}
				
				class H extends G {}
				
				class I extends H {}
				
				new I();
			} ).to.throw('G is not abstract and does not override abstract method E_method4() in E');
		});
	
		it("should throw error when a non-abstract class override all abstract methods in the chain except grand-parent abstract methods", () => {
			expect( () => {
	
				class A {
					constructor() {
						djsOOP.Bootstrap(new.target);
					}
				}
				
				class B extends A {}
	
				class C extends B {
					constructor() {
						djsOOP.Abstract(C, ['C_method1', 'C_method2']);
						super();
					}
				}
	
				class D extends C {
					constructor() {
						djsOOP.Abstract(D, ['D_method3']);
						super();
					}
				}
	
				class E extends D {}
	
				class F extends E {
					constructor() {
						djsOOP.Abstract(F, ['F_method5']);
						super();
					}
				}
				
				class G extends F {
					C_method2() {}
					C_method1() {}
					F_method5() {}
					D_method3() {}
				}
				
				class H extends G {}
				
				class I extends H {}
				
				new I();
			} ).to.throw('E is not abstract and does not override abstract method D_method3() in D');
		});
	
		it("should throw error when a non-abstract class override all abstract methods in the chain except grand-parent abstract methods #2", () => {
			expect( () => {
	
				class A {
					constructor() {
						djsOOP.Bootstrap(new.target);
					}
				}
				
				class B extends A {}
	
				class C extends B {
					constructor() {
						djsOOP.Abstract(C, ['C_method1', 'C_method2']);
						super();
					}
				}
	
				class D extends C {
					constructor() {
						djsOOP.Abstract(D, ['D_method3']);
						super();
					}
				}
	
				class E extends D {
					constructor() {
						djsOOP.Abstract(E, ['E_method4']);
						super();
					}
				}
	
				class F extends E {
					constructor() {
						djsOOP.Abstract(F, ['F_method5']);
						super();
					}
				}
				
				class G extends F {
					C_method2() {}
					C_method1() {}
					F_method5() {}
					D_method3() {}
				}
				
				class H extends G {}
				
				class I extends H {}
				
				new I();
			} ).to.throw('G is not abstract and does not override abstract method E_method4() in E');
		});
	
		it("should throw error when a non-abstract class just overridden parent abstract methods & didn't override any other abstract methods in the chain", () => {
			expect( () => {
	
				class A {
					constructor() {
						djsOOP.Bootstrap(new.target);
					}
				}
				
				class B extends A {}
	
				class C extends B {
					constructor() {
						djsOOP.Abstract(C, ['C_method2', 'C_method1']);
						super();
					}
				}
	
				class D extends C {
					constructor() {
						djsOOP.Abstract(D, ['D_method3']);
						super();
					}
				}
	
				class E extends D {
					constructor() {
						djsOOP.Abstract(E, ['E_method4']);
						super();
					}
				}
	
				class F extends E {
					constructor() {
						djsOOP.Abstract(F, ['F_method5']);
						super();
					}
				}
				
				class G extends F {
					F_method5() {}
				}
				
				class H extends G {}
				
				class I extends H {}
				
				new I();
			} ).to.throw('G is not abstract and does not override abstract method E_method4() in E');
		});
	
		it("should throw error when a non-abstract class overridden some abstract methods & didn't override some of them.", () => {
			expect( () => {
	
				class A {
					constructor() {
						djsOOP.Bootstrap(new.target);
					}
				}
				
				class B extends A {}
	
				class C extends B {
					constructor() {
						djsOOP.Abstract(C, ['C_method2', 'C_method1']);
						super();
					}
				}
	
				class D extends C {
					constructor() {
						djsOOP.Abstract(D, ['D_method3']);
						super();
					}
				}
	
				class E extends D {
					constructor() {
						djsOOP.Abstract(E, ['E_method4']);
						super();
					}
				}
	
				class F extends E {
					constructor() {
						djsOOP.Abstract(F, ['F_method5']);
						super();
					}
				}
				
				class G extends F {
					F_method5() {}
					D_method3() {}
					E_method4() {}
				}
				
				class H extends G {}
				
				class I extends H {}
				
				new I();
			} ).to.throw('G is not abstract and does not override abstract method C_method2() in C');
		});

	});

});

describe('Interface', () => {
	
	describe('instantiation', () => {

		it('should not be able to instantiate the highest interface super class', () => {
			expect( () => {
	
				class A {
					constructor() {
						djsOOP.Interface(A, ['A_method1', 'A_method2']);
						djsOOP.InterfaceBootstrap(new.target);
					}
				}
	
				new A();
			} ).to.throw('A is abstract; cannot be instantiated');
		});
	
		it("should not be able to instantiate any other interface sub class", () => {
			expect( () => {
	
				class A {
					constructor() {
						djsOOP.Interface(A, ['A_method1', 'A_method2']);
						djsOOP.InterfaceBootstrap(new.target);
					}
				}
	
				class B extends A {
					constructor() {
						djsOOP.Interface(B, ['B_method3', 'B_method4']);
						super();
					}
				}
	
				class C extends B {
					constructor() {
						djsOOP.Interface(C, ['C_method5']);
						super();
					}
				}
				
				new C();
			} ).to.throw('C is abstract; cannot be instantiated');
		});
		
	});

	describe("non-interface can't extends interface", () => {

		it('should throw error when a non-interface class extends an interface class #1', () => {
			expect(() => {

				class A {
					constructor() {
						djsOOP.Interface(A);
						djsOOP.InterfaceBootstrap(new.target);
					}
				}

				class B extends A {}

				new B();

			}).to.throw('"B" is not an interface class. Only an interface class can extends an interface class.');

		});

		it('should throw error when a non-interface class extends an interface class #2', () => {

			expect(() => {

				class A {
					constructor() {
						djsOOP.Interface(A);
						djsOOP.InterfaceBootstrap(new.target);
					}
				}

				class B extends A {
					constructor() {
						djsOOP.Interface(B);
						super();
					}
				}

				class C extends B {}

				new C();

			}).to.throw('"C" is not an interface class. Only an interface class can extends an interface class.');

		});

	});

	describe("interface can't extend non-interface", () => {
		
		it('should throw error when an interface class extends a non-interface class #1', () => {
			expect(() => {

				class A {
					constructor() {
						djsOOP.InterfaceBootstrap(new.target);
					}
				}

				class B extends A {
					constructor() {
						djsOOP.Interface(B);
						super();
					}
				}

				class C extends B {}

				new C();

			}).to.throw(`"B" can't extends "A" because "A" is not interface. Interface classes only can extends an interface class.`);
		});

		it('should throw error when an interface class extends a non-interface class #2', () => {
			expect(() => {

				class A {
					constructor() {
						djsOOP.InterfaceBootstrap(new.target);
					}
				}

				class B extends A {
					constructor() {
						djsOOP.Interface(B);
						super();
					}
				}

				class C extends B {}

				class D extends C {}

				new D();

			}).to.throw(`"B" can't extends "A" because "A" is not interface. Interface classes only can extends an interface class.`);
		});

	});

	describe("in the interface chain all classes should be interface", () => {

		it('should throw error when an non-interface class extends a non-interface class (in the interface chain)', () => {
			expect(() => {

				class A {
					constructor() {
						djsOOP.InterfaceBootstrap(new.target);
					}
				}

				class B extends A {}

				class C extends B {
					constructor() {
						djsOOP.Interface(C);
						super();
					}
				}

				class D extends C {}

				new D();

			}).to.throw(`"A" must be an interface.`);
		});
	
	});

	describe("interface method can't have body", () => {

		it('sould throw error if any method defined by user in class body', () => {
			expect(() => {

				class A {
					constructor() {
						djsOOP.Interface(A, ['A_method1', 'A_method2']);
						djsOOP.InterfaceBootstrap(new.target);
					}

					A_method1() {}
				}

				class B extends A {
					constructor() {
						djsOOP.Interface(B, ['B_method3', 'B_method4']);
						super();
					}

					B_method3() {}
				}

				class C extends B {}

				new C();

			}).to.throw(`interface abstract methods cannot have body. Don't define "B_method3" method in the class, just pass it to "Interface" function`);
		});

	});

	describe('override interface methods', () => {

		it("should throw error when a non-abstract class didn't override interface methods #1", () => {
			expect( () => {

				class Interface_A {
					constructor() {
						djsOOP.Interface(Interface_A, ['interface_method1', 'interface_method2']);
						djsOOP.InterfaceBootstrap(new.target);
					}
				}

				class Interface_B extends Interface_A {
					constructor() {
						djsOOP.Interface(Interface_B, ['interface_method3', 'interface_method4']);
						super();
					}
				}
		
				class A {
					constructor() {
						djsOOP.Implements(A, [Interface_B]);
						djsOOP.Bootstrap(new.target);
					}
				}
				
				class B extends A {}
				
				new B();
			} ).to.throw('A is not abstract and does not override abstract method interface_method3() in Interface_B');
		});

		it("should throw error when a non-abstract class didn't override interface methods #2", () => {
			expect( () => {

				class Interface_A {
					constructor() {
						djsOOP.Interface(Interface_A, ['interface_method1', 'interface_method2']);
						djsOOP.InterfaceBootstrap(new.target);
					}
				}

				class Interface_B extends Interface_A {
					constructor() {
						djsOOP.Interface(Interface_B, ['interface_method3', 'interface_method4']);
						super();
					}
				}
		
				class A {
					constructor() {
						djsOOP.Implements(A, [Interface_B]);
						djsOOP.Bootstrap(new.target);
					}

					interface_method3() {}
					interface_method4() {}
				}
				
				class B extends A {}
				
				new B();
			} ).to.throw('A is not abstract and does not override abstract method interface_method1() in Interface_A');
		});

		it("should throw error when a non-abstract class didn't override interface methods #3", () => {
			expect( () => {

				class Interface_A {
					constructor() {
						djsOOP.Interface(Interface_A, ['interface_method1', 'interface_method2']);
						djsOOP.InterfaceBootstrap(new.target);
					}
				}

				class Interface_B extends Interface_A {
					constructor() {
						djsOOP.Interface(Interface_B, ['interface_method3', 'interface_method4']);
						super();
					}
				}
		
				class A {
					constructor() {
						djsOOP.Implements(A, [Interface_B]);
						djsOOP.Bootstrap(new.target);
					}
				}
				
				new A();
			} ).to.throw('A is not abstract and does not override abstract method interface_method3() in Interface_B');
		});

		it("should throw error when a non-abstract class didn't override interface methods #4", () => {
			expect( () => {

				class Interface_A {
					constructor() {
						djsOOP.Interface(Interface_A, ['interface_method1', 'interface_method2']);
						djsOOP.InterfaceBootstrap(new.target);
					}
				}
		
				class A {
					constructor() {
						djsOOP.Implements(A, [Interface_A]);
						djsOOP.Bootstrap(new.target);
					}
				}
				
				new A();
			} ).to.throw('A is not abstract and does not override abstract method interface_method1() in Interface_A');
		});

		it("should throw error when a non-abstract class didn't override interface methods #5", () => {
			expect( () => {

				class Interface_A {
					constructor() {
						djsOOP.Interface(Interface_A, ['interface_method1', 'interface_method2']);
						djsOOP.InterfaceBootstrap(new.target);
					}
				}
		
				class Interface_B extends Interface_A {
					constructor() {
						djsOOP.Interface(Interface_B, ['interface_method3', 'interface_method4']);
						super();
					}
				}
		
				class Interface_C {
					constructor() {
						djsOOP.Interface(Interface_C, ['interface_method5', 'interface_method6']);
						djsOOP.InterfaceBootstrap(new.target);
					}
				}
		
				class A {
					constructor() {
						djsOOP.Abstract(A);
						djsOOP.Implements(A, [Interface_B]);
						djsOOP.Bootstrap(new.target);
					}
				}
				
				class B extends A {
					constructor() {
						djsOOP.Abstract(B);
						djsOOP.Implements(B, [Interface_C]);
						super();
					}
				}
				
				class C extends B {}
				
				new C();

			} ).to.throw('C is not abstract and does not override abstract method interface_method5() in Interface_C');
		});

		it('should not throw error when an abstract class implements an interface & override all interface methods', () => {

			expect( () => {
				
				class Interface_A {
					constructor() {
						djsOOP.Interface(Interface_A, ['A_method1', 'A_method2']);
						djsOOP.InterfaceBootstrap(new.target);
					}
				}
				
				class A {
					constructor() {
						djsOOP.Abstract(A);
						djsOOP.Implements(A, [Interface_A]);
						djsOOP.Bootstrap(new.target);
					}
				
					A_method1() {}
					A_method2() {}
				}
				
				class B extends A {}
				
				class C extends B {}
				
				new C();

			}).not.to.throw();
			
		});
		

	});

});