import { testPackage } from "../testing.js";

testPackage(import.meta.dir, {
  dependencies: [],
  peers: {
    react: "^18.2.0 || ^19.0.0",
    "react-dom": "^18.2.0 || ^19.0.0",
  },
  budget: 17_500,
});
