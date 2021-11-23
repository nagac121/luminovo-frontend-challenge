# ERRORS

## ERROR 1

> Error: Warning: Encountered two children with the same key, `2d02db26-f814-4d36-ad7c-8d374bc540d3`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.

### code fix

src\App.tsx

```javascript
key={`${project.id}-${project.projectName}`}
```

## ERROR 2

> TypeError: date2.getTime is not a function

### code fix

src\App.tsx

```javascript
let date2 = new Date(b.creationDate);
```

## ERROR 3

> bug: project name is not getting displayed, because of wrong property name in db.json.

### code fix

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

## Error 4
> 'creationDate' is Invalid date    

### code Fix
added hardcoded date to recognize invalid dates and for successful sorting of projects.

```javascript
if (new Date(project.creationDate).toDateString() === "Invalid Date") {
 project.creationDate = new Date("2000-01-01T00:00:00.000Z").toISOString();
}
```
# Known bugs
1. run `npm run run-server-big`.
2. click on 'search by project' or 'search by status' gives `Warning: Encountered two children with the same key`.

## Solutions tried
gave unique key to `options` attribute of <Autocomplete>, 
```javascript
 options={statusDDL.map((project: any,index:number) => <li key={`${project.id}-${index}`}>{project.status}</li>)}
 ```
and error is gone, 
but a new error `Uncaught TypeError: Converting circular structure to JSON autocomplete` is occurring, and breaking the application.

I could not find the solution so far.