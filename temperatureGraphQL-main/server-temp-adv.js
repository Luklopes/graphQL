var express = require('express');
var { graphqlHTTP } = require('express-graphql');
var { buildSchema } = require('graphql');

var schema = buildSchema(`
  type City {
    id: String
    name: String!
    temperature: String!
    min: String!
    max: String!
  }

  type CityForecasting {   
    city: String!
    nextTemperatures: [Int]    
  }

  input CityTemperatureInput {
    name: String
    temperature: String
    min: String
    max: String
  }

  type Query {
    temperature(id: String): City
    forecasting(id: String): CityForecasting
  }

  type Mutation {
    createCityTemp(input: CityTemperatureInput): City   
  }
`);

class City {
    constructor(id, {name, temperature, min, max}) {
      this.id = id;
      this.name = name;
      this.temperature = temperature;
      this.min = min;
      this.max = max;
    }
  }

// Maps id to User object
const fakeDatabase = {
    'BeloHorizonte': {
        name: 'Belo Horizonte',
        temperature: '18º',
        min: '10º',
        max: '20º'
    },
    'Contagem': {
        name: 'Contagem',
        temperature: '20º',
        min: '14º',
        max: '20º'
    },
};


const root = {
    temperature: ({ id }) => {
        return fakeDatabase[id.replaceAll(' ', '')];
    },
    forecasting: ({ id }) => {
        const city = fakeDatabase[id.replaceAll(' ', '')];
        let randomTemp = [];

        let forecast = {
            city: city.name
        }

        for (let i = 0; i < 7; i++) {
            randomTemp.push(1 + Math.floor(Math.random() * 35));
        }

        forecast['nextTemperatures'] = randomTemp;
        return forecast;
    },
    createCityTemp: ({input}) => {      
        var id = input.name;    
        fakeDatabase[id] = input;
        return new City(id, input);
    },
};

var app = express();
app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
}));
app.listen(4000);
console.log('Running a GraphQL API server at localhost:4000/graphql');