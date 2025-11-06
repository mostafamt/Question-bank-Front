# Comprehensive React Component Debugging Guide

**Date:** November 6, 2025
**Purpose:** Step-by-step guide to debug React components effectively

---

## Table of Contents

1. [Pre-Debugging Checklist](#pre-debugging-checklist)
2. [Debugging Tools Setup](#debugging-tools-setup)
3. [General Debugging Strategy](#general-debugging-strategy)
4. [React-Specific Debugging Techniques](#react-specific-debugging-techniques)
5. [Browser DevTools Mastery](#browser-devtools-mastery)
6. [Common Debugging Patterns](#common-debugging-patterns)
7. [Performance Debugging](#performance-debugging)
8. [State Management Debugging](#state-management-debugging)
9. [Props & Context Debugging](#props--context-debugging)
10. [Event Handler Debugging](#event-handler-debugging)
11. [Debugging StudioAreaSelector (Example)](#debugging-studioareaselector-example)
12. [Advanced Techniques](#advanced-techniques)
13. [Troubleshooting Common Issues](#troubleshooting-common-issues)

---

## Pre-Debugging Checklist

Before diving into debugging, answer these questions:

### 1. What's the Problem?
- [ ] Can you reproduce the issue consistently?
- [ ] What's the expected behavior?
- [ ] What's the actual behavior?
- [ ] When did it start happening? (after what change?)
- [ ] Does it happen in all browsers?
- [ ] Does it happen for all users/scenarios?

### 2. Information Gathering
- [ ] Error messages in console?
- [ ] Warnings in console?
- [ ] Network errors (failed API calls)?
- [ ] React errors in overlay?
- [ ] Performance issues (slow rendering)?

### 3. Narrow Down the Scope
- [ ] Which component is affected?
- [ ] Which feature/user flow is broken?
- [ ] Is it a rendering issue, logic issue, or data issue?
- [ ] Is it client-side or server-side?

---

## Debugging Tools Setup

### 1. Browser Extensions

#### React DevTools (Essential!)
```bash
# Chrome
https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi

# Firefox
https://addons.mozilla.org/en-US/firefox/addon/react-devtools/
```

**Features:**
- Component tree inspection
- Props and state viewing
- Hook values
- Component profiling
- Time-travel debugging (with some limitations)

#### Redux DevTools (If using Redux)
```bash
# Chrome
https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd
```

#### Why Did You Render (Advanced)
```bash
npm install --save-dev @welldone-software/why-did-you-render
```

### 2. VS Code Extensions

**Essential Extensions:**
- **ES7+ React/Redux/React-Native snippets** - Quick snippets
- **ESLint** - Catch errors before runtime
- **Prettier** - Code formatting
- **JavaScript Debugger** (Built-in) - Breakpoint debugging
- **Error Lens** - Inline error display

**Setup VS Code Debugger:**

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome against localhost",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/src",
      "sourceMapPathOverrides": {
        "webpack:///src/*": "${webRoot}/*"
      }
    }
  ]
}
```

### 3. Console Setup

**Custom Console Styles:**
```javascript
// Add to src/utils/debug.js
export const log = {
  info: (message, data) => console.log('%c INFO ', 'background: blue; color: white', message, data),
  warn: (message, data) => console.log('%c WARN ', 'background: orange; color: white', message, data),
  error: (message, data) => console.log('%c ERROR ', 'background: red; color: white', message, data),
  success: (message, data) => console.log('%c SUCCESS ', 'background: green; color: white', message, data),
  debug: (message, data) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('%c DEBUG ', 'background: purple; color: white', message, data);
    }
  }
};
```

---

## General Debugging Strategy

### The Scientific Method for Debugging

#### 1. **Observe** 🔍
- Reproduce the bug
- Note exactly what happens
- Document all symptoms

#### 2. **Hypothesize** 💡
- Form theories about what might be wrong
- Based on your observations
- Start with the most likely cause

#### 3. **Test** 🧪
- Add console.logs
- Set breakpoints
- Change one thing at a time

#### 4. **Analyze** 📊
- Review the data
- Confirm or reject hypothesis
- Form new hypothesis if needed

#### 5. **Fix** 🔧
- Implement the solution
- Verify the fix works
- Test for regressions

#### 6. **Document** 📝
- Note what caused the issue
- Document the solution
- Update tests if needed

---

## React-Specific Debugging Techniques

### 1. Console Logging Effectively

#### Basic Console Logging
```javascript
const MyComponent = ({ data, onUpdate }) => {
  console.log('MyComponent rendered');
  console.log('Props:', { data, onUpdate });

  return <div>Content</div>;
};
```

#### Advanced Console Logging
```javascript
const MyComponent = ({ data, onUpdate }) => {
  // 1. Use console.group for organization
  console.group('MyComponent Render');
  console.log('Props:', { data, onUpdate });
  console.log('Timestamp:', new Date().toISOString());
  console.groupEnd();

  // 2. Use console.table for arrays/objects
  console.table(data);

  // 3. Use console.trace to see call stack
  console.trace('How did we get here?');

  return <div>Content</div>;
};
```

#### Strategic Logging Points
```javascript
const MyComponent = ({ data }) => {
  console.log('1. Component function called');

  const [state, setState] = useState(() => {
    console.log('2. useState initializer');
    return initialValue;
  });

  useEffect(() => {
    console.log('3. useEffect executed', { data });

    return () => {
      console.log('4. useEffect cleanup');
    };
  }, [data]);

  const handleClick = () => {
    console.log('5. Event handler called');
    setState(newValue);
  };

  console.log('6. Before return, state:', state);

  return (
    <div onClick={handleClick}>
      Content
    </div>
  );
};
```

### 2. Using React DevTools

#### Component Inspector
```
1. Open React DevTools
2. Select "Components" tab
3. Click on component in tree
4. Right panel shows:
   - Props
   - State
   - Hooks
   - Rendered by
   - Source
```

#### Search for Components
```
1. Use search box (Ctrl/Cmd + F)
2. Search by:
   - Component name: "StudioAreaSelector"
   - Prop value: "propName=value"
   - Hook value: "useStateName"
```

#### Edit Props/State Live
```
1. Select component
2. In right panel, find prop/state
3. Double-click value
4. Edit and press Enter
5. Component re-renders with new value
```

#### View Component Source
```
1. Select component
2. Click "</>" icon in toolbar
3. VS Code opens at component definition
```

### 3. Debugging Hooks

#### useState Hook
```javascript
const [count, setCount] = useState(() => {
  console.log('useState initializer');
  return 0;
});

// Debug state updates
const handleIncrement = () => {
  setCount(prev => {
    console.log('setState updater', { prev, next: prev + 1 });
    return prev + 1;
  });
};

// Watch state changes
useEffect(() => {
  console.log('count changed:', count);
}, [count]);
```

#### useEffect Hook
```javascript
useEffect(() => {
  console.log('Effect running', {
    dependency: data,
    timestamp: Date.now()
  });

  // Effect logic

  return () => {
    console.log('Effect cleanup', {
      previousDependency: data
    });
  };
}, [data]);
```

#### Custom Hook Debugging
```javascript
const useMyCustomHook = (param) => {
  console.group('useMyCustomHook');
  console.log('Input:', param);

  const [state, setState] = useState(null);
  console.log('Current state:', state);

  useEffect(() => {
    console.log('Custom hook effect');
  }, [param]);

  console.groupEnd();

  return state;
};
```

### 4. Component Lifecycle Debugging

#### Class Components (Legacy)
```javascript
class MyComponent extends React.Component {
  componentDidMount() {
    console.log('Component mounted');
  }

  componentDidUpdate(prevProps, prevState) {
    console.log('Component updated', {
      prevProps,
      nextProps: this.props,
      prevState,
      nextState: this.state
    });
  }

  componentWillUnmount() {
    console.log('Component will unmount');
  }

  render() {
    console.log('Render called');
    return <div>Content</div>;
  }
}
```

#### Functional Components
```javascript
const MyComponent = (props) => {
  console.log('Render (function called)');

  useEffect(() => {
    console.log('Mount (similar to componentDidMount)');

    return () => {
      console.log('Unmount (similar to componentWillUnmount)');
    };
  }, []);

  useEffect(() => {
    console.log('Update (similar to componentDidUpdate)');
  });

  return <div>Content</div>;
};
```

---

## Browser DevTools Mastery

### 1. Console Tab

#### Useful Console Methods
```javascript
// Clear console
console.clear();

// Count function calls
console.count('functionName');

// Measure execution time
console.time('operation');
// ... code ...
console.timeEnd('operation');

// Assert conditions
console.assert(value > 0, 'Value should be positive', value);

// Log object in a table format
console.table([
  { name: 'Item 1', value: 10 },
  { name: 'Item 2', value: 20 }
]);

// Display styled message
console.log(
  '%cImportant!',
  'color: red; font-size: 20px; font-weight: bold'
);
```

#### Console Filters
```
1. Click filter icon
2. Select:
   - All
   - Errors
   - Warnings
   - Info
   - Verbose
3. Use search box to filter messages
```

### 2. Sources Tab (Breakpoint Debugging)

#### Setting Breakpoints
```
Method 1: Click on line number in Sources tab
Method 2: Add debugger statement in code
Method 3: Right-click line → "Add conditional breakpoint"
```

#### Types of Breakpoints

**1. Line Breakpoint**
```javascript
const handleClick = () => {
  debugger; // Execution pauses here
  processData();
};
```

**2. Conditional Breakpoint**
```
Right-click line number → Add conditional breakpoint
Condition: count > 5
```

**3. DOM Breakpoint**
```
Elements tab → Right-click element → Break on:
- Subtree modifications
- Attribute modifications
- Node removal
```

**4. Event Listener Breakpoint**
```
Sources tab → Event Listener Breakpoints
Check: Mouse → click
```

**5. XHR/Fetch Breakpoint**
```
Sources tab → XHR/fetch Breakpoints
Add URL pattern: /api/blocks
```

#### Breakpoint Controls
```
F8 / ▶️  - Resume execution
F10 / ⤵️  - Step over (next line)
F11 / ⬇️  - Step into (enter function)
Shift+F11 / ⬆️ - Step out (exit function)
```

#### Inspecting Variables at Breakpoint
```
1. Pause at breakpoint
2. Hover over variables to see values
3. Scope panel shows all variables in scope
4. Watch panel lets you evaluate expressions
5. Console is available (use variables in scope)
```

### 3. Network Tab

#### Debugging API Calls
```
1. Open Network tab
2. Filter by XHR or Fetch
3. Click on request to see:
   - Headers (request/response)
   - Preview (formatted response)
   - Response (raw data)
   - Timing (how long each phase took)
```

#### Copy Request as cURL
```
1. Right-click request
2. Copy → Copy as cURL
3. Test in terminal or Postman
```

#### Replay Request
```
1. Right-click request
2. Replay XHR
```

### 4. Performance Tab

#### Record Performance
```
1. Click record button (⏺️)
2. Perform action in app
3. Click stop
4. Analyze:
   - Main thread activity
   - Function call times
   - React component renders
```

#### Identify Performance Issues
```
Look for:
- Long tasks (yellow/red bars)
- Frequent re-renders
- Layout thrashing
- Memory leaks
```

### 5. React Profiler (In React DevTools)

#### Profile a Component
```
1. Open React DevTools → Profiler tab
2. Click record button
3. Perform action in app
4. Click stop
5. Review:
   - Commit timeline
   - Flame graph (which components rendered)
   - Ranked chart (slowest components)
   - Component details (render time, why it rendered)
```

---

## Common Debugging Patterns

### 1. "Why is my component not rendering?"

**Debug Checklist:**
```javascript
const MyComponent = (props) => {
  // 1. Is the component even mounting?
  console.log('MyComponent function called');

  // 2. Check props
  console.log('Props received:', props);

  // 3. Check if parent is rendering this component
  useEffect(() => {
    console.log('MyComponent mounted');
  }, []);

  // 4. Check return statement
  console.log('About to return JSX');
  return <div>Content</div>;
};
```

**Common Causes:**
- Component not imported/exported correctly
- Component not included in parent's JSX
- Conditional rendering returning `null`
- Props causing component to return early
- Router not matching the path

### 2. "Why is my component re-rendering too much?"

**Debug with Why-Did-You-Render:**
```javascript
// Add to index.js (development only)
if (process.env.NODE_ENV === 'development') {
  const whyDidYouRender = require('@welldone-software/why-did-you-render');
  whyDidYouRender(React, {
    trackAllPureComponents: true,
  });
}

// Mark component for tracking
MyComponent.whyDidYouRender = true;
```

**Manual Debugging:**
```javascript
const MyComponent = ({ data, onUpdate }) => {
  const renderCount = useRef(0);
  renderCount.current++;

  console.log(`Render #${renderCount.current}`);

  useEffect(() => {
    console.log('Re-rendered because:', {
      dataDeps: data,
      onUpdateDeps: onUpdate
    });
  });

  return <div>Content</div>;
};
```

**Common Causes:**
- Parent re-rendering (component re-renders with parent)
- Props changing (even if shallowly equal)
- State updates in component
- Context value changing
- Inline functions/objects in props (new reference each time)

### 3. "Why is my state not updating?"

**Debug State Updates:**
```javascript
const [count, setCount] = useState(0);

const handleClick = () => {
  console.log('Before setState:', count);

  setCount(count + 1);

  // ❌ This will still log old value (state update is async)
  console.log('After setState:', count);

  // ✅ Use callback to see updated value
  setCount(prev => {
    const next = prev + 1;
    console.log('State update:', { prev, next });
    return next;
  });
};

// ✅ Watch state changes with useEffect
useEffect(() => {
  console.log('count changed to:', count);
}, [count]);
```

**Common Causes:**
- State updates are asynchronous
- Using stale state (not using updater function)
- Mutating state instead of replacing it
- State update is batched (will see combined update)
- State reference hasn't changed (object/array mutation)

### 4. "Why is my useEffect not running?"

**Debug useEffect:**
```javascript
useEffect(() => {
  console.log('Effect running', {
    dependencies: [dep1, dep2],
    timestamp: Date.now()
  });

  // Effect logic

  return () => {
    console.log('Effect cleanup');
  };
}, [dep1, dep2]); // ⚠️ Check dependencies!
```

**Dependency Checker:**
```javascript
useEffect(() => {
  // Your effect
}, [dep1, dep2]);

// Add this to debug dependencies
useEffect(() => {
  console.log('dep1 changed:', dep1);
}, [dep1]);

useEffect(() => {
  console.log('dep2 changed:', dep2);
}, [dep2]);
```

**Common Causes:**
- Dependencies array missing dependencies
- Dependencies not changing (same reference)
- Effect only runs on mount (`[]` dependency)
- Infinite loop (effect updates dependency)

### 5. "Why is my event handler not firing?"

**Debug Event Handlers:**
```javascript
const MyComponent = () => {
  const handleClick = (e) => {
    console.log('Click handler called', {
      event: e,
      target: e.target,
      currentTarget: e.currentTarget,
      timestamp: Date.now()
    });
  };

  console.log('handleClick function:', handleClick);

  return (
    <div
      onClick={handleClick}
      onClickCapture={() => console.log('Capture phase')}
    >
      <button onClick={(e) => {
        console.log('Button clicked');
        // e.stopPropagation(); // Check if propagation is stopped
      }}>
        Click Me
      </button>
    </div>
  );
};
```

**Common Causes:**
- Event handler not attached to element
- Event propagation stopped by child
- Pointer-events CSS preventing clicks
- Element covered by another element
- Handler is `null` or `undefined`

---

## Performance Debugging

### 1. Identify Slow Components

**Using React Profiler:**
```
1. Open React DevTools → Profiler
2. Record interaction
3. Find components with:
   - Long render times (red/yellow in flame graph)
   - Frequent renders (high commit count)
   - Unnecessary renders (rendered but didn't commit)
```

**Manual Profiling:**
```javascript
const MyComponent = (props) => {
  const renderStart = performance.now();

  // Component logic

  useEffect(() => {
    const renderEnd = performance.now();
    const renderTime = renderEnd - renderStart;

    if (renderTime > 16) { // More than 1 frame at 60fps
      console.warn(`Slow render: ${renderTime}ms`, props);
    }
  });

  return <div>Content</div>;
};
```

### 2. Optimize Re-Renders

**Memoization:**
```javascript
// Memoize component
const ExpensiveComponent = React.memo(({ data }) => {
  console.log('ExpensiveComponent rendered');
  return <div>{/* Expensive rendering */}</div>;
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.data.id === nextProps.data.id;
});

// Memoize callback
const handleClick = useCallback(() => {
  console.log('Clicked');
}, [/* dependencies */]);

// Memoize computed value
const expensiveValue = useMemo(() => {
  console.log('Computing expensive value');
  return computeExpensiveValue(data);
}, [data]);
```

### 3. Debug Memory Leaks

**Common Patterns:**
```javascript
const MyComponent = () => {
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Interval running');
    }, 1000);

    // ✅ Cleanup
    return () => {
      console.log('Cleaning up interval');
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      console.log('Window resized');
    };

    window.addEventListener('resize', handleResize);

    // ✅ Cleanup
    return () => {
      console.log('Removing event listener');
      window.removeEventListener('resize', handleResize);
    };
  }, []);
};
```

**Detect Memory Leaks:**
```
1. Open Performance tab
2. Check "Memory" checkbox
3. Record and perform actions
4. Look for continuously increasing memory
5. Check heap snapshots in Memory tab
```

---

## State Management Debugging

### 1. Zustand (Your Project)

**Debug Zustand Store:**
```javascript
// In store.js
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export const useStore = create(
  devtools(
    (set, get) => ({
      data: {},

      setFormState: (newData) => {
        console.log('setFormState called', { newData });
        set((state) => {
          console.log('Previous state:', state);
          const nextState = { data: { ...state.data, ...newData } };
          console.log('Next state:', nextState);
          return nextState;
        });
      },

      openModal: (name, props) => {
        console.log('openModal called', { name, props });
        set({ modal: { name, opened: true, props } });
      },
    }),
    { name: 'AppStore' } // Shows in Redux DevTools
  )
);
```

**Monitor Store in Component:**
```javascript
const MyComponent = () => {
  const data = useStore(state => state.data);

  useEffect(() => {
    console.log('Store data changed:', data);
  }, [data]);

  // Or subscribe to all changes
  useEffect(() => {
    const unsubscribe = useStore.subscribe((state, prevState) => {
      console.log('Store updated', {
        prev: prevState,
        next: state,
        changes: Object.keys(state).filter(
          key => state[key] !== prevState[key]
        )
      });
    });

    return unsubscribe;
  }, []);
};
```

### 2. Context Debugging

**Debug Context Provider:**
```javascript
const MyContext = createContext();

export const MyProvider = ({ children }) => {
  const [state, setState] = useState(initialState);

  const value = useMemo(() => {
    console.log('Context value recomputed', state);
    return {
      state,
      setState
    };
  }, [state]);

  return (
    <MyContext.Provider value={value}>
      {children}
    </MyContext.Provider>
  );
};

export const useMyContext = () => {
  const context = useContext(MyContext);

  if (!context) {
    console.error('useMyContext must be used within MyProvider');
    throw new Error('useMyContext must be used within MyProvider');
  }

  console.log('Context consumed:', context);
  return context;
};
```

---

## Props & Context Debugging

### Debug Props

```javascript
const MyComponent = (props) => {
  // 1. Log all props
  console.log('Props:', props);

  // 2. Log individual props
  console.log('Individual props:', {
    data: props.data,
    onUpdate: props.onUpdate,
    isLoading: props.isLoading
  });

  // 3. Check prop types at runtime
  console.log('Prop types:', {
    data: typeof props.data,
    onUpdate: typeof props.onUpdate,
    isLoading: typeof props.isLoading
  });

  // 4. Watch prop changes
  useEffect(() => {
    console.log('Props changed:', props);
  }, [props]);

  // 5. Watch specific prop
  useEffect(() => {
    console.log('data prop changed:', props.data);
  }, [props.data]);

  return <div>Content</div>;
};
```

---

## Event Handler Debugging

### Debug Event Flow

```javascript
const MyComponent = () => {
  const handleParentClick = (e) => {
    console.log('Parent clicked', {
      phase: 'bubble',
      target: e.target,
      currentTarget: e.currentTarget
    });
  };

  const handleChildClick = (e) => {
    console.log('Child clicked', {
      phase: 'bubble',
      target: e.target,
      currentTarget: e.currentTarget
    });

    // Uncomment to stop propagation
    // e.stopPropagation();
  };

  return (
    <div
      onClick={handleParentClick}
      onClickCapture={(e) => {
        console.log('Parent capture phase');
      }}
    >
      <button
        onClick={handleChildClick}
        onClickCapture={(e) => {
          console.log('Child capture phase');
        }}
      >
        Click Me
      </button>
    </div>
  );
};
```

---

## Debugging StudioAreaSelector (Example)

Let me read the component first and create a specific debugging guide for it.

### Step-by-Step Debugging Guide

#### 1. Initial Setup

**Add Debug Flag:**
```javascript
// Add at top of StudioAreaSelector.jsx
const DEBUG = process.env.NODE_ENV === 'development';

const debug = {
  log: (...args) => DEBUG && console.log('[StudioAreaSelector]', ...args),
  warn: (...args) => DEBUG && console.warn('[StudioAreaSelector]', ...args),
  error: (...args) => DEBUG && console.error('[StudioAreaSelector]', ...args),
  group: (label) => DEBUG && console.group(`[StudioAreaSelector] ${label}`),
  groupEnd: () => DEBUG && console.groupEnd(),
};
```

#### 2. Debug Props Flow

```javascript
const StudioAreaSelector = (props) => {
  // Log all props on every render
  debug.group('Render');
  debug.log('Props received:', {
    areas: props.areas,
    onChangeHandler: props.onChangeHandler,
    // ... other props
  });
  debug.groupEnd();

  // Watch specific prop changes
  useEffect(() => {
    debug.log('areas prop changed:', props.areas);
  }, [props.areas]);

  // ...
};
```

#### 3. Debug Area Selection

```javascript
const onChangeHandler = (newAreas) => {
  debug.group('Area Changed');
  debug.log('Previous areas:', areas);
  debug.log('New areas:', newAreas);
  debug.log('Diff:', {
    added: newAreas.length - areas.length,
    newAreaData: newAreas[newAreas.length - 1]
  });
  debug.groupEnd();

  props.onChangeHandler?.(newAreas);
};
```

#### 4. Debug Image Loading

```javascript
const handleImageLoad = () => {
  debug.group('Image Loaded');
  debug.log('Image dimensions:', {
    naturalWidth: imageRef.current?.naturalWidth,
    naturalHeight: imageRef.current?.naturalHeight,
    clientWidth: imageRef.current?.clientWidth,
    clientHeight: imageRef.current?.clientHeight
  });
  debug.groupEnd();

  // Your logic
};
```

#### 5. Debug Coordinate Calculations

```javascript
const convertCoordinates = (area) => {
  debug.group('Coordinate Conversion');
  debug.log('Input area:', area);

  const converted = {
    // ... conversion logic
  };

  debug.log('Converted area:', converted);
  debug.groupEnd();

  return converted;
};
```

#### 6. Debug Rendering Issues

```javascript
const StudioAreaSelector = (props) => {
  const renderCount = useRef(0);
  renderCount.current++;

  debug.log(`Render count: ${renderCount.current}`);

  useEffect(() => {
    debug.log('Component mounted');

    return () => {
      debug.log('Component unmounting');
    };
  }, []);

  // ...
};
```

#### 7. Debug React-Image-Area Library

```javascript
// Debug the @bmunozg/react-image-area component
<AreaSelector
  areas={areas}
  onChange={(newAreas) => {
    debug.group('AreaSelector onChange');
    debug.log('Library callback triggered');
    debug.log('New areas from library:', newAreas);
    debug.groupEnd();

    onChangeHandler(newAreas);
  }}
  onChangeComplete={(newAreas) => {
    debug.log('AreaSelector onChangeComplete:', newAreas);
  }}
  // ...
/>
```

#### 8. Create Debug Panel (Optional)

```javascript
const DebugPanel = ({ areas, imageRef }) => {
  if (!DEBUG) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 10,
      right: 10,
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: 10,
      borderRadius: 5,
      fontSize: 12,
      maxWidth: 300,
      maxHeight: 400,
      overflow: 'auto'
    }}>
      <h4>Debug Info</h4>
      <div>
        <strong>Areas Count:</strong> {areas.length}
      </div>
      <div>
        <strong>Image Size:</strong> {imageRef.current?.clientWidth} x {imageRef.current?.clientHeight}
      </div>
      <div>
        <strong>Areas:</strong>
        <pre>{JSON.stringify(areas, null, 2)}</pre>
      </div>
    </div>
  );
};
```

---

## Advanced Techniques

### 1. React DevTools Profiler API

```javascript
import { Profiler } from 'react';

const onRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime,
  interactions
) => {
  console.log('Profiler:', {
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime
  });
};

const MyComponent = () => (
  <Profiler id="MyComponent" onRender={onRenderCallback}>
    <div>Content</div>
  </Profiler>
);
```

### 2. Error Boundaries for Debugging

```javascript
class DebugErrorBoundary extends React.Component {
  state = { hasError: false, error: null, errorInfo: null };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', {
      error,
      errorInfo,
      componentStack: errorInfo.componentStack
    });

    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, background: '#fee', color: '#c00' }}>
          <h2>Something went wrong</h2>
          <details>
            <summary>Error Details</summary>
            <pre>{this.state.error?.toString()}</pre>
            <pre>{this.state.errorInfo?.componentStack}</pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 3. Time-Travel Debugging

