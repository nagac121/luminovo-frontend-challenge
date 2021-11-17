# ERRORS

## ERROR 1

> Error: Warning: Encountered two children with the same key, `2d02db26-f814-4d36-ad7c-8d374bc540d3`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.

### Solution:

src\App.tsx

```javascript
key={`${project.id}-${project.projectName}`}
```

## ERROR 2

> TypeError: date2.getTime is not a function

## solution:

src\App.tsx

```javascript
let date2 = new Date(b.creationDate);
```

## ERROR 3

> bug: project name is not getting displayed, because of wrong property name in db.json.

## solution:

parse api result and fix wrong property name ie correct 'projectNamee' to 'projectName'

```javascript
function sanitizeProjectsData(projectsData: any) {
  const prjDataArr: any[] = [];

  for (let project of projectsData.data) {
    if (project["projectName"]) {
      prjDataArr.push(project);
    } else {
      project["projectName"] = project["projectNamee"];
      delete project["projectNamee"];
      prjDataArr.push(project);
    }
  }
  return prjDataArr;
}
```
