import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import React, { useEffect, useState, useCallback } from "react";
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
});

const ProjectCard: React.FC<CardProps> = ({ date, name, status }) => {
  const classes = useCardStyles();
  const toDate = new Date(date);

  return (
    <Card className={classes.root} variant="outlined">
      <div>
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
  // const [sortedField, setSortedField] = useState<string>("");
  // let sortedProjects = [...projects];

  const classes = useStyles();

  // Fetch Projects
  const fetchProjects = useCallback(async () => {
    const res = await fetch("http://localhost:3004/projects");
    let data = await res.json();
    data = sanitizeProjectsData(data);
    return data;
  }, []);

  function sanitizeProjectsData(projectsData: any) {
    const prjDataArr: any[] = [];

    for (let project of projectsData.data) {
      if (new Date(project.creationDate).toDateString() === "Invalid Date") {
        // adding hardcoded date to recognize invalid dates
        project.creationDate = new Date("2000-01-01T00:00:00.000Z").toISOString();
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
      const projectsFromServer = await fetchProjects();
      setProjects(projectsFromServer);
    };
    getProjects();
  }, [fetchProjects]);

  function handleChange(sortedType: "earliest" | "latest") {
    const sorted = [...projects].sort((a, b) => {
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
    // console.log("sorted: ",sorted);
    
    setProjects(sorted);
  }

  // render App
  return (
    <div className="App">
      <div className="buttons-menu">
        <Button
          className={classes.root}
          variant="contained"
          onClick={() => handleChange("earliest")}
          data-testid="earliest-button"
        >
          Earliest
        </Button>
        <Button
          className={classes.root}
          variant="contained"
          onClick={() => handleChange("latest")}
          data-testid="latest-button"
        >
          Latest
        </Button>
      </div>
      <div className="projects-content">
        {projects.map((project) => {
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
