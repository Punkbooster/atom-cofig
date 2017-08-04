'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseServiceDefinition = parseServiceDefinition;

var _babylon;

function _load_babylon() {
  return _babylon = _interopRequireWildcard(require('babylon'));
}

var _builtinTypes;

function _load_builtinTypes() {
  return _builtinTypes = require('./builtin-types');
}

var _location;

function _load_location() {
  return _location = require('./location');
}

var _DefinitionValidator;

function _load_DefinitionValidator() {
  return _DefinitionValidator = require('./DefinitionValidator');
}

var _resolveFrom;

function _load_resolveFrom() {
  return _resolveFrom = _interopRequireDefault(require('resolve-from'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _fs = _interopRequireDefault(require('fs'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function isPrivateMemberName(name) {
  return name.startsWith('_');
}

/**
 * Parse a definition file, returning an intermediate representation that has all of the
 * information required to generate the remote proxy, as well as marshal and unmarshal the
 * data over a network.
 * @param source - The string source of the definition file.
 */
function parseServiceDefinition(fileName, source, predefinedTypes) {
  return new ServiceParser(predefinedTypes).parseService(fileName, source);
}

class ServiceParser {

  constructor(predefinedTypes) {
    this._defs = new Map();
    this._filesTodo = [];
    this._filesSeen = new Set();

    // Add all builtin types
    const defineBuiltinType = name => {
      if (!!this._defs.has(name)) {
        throw new Error('Duplicate builtin type');
      }

      this._defs.set(name, {
        kind: 'alias',
        name,
        location: { type: 'builtin' }
      });
    };
    (_builtinTypes || _load_builtinTypes()).namedBuiltinTypes.forEach(defineBuiltinType);
    predefinedTypes.forEach(defineBuiltinType);
  }

  parseService(fileName, source) {
    this._filesSeen.add(fileName);

    this._parseFile(fileName, 'service', source);

    while (this._filesTodo.length > 0) {
      const file = this._filesTodo.pop();
      const contents = _fs.default.readFileSync(file, 'utf8');
      this._parseFile(file, 'import', contents);
    }

    (0, (_DefinitionValidator || _load_DefinitionValidator()).validateDefinitions)(this._defs);

    return this._defs;
  }

  _parseFile(fileName, fileType, source) {
    const parser = new FileParser(fileName, fileType, this._defs);
    const imports = parser.parse(source);
    for (const imp of imports) {
      const resolvedFrom = (0, (_resolveFrom || _load_resolveFrom()).default)((_nuclideUri || _load_nuclideUri()).default.dirname(fileName), imp);

      if (!this._filesSeen.has(resolvedFrom)) {
        this._filesSeen.add(resolvedFrom);
        this._filesTodo.push(resolvedFrom);
      }
    }
  }
}

class FileParser {
  // Maps type names to the imported name and file that they are imported from.
  constructor(fileName, fileType, defs) {
    this._fileType = fileType;
    this._fileName = fileName;
    this._defs = defs;
    this._imports = new Map();
    this._importsUsed = new Set();
  }
  // Set of files required by imports


  _locationOfNode(node) {
    return {
      type: 'source',
      fileName: this._fileName,
      line: node.loc.start.line
    };
  }

  _nodeLocationString(node) {
    return `${ this._fileName }(${ node.loc.start.line })`;
  }

  _errorLocations(locations, message) {
    let fullMessage = `${ (0, (_location || _load_location()).locationToString)(locations[0]) }:${ message }`;
    fullMessage = fullMessage.concat(...locations.slice(1).map(location => `\n${ (0, (_location || _load_location()).locationToString)(location) }: Related location`));
    return new Error(fullMessage);
  }

  _error(node, message) {
    return new Error(`${ this._nodeLocationString(node) }:${ message }`);
  }

  _assert(node, condition, message) {
    if (!condition) {
      throw this._error(node, message);
    }
  }

  // Returns set of imported files required.
  // The file names returned are relative to the file being parsed.
  parse(source) {
    this._imports = new Map();

    const ast = (_babylon || _load_babylon()).parse(source, {
      sourceType: 'module',
      plugins: ['*', 'jsx', 'flow']
    });
    const program = ast.program;

    if (!(program && program.type === 'Program')) {
      throw new Error('The result of parsing is a Program node.');
    }

    // Iterate through each node in the program body.


    for (const node of program.body) {
      // We're specifically looking for exports.
      switch (node.type) {
        case 'ExportNamedDeclaration':
          this._parseExport(node);
          break;

        case 'ImportDeclaration':
          this._parseImport(node);
          break;

        default:
          // Ignore all non-export top level program elements including:
          // imports, statements, variable declarations, function declarations
          break;
      }
    }

    return this._importsUsed;
  }

  _parseExport(node) {
    if (!(node.type === 'ExportNamedDeclaration')) {
      throw new Error('Invariant violation: "node.type === \'ExportNamedDeclaration\'"');
    }

    const declaration = node.declaration;
    switch (declaration.type) {
      // An exported function that can be directly called by a client.
      case 'FunctionDeclaration':
        if (!isPrivateMemberName(declaration.id.name)) {
          this._add(this._parseFunctionDeclaration(declaration));
        }
        break;
      // An exported type alias.
      case 'TypeAlias':
        if (!isPrivateMemberName(declaration.id.name)) {
          this._add(this._parseTypeAlias(declaration));
        }
        break;
      // Parse classes as remotable interfaces.
      case 'ClassDeclaration':
        this._add(this._parseClassDeclaration(declaration));
        break;
      case 'InterfaceDeclaration':
        this._add(this._parseInterfaceDeclaration(declaration));
        break;
      case 'VariableDeclaration':
        // Ignore exported variables.
        break;
      // Unknown export declaration.
      default:
        throw this._error(declaration, `Unknown declaration type ${ declaration.type } in definition body.`);
    }
  }

  _parseImport(node) {
    const from = node.source.value;

    if (!(typeof from === 'string')) {
      throw new Error('Invariant violation: "typeof from === \'string\'"');
    }

    for (const specifier of node.specifiers) {
      if (specifier.type === 'ImportSpecifier') {
        const imported = specifier.imported.name;
        const local = specifier.local.name;
        this._imports.set(local, {
          imported,
          file: from,
          added: false,
          location: this._locationOfNode(specifier)
        });
      }
    }
  }

  _add(definition) {
    if (this._defs.has(definition.name)) {
      const existingDef = this._defs.get(definition.name);

      if (!(existingDef != null)) {
        throw new Error('Invariant violation: "existingDef != null"');
      }

      throw this._errorLocations([definition.location, existingDef.location], `Duplicate definition for ${ definition.name }`);
    } else {
      this._defs.set(definition.name, definition);
    }
  }

  /**
   * Helper function that parses an exported function declaration, and returns the function name,
   * along with a FunctionType object that encodes the argument and return types of the function.
   */
  _parseFunctionDeclaration(declaration) {
    if (this._fileType === 'import') {
      throw this._error(declaration, 'Exported function in imported RPC file');
    }

    this._assert(declaration, declaration.id && declaration.id.type === 'Identifier', 'Remote function declarations must have an identifier.');
    this._assert(declaration, declaration.returnType != null && declaration.returnType.type === 'TypeAnnotation', 'Remote functions must be annotated with a return type.');

    const returnType = this._parseTypeAnnotation(declaration.returnType.typeAnnotation);

    return {
      kind: 'function',
      name: declaration.id.name,
      location: this._locationOfNode(declaration),
      type: {
        location: this._locationOfNode(declaration),
        kind: 'function',
        argumentTypes: declaration.params.map(param => this._parseParameter(param)),
        returnType
      }
    };
  }

  /**
   * Helper function that parses an exported type alias, and returns the name of the alias,
   * along with the type that it refers to.
   */
  _parseTypeAlias(declaration) {
    this._assert(declaration, declaration.type === 'TypeAlias', 'parseTypeAlias accepts a TypeAlias node.');
    return {
      kind: 'alias',
      location: this._locationOfNode(declaration),
      name: declaration.id.name,
      definition: this._parseTypeAnnotation(declaration.right)
    };
  }

  /**
   * Parse a ClassDeclaration AST Node.
   * @param declaration - The AST node.
   */
  _parseClassDeclaration(declaration) {
    if (this._fileType === 'import') {
      throw this._error(declaration, 'Exported class in imported RPC file');
    }

    const def = {
      kind: 'interface',
      name: declaration.id.name,
      location: this._locationOfNode(declaration),
      constructorArgs: [],
      staticMethods: new Map(),
      instanceMethods: new Map()
    };

    const classBody = declaration.body;
    for (const method of classBody.body) {
      if (method.kind === 'constructor') {
        def.constructorArgs = method.params.map(param => this._parseParameter(param));
        if (method.returnType) {
          throw this._error(method, 'constructors may not have return types');
        }
      } else {
        if (!isPrivateMemberName(method.key.name)) {
          const { name, type } = this._parseClassMethod(method);
          const isStatic = Boolean(method.static);
          this._validateMethod(method, name, type, isStatic);
          this._defineMethod(name, type, isStatic ? def.staticMethods : def.instanceMethods);
        }
      }
    }
    if (!def.instanceMethods.has('dispose')) {
      throw this._error(declaration, 'Remotable interfaces must include a dispose method');
    }
    return def;
  }

  _validateMethod(node, name, type, isStatic) {
    if (name === 'dispose' && !isStatic) {
      // Validate dispose method has a reasonable signature
      if (type.argumentTypes.length > 0) {
        throw this._error(node, 'dispose method may not take arguments');
      }
      if (!isValidDisposeReturnType(type.returnType)) {
        throw this._error(node, 'dispose method must return either void or Promise<void>');
      }
    }
  }

  /**
   * Parse a InterfaceDeclaration AST Node.
   * @param declaration - The AST node.
   */
  _parseInterfaceDeclaration(declaration) {
    const def = {
      kind: 'interface',
      name: declaration.id.name,
      location: this._locationOfNode(declaration),
      constructorArgs: null,
      staticMethods: new Map(),
      instanceMethods: new Map()
    };

    if (!(declaration.body.type === 'ObjectTypeAnnotation')) {
      throw new Error('Invariant violation: "declaration.body.type === \'ObjectTypeAnnotation\'"');
    }

    const properties = declaration.body.properties;
    for (const property of properties) {
      if (!(property.type === 'ObjectTypeProperty')) {
        throw new Error('Invariant violation: "property.type === \'ObjectTypeProperty\'"');
      }

      if (!isPrivateMemberName(property.key.name)) {
        const { name, type } = this._parseInterfaceClassMethod(property);

        if (!!property.static) {
          throw new Error('static interface members are a parse error');
        }

        this._validateMethod(property, name, type, false);
        this._defineMethod(name, type, def.instanceMethods);
      }
    }
    if (!def.instanceMethods.has('dispose')) {
      throw this._error(declaration, 'Remotable interfaces must include a dispose method');
    }
    return def;
  }

  _defineMethod(name, type, peers) {
    if (peers.has(name)) {
      // $FlowFixMe(peterhal)
      const relatedLocation = peers.get(name).location;
      throw this._errorLocations([type.location, relatedLocation], `Duplicate method definition ${ name }`);
    } else {
      peers.set(name, type);
    }
  }

  /**
   * Helper function that parses an method definition in a class.
   * @param defintion - The ClassMethod AST node.
   * @returns A record containing the name of the method, and a FunctionType object
   *   encoding the arguments and return type of the method.
   */
  _parseClassMethod(definition) {
    this._assert(definition, definition.type === 'ClassMethod', 'This is a ClassMethod object.');
    this._assert(definition, definition.key && definition.key.type === 'Identifier', 'This method defintion has an key (a name).');
    this._assert(definition, definition.returnType && definition.returnType.type === 'TypeAnnotation', `${ definition.key.name } missing a return type annotation.`);

    const returnType = this._parseTypeAnnotation(definition.returnType.typeAnnotation);
    return {
      location: this._locationOfNode(definition.key),
      name: definition.key.name,
      type: {
        location: this._locationOfNode(definition),
        kind: 'function',
        argumentTypes: definition.params.map(param => this._parseParameter(param)),
        returnType
      }
    };
  }

  /**
   * Parses an method definition in an interface.
   * Note that interface method definitions are slightly different structure to class methods.
   * @param defintion - The ObjectTypeProperty AST node.
   * @returns A record containing the name of the method, and a FunctionType object
   *   encoding the arguments and return type of the method.
   */
  _parseInterfaceClassMethod(definition) {
    this._assert(definition, definition.type === 'ObjectTypeProperty', 'This is a ObjectTypeProperty object.');
    this._assert(definition, definition.key && definition.key.type === 'Identifier', 'This method definition has an key (a name).');
    this._assert(definition, definition.value.returnType != null, `${ definition.key.name } missing a return type annotation.`);

    const returnType = this._parseTypeAnnotation(definition.value.returnType);

    if (!(typeof definition.key.name === 'string')) {
      throw new Error('Invariant violation: "typeof definition.key.name === \'string\'"');
    }

    return {
      location: this._locationOfNode(definition.key),
      name: definition.key.name,
      type: {
        location: this._locationOfNode(definition.value),
        kind: 'function',
        argumentTypes: definition.value.params.map(param => this._parseInterfaceParameter(param)),
        returnType
      }
    };
  }

  _parseInterfaceParameter(param) {
    if (!param.typeAnnotation) {
      throw this._error(param, `Parameter ${ param.name } doesn't have type annotation.`);
    } else {
      const name = param.name.name;

      if (!(typeof name === 'string')) {
        throw new Error('Invariant violation: "typeof name === \'string\'"');
      }

      const type = this._parseTypeAnnotation(param.typeAnnotation);
      if (param.optional && type.kind !== 'nullable') {
        return {
          name,
          type: {
            location: this._locationOfNode(param),
            kind: 'nullable',
            type
          }
        };
      } else {
        return {
          name,
          type
        };
      }
    }
  }

  _parseParameter(param) {
    // Parameter with a default type, e.g. (x: number = 1).
    // Babel's transpiled implementation will take care of actually setting the default.
    if (param.type === 'AssignmentPattern') {
      return this._parseParameter(Object.assign({}, param.left, {
        // Having a default value implies that it's optional.
        optional: true
      }));
    }

    if (!param.typeAnnotation) {
      throw this._error(param, `Parameter ${ param.name } doesn't have type annotation.`);
    } else {
      const name = param.name;
      const type = this._parseTypeAnnotation(param.typeAnnotation.typeAnnotation);
      if (param.optional && type.kind !== 'nullable') {
        return {
          name,
          type: {
            location: this._locationOfNode(param),
            kind: 'nullable',
            type
          }
        };
      } else {
        return {
          name,
          type
        };
      }
    }
  }

  /**
   * Helper function that parses a Flow type annotation into our intermediate format.
   * @returns {Type} A representation of the type.
   */
  _parseTypeAnnotation(typeAnnotation) {
    const location = this._locationOfNode(typeAnnotation);
    switch (typeAnnotation.type) {
      case 'AnyTypeAnnotation':
        return { location, kind: 'any' };
      case 'MixedTypeAnnotation':
        return { location, kind: 'mixed' };
      case 'StringTypeAnnotation':
        return { location, kind: 'string' };
      case 'NumberTypeAnnotation':
        return { location, kind: 'number' };
      case 'BooleanTypeAnnotation':
        return { location, kind: 'boolean' };
      case 'StringLiteralTypeAnnotation':
        return { location, kind: 'string-literal', value: typeAnnotation.value };
      case 'NumericLiteralTypeAnnotation':
        return { location, kind: 'number-literal', value: typeAnnotation.value };
      case 'BooleanLiteralTypeAnnotation':
        return { location, kind: 'boolean-literal', value: typeAnnotation.value };
      case 'NullableTypeAnnotation':
        return {
          location,
          kind: 'nullable',
          type: this._parseTypeAnnotation(typeAnnotation.typeAnnotation)
        };
      case 'ObjectTypeAnnotation':
        return {
          location,
          kind: 'object',
          fields: typeAnnotation.properties.map(prop => {
            if (!(prop.type === 'ObjectTypeProperty')) {
              throw new Error('Invariant violation: "prop.type === \'ObjectTypeProperty\'"');
            }

            return {
              location: this._locationOfNode(prop),
              name: prop.key.name,
              type: this._parseTypeAnnotation(prop.value),
              optional: prop.optional
            };
          })
        };
      case 'VoidTypeAnnotation':
        return { location, kind: 'void' };
      case 'TupleTypeAnnotation':
        return {
          location,
          kind: 'tuple',
          types: typeAnnotation.types.map(this._parseTypeAnnotation.bind(this))
        };
      case 'UnionTypeAnnotation':
        return {
          location,
          kind: 'union',
          types: typeAnnotation.types.map(this._parseTypeAnnotation.bind(this))
        };
      case 'IntersectionTypeAnnotation':
        return {
          location,
          kind: 'intersection',
          types: typeAnnotation.types.map(this._parseTypeAnnotation.bind(this))
        };
      case 'GenericTypeAnnotation':
        return this._parseGenericTypeAnnotation(typeAnnotation);
      default:
        throw this._error(typeAnnotation, `Unknown type annotation ${ typeAnnotation.type }.`);
    }
  }

  /**
   * Helper function that parses annotations of type 'GenericTypeAnnotation'. Meant to be called
   * from parseTypeAnnotation.
   */
  _parseGenericTypeAnnotation(typeAnnotation) {
    if (!(typeAnnotation.type === 'GenericTypeAnnotation')) {
      throw new Error('Invariant violation: "typeAnnotation.type === \'GenericTypeAnnotation\'"');
    }

    const id = this._parseTypeName(typeAnnotation.id);
    const location = this._locationOfNode(typeAnnotation);
    switch (id) {
      case 'Array':
        return {
          location,
          kind: 'array',
          type: this._parseGenericTypeParameterOfKnownType(id, typeAnnotation)
        };
      case 'Set':
        return {
          location,
          kind: 'set',
          type: this._parseGenericTypeParameterOfKnownType(id, typeAnnotation)
        };
      case 'Promise':
        return {
          location,
          kind: 'promise',
          type: this._parseGenericTypeParameterOfKnownType(id, typeAnnotation)
        };
      case 'ConnectableObservable':
        return {
          location,
          kind: 'observable',
          type: this._parseGenericTypeParameterOfKnownType(id, typeAnnotation)
        };
      case 'Map':
        this._assert(typeAnnotation, typeAnnotation.typeParameters != null && typeAnnotation.typeParameters.params.length === 2, `${ id } takes exactly two type parameters.`);
        return {
          location,
          kind: 'map',
          keyType: this._parseTypeAnnotation(typeAnnotation.typeParameters.params[0]),
          valueType: this._parseTypeAnnotation(typeAnnotation.typeParameters.params[1])
        };
      default:
        this._assert(typeAnnotation, id !== 'Observable', 'Use of Observable in RPC interface. Use ConnectableObservable instead.');

        // Named types are represented as Generic types with no type parameters.
        this._assert(typeAnnotation, typeAnnotation.typeParameters == null, `Unknown generic type ${ id }.`);

        const imp = this._imports.get(id);
        if (!this._defs.has(id) && imp != null && !imp.added) {
          imp.added = true;
          this._importsUsed.add(imp.file);
          if (id !== imp.imported) {
            return { location, kind: 'named', name: imp.imported };
          }
        }
        return { location, kind: 'named', name: id };
    }
  }

  _parseGenericTypeParameterOfKnownType(id, typeAnnotation) {
    this._assert(typeAnnotation, typeAnnotation.typeParameters != null && typeAnnotation.typeParameters.params.length === 1, `${ id } has exactly one type parameter.`);
    return this._parseTypeAnnotation(typeAnnotation.typeParameters.params[0]);
  }

  /**
   * Type names may either be simple Identifiers, or they may be
   * qualified identifiers.
   */
  _parseTypeName(type) {
    switch (type.type) {
      case 'Identifier':
        return type.name;
      case 'QualifiedTypeIdentifier':
        if (!(type.id.type === 'Identifier')) {
          throw new Error('Invariant violation: "type.id.type === \'Identifier\'"');
        }

        return `${ this._parseTypeName(type.qualification) }.${ type.id.name }`;
      default:
        throw this._error(type, `Expected named type. Found ${ type.type }`);
    }
  }
}

function isValidDisposeReturnType(type) {
  return type.kind === 'void' || type.kind === 'promise' && type.type.kind === 'void';
}