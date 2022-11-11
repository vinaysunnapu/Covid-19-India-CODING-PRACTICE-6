const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

let db = null;
const dbPath = path.join(__dirname, "covid19India.db");
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server Running at http://localhost:3001/");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
  };
};

//API 1
app.get("/states/", async (request, response) => {
  const getStatesQuery = `
        SELECT * FROM state GROUP BY state_id;
    `;
  const getStates = await db.all(getStatesQuery);
  response.send(getStates.map((each) => convertDbObjectToResponseObject(each)));
});

//API 2
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const stateQuery = `
        SELECT * FROM state WHERE state_id = ${stateId};
    `;
  const state = await db.get(stateQuery);
  response.send(convertDbObjectToResponseObject(state));
});

//API3
app.post("/districts/", async (request, response) => {
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const createNewDistrict = `
    INSERT INTO
        district (district_name,state_id,cases,cured,active,deaths)
    VALUES 
        (
            '${districtName}',
            ${stateId},
            ${cases},
            ${cured},
            ${active},
            ${deaths}
        );
  `;
  const inserDistrict = await db.run(createNewDistrict);
  response.send("District Successfully Added");
});

const convertDbObjectToResponseObject1 = (dbObject) => {
  return {
    districtId: dbObject.district_id,
    districtName: dbObject.district_name,
    stateName: dbObject.state_name,
    stateId: dbObject.state_id,
    cases: dbObject.cases,
    cured: dbObject.cured,
    active: dbObject.active,
    deaths: dbObject.deaths,
  };
};

//API 4

app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrict = `
        SELECT * FROM district WHERE district_id = ${districtId}
    `;
  const district = await db.get(getDistrict);
  response.send(convertDbObjectToResponseObject1(district));
});

//API 5
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteQuery = `
        SELECT * FROM district WHERE district_id = ${districtId};
    `;
  const deleteDistrict = await db.run(deleteQuery);
  response.send("District Removed");
});

//API 6

app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const updateDistrict = `
        UPDATE 
            district
        SET 
            district_name = '${districtName}',
            state_id = ${stateId},
            cases = ${cases},
            cured = ${cured},
            active=${active},
            deaths = ${deaths}

  `;
  const updateDistricts = await db.run(updateDistrict);
  response.send("District Details Updated");
});

//API 7
const convertDbObjectToResponseObject2 = (dbObject) => {
  return {
    totalCases: dbObject.cases,
    totalCured: dbObject.cured,
    totalActive: dbObject.active,
    totalDeaths: dbObject.deaths,
  };
};

app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const totalCasesQuery = `
        SELECT 
            *
        FROM  
            district 
        where 
            state_id = ${stateId}
        GROUP BY state_id;
         
    `;
  const totalCases = await db.get(totalCasesQuery);
  response.send(convertDbObjectToResponseObject2(totalCases));
});

// API 8

app.get("/districts/:districtId/details/", (request, response) => {
  const { districtId } = request.params;
  const query = `

    `;
});

module.exports = app;
