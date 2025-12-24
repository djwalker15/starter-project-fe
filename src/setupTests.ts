import "@testing-library/jest-dom"; //
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// clean up the DOM after each test
afterEach(() => cleanup());
