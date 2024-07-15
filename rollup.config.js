import preserveDirectives from "rollup-plugin-preserve-directives"

export default {
    output: {
        preserveModules: true,
    },
    plugins: [preserveDirectives()],
};