```javascript
// Create a history of state changes
const useStateWithHistory = (initialValue, maxHistory = 10) => {
  const [state, setState] = useState(initialValue);
  const [history, setHistory] = useState([initialValue]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const setStateWithHistory = (newState) => {
    const value = typeof newState === 'function'
      ? newState(state)
      : newState;

    const newHistory = [
      ...history.slice(0, historyIndex + 1),
      value
    ].slice(-maxHistory);

    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setState(value);

    console.log('State history:', newHistory);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setState(history[newIndex]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setState(history[newIndex]);
    }
  };

  return [state, setStateWithHistory, { undo, redo, history }];
};
```

---

## Troubleshooting Common Issues

### Issue: "Component not updating when prop changes"

**Causes & Solutions:**

1. **Prop reference not changing (object/array)**
   ```javascript
   // ❌ Bad - mutating object
   obj.property = newValue;
   setData(obj);

   // ✅ Good - new reference
   setData({ ...obj, property: newValue });
   ```

2. **Component is memoized incorrectly**
   ```javascript
   // Check React.memo comparison
   const MyComponent = React.memo(
     ({ data }) => <div>{data.value}</div>,
     (prevProps, nextProps) => {
       console.log('Memo comparison:', { prevProps, nextProps });
       return prevProps.data.id === nextProps.data.id;
     }
   );
   ```

