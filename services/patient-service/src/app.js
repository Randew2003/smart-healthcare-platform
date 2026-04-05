const express = require('express');
const cors = require('cors');
require('dotenv').config();

const patientRoutes = require('./routes/patientRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Patient service is running');
});

app.use('/api/patients', patientRoutes);

module.exports = app;