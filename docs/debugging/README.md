# Debugging Documentation

**Purpose:** Comprehensive debugging guides for the Question Bank application

---

## Available Guides

### 1. [Comprehensive Debugging Guide](./COMPREHENSIVE_DEBUGGING_GUIDE.md) ⭐

**Use this when:** You need to debug any React component or learn debugging techniques

**Contents:**
- Pre-debugging checklist
- Debugging tools setup (React DevTools, VS Code, etc.)
- General debugging strategy
- React-specific debugging techniques
- Browser DevTools mastery
- Common debugging patterns
- Performance debugging
- State management debugging
- Props & Context debugging
- Event handler debugging
- Advanced techniques
- Troubleshooting common issues

**Topics Covered:**
- ✅ Console logging effectively
- ✅ React DevTools usage
- ✅ Breakpoint debugging
- ✅ Hook debugging (useState, useEffect, custom hooks)
- ✅ Performance profiling
- ✅ Memory leak detection
- ✅ Network debugging
- ✅ State management (Zustand, Context)
- ✅ And much more...

---

### 2. [StudioAreaSelector Debug Guide](./STUDIO_AREA_SELECTOR_DEBUG_GUIDE.md)

**Use this when:** You're debugging the StudioAreaSelector component specifically

**Contents:**
- Component overview
- Quick debug setup
- Common issues & solutions
- Debugging props
- Debugging area selection
- Debugging image loading
- Debugging conditional rendering
- Debugging composite blocks
- Debugging virtual blocks
- Performance debugging
- Full debug version

**Common Issues Solved:**
- ✅ Areas not displaying on image
- ✅ Can't select new areas
- ✅ Selected areas in wrong position
- ✅ Component re-rendering too much
- ✅ Image loading issues
- ✅ Composite blocks not working

---

## Quick Start

### For Beginners

1. **Start here:** Read the [Comprehensive Debugging Guide](./COMPREHENSIVE_DEBUGGING_GUIDE.md)
2. **Install tools:** React DevTools, VS Code extensions
3. **Learn basics:** Console logging, breakpoints, React DevTools
4. **Practice:** Try debugging a simple component first

### For Experienced Developers

1. **Jump to specific section** in the [Comprehensive Guide](./COMPREHENSIVE_DEBUGGING_GUIDE.md):
   - Common debugging patterns
   - Performance debugging
   - State management debugging
2. **Use component-specific guides** like [StudioAreaSelector](./STUDIO_AREA_SELECTOR_DEBUG_GUIDE.md)

### For StudioAreaSelector Issues

1. **Go directly to:** [StudioAreaSelector Debug Guide](./STUDIO_AREA_SELECTOR_DEBUG_GUIDE.md)
2. **Find your issue** in the Common Issues section
3. **Follow the debug steps** provided
4. **Apply the quick fix** if available

---

## Debugging Workflow

### General Process

```
1. Identify the problem
   ↓
2. Reproduce consistently
   ↓
3. Check console for errors
   ↓
4. Add console.logs at key points
   ↓
5. Use React DevTools to inspect state/props
   ↓
6. Set breakpoints if needed
   ↓
7. Form hypothesis
   ↓
8. Test hypothesis
   ↓
9. Fix issue
   ↓
10. Verify fix works
   ↓
11. Remove debug code
   ↓
12. Document solution
```

### Component-Specific Workflow

For a component like StudioAreaSelector:

```
1. Add debug utility to component
   ↓
2. Add render counter
   ↓
3. Log all props on render
   ↓
4. Watch specific prop changes with useEffect
   ↓
5. Add logs to event handlers
   ↓
6. Check conditional rendering logic
   ↓
7. Verify data flow (props → state → render)
   ↓
8. Fix issue
   ↓
9. Remove debug code or hide behind DEBUG flag
```

---

## Tools & Extensions

### Essential Browser Extensions

- **React DevTools** - Inspect React component tree
- **Redux DevTools** - Debug Redux/Zustand store (if configured)

### VS Code Extensions

- **ES7+ React/Redux/React-Native snippets**
- **ESLint**
- **Prettier**
- **Error Lens**

### npm Packages (Development)

```bash
# Why Did You Render (track re-renders)
npm install --save-dev @welldone-software/why-did-you-render

# React Query DevTools (if using React Query)
npm install --save-dev @tanstack/react-query-devtools
```

---

## Debugging Best Practices

### Do's ✅

- ✅ Use meaningful log messages
- ✅ Group related logs with console.group()
- ✅ Use appropriate log levels (log, warn, error)
- ✅ Add timestamps to logs when needed
- ✅ Check for errors in console first
- ✅ Use React DevTools to inspect components
- ✅ Set breakpoints at critical points
- ✅ Test one hypothesis at a time
- ✅ Document solutions for future reference