3. **Using wrong comparison in useEffect**
   ```javascript
   // ❌ Will always trigger (new object)
   useEffect(() => {
     // ...
   }, [{ id: 1 }]);

   // ✅ Use primitive value
   useEffect(() => {
     // ...
   }, [id]);
   ```

### Issue: "Infinite loop / Too many re-renders"

**Causes & Solutions:**

1. **Setting state in render**
   ```javascript
   // ❌ Bad
   const MyComponent = () => {
     setState(newValue); // Causes infinite loop
     return <div>Content</div>;
   };

   // ✅ Good
   const MyComponent = () => {
     useEffect(() => {
       setState(newValue);
     }, []);
     return <div>Content</div>;
   };
   ```

2. **Effect updating its own dependency**
   ```javascript
   // ❌ Bad - infinite loop
   useEffect(() => {
     setCount(count + 1);
   }, [count]);

   // ✅ Good - runs once
   useEffect(() => {
     setCount(prev => prev + 1);
   }, []);
   ```

3. **New object/function in dependency array**
   ```javascript
   // ❌ Bad - new object each render
   useEffect(() => {
     // ...
   }, [{ id: 1 }]);

   // ✅ Good - use primitive or useMemo
   const config = useMemo(() => ({ id: 1 }), []);
   useEffect(() => {
     // ...
   }, [config]);
   ```

---

## Quick Reference

### Console Shortcuts
```javascript
// Store as global variable (in DevTools console)
temp1 // Last evaluated expression

// Monitor function calls
monitor(functionName) // Logs every time function is called
unmonitor(functionName)

// Get event listeners
getEventListeners(element)

// Copy to clipboard
copy(object)
```

### React DevTools Shortcuts
```
Ctrl/Cmd + F - Search components
Ctrl/Cmd + D - Toggle DevTools theme
Ctrl/Cmd + Shift + P - Find component by name
```

### Browser DevTools Shortcuts
```
Ctrl/Cmd + Shift + C - Inspect element
Ctrl/Cmd + Shift + J - Open console
Ctrl/Cmd + Shift + I - Open DevTools
F12 - Toggle DevTools
Ctrl/Cmd + R - Reload page
Ctrl/Cmd + Shift + R - Hard reload (clear cache)
```

---

## Best Practices

1. **Remove console.logs before committing**
   - Or use a debug flag: `if (DEBUG) console.log(...)`
   - Or use a logging library that can be disabled in production

2. **Use meaningful log messages**
   - ❌ `console.log(data)`
   - ✅ `console.log('User data after API call:', data)`

3. **Group related logs**
   - Use `console.group()` and `console.groupEnd()`

4. **Use appropriate log levels**
   - `console.log()` - General info
   - `console.info()` - Informational messages
   - `console.warn()` - Warnings
   - `console.error()` - Errors

5. **Add timestamps to logs**
   ```javascript
   const log = (message, data) => {
     console.log(`[${new Date().toISOString()}] ${message}`, data);
   };
   ```

6. **Create debug utilities**
   - Centralize debugging logic
   - Easy to enable/disable
   - Consistent formatting

---

## Resources

- [React DevTools Documentation](https://react.dev/learn/react-developer-tools)
- [Chrome DevTools Documentation](https://developer.chrome.com/docs/devtools/)
- [React Profiler API](https://react.dev/reference/react/Profiler)
- [Why Did You Render](https://github.com/welldone-software/why-did-you-render)

---

**Last Updated:** November 6, 2025
