Shield: [![CC BY-NC-SA 4.0][cc-by-nc-sa-shield]][cc-by-nc-sa]

This work is licensed under a
[Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License][cc-by-nc-sa].

[![CC BY-NC-SA 4.0][cc-by-nc-sa-image]][cc-by-nc-sa]

[cc-by-nc-sa]: http://creativecommons.org/licenses/by-nc-sa/4.0/
[cc-by-nc-sa-image]: https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png
[cc-by-nc-sa-shield]: https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg

# The Collins Institute Core Platform

An LMS-like web application, which includes a skill tree progression system, used by the Collins Institute online learning system. To learn more about the problem [the Collins Institute](https://collinsinstitute.org/) is trying to solve, please visit their website.

## Contribution Guidelines

[Read here](https://github.com/RussiSunni/SkillTreeAppV3/blob/main/CONTRIBUTING.md)

## Tech Stack

### Front End

-   Vue 3
-   Pinia
-   Vue Router
-   Vite
-   D3

### Back End

-   Node
-   Express
-   MariaDB

## Project Setup

### Install dependancies

npm install

### Setup database

Run the database-setup.sql script to create the database schema

### Setup .env file

Create an .env file based on the .env.example file

## Run or Compile

### Hot-Reload for Development

npm run dev

### Build

npm run build

### Run compiled version

npm run start
