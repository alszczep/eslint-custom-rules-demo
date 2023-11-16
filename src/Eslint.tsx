import React from "react";

// props correct
type EslintProps = {
  text: string;
};

export function Eslint(props: EslintProps) {
  return <div></div>;
}

type Eslint0Props = {
  text: string;
};

export function Eslint0({ text }: Eslint0Props) {
  return <div></div>;
}

// props to early
type Eslint1Props = {
  text: string;
};

type Test = {
  text: string;
};

export function Eslint1(props: Eslint1Props) {
  return <div></div>;
}

// props after the component
export function Eslint2(props: Eslint2Props) {
  return <div></div>;
}

type Eslint2Props = {
  text: string;
};

// no props (correct)
export function Eslint3() {
  return <div></div>;
}

// incorrect
export function Eslint4(props: string) {
  return <div></div>;
}

// many arguments as props
export function Eslint5(props: string, props2: string) {
  return <div></div>;
}
