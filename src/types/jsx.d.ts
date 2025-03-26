import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      div: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
      span: React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
      a: React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;
      p: React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;
      h1: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      h2: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      h3: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      h4: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      h5: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      h6: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      button: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
      input: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
      textarea: React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;
      form: React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>;
      img: React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;
      ul: React.DetailedHTMLProps<React.HTMLAttributes<HTMLUListElement>, HTMLUListElement>;
      ol: React.DetailedHTMLProps<React.HTMLAttributes<HTMLOListElement>, HTMLOListElement>;
      li: React.DetailedHTMLProps<React.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>;
      table: React.DetailedHTMLProps<React.TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>;
      tr: React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement>;
      td: React.DetailedHTMLProps<React.TdHTMLAttributes<HTMLTableDataCellElement>, HTMLTableDataCellElement>;
      th: React.DetailedHTMLProps<React.ThHTMLAttributes<HTMLTableHeaderCellElement>, HTMLTableHeaderCellElement>;
      thead: React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
      tbody: React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
      select: React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>;
      option: React.DetailedHTMLProps<React.OptionHTMLAttributes<HTMLOptionElement>, HTMLOptionElement>;
      label: React.DetailedHTMLProps<React.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>;
      nav: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      header: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      footer: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      main: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      section: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      article: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      aside: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      canvas: React.DetailedHTMLProps<React.CanvasHTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement>;
      audio: React.DetailedHTMLProps<React.AudioHTMLAttributes<HTMLAudioElement>, HTMLAudioElement>;
      video: React.DetailedHTMLProps<React.VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>;
      source: React.DetailedHTMLProps<React.SourceHTMLAttributes<HTMLSourceElement>, HTMLSourceElement>;
      svg: React.SVGProps<SVGSVGElement>;
      path: React.SVGProps<SVGPathElement>;
      circle: React.SVGProps<SVGCircleElement>;
      rect: React.SVGProps<SVGRectElement>;
      line: React.SVGProps<SVGLineElement>;
      g: React.SVGProps<SVGGElement>;
      defs: React.SVGProps<SVGDefsElement>;
      polyline: React.SVGProps<SVGPolylineElement>;
      polygon: React.SVGProps<SVGPolygonElement>;
      text: React.SVGProps<SVGTextElement>;
      tspan: React.SVGProps<SVGTSpanElement>;
      [elemName: string]: any;
    }
  }
}

// React Router types
declare module 'react-router-dom' {
  import { ComponentType, ReactNode } from 'react';

  export interface RouteProps {
    path?: string;
    element?: ReactNode;
    children?: ReactNode;
  }

  export interface RoutesProps {
    children?: ReactNode;
    location?: any;
  }

  export const BrowserRouter: ComponentType<{ children?: ReactNode }>;
  export const Routes: ComponentType<RoutesProps>;
  export const Route: ComponentType<RouteProps>;
  export const Link: ComponentType<{ to: string; className?: string; children?: ReactNode }>;
  export const Navigate: ComponentType<{ to: string; replace?: boolean }>;
}

// Material UI types
declare module '@mui/material/Box' {
  import { ComponentType, ReactNode } from 'react';
  
  interface BoxProps {
    sx?: any;
    children?: ReactNode;
    [key: string]: any;
  }
  
  const Box: ComponentType<BoxProps>;
  export default Box;
}

declare module '@mui/material/Typography' {
  import { ComponentType, ReactNode } from 'react';
  
  interface TypographyProps {
    variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'subtitle1' | 'subtitle2' | 'body1' | 'body2';
    gutterBottom?: boolean;
    sx?: any;
    children?: ReactNode;
    [key: string]: any;
  }
  
  const Typography: ComponentType<TypographyProps>;
  export default Typography;
}

declare module '@mui/material/Paper' {
  import { ComponentType, ReactNode } from 'react';
  
  interface PaperProps {
    sx?: any;
    children?: ReactNode;
    [key: string]: any;
  }
  
  const Paper: ComponentType<PaperProps>;
  export default Paper;
}

declare module '@mui/material/LinearProgress' {
  import { ComponentType } from 'react';
  
  interface LinearProgressProps {
    variant?: 'determinate' | 'indeterminate' | 'buffer' | 'query';
    value?: number;
    sx?: any;
    [key: string]: any;
  }
  
  const LinearProgress: ComponentType<LinearProgressProps>;
  export default LinearProgress;
}

declare module '@mui/material/Grid' {
  import { ComponentType, ReactNode } from 'react';
  
  interface GridProps {
    container?: boolean;
    item?: boolean;
    xs?: number | boolean;
    sm?: number | boolean;
    md?: number | boolean;
    lg?: number | boolean;
    spacing?: number;
    sx?: any;
    children?: ReactNode;
    [key: string]: any;
  }
  
  const Grid: ComponentType<GridProps>;
  export default Grid;
}

declare module '@mui/material/Chip' {
  import { ComponentType, ReactNode } from 'react';
  
  interface ChipProps {
    label?: ReactNode;
    icon?: ReactNode;
    color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
    variant?: 'filled' | 'outlined';
    sx?: any;
    [key: string]: any;
  }
  
  const Chip: ComponentType<ChipProps>;
  export default Chip;
}

declare module '@mui/material/Button' {
  import { ComponentType, ReactNode } from 'react';
  
  interface ButtonProps {
    variant?: 'text' | 'outlined' | 'contained';
    color?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
    onClick?: () => void;
    sx?: any;
    children?: ReactNode;
    [key: string]: any;
  }
  
  const Button: ComponentType<ButtonProps>;
  export default Button;
}
