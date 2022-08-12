# Manage: a CLI tool to manage your tasks and events

Manage is a Nodejs CLI tool that manages your tasks and events.

## Installation
If you have npm on your machine, run `npm i tdmanage`. This app uses `chalk`, `conf`, and `commander`. Works with nodejs version 16, but not with anything lower. To install dependencies, run `npm i chalk conf commander`.

## Usage
To start, run `manage help` to see the possible commands.

`manage` will keep track of your todos and the events you have, and display a calendar when prompted. 

https://user-images.githubusercontent.com/80844905/184218259-bb7674d6-3e1c-4349-882f-b17781b1693c.mp4

`manage todos` keeps track of your tasks, with due date support included. `manage events` works in a similar way, but it keeps track of specific events and weekly occurrences. 
