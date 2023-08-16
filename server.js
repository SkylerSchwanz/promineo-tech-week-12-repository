import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import Joi from 'joi';
import express from 'express';
import cors from 'cors';
const app = express();

const groceries = [];

// This is middleware that helps us process the body of HTTP requests
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Serve static files (including index.html) from the root directory
app.use(express.static(__dirname));

app.get('/api/groceries', (req, res) => {
  res.send(groceries);
});

// :whatever after the url is the name of the PARAMETER
app.get('/api/groceries/:id', (req, res) => {
  const grocery = groceries.find((c) => c.id === parseInt(req.params.id));
  if (!grocery) return res.status(404).send('The grocery with the given ID was not found');
  res.send(grocery);
});

app.post('/api/groceries', (req, res) => {
  const { error } = validateGrocery(req.body); // result.error
  if (error) return res.status(400).send(error.details[0].message);

  const grocery = {
    id: groceries.length + 1,
    type: req.body.type,
    name: req.body.name,
    price: req.body.price,
  };

  groceries.push(grocery);
  res.send(grocery);
});

app.put('/api/groceries/:id', (req, res) => {
  const grocery = groceries.find((c) => c.id === parseInt(req.params.id));
  if (!grocery) return res.status(404).send('The grocery with the given ID was not found');

  //object destructoring
  const { error } = validateGrocery(req.body); // result.error
  if (error) return res.status(400).send(error.details[0].message);

  // Update grocery
  grocery.name = req.body.name;
  grocery.type = req.body.type;
  grocery.price = req.body.price;
  //Return the updated grocery
  res.send(grocery);
});

function validateGrocery(grocery) {
  const schema = {
    name: Joi.string().min(1).required(),
    type: Joi.string().valid('Fruit', 'Vegetable', 'Carbohydrate', 'Meat', 'Fish').required(),
    price: Joi.number().min(0).required(),
  };

  return Joi.validate(grocery, schema);
}

app.delete('/api/groceries/:id', (req, res) => {
  const grocery = groceries.find((c) => c.id === parseInt(req.params.id));
  if (!grocery) return res.status(404).send('The grocery with the given ID was not found');

  const index = groceries.indexOf(grocery);
  groceries.splice(index, 1);

  res.send(grocery);
});

// PORT
// Node has a variable called port, dynamically given to the hosting environment and is an environment variable that runs outside the application, and is used because sometimes port 3000 isn't always available
// The purpose of this line is to read the value of THIS port environment variable by using the global process variable
//The proper way to set a port in the enviornment:
//export PORT=number;
const port = process.env.PORT || 3000;

// 3000 = port number | OPTIONAL | second argument is a passed function that fires when the port begins listening
app.listen(port, () => {
  console.log(`Server is up and running on port ${port}`);
});
