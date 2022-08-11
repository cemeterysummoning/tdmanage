#! /usr/bin/env node

import { Command } from 'commander';
const program = new Command();

import Conf from 'conf'
const config = new Conf({
    projectName: 'tdmanage'
})

import { list, add, remove, removeAll, markDone } from './commands/todo.js';
import { listEvents, addEvent, removeEvent } from './commands/events.js';
import { print_week } from './commands/calendar.js'

let td = config.get('todo-list')
let e = config.get('events-list')
if (!td) {
    td = []
    td.push({
        text: 'Epoch',
        description: 'UNIX time 0',
        date: 0,
        done: false
    })
    config.set('todo-list', td)
}
if (!e) {
    e = []
    e.push({
        name: 'Epoch',
        description: 'UNIX time 0',
        date: 0,
        isRepeating: false,
        repeat: [0, []]
    })
}

program
    .command('todos')
    .description('Manages todo list. Will list contents of todo by default')
    .option('-a, --add', 'Add task to the todo list')
    .option('-m, --mark', 'Mark tasks as done')
    .option('-d, --delete <task>', 'Deletes task with specified name, "all" to delete all')
    .action((options, command) => {
        if (options.done && options.add && options.delete && options.edit) {
            console.log(
                chalk.red.bold("Cannot use -a, -m and -d flags at once")
            );
        } else if (options.add) {
            add(); 
        } else if (options.delete) {
            if (options.delete == "all"){
                removeAll();
            } else {
                remove(options.delete);
            }
        } else if (options.mark) {
            markDone();
        } else if (options.edit) {
            edit();
        } else {
            list();
        }
    })

program
    .command('events')
    .description('Manages events. Lists events in the next week by default')
    .option('-a, --add', 'Add an event to the list')
    .option('-d, --delete <task>', 'Delete an event')
    .action((options, command) => {
        if (options.add) {
            addEvent();
        } else if (options.delete) {
            removeEvent(options.delete);
        } else {
            listEvents();
        }
    })

program
    .command('calendar')
    .description('Displays a calendar of events and todos based on a specified frame of time')
    .action((options, command) => {
        let terminal_width = process.stdout.columns
        print_week(Math.floor(terminal_width / 7.5), terminal_width)
    })

program.parse();
