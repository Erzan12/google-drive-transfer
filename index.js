require("dotenv").config();
const express = require("express");
const { google } = require("googleapis");
const open = require("open");

const app = express();
const PORT = 3000;