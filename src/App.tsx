import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import React, { useEffect, useState, useCallback } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import DateTimePicker from "@mui/lab/DateTimePicker";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import InfiniteScroll from "react-infinite-scroll-component";

// Default values
const SCROLL_LIMIT = 20;
const DEFAULT_USER_ACTIONS = {
  loaded: false,
  sorted: false,
  searchByProject: false,
};

interface ProjectItem {
  creationDate: any;
  projectName: any;
  id: any;
  status: string;
}

const useStyles = makeStyles({
  root: {
    margin: 10,
  },
  fieldStyles: {
    borderColor: "rgba(0, 0, 0, 0.1)",
    margin: 10,
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  legendStyles: {
    marginLeft: 10,
    paddingLeft: 10,
    paddingRight: 10,
    fontSize: 15,
    fontWeight: "bold",
    color: "rgba(0, 0, 0, 0.6)",
  },
  datePicker: {
    width: "220px",
  },
});

interface CardProps {
  date: any;
  name: string;
  status: string;
}

const useCardStyles = makeStyles({
  root: {
    width: 350,
    margin: 10,
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 10,
  },
  cardContent: {
    marginLeft: 10,
    marginTop: 10,
  },
});

const ProjectCard: React.FC<CardProps> = ({ date, name, status }) => {
  const classes = useCardStyles();
  const toDate = new Date(date);

  return (
    <Card className={classes.root} variant="outlined">
      <div className={classes.cardContent}>
        <Typography
          data-testid="date"
          className={classes.title}
          color="textSecondary"
        >
          {toDate.toUTCString()}
        </Typography>
        <Typography variant="h5" component="h2">
          {name}
        </Typography>
        <Typography style={{ color: "textSecondary", marginBottom: 10 }}>
          {status}
        </Typography>
      </div>
    </Card>
  );
};

function App() {
  // project state
  const [fetchedProjects, setFetchedProjects] = useState<ProjectItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [sortedProjects, setSortedProjects] = useState<ProjectItem[]>([]);
  const [searchedProjects, setSearchedProjects] = useState<ProjectItem[]>([]);
  
  // user actions
  const [fromDateValue, setFromDateValue] = useState("");
  const [toDateValue, setToDateValue] = useState("");
  const [statusDDL, setStatusDDL] = useState<any>([]);
  const [userActions, setUserActions] = useState(DEFAULT_USER_ACTIONS);
  // infinite scroll
  const [scrollMark, setScrollMark] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  // styling
  const classes = useStyles();

  // Fetch Projects
  const fetchProjects = useCallback(async (newValue) => {
    let url = "http://localhost:3004/projects";
    const res = await fetch(url);
    let data = await res.json();
    data = sanitizeProjectsData(data);
    setFetchedProjects(data);
    return data;
  }, []);

  function sanitizeProjectsData(projectsData: any) {
    const prjDataArr: any[] = [];
    for (let project of projectsData.data) {
      if (new Date(project.creationDate).toDateString() === "Invalid Date") {
        // adding hardcoded date to recognize invalid dates
        project.creationDate = new Date(
          "2000-01-01T00:00:00.000Z"
        ).toISOString();
      }

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

  // Specify that API is called once on page load
  useEffect(() => {
    const getProjects = async () => {
      const projectsFromServer = await fetchProjects(null);
      // set JSX data
      const projectSet = initialProjects(projectsFromServer);
      setProjects(projectSet);

      // set hasMore state
      const more = checkHasMore(projectSet, projectsFromServer);
      setHasMore(more);

      // preparing status obj
      let statusSet = new Set();
      projectsFromServer.forEach((project: ProjectItem) => {
        let status =
          project.status === "inProgress" ? "In Progress" : project.status;
        statusSet.add(status);
      });
      let statusArr: any[] = [];
      let statusArrObj = [];
      statusArr = Array.from(statusSet);
      for (let item of statusArr) {
        statusArrObj.push({
          status: item,
        });
      }
      setStatusDDL(statusArrObj);

      // set user actions
      // make everything false, except this particular action
      setUserActions((prevState) => {
        return {
          ...DEFAULT_USER_ACTIONS,
          loaded: true,
        };
      });
    };
    getProjects();
  }, [fetchProjects]);

  function checkHasMore(currentSet: any[], totalData: any[]) {
    const more = currentSet.length < totalData.length;
    return more;
  }

  const fetchMoreData = () => {
    console.log("fetch more method");

    const projectSet: any[] = [];
    const limit = scrollMark + SCROLL_LIMIT;
    let moreProjects = [...fetchedProjects];

    console.log("fetch more: ", userActions, userActions.sorted);
    if (userActions["sorted"]) {
      moreProjects = [...sortedProjects];
    }
    if (userActions["searchByProject"]) {
      moreProjects = [...searchedProjects];
    }

    for (let i = scrollMark; i < limit; i++) {
      if (moreProjects[i]) {
        projectSet.push(moreProjects[i]);
      }
    }
    // create project set
    let obj: any[] = [];
    if (!!projectSet.length) {
      // projects is existing, projectSet is incoming
      obj = [...projects, ...projectSet];
      setProjects(obj);
    }
    if (obj.length < fetchedProjects.length) {
      setScrollMark(limit);
      setHasMore(true);
    } else {
      setHasMore(false);
    }
  };

  function handleSortClick(sortedType: "earliest" | "latest") {
    const sorted = sortProjects(fetchedProjects, sortedType);
    setSortedProjects(sorted);
    // set initial projects
    const projectSet = initialProjects(sorted);
    setProjects(projectSet);

    setUserActions({
      ...DEFAULT_USER_ACTIONS,
      sorted: true,
    });

    // set hasMore state
    const more = sorted.length > SCROLL_LIMIT;
    setHasMore(more);
  }

  function initialProjects(items: ProjectItem[]) {
    const projectSet: ProjectItem[] = [];
    for (let i = 0; i < SCROLL_LIMIT; i++) {
      projectSet.push(items[i]);
    }
    setScrollMark(SCROLL_LIMIT);
    return projectSet;
  }

  function sortProjects(projects: ProjectItem[], sortedType: string) {
    return [...projects].sort((a, b) => {
      let date1 = new Date(a.creationDate);
      let date2 = new Date(b.creationDate);
      if (sortedType === "earliest") {
        return date1.getTime() - date2.getTime();
      } else if (sortedType === "latest") {
        return date2.getTime() - date1.getTime();
      } else {
        return 0;
      }
    });
  }

  function handleSearchChange(
    event: any,
    newValue: string,
    selectOption: string
  ): void {
    if (selectOption === "clear") {
      setProjects(fetchedProjects);
    } else if (selectOption === "selectOption") {
      const searchedProjects = fetchedProjects.reduce(
        (acc: ProjectItem[], curVal: ProjectItem): ProjectItem[] => {
          if (curVal.projectName === newValue) {
            acc.push(curVal);
          }
          return acc;
        },
        []
      );
      setSearchedProjects(searchedProjects);
      // setProjects(searchedProjects);
      // set initial projects
      if (searchedProjects.length < SCROLL_LIMIT) {
        setProjects(searchedProjects);
      } else {
        const projectSet = initialProjects(searchedProjects);
        setProjects(projectSet);
      }
      setUserActions({
        ...DEFAULT_USER_ACTIONS,
        searchByProject: true,
      });
      // set hasMore state
      const more = searchedProjects.length > SCROLL_LIMIT;
      setHasMore(more);
    } else {
      // createOption ie typed manually
      alert("Select Project from suggestions !");
    }
  }

  const handleDateChange = (flag: string, newValue: any) => {
    if (flag === "fromDate") {
      setFromDateValue(newValue);
    } else {
      setToDateValue(newValue);
    }
  };

  const handleFilterClick = () => {
    const fromTime = new Date(fromDateValue).getTime();
    const toTime = new Date(toDateValue).getTime();
    const filteredProjects = projects.reduce(
      (acc: ProjectItem[], curVal: ProjectItem) => {
        const curValTime = new Date(curVal.creationDate).getTime();
        // inclusive filtering
        if (curValTime >= fromTime && curValTime <= toTime) {
          acc.push(curVal);
        }
        return acc;
      },
      []
    );
    setProjects(filteredProjects);
  };

  function handleStatusChange(
    event: any,
    newValue: string,
    selectOption: string
  ) {
    if (selectOption === "clear") {
      setProjects(fetchedProjects);
    } else if (selectOption === "selectOption") {
      const searchedProjects = fetchedProjects.reduce(
        (acc: ProjectItem[], curVal: ProjectItem): ProjectItem[] => {
          const status =
            curVal.status === "inProgress" ? "In Progress" : curVal.status;
          if (status === newValue) {
            acc.push(curVal);
          }
          return acc;
        },
        []
      );
      setProjects(searchedProjects);
    } else {
      // createOption ie typed manually
      alert("Select status from suggestions !");
    }
  }

  // render App
  return (
    <div className="App">
      <div className="buttons-menu">
        <Button
          className={classes.root}
          variant="contained"
          onClick={() => handleSortClick("earliest")}
          data-testid="earliest-button"
        >
          Earliest
        </Button>

        <Autocomplete
          id="project-search"
          freeSolo
          options={fetchedProjects.map((project) => project.projectName)}
          autoComplete={true}
          autoHighlight={true}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search By Project"
              sx={{ width: 180, mt: 1 }}
              size="small"
            />
          )}
          onChange={(event, newValue, selectOption) =>
            handleSearchChange(event, newValue, selectOption)
          }
        />

        <Autocomplete
          id="status-search"
          freeSolo
          options={statusDDL.map((project: any) => project.status)}
          autoComplete={true}
          autoHighlight={true}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search By Status"
              sx={{ width: 180, mt: 1 }}
              size="small"
            />
          )}
          onChange={(event, newValue, selectOption) =>
            handleStatusChange(event, newValue + "", selectOption)
          }
        />

        <Button
          className={classes.root}
          variant="contained"
          onClick={() => handleSortClick("latest")}
          data-testid="latest-button"
        >
          Latest
        </Button>
      </div>
      <div>
        <fieldset className={classes.fieldStyles}>
          <legend className={classes.legendStyles}>Filtering</legend>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="From Date"
              value={fromDateValue}
              onChange={(newValue) => handleDateChange("fromDate", newValue)}
              renderInput={(params) => {
                return (
                  <TextField
                    {...params}
                    size="small"
                    sx={{ m: 1 }}
                    className={classes.datePicker}
                  />
                );
              }}
            />
          </LocalizationProvider>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="End Date"
              value={toDateValue}
              onChange={(newValue) => handleDateChange("toDate", newValue)}
              renderInput={(params) => {
                return (
                  <TextField
                    {...params}
                    sx={{ m: 1 }}
                    className={classes.datePicker}
                    size="small"
                  />
                );
              }}
            />
          </LocalizationProvider>
          <Button
            className={classes.root}
            variant="contained"
            onClick={handleFilterClick}
            data-testid="latest-button"
            disabled={!fromDateValue || !toDateValue}
          >
            Filter
          </Button>
        </fieldset>
      </div>

      <div className="projects-content">
        <InfiniteScroll
          dataLength={projects.length}
          next={fetchMoreData}
          hasMore={hasMore}
          scrollThreshold="30%"
          loader={<h4>Loading...</h4>}
          height={400}
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {projects.map((project, index) => {
            return (
              <ProjectCard
                key={`${project.id}-${index}}`}
                date={project.creationDate}
                name={project.projectName}
                status={project.status}
              />
            );
          })}
        </InfiniteScroll>
        <p style={{ textAlign: "center", display: hasMore ? "none" : "block" }}>
          <b>End of the results.{projects.length}</b>
        </p>
      </div>
    </div>
  );
}

export default App;
