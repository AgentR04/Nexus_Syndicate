// Custom type declarations to fix JSX errors
import React from 'react';

// Fix for window.aptos
interface Window {
  aptos?: any;
}

// Fix for React Router components
declare module 'react-router-dom' {
  export interface RouteProps {
    path?: string;
    element?: React.ReactNode;
    children?: React.ReactNode;
  }

  export const BrowserRouter: React.ComponentType<{ children?: React.ReactNode }>;
  export const Routes: React.ComponentType<{ children?: React.ReactNode }>;
  export const Route: React.ComponentType<RouteProps>;
  export const Link: React.ComponentType<{ to: string; className?: string; children?: React.ReactNode }>;
  export const Navigate: React.ComponentType<{ to: string; replace?: boolean }>;
}

// Fix for Material UI components
declare module '@mui/material/Box' {
  const Box: React.ComponentType<any>;
  export default Box;
}

declare module '@mui/material/Typography' {
  const Typography: React.ComponentType<any>;
  export default Typography;
}

declare module '@mui/material/Paper' {
  const Paper: React.ComponentType<any>;
  export default Paper;
}

declare module '@mui/material/LinearProgress' {
  const LinearProgress: React.ComponentType<any>;
  export default LinearProgress;
}

declare module '@mui/material/Grid' {
  const Grid: React.ComponentType<any>;
  export default Grid;
}

declare module '@mui/material/Button' {
  const Button: React.ComponentType<any>;
  export default Button;
}

declare module '@mui/material/Chip' {
  const Chip: React.ComponentType<any>;
  export default Chip;
}
