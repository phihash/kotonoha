// デザインの値は components/theme.ts のトークンだけを使う。theme.ts 自身は .oxlintrc.json で対象外にしている。
const NUMBER_PROPS =
  /^(fontSize|lineHeight|letterSpacing|border\w*Radius|shadowOpacity|shadowRadius|elevation|opacity|(padding|margin)\w*|gap|rowGap|columnGap)$/;
const STRING_PROPS = /^(fontWeight|fontFamily)$/;
const COLOR = /^(#|rgba?\(|hsla?\()/i;

const isNumber = (v) =>
  (v.type === "Literal" && typeof v.value === "number" && v.value !== 0) ||
  (v.type === "UnaryExpression" && v.operator === "-" && isNumber(v.argument));

const keyName = (node) => node.key?.name ?? node.key?.value;

export default {
  meta: { name: "design" },
  rules: {
    "no-raw-style": {
      create(context) {
        const report = (node, what) =>
          context.report({ node, message: `${what} を直接書かず、components/theme.ts のトークンを使う` });
        return {
          Literal(node) {
            if (typeof node.value === "string" && COLOR.test(node.value)) report(node, "色");
          },
          Property(node) {
            const key = keyName(node);
            const v = node.value;
            if (NUMBER_PROPS.test(key) && isNumber(v)) report(v, key);
            else if (STRING_PROPS.test(key) && v.type === "Literal") report(v, key);
            else if (key === "shadowOffset" && v.type === "ObjectExpression") report(v, key);
          },
        };
      },
    },
  },
};
