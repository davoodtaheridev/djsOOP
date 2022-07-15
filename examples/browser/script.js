
/*	--------------------------------------------------
	Abstract usage
	--------------------------------------------------
*/
try {
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
	
		A_method1() {}
		A_method2() {}
	}
	
	new B();
}
catch(e) {
	console.log(e);
}

/*	--------------------------------------------------
	Abstract usage
	--------------------------------------------------
*/
try {
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
	
		A_method1() {}
	}
	
	new B();
}
catch(e) {
	console.log(e);
}

/*	--------------------------------------------------
	Interface usage
	--------------------------------------------------
*/
try {
	class Interface_A {
		constructor() {
			djsOOP.Interface(Interface_A, ['A_method1', 'A_method2']);
			djsOOP.InterfaceBootstrap(new.target);
		}
	}
	
	class Interface_B extends Interface_A {
		constructor() {
			djsOOP.Interface(Interface_B, ['B_method1', 'B_method2']);
			super();
		}
	}
	
	class Interface_C {
		constructor() {
			djsOOP.Interface(Interface_C, ['C_method1', 'C_method2']);
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
	
		A_method1() {}
		A_method2() {}
		B_method1() {}
		B_method2() {}
		C_method1() {}
		C_method2() {}
	}
	
	class C extends B {}
	
	new C();
}
catch(e) {
	console.log(e);
}

/*	--------------------------------------------------
	Interface usage
	--------------------------------------------------
*/
try {
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
	}
	
	class B extends A {
	}
				
	class C extends B {}
				
	new C();
}
catch(e) {
	console.log(e);
}