import Conf from 'conf';
import chalk from 'chalk';
import inquirer from 'inquirer';

const config = new Conf({
    projectName: "tdmanage"
});
function prepend_zeroes(num) {
    let string = "";
    if (num < 10) {
        string += "0";
    }
    string += num;
    return string
}

function next_date(current_date, repeating_list) {
    let dayMilliseconds = 8.64e7;
    const daysList = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let dateRightNow = new Date(Date.now())
    let nextDate = new Date(current_date)
    nextDate.setDate(nextDate.getDate() + (dateRightNow.getDate() - nextDate.getDate()))
    
    let timeslist = []
    let nextDifference = -1;

    for (let i of repeating_list[1]) {
        let diff = daysList.indexOf(i) - dateRightNow.getDay()
        timeslist.push(diff)
    }

    for (let i of timeslist) {
        if (i >= 0 && nextDifference < 0) {
            nextDifference = i
        }
    }

    if (nextDifference < 0) {
        nextDifference = timeslist[0] + repeating_list[0] * 7
    }

    nextDate.setDate(nextDate.getDate() + nextDifference)

    return nextDate.getTime()
}

function update_repeats() {

    let eventsList = config.get('events-list')
    if (!eventsList) {
        return 0;
    }
    for (let i of eventsList) {
        if (i.isRepeating) {
            while (i.date < Date.now()) {
                i.date = next_date(i.date, i.repeat)
            }
        }
    }
    config.set('events-list', eventsList)
    return 0;
}

export function listEvents() {
    update_repeats();
    let eventsList = config.get('events-list');
    const monthsList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Oct', 'Nov', 'Dec'];
    const daysList = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    if (!eventsList) {
        console.log(
            chalk.red.bold(
                "Nothing in your events list."
            )
        )
        return 0;
    }

    eventsList = eventsList.filter(event => (event.isRepeating || event.date >= Date.now()))

    const dateNow = new Date(Date.now());
    const dateWeek = new Date(Date.now());
    dateWeek.setDate(dateWeek.getDate() + 7);
    console.log(
        chalk.blue.bold(`Today is ${daysList[dateNow.getDay()]}, ${monthsList[dateNow.getMonth()]} ${dateNow.getDate()}, ${dateNow.getFullYear()}.`)
    )
    let inWeekEvents = eventsList.filter(event => {
        return (event.date <= dateWeek.getTime() && event.date >= dateNow.getTime()) || event.isRepeating;
    })

    if (inWeekEvents && inWeekEvents.length) {
        
        console.log(
            chalk.blue(`You have ${inWeekEvents.length} events between now and next week.`)
        )
        for (let event of inWeekEvents) {
            let date = new Date(event.date)
            let str = "";
            if (event.isRepeating) {
                str += `: repeats every ${event.repeat[0]} weeks`
            }
            console.log(
                chalk.magenta.bold(`→ ${event.name}`) + chalk.magenta(`${str}`)
            )
            console.log(
                chalk.magenta(`\tDescription: ${event.description}`)
            )
            console.log(
                chalk.magenta(`\ton ${daysList[date.getDay()]}, ${monthsList[date.getMonth()]} ${date.getDate()}\n`) +
                chalk.magenta(`\tat ${prepend_zeroes(date.getHours())}:${prepend_zeroes(date.getMinutes())}`)
            )
        }
    } else {
        console.log(
            chalk.red.bold("No events logged yet")
        )
    }
    config.set('events-list', eventsList)
    return 0;
}

export function addEvent() {
    let eventsList = config.get('events-list');
    if (!eventsList) {
        eventsList = [];
    }
    console.log("Your event name should be short and unique so you can reference it later.")
    let tempObj = {
        name: "",
        description: "", 
        date: 0,
        isRepeating: false,
        repeat: [0, []]
    }

    inquirer
        .prompt([
            {
                name: "eventText",
                message: "Name of event:",
                type: "input"
            }, 
            {
                name: "describeEvent", 
                message: "Describe your event:",
                type: "input"
            },
            {
                name: "date",
                message: "Input date of the event (dd [month] yyyy hh:mm):",
                type: "input"
            }, 
            {
                name: "isRepeating",
                message: "Will this event repeat?",
                type: "list",
                choices: ['Yes', 'No']
            }
        ])
        .then(answer => {
            tempObj.name = answer.eventText;
            tempObj.description = answer.describeEvent;
            tempObj.date = Date.parse(answer.date);

            let willRepeat = (answer.isRepeating == 'Yes');
            tempObj.isRepeating = willRepeat;
            // let repeatInfo = [0, []];
            if (willRepeat) {
                inquirer.prompt([
                    {
                        name: "weekIntervals",
                        message: "What is the interval between weeks (e.g. weekly events have an interval of 1)?",
                        type: "input"
                    }, 
                    {
                        name: "dotw",
                        message: "What day(s) of the week does this take place (space-separated)?",
                        type: "checkbox",
                        choices: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                    }
                ]).then(answer => {
                    tempObj.repeat[0] = Number.parseInt(answer.weekIntervals);
                    tempObj.repeat[1] = answer.dotw;
                    eventsList.push(tempObj)
                    config.set('events-list', eventsList)
                })
            } else {
                eventsList.push(tempObj)
                config.set('events-list', eventsList)
            }
        })
}

export function removeEvent(name) {
    let eventsList = config.get('events-list');
    let eventsNames = eventsList.map(event => event.name);
    let index;
    if (!eventsList) {
        console.log(
            chalk.red.bold("No events to delete")
        )
    } else {
        index = eventsNames.indexOf(name);
        eventsList.splice(index, 1);
    }
    config.set('events-list', eventsList);
    if (index == -1) {
        console.log(
            chalk.red.bold("No event with that name")
        )
    } else {
        console.log(
            chalk.green.bold("Event deleted")
        )
    }
}

// update_repeats()