/// <reference types="react-scripts" />
/// <reference path="./types/jsx.d.ts" />

// Declare React module to fix useState and useEffect imports
declare module 'react' {
  // React Hooks
  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: ReadonlyArray<any>): void;
  export function useRef<T>(initialValue: T): { current: T };
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: ReadonlyArray<any>): T;
  export function useMemo<T>(factory: () => T, deps: ReadonlyArray<any>): T;
  export function useContext<T>(context: React.Context<T>): T;
  export function createContext<T>(defaultValue: T): React.Context<T>;
  
  // React Component Types
  export type FC<P = {}> = FunctionComponent<P>;
  export interface FunctionComponent<P = {}> {
    (props: P): ReactElement<any, any> | null;
    displayName?: string;
  }
  
  // React Element Types
  export type ReactNode = 
    | ReactElement<any, any> 
    | ReactPortal 
    | ReactFragment 
    | ReactText 
    | Array<ReactNode>;
  export type ReactText = string | number;
  export type ReactFragment = {} | ReactNodeArray;
  export type ReactNodeArray = Array<ReactNode>;
  
  export interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
    type: T;
    props: P;
    key: Key | null;
  }
  
  export interface ReactPortal extends ReactElement {
    key: Key | null;
    children: ReactNode;
  }
  
  // Event Types
  export interface FormEvent<T = Element> extends SyntheticEvent<T> {}
  export interface MouseEvent<T = Element> extends SyntheticEvent<T> {}
  export interface SyntheticEvent<T = Element> {
    preventDefault(): void;
    stopPropagation(): void;
    target: EventTarget & T;
  }
  
  // Form Event Handlers
  export type FormEventHandler<T = Element> = (event: FormEvent<T>) => void;
  export type MouseEventHandler<T = Element> = (event: MouseEvent<T>) => void;
  
  // Style Types
  export interface CSSProperties {
    [key: string]: any;
  }
  
  // Other Types
  export type Key = string | number;
  export type JSXElementConstructor<P> = (props: P) => ReactElement<any, any> | null;
  export type Dispatch<A> = (value: A) => void;
  export type SetStateAction<S> = S | ((prevState: S) => S);
  
  // React Components
  export const Fragment: React.FC;
  export const StrictMode: React.FC;
}

// Add window.aptos for Petra wallet
interface Window {
  aptos?: any;
}

// Add missing React event types
declare namespace React {
  interface ChangeEvent<T = Element> {
    target: EventTarget & T;
  }
  
  interface TouchEvent<T = Element> extends React.SyntheticEvent<T> {
    touches: TouchList;
    targetTouches: TouchList;
    changedTouches: TouchList;
  }
  
  interface TouchList {
    length: number;
    item(index: number): Touch;
    [index: number]: Touch;
  }
  
  interface Touch {
    identifier: number;
    target: EventTarget;
    clientX: number;
    clientY: number;
    screenX: number;
    screenY: number;
    pageX: number;
    pageY: number;
  }
}

// Fix for React Fragment
declare namespace JSX {
  interface IntrinsicAttributes {
    key?: string | number;
  }
}
