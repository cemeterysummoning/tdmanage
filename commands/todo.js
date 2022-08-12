import Conf from 'conf';
import chalk from 'chalk';

const config = new Conf({
    projectName: "tdmanage"
});
import inquirer from 'inquirer';
function prepend_zeroes(num) {
    let string = "";
    if (num < 10) {
        string += "0";
    }
    string += num;
    return string
}

export function list() {
    const todoList = config.get('todo-list');
    const monthsList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Oct', 'Nov', 'Dec'];
    const daysList = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    if (todoList && todoList.length) {
        console.log(
            chalk.magenta('Not done:')
        )
        todoList.filter(item => !item.done).forEach((task, index) => {
            let specDate = new Date(task.date);
            console.log(
                chalk.magentaBright(`✗ ${task.text}`)
            );
            console.log(
                chalk.magentaBright(`\tDescription: ${task.description}`)
            )
            if (task.isDue) {
                console.log(
                    chalk.magentaBright(`\tDue ${daysList[specDate.getDay()]}, ${monthsList[specDate.getMonth()]} ${specDate.getDate()}, ${specDate.getFullYear()} \n`) + 
                    chalk.magentaBright(`\tat  ${prepend_zeroes(specDate.getHours())}:${prepend_zeroes(specDate.getMinutes())}`)
                )
            }
        })
        console.log(
            chalk.blue('Done:')
        )
        todoList.filter(item => item.done).forEach((task, index) => {
            console.log(
                chalk.blueBright(`✓ ${task.text}`)
            );
            console.log(
                chalk.blueBright(`\tDescription: ${task.description}`)
            )
        });
    } else {
        console.log(
            chalk.red.bold("Nothing in your todo list.")
        )
    }
}

export function add() {
    let todoList = config.get('todo-list');
    if (!todoList) {
        todoList = [];
    }
    console.log("Your task name should be short and unique so you can reference it later.")

    inquirer
        .prompt([
            {
                name: "taskText",
                message: "Name of task:",
                type: "input"
            }, 
            {
                name: "describeTask", 
                message: "Describe your task:",
                type: "input"
            },
            {
                name: "isDue",
                message: "Does this task have a due date?",
                type: "list",
                choices: ['Yes', 'No']
            }
        ])
        .then(answer => {
            if (answer.isDue == 'Yes') {
                inquirer.prompt([
                    {
                        name: "date",
                        message: "Input date the task is due (dd [month] yyyy hh:mm):",
                        type: "input"
                    }
                ]).then(answerDate => {
                    todoList.push({
                        text: answer.taskText,
                        description: answer.describeTask, 
                        done: false,
                        isDue: true,
                        date: Date.parse(answerDate.date),
                    })
                })
            } else {
                todoList.push({
                    text: answer.taskText,
                    description: answer.describeTask, 
                    done: false,
                    isDue: false,
                    date: 0,
                })
            }
            
            
        }).then(() => config.set('todo-list', todoList))
    
}

export function remove(name) {
    let todoList = config.get('todo-list');
    let todoNames = todoList.map(todo => todo.text)
    if (!todoList) {
        console.log(
            chalk.red.bold("No tasks to delete")
        )
    } else {
        let index = todoNames.indexOf(name);
        todoList.splice(index, 1);
    }
    config.set('todo-list', todoList);
    console.log(
        chalk.green.bold("Task deleted")
    )
}

export function removeAll() {
    config.set('todo-list', []);
    console.log(
        chalk.green.bold("All tasks deleted")
    )
}

export function markDone() {
    let todoList = config.get('todo-list');
    if (todoList.filter(todo => !todo.done).length == 0) {
        console.log(
            chalk.red.bold("All items are marked done")
        )
    } else {
        inquirer
        .prompt([
            {
                type: 'checkbox',
                name: 'edit',
                messages: 'Toggle tasks to mark done',
                choices: todoList.filter(todo => !todo.done).map(todo => todo.text)
            }
        ])
        .then(answer => {
            if (answer){
                for (let task of answer.edit) {
                    let index = todoList.map(item => item.text).indexOf(task);
                    todoList[index].done = true;
                }
            }
            config.set('todo-list', todoList);
            console.log(
                chalk.green.bold("Tasks marked done")
            )
        });
    }
        
}

