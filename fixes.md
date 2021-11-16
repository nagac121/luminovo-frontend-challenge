Error: Warning: Encountered two children with the same key, `2d02db26-f814-4d36-ad7c-8d374bc540d3`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.

Solution:
src\App.tsx
```javascript
key={`${project.id}-${project.projectName}`}
```
