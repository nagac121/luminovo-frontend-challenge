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
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [searchResult, setSearchResult] = useState<ProjectItem[]>([]);
  const [fromDateValue, setFromDateValue] = useState("");
  const [toDateValue, setToDateValue] = useState("");
  const [filteredProjects, setFilteredProjects] = useState<ProjectItem[]>([]);

  // const [sortedField, setSortedField] = useState<string>("");
  // let sortedProjects = [...projects];

  const classes = useStyles();

  // Fetch Projects
  const fetchProjects = useCallback(async (newValue) => {
    let url = "http://localhost:3004/projects";
    const res = await fetch(url);
    let data = await res.json();
    data = sanitizeProjectsData(data);
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
      setProjects(projectsFromServer);
    };
    getProjects();
  }, [fetchProjects]);

  function handleClick(sortedType: "earliest" | "latest") {
    setSearchResult([]);
    const sorted = sortProjects(projects, sortedType);
    setProjects(sorted);
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

  function handleSearch(event: any, newValue: string): void {
    const searchedProjects = projects.reduce(
      (acc: ProjectItem[], curVal: ProjectItem): ProjectItem[] => {
        if (curVal.projectName === newValue) {
          acc.push(curVal);
        }
        return acc;
      },
      []
    );
    setSearchResult(searchedProjects);
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
    setFilteredProjects(filteredProjects);
  };

  // render App
  return (
    <div className="App">
      <div className="buttons-menu">
        <Button
          className={classes.root}
          variant="contained"
          onClick={() => handleClick("earliest")}
          data-testid="earliest-button"
        >
          Earliest
        </Button>

        <Autocomplete
          id="project-search"
          freeSolo
          options={projects.map((option) => option.projectName)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search Project"
              sx={{ width: 180, mt: 1 }}
              size="small"
            />
          )}
          onChange={(event, newValue) => handleSearch(event, newValue)}
        />

        <Button
          className={classes.root}
          variant="contained"
          onClick={() => handleClick("latest")}
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
        {/* search len: {searchResult.length}
        <br />
        projects len: {projects.length} */}
        {/* display projects */}
        {!searchResult.length &&
          projects.map((project) => {
            return (
              <ProjectCard
                key={`${project.id}-${project.projectName}`}
                date={project.creationDate}
                name={project.projectName}
                status={project.status}
              />
            );
          })}
        {/* display search results */}
        {!!searchResult.length &&
          searchResult.map((project) => {
            return (
              <ProjectCard
                key={`${project.id}-${project.projectName}`}
                date={project.creationDate}
                name={project.projectName}
                status={project.status}
              />
            );
          })}
      </div>
    </div>
  );
}

export default App;
