import React from "react";

export function Hello({ name }: { name: string }) {
  return <p data-testid="hello">Hello, {name}!</p>;
}