### Don'ts ❌

- ❌ Leave console.logs in production code
- ❌ Ignore warnings in console
- ❌ Change multiple things at once
- ❌ Debug without reproducing the issue first
- ❌ Skip checking the React DevTools
- ❌ Assume the problem without evidence
- ❌ Give up after first failed hypothesis

---

## Common Issues Across Components

### 1. "Component not updating when props change"

**Quick Debug:**
```javascript
useEffect(() => {
  console.log('Prop changed:', propName);
}, [propName]);
```

**See:** [Comprehensive Guide - Troubleshooting](./COMPREHENSIVE_DEBUGGING_GUIDE.md#troubleshooting-common-issues)

---

### 2. "Too many re-renders"

**Quick Debug:**
```javascript
const renderCount = useRef(0);
renderCount.current++;
console.log('Render count:', renderCount.current);
```

**See:** [Comprehensive Guide - Performance Debugging](./COMPREHENSIVE_DEBUGGING_GUIDE.md#performance-debugging)

---

### 3. "State not updating"

**Quick Debug:**
```javascript
setState(prev => {
  console.log('State update:', { prev, next: prev + 1 });
  return prev + 1;
});
```

**See:** [Comprehensive Guide - Common Patterns](./COMPREHENSIVE_DEBUGGING_GUIDE.md#common-debugging-patterns)

---

### 4. "Event handler not firing"

**Quick Debug:**
```javascript
const handleClick = (e) => {
  console.log('Handler called:', e);
  // handler logic
};
```

**See:** [Comprehensive Guide - Event Handler Debugging](./COMPREHENSIVE_DEBUGGING_GUIDE.md#event-handler-debugging)

---

## Creating New Component Debug Guides

When creating a debug guide for a new component:

1. **Use the template:**
   - Component overview
   - Quick debug setup
   - Common issues & solutions
   - Function-by-function debugging
   - Full debug version

2. **Include:**
   - Specific error messages
   - Code examples
   - Quick fixes
   - Debug checklist

3. **Link to:**
   - Comprehensive guide for general techniques
   - Related component guides
   - External documentation

---

## Tips for Effective Debugging

### Tip 1: Start Simple

Begin with console.logs, not complex debuggers. Most issues can be found with strategic logging.

### Tip 2: Divide and Conquer

If the problem is complex, break it down:
- Is it a rendering issue?
- Is it a data issue?
- Is it a timing issue?

### Tip 3: Check the Basics

Before diving deep:
- Is the component mounted?
- Are props passed correctly?
- Is data in the expected format?
- Are there console errors?

### Tip 4: Use the Right Tool

- **Console logs:** Quick checks, data inspection
- **React DevTools:** Component tree, props, state, hooks
- **Breakpoints:** Step-by-step execution
- **Network tab:** API calls, loading issues
- **Performance tab:** Slow renders, memory leaks

### Tip 5: Document Your Findings

When you solve a bug:
- Note what caused it
- Note how you fixed it
- Update documentation
- Consider adding tests

---

## Getting Help

### When You're Stuck

1. **Check existing documentation**
   - [Comprehensive Guide](./COMPREHENSIVE_DEBUGGING_GUIDE.md)
   - [Component-specific guides](./STUDIO_AREA_SELECTOR_DEBUG_GUIDE.md)

2. **Search the codebase**
   - Look for similar patterns
   - Check how other components handle it

3. **Ask for help**
   - Provide error message
   - Show what you've tried
   - Include relevant code
   - Include console output

### Preparing a Bug Report

Include:
- **What you expected** to happen
- **What actually** happened
- **Steps to reproduce**
- **Error messages** (full stack trace)
- **Browser/environment** info
- **What you've tried** so far

---

## Contributing

### Adding New Guides

1. Create new file in `docs/debugging/`
2. Follow existing template structure
3. Update this README with link
4. Test all examples

### Improving Existing Guides

1. Add missing information
2. Fix errors
3. Add more examples
4. Update outdated content

---

## Changelog

### November 6, 2025
- ✅ Created comprehensive debugging guide
- ✅ Created StudioAreaSelector debug guide
- ✅ Created debugging index (this file)

---

## Resources

### Official Documentation
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [React Profiler API](https://react.dev/reference/react/Profiler)

### Libraries Used
- [@bmunozg/react-image-area](https://www.npmjs.com/package/@bmunozg/react-image-area)
- [Zustand](https://github.com/pmndrs/zustand)
- [React Query](https://tanstack.com/query/latest)

### Debugging Tools
- [Why Did You Render](https://github.com/welldone-software/why-did-you-render)
- [React DevTools Profiler](https://react.dev/learn/react-developer-tools#profiler)

---

**Last Updated:** November 6, 2025
