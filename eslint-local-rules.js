const path = require("path");

const isComponentName = (name) => name[0] === name[0].toUpperCase();

const findComponentsInProgram = (node) => {
  const isNodeANotExportedComponent = (n) =>
    n.type === "FunctionDeclaration" && isComponentName(n.id.name);
  const isNodeANamedExportedComponent = (n) =>
    n.type === "ExportNamedDeclaration" &&
    n.declaration.type === "FunctionDeclaration" &&
    isComponentName(n.declaration.id.name);
  const isNodeADefaultExportedComponent = (n) =>
    n.type === "ExportDefaultDeclaration" &&
    n.declaration.type === "FunctionDeclaration" &&
    isComponentName(n.declaration.id.name);

  const isNodeAComponent = (n) =>
    isNodeANotExportedComponent(n) ||
    isNodeANamedExportedComponent(n) ||
    isNodeADefaultExportedComponent(n);

  return node.body
    .map((n, index) => ({ ...n, index }))
    .filter(isNodeAComponent)
    .map((n) => {
      if (isNodeANotExportedComponent(n)) {
        return {
          export: "none",
          node: n,
          index: n.index,
        };
      } else if (isNodeANamedExportedComponent(n)) {
        return {
          export: "named",
          node: n.declaration,
          index: n.index,
        };
      } else if (isNodeADefaultExportedComponent(n)) {
        return {
          export: "default",
          node: n.declaration,
          index: n.index,
        };
      }

      return null;
    });
};

const findTypesInProgram = (node) => {
  const isNodeANotExportedType = (n) =>
    n.type === "TSTypeAliasDeclaration" && isComponentName(n.id.name);
  const isNodeANamedExportedType = (n) =>
    n.type === "ExportNamedDeclaration" &&
    n.declaration.type === "TSTypeAliasDeclaration" &&
    isComponentName(n.declaration.id.name);

  const isNodeAType = (n) =>
    isNodeANotExportedType(n) || isNodeANamedExportedType(n);

  return node.body
    .map((n, index) => ({ ...n, index }))
    .filter(isNodeAType)
    .map((n) => {
      if (isNodeANotExportedType(n)) {
        return {
          export: "none",
          node: n,
          index: n.index,
        };
      } else if (isNodeANamedExportedType(n)) {
        return {
          export: "named",
          node: n.declaration,
          index: n.index,
        };
      }

      return null;
    });
};

const findPropsTypesInProgram = (node) => {
  return findTypesInProgram(node).filter((t) =>
    t.node.id.name.endsWith("Props")
  );
};

module.exports = {
  "react-component-props-structure": {
    meta: {
      type: "problem",
    },
    create: (context) => {
      return {
        Program: (node) => {
          console.log(
            path.basename(
              context.getFilename(),
              path.extname(context.getFilename())
            )
          );
          const components = findComponentsInProgram(node);
          const propsTypes = findPropsTypesInProgram(node);

          components.forEach((c) => {
            if (c.node.params.length > 0) {
              if (c.node.params.length > 1) {
                context.report({
                  node: c.node.params[0],
                  message: "Props have to be defined as a single object",
                });
              } else {
                if (
                  !c.node.params[0].typeAnnotation ||
                  c.node.params[0].typeAnnotation.typeAnnotation.type !==
                    "TSTypeReference" ||
                  c.node.params[0].typeAnnotation.typeAnnotation.typeName
                    .name !== `${c.node.id.name}Props`
                ) {
                  context.report({
                    node: c.node.params[0].typeAnnotation ?? c.node.params[0],
                    message: "Incorrect props type",
                  });
                } else {
                  const propsType = propsTypes.find(
                    (p) => p.node.id.name === `${c.node.id.name}Props`
                  );

                  if (propsType && propsType.index + 1 !== c.index) {
                    context.report({
                      node: propsType.node.id,
                      message:
                        "Props have to be declared directly before the component",
                    });
                  }
                }
              }
            }
          });
        },
      };
    },
  },
};
