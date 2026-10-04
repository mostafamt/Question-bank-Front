# Debugging: Why Dashed Borders Still Appear

## Investigation Steps

### Step 1: Inspect the DOM Structure
When you click the toggle to hide borders, open Chrome DevTools (F12) and:

1. **Right-click on a block area** (the one showing grey dashed border)
2. **Select "Inspect"** to open DevTools
3. **Note the DOM structure:**
   - What is the exact tag/class of the element with the dashed border?
   - What are the parent elements?
   - Are there any inline styles?

### Example DOM structures to look for:

```html
<!-- Possibility 1: Direct area div -->
<div class="block">
  <div><!-- image --></div>
  <div style="border: 2px dashed rgb(128, 128, 128);"><!-- Area 1 --></div>
  <div style="border: 2px dashed rgb(128, 128, 128);"><!-- Area 2 --></div>
</div>

<!-- Possibility 2: Nested structure -->
<div class="block">
  <div><!-- image --></div>
  <div class="area-wrapper"><!-- Library wrapper -->
    <div style="border: 2px dashed rgb(128, 128, 128);"><!-- Actual area --></div>
  </div>
</div>

<!-- Possibility 3: Different selector structure -->
<div class="block">
  <div><!-- image --></div>
  <div data-area-id="..."><!-- Area with data attribute --></div>
</div>
```

### Step 2: Check Applied Styles
In DevTools, when inspecting the bordered element:

1. **Look at the "Styles" panel**
2. **Find where `border` is being set:**
   - Is it inline (`style="border: ..."`)? 
   - Is it from a CSS class?
   - Is it from emotion CSS?
   - What is the exact border value? (color, style, width)
3. **Check if our CSS override is visible:**
   - Look for `.hideBlocksStyling` class applied to parent
   - Look for our `border: none !important` rule

### Step 3: Verify Class Application
1. **Click the toggle button** to turn styling OFF
2. **Inspect the `.block` div** (the parent container)
3. **Check if it has class `hideBlocksStyling`:**
   - In DevTools, look at the class attribute
   - Should see: `class="block hideBlocksStyling"`
   - Or with emotion class: `class="block hideBlocksStyling css-xxxxx"`

## Common Issues & Solutions

### Issue 1: CSS Selector Not Matching
**Symptoms:** Class is applied but borders still show

**Debug:**
```css
/* In DevTools Console, try: */
document.querySelectorAll('.block.hideBlocksStyling > div:nth-of-type(n+2)')
/* If this returns [], selector is wrong */
```

**Solution:** Adjust selector based on actual DOM structure

### Issue 2: Inline Styles Have Higher Specificity
**Symptoms:** `!important` doesn't work, borders still visible

**Debug:**
```
If element has inline style: <div style="border: 2px dashed ...">
The inline style overrides !important in some cases
```

**Solution:** Use attribute selector with !important:
```scss
&.hideBlocksStyling {
  & > div[style] {
    border: none !important;
    background-color: transparent !important;
  }
}
```

### Issue 3: Emotion CSS Still Applying Styles
**Symptoms:** Our SCSS changes work but emotion CSS overrides them

**Debug:**
```
Check constructBoxColors output when showBlocksStyling = false
If it still has border/backgroundColor, emotion CSS wins
```

**Solution:** Already implemented - constructBoxColors returns `{}` when false

### Issue 4: Different DOM Level
**Symptoms:** Borders on elements deeper in the tree

**Debug:**
```css
/* Try targeting all descendants, not just direct children: */
&.hideBlocksStyling div {
  border: none !important;
  background-color: transparent !important;
}
```

## What to Report Back

When you run the inspection, please provide:

1. **Exact DOM structure** (copy from DevTools)
   ```html
   <div class="block ...">
     <div><!-- what's inside? --></div>
     <div><!-- describe what you see --></div>
   </div>
   ```

2. **Where the border comes from:**
   - Inline style: `style="border: 2px dashed rgb(128, 128, 128);"`?
   - CSS class: from which class?
   - Value: what is the exact border value?

3. **Parent classes/attributes:**
   - Does `.block` have class `hideBlocksStyling`?
   - Any data attributes?

4. **Screenshots/Console output:**
   - Screenshot of DevTools elements panel
   - Output of: `document.querySelectorAll('.block.hideBlocksStyling > div:nth-of-type(n+2)').length`

## Quick Console Debugging

You can paste this in Chrome DevTools Console to diagnose:

```javascript
// Check if hideBlocksStyling class is applied
const block = document.querySelector('.block');
console.log('Has hideBlocksStyling class:', block?.classList.contains('hideBlocksStyling'));
console.log('Block classes:', block?.className);

// Check if our CSS selector matches anything
const areas = document.querySelectorAll('.block.hideBlocksStyling > div:nth-of-type(n+2)');
console.log('Elements matching our selector:', areas.length);
areas.forEach((el, i) => {
  console.log(`Area ${i}:`, el.className, el.style.border);
});

// Check all divs with borders
const bordered = document.querySelectorAll('[style*="border"]');
console.log('All elements with inline border styles:', bordered.length);
bordered.forEach((el, i) => {
  console.log(`Bordered ${i}:`, el.className, el.style.border, el.parentElement.className);
});
```

## Alternative Fixes (Based on Findings)

### If borders are inline styles on area divs:
```scss
&.hideBlocksStyling > div {
  border: none !important;
  background-color: transparent !important;
}
```

### If borders are in emotion CSS:
Check if `constructBoxColors` is correctly returning empty `{}` when `showBlocksStyling = false`

### If library uses data attributes:
```scss
&.hideBlocksStyling [data-area-id],
&.hideBlocksStyling [data-id],
&.hideBlocksStyling [data-area] {
  border: none !important;
  background-color: transparent !important;
}
```

### Nuclear option (safest):
```scss
&.hideBlocksStyling > * {
  border: none !important;
  background-color: transparent !important;
  outline: none !important;
}
```

---

**Next Step:** Run the inspection and share what you find. This will tell us exactly what to target.
