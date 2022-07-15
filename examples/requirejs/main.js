requirejs(["../../index.js"], function(djsOOP) {

	try {
		class A {
			constructor() {
				djsOOP.Abstract(A, ['method_A1']);
				djsOOP.Bootstrap(new.target);
			}
		}
	
		class B extends A {}
	
		new B();
	}
	catch(e) {
		console.log(e);
	}

});