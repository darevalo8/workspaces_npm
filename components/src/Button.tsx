import React from "react";

const Button: React.FC<React.DOMAttributes<HTMLButtonElement>> = ({
  children,
  ...props
}) => {
  return <button {...props}>{children}</button>;
};

export default Button;