(function (root, factory) {
	"use strict";
	if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node.
        module.exports = factory(root);
    } else {
        // Browser globals (global is window)
        root.returnExports = factory(root);
    }
}(typeof self !== 'undefined' ? self : this, function (root) {
	"use strict";
	
	root = root || {};

	function Abstract(_class, abstractMethods = []) {

		const classProto = _class.prototype;
		
		classProto.__IS_ABSTRACT__ = true;

		// removes duplicated values
		abstractMethods = abstractMethods.filter((value, index, self) => {
			return self.indexOf(value) === index;
		});

		classProto.__ABSTRACT_METHODS__ = abstractMethods;
		classProto.__CORRESPONDING_ABSTRACT_METHODS_OWNERS__ = Array(classProto.__ABSTRACT_METHODS__.length).fill(classProto.constructor.name);

		const superClassMethods = getUserDefinedMethods(classProto);

		const wrongMethodDefinition = superClassMethods.filter((method) => {
			return classProto.__ABSTRACT_METHODS__.indexOf(method) > -1
		});

		if(wrongMethodDefinition.length > 0) {
			throw new Error(`abstract methods cannot have a body. Don't define "${wrongMethodDefinition[0]}" method in the class, just pass it to "Abstract" function`);
		}
		
	}

	function Interface(superClass, abstractMethods = []) {
		const classProto = superClass.prototype;
		
		classProto.__IS_INTERFACE__ = true;

		// remove duplicated values
		abstractMethods = abstractMethods.filter((value, index, self) => {
			return self.indexOf(value) === index;
		});

		classProto.__INTERFACE_METHODS__ = abstractMethods;
		classProto.__CORRESPONDING_INTERFACE_METHODS_OWNERS__ = Array(abstractMethods.length).fill(classProto.constructor.name);

		// Get methods except constructor method -----------------------------------------------------
		const superClassMethods = getUserDefinedMethods(classProto);

		if(superClassMethods.length > 0) {
			throw new Error(`interface abstract methods cannot have body. Don't define "${superClassMethods[0]}" method in the class, just pass it to "Interface" function`);
		}

	}

	function Implements(_class, interfaceArray = []) {

		const classProto = _class.prototype;
		
		if( interfaceArray.length === 0 ) {
			return;
		}

		let isNotInerface;
		let interfaceProto;
		let concatinatedIntrefaceMethods = [];
		let concatinatedInterfaceMethodsOwners = [];

		for( let i = 0; i < interfaceArray.length; i++ ) {
			isNotInerface = true;
			if (typeof interfaceArray[i] === 'function') {

				interfaceProto = interfaceArray[i].prototype;

				try {
					class __TestInterfaceClass extends interfaceArray[i] {}
					// __CAN_EXTEND_INTERFACE__ is only for test that a class can extend an interface or not
					__TestInterfaceClass.prototype.__CAN_EXTEND_INTERFACE__ = true;
					new __TestInterfaceClass();
					isNotInerface = false;
				}
				catch(e) {}

				// if interfaceArray[i] doesn't throw error when invoked without 'new' then it's a function not a class nor an interface
				try {
					interfaceArray[i]();
					isNotInerface = true;
				}
				catch(e) {}

				if( isNotInerface ) {
					throw new Error(`"${interfaceProto.constructor.name}" is not an interface. "Implements" function only accepts interfaces.`);
				}

				concatinatedIntrefaceMethods = [...concatinatedIntrefaceMethods, ...interfaceProto.__INTERFACE_METHODS__];
				concatinatedInterfaceMethodsOwners = [...concatinatedInterfaceMethodsOwners, ...interfaceProto.__CORRESPONDING_INTERFACE_METHODS_OWNERS__];

			}
			else {
				throw new Error(`"${interfaceArray[i]}" is not an interface. "Implements" function only accepts interfaces.`);
			}
		}

		// remove duplicated values
		concatinatedIntrefaceMethods = concatinatedIntrefaceMethods.filter((value, index, self) => {
			return self.indexOf(value) === index;
		});

		classProto.__INTERFACE_METHODS__ = concatinatedIntrefaceMethods;
		classProto.__CORRESPONDING_INTERFACE_METHODS_OWNERS__ = concatinatedInterfaceMethodsOwners;
		
	}

	function Bootstrap(newTarget) {

		const superProto = newTarget.prototype;

		preventAbstractInstantiation(newTarget);

		const protoChainStack = getPrototypeChainStack(superProto);

		let currentClassProto = protoChainStack[protoChainStack.length - 1];

		let missingInterfaceMethodName = getNotOverriddenInterfaceMethod(currentClassProto, currentClassProto);

		if(missingInterfaceMethodName) {
			const missingMehotdIndex = currentClassProto.__INTERFACE_METHODS__.indexOf(missingInterfaceMethodName);
			const missingMehotdOwnerName = currentClassProto.__CORRESPONDING_INTERFACE_METHODS_OWNERS__[missingMehotdIndex];
			throw new Error(`${currentClassProto.constructor.name} is not abstract and does not override abstract method ${missingInterfaceMethodName}() in ${missingMehotdOwnerName}`);
		}

		for( let i = protoChainStack.length - 2; i >= 0; i-- ) {

			let currentClassProto = protoChainStack[i];
			let parentClassProto = protoChainStack[i + 1];
			
			let isClassAbstract = isAbstract(currentClassProto);
			let isParentClassAbstract = isAbstract(parentClassProto);

			// if current class is abstract and it's parent is abstract too, should inherit abstract methods
			if( isClassAbstract && isParentClassAbstract && parentClassProto.hasOwnProperty('__ABSTRACT_METHODS__') ) {
				let inheritedAbstractMethods = inheritAbstractMethods(currentClassProto, parentClassProto);
				protoChainStack[i].__ABSTRACT_METHODS__ = inheritedAbstractMethods.methods;
				protoChainStack[i].__CORRESPONDING_ABSTRACT_METHODS_OWNERS__ = inheritedAbstractMethods.owners;
			}
			else if( !isClassAbstract ) {
				protoChainStack[i].__ABSTRACT_METHODS__ = [];
				protoChainStack[i].__CORRESPONDING_ABSTRACT_METHODS_OWNERS__ = [];
			}
			
			let inheritedInterfaceMethods = inheritInterfaceMethods(currentClassProto, parentClassProto);
			protoChainStack[i].__INTERFACE_METHODS__ = inheritedInterfaceMethods.methods;
			protoChainStack[i].__CORRESPONDING_INTERFACE_METHODS_OWNERS__ = inheritedInterfaceMethods.owners;

			let missingAbstractMethodName = getNotOverriddenAbstractMethod(currentClassProto, parentClassProto);

			if(missingAbstractMethodName) {
				const missingMehotdIndex = parentClassProto.__ABSTRACT_METHODS__.indexOf(missingAbstractMethodName);
				const missingMehotdOwnerName = parentClassProto.__CORRESPONDING_ABSTRACT_METHODS_OWNERS__[missingMehotdIndex];
				throw new Error(`${currentClassProto.constructor.name} is not abstract and does not override abstract method ${missingAbstractMethodName}() in ${missingMehotdOwnerName}`);
			}
			
			missingInterfaceMethodName = getNotOverriddenInterfaceMethod(currentClassProto, parentClassProto);

			if(missingInterfaceMethodName) {
				const missingMehotdIndex = parentClassProto.__INTERFACE_METHODS__.indexOf(missingInterfaceMethodName);
				const missingMehotdOwnerName = parentClassProto.__CORRESPONDING_INTERFACE_METHODS_OWNERS__[missingMehotdIndex];
				throw new Error(`${currentClassProto.constructor.name} is not abstract and does not override abstract method ${missingInterfaceMethodName}() in ${missingMehotdOwnerName}`);
			}
		}

	}

	function InterfaceBootstrap(newTarget) {

		const superProto = newTarget.prototype;

		preventInterfaceInstantiation(newTarget);

		const protoChainStack = getPrototypeChainStack(superProto);

		for( let i = protoChainStack.length - 2; i >= 0; i-- ) {

			let currentClassProto = protoChainStack[i];
			let parentClassProto = protoChainStack[i + 1];
			
			let isClassInterface = isInterface(currentClassProto);
			let isParentClassInterface = isInterface(parentClassProto);

			if( !isClassInterface && isParentClassInterface && ( currentClassProto.__CAN_EXTEND_INTERFACE__ !== true ) ) {
				throw new Error(`"${currentClassProto.constructor.name}" is not an interface class. Only an interface class can extends an interface class.`);
			}
			else if( isClassInterface && !isParentClassInterface ) {
				if( i === 1 ) {
					throw new Error(`"Interface" function cannot be called after InterfaceBootstrap. "${currentClassProto.constructor.name}" can't extends "${parentClassProto.constructor.name}" because "${parentClassProto.constructor.name}" is not interface. Interface classes only can extends an interface class.`);
				}

				throw new Error(`"${currentClassProto.constructor.name}" can't extends "${parentClassProto.constructor.name}" because "${parentClassProto.constructor.name}" is not interface. Interface classes only can extends an interface class.`);
			}
			else if( !isClassInterface && !isParentClassInterface ) {
				throw new Error(`"${parentClassProto.constructor.name}" must be an interface.`);
			}

			let inheritedInterfaceMethods = inheritInterfaceMethods(currentClassProto, parentClassProto);
			protoChainStack[i].__INTERFACE_METHODS__ = inheritedInterfaceMethods.methods;
			protoChainStack[i].__CORRESPONDING_INTERFACE_METHODS_OWNERS__ = inheritedInterfaceMethods.owners;
			
		}

	}

	function getUserDefinedMethods(classProto) {
		// Get methods except constructor method and -----------------------------------------------------
		return Object.getOwnPropertyNames(classProto).filter((item) => {
			return !['constructor', '__IS_ABSTRACT__', '__IS_INTERFACE__', '__ABSTRACT_METHODS__', '__INTERFACE_METHODS__', '__CORRESPONDING_ABSTRACT_METHODS_OWNERS__', '__CORRESPONDING_INTERFACE_METHODS_OWNERS__'].includes(item);
		});
	}

	function getPrototypeChainStack(classProto) {
		let parentClassProto = classProto;

		const protoChainStack = [];
		
		while( parentClassProto && parentClassProto.constructor.name !== 'Object' ) {
			protoChainStack.push(parentClassProto);
			parentClassProto = Object.getPrototypeOf(parentClassProto);
		}

		return protoChainStack;
	}

	function isInterface(classProto) {
		return classProto.hasOwnProperty('__IS_INTERFACE__') && classProto.__IS_INTERFACE__ === true;
	}

	function isAbstract(classProto) {
		return classProto.hasOwnProperty('__IS_ABSTRACT__') && classProto.__IS_ABSTRACT__ === true;
	}

	function preventInterfaceInstantiation(newTarget) {

		const superProto = newTarget.prototype;

		if( isInterface(superProto) && newTarget.name === superProto.constructor.name ) {
			throw new Error(`${superProto.constructor.name} is abstract; cannot be instantiated`);
		}

	}

	function preventAbstractInstantiation(newTarget) {

		const superProto = newTarget.prototype;

		if( isAbstract(superProto) && newTarget.name === superProto.constructor.name ) {
			throw new Error(`${superProto.constructor.name} is abstract; cannot be instantiated`);
		}

	}

	function inheritInterfaceMethods(classProto, parentClassProto) {
		
		classProto.__INTERFACE_METHODS__ = classProto.__INTERFACE_METHODS__ || [];
		parentClassProto.__INTERFACE_METHODS__ = parentClassProto.__INTERFACE_METHODS__ || [];
		classProto.__CORRESPONDING_INTERFACE_METHODS_OWNERS__ = classProto.__CORRESPONDING_INTERFACE_METHODS_OWNERS__ || [];
		parentClassProto.__CORRESPONDING_INTERFACE_METHODS_OWNERS__ = parentClassProto.__CORRESPONDING_INTERFACE_METHODS_OWNERS__ || [];

		let concatinatedInterfaceMethods = [...classProto.__INTERFACE_METHODS__, ...parentClassProto.__INTERFACE_METHODS__];
		let concatinatedInterfaceMethodsOwners = [...classProto.__CORRESPONDING_INTERFACE_METHODS_OWNERS__, ...parentClassProto.__CORRESPONDING_INTERFACE_METHODS_OWNERS__];

		// remove duplicated values
		for( let j = 0; j < concatinatedInterfaceMethods.length; j++ ) {

			if( concatinatedInterfaceMethods.indexOf( concatinatedInterfaceMethods[j] ) !== j ) {

				concatinatedInterfaceMethods.splice( j ,1);
				
				/* 
					remove corresponding value to __INTERFACE_METHODS__ from __CORRESPONDING_INTERFACE_METHODS_OWNERS__
					for example:

						before:
							__INTERFACE_METHODS__ = ['A', 'B', 'C'];
							__CORRESPONDING_INTERFACE_METHODS_OWNERS__ = [1, 2, 3];

						after:
							__INTERFACE_METHODS__ = ['A', 'C'];
							__CORRESPONDING_INTERFACE_METHODS_OWNERS__ = [1, 3];

				*/
				concatinatedInterfaceMethodsOwners.splice( j ,1);

				// one element is removed so counter should decrease
				j--;

			}
		}

		// remove parent & ancestors interface methods that overridden in current interface class from list
		concatinatedInterfaceMethods = concatinatedInterfaceMethods.filter((name, index) => {
			
			/* 
				remove corresponding value to __INTERFACE_METHODS__ from __CORRESPONDING_INTERFACE_METHODS_OWNERS__
				for example:

					before:
						__INTERFACE_METHODS__ = ['A', 'B', 'C'];
						__CORRESPONDING_INTERFACE_METHODS_OWNERS__ = [1, 2, 3];

					after:
						__INTERFACE_METHODS__ = ['A', 'C'];
						__CORRESPONDING_INTERFACE_METHODS_OWNERS__ = [1, 3];

			*/
			if( parentClassProto.hasOwnProperty(name) ) {
				concatinatedInterfaceMethodsOwners.splice(index ,1);
			}
			
			return !parentClassProto.hasOwnProperty(name);
		});

		return {methods: concatinatedInterfaceMethods, owners: concatinatedInterfaceMethodsOwners};
		
	}

	function inheritAbstractMethods(classProto, parentClassProto) {

		let concatinatedAbstractMethods = [...classProto.__ABSTRACT_METHODS__, ...parentClassProto.__ABSTRACT_METHODS__];
		let concatinatedAbstractMethodsOwners = [...classProto.__CORRESPONDING_ABSTRACT_METHODS_OWNERS__, ...parentClassProto.__CORRESPONDING_ABSTRACT_METHODS_OWNERS__];
		
		// remove parent & ancestors abstract methods that overridden in current abstract class from list
		concatinatedAbstractMethods = concatinatedAbstractMethods.filter((name, index) => {
			
			/* 
				remove corresponding value to __ABSTRACT_METHODS__ from __CORRESPONDING_ABSTRACT_METHODS_OWNERS__
				for example:

					before:
						__ABSTRACT_METHODS__ = ['A', 'B', 'C'];
						__CORRESPONDING_ABSTRACT_METHODS_OWNERS__ = [1, 2, 3];

					after:
						__ABSTRACT_METHODS__ = ['A', 'C'];
						__CORRESPONDING_ABSTRACT_METHODS_OWNERS__ = [1, 3];

			*/
			if( classProto.hasOwnProperty(name) ) {
				concatinatedAbstractMethodsOwners.splice(index ,1);
			}
			
			return !classProto.hasOwnProperty(name);
		});

		return {methods: concatinatedAbstractMethods, owners: concatinatedAbstractMethodsOwners};

	}

	function getNotOverriddenInterfaceMethod(classProto, parentClassProto) {

		let isClassAbstract = isAbstract(classProto);

		return !isClassAbstract && parentClassProto.__INTERFACE_METHODS__ && parentClassProto.__INTERFACE_METHODS__.find(name => {
			return !classProto.hasOwnProperty(name) && !parentClassProto.hasOwnProperty(name);
		});

	}

	function getNotOverriddenAbstractMethod(classProto, parentClassProto) {

		let isClassAbstract = isAbstract(classProto);

		return !isClassAbstract && parentClassProto.__ABSTRACT_METHODS__ && parentClassProto.__ABSTRACT_METHODS__.find(name => {
			return !classProto.hasOwnProperty(name);
		});

	}

	const djsOOP = root.djsOOP = {
		Abstract,
		Bootstrap,
		Interface,
		InterfaceBootstrap,
		Implements
	}

	return djsOOP;
}));