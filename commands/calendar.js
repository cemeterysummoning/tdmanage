import Conf from 'conf';
import chalk from 'chalk';

const config = new Conf({
    projectName: "tdmanage"
});

const boxChars = {
    line_h: "─",
    line_v: "│",
    corner_UL: "┌",
    corner_UR: "┐",
    corner_LL: "└", 
    corner_LR: "┘",
    intersection_R: "├",
    intersection_L: "┤",
    intersection_D: "┬",
    intersection_U: "┴",
    intersection_all: "┼",
    corner_UL_round: "╭",
    corner_UR_round: "╮",
    corner_LL_round: "╰",
    corner_LR_round: "╯"
}
function prepend_zeroes(num) {
    let string = "";
    if (num < 10) {
        string += "0";
    }
    string += num;
    return string
}

function print_box(pieces, total_space) {
    let offset = total_space - pieces[0].length
    for (let i of pieces) {
        console.log(
            " ".repeat(Math.floor(offset / 2)) + chalk.blue(i)
        )
    }
}

function get_empty() {
    const daysList = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    let currentDay = new Date(Date.now())
    let tableList = []
    let ind = currentDay.getDay();

    for (let i = 0; i < 7; i++) {
        let temp = [daysList[ind]]
        temp.push([" "])
        temp.push([" "])
        ind += 1;
        ind %= 7;

        tableList.push(temp)
    }
    return [tableList, 1, 1]
}

function get_list() {
    let dayMilliseconds = 8.64e7;
    let todoList = config.get('todo-list')
    let eventsList = config.get('events-list')

    let thisWeek = Date.now()
    let currentDay = new Date(Date.now())
    let nextWeek = thisWeek + 7 * dayMilliseconds

    let events = eventsList.filter(item => (item.date >= thisWeek && item.date <= nextWeek))
    let todos = todoList.filter(item => (item.date >= thisWeek && item.date <= nextWeek && !item.done))

    const daysList = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    let tableList = []
    let ind = currentDay.getDay();
    let longest_events_length = 0;
    let longest_todos_length = 0;

    for (let i = 0; i < 7; i++) {
        let temp = [daysList[ind]]
        temp.push(events.filter(item => {
            let day = new Date(item.date)
            return day.getDay() == ind
        }).map(item => {
            let date = new Date(item.date)
            return `→ ${prepend_zeroes(date.getHours())}:${prepend_zeroes(date.getMinutes())} - ${item.name}`
        }))

        temp.push(todos.filter(item => {
            let day = new Date(item.date)
            return day.getDay() == ind
        }).map(item => {
            let date = new Date(item.date)
            return `✗ ${prepend_zeroes(date.getHours())}:${prepend_zeroes(date.getMinutes())} - ${item.text}`
        }))
        ind += 1;
        ind %= 7;

        tableList.push(temp)
        if (longest_events_length < temp[1].length) {
            longest_events_length = temp[1].length
        }
        if (longest_todos_length < temp[2].length) {
            longest_todos_length = temp[2].length
        }
    }

    for (let i of tableList) {
        while (i[1].length < longest_events_length) {
            i[1].push(" ")
        }
        while (i[2].length < longest_todos_length) {
            i[2].push(" ")
        }
    }
    
    return [tableList, longest_events_length, longest_todos_length]
}
function align_spaces(text, spaces) {
    let difference = spaces - text.length;
    let str;
    if (difference >= 0) {
        str = text + " ".repeat(difference)
    } else {
        str = text.slice(0, spaces - 3) + "..."
    }
    
    return str
}

function center_text(text, spaces) {
    let difference = spaces - text.length;

    let offset = Math.floor(difference / 2);

    let str = " ".repeat(offset) + text + " ".repeat(difference - offset)
    return str;
}

function generate_upper(num_columns, num_spaces) {
    return boxChars.corner_UL + (boxChars.line_h.repeat(num_spaces) + boxChars.intersection_D).repeat(num_columns - 1) + boxChars.line_h.repeat(num_spaces) + boxChars.corner_UR
}
function generate_lower(num_columns, num_spaces) {
    return boxChars.corner_LL + (boxChars.line_h.repeat(num_spaces) + boxChars.intersection_U).repeat(num_columns - 1) + boxChars.line_h.repeat(num_spaces) + boxChars.corner_LR
}
function generate_middle(num_columns, num_spaces) {
    return boxChars.intersection_R + (boxChars.line_h.repeat(num_spaces) + boxChars.intersection_all).repeat(num_columns - 1) + boxChars.line_h.repeat(num_spaces) + boxChars.intersection_L
}

function add_data(dataList, spaceNumber, isLabel = false) {
    let str = ""
    for (let i = 0; i < dataList.length; i++) {
        str += boxChars.line_v
        if (isLabel) {
            str += chalk.blue.bold(align_spaces(dataList[i], spaceNumber))
        } else {
            str += align_spaces(dataList[i], spaceNumber)
        }
    }
    str += boxChars.line_v
    return str
}

export function print_week(spaces, terminal_width) {
    let list_info = [];
    try {
        list_info = get_list()
    } catch {
        
        list_info = get_empty()
    }


    let tabular = list_info[0]
    let longest_events_length = list_info[1]
    let longest_todos_length = list_info[2]

    let dotw = tabular.map(item => item[0])
    let has_events = tabular.map(item => {
        return item[1].length == 0 && item[2].length == 0
    })
    let space_array = new Array(7).fill(" ")

    let rows = []
    rows.push(generate_upper(7, spaces))
    rows.push(add_data(dotw.map(item => center_text(item, spaces)), spaces, true))
    rows.push(generate_middle(7, spaces))
    let events_text_array = new Array(7).fill("Events")

    rows.push(add_data(events_text_array, spaces, true))
    for (let i = 0; i < longest_events_length; i++) {
        let temp_array = tabular.map(item => item[1]).map(item => item[i])
        rows.push(add_data(temp_array, spaces))
    }
    rows.push(add_data(space_array, spaces))

    let todos_text_array = new Array(7).fill("Todos")
    rows.push(add_data(todos_text_array, spaces, true))
    for (let i = 0; i < longest_todos_length; i++) {
        let temp_array = tabular.map(item => item[2]).map(item => item[i])
        rows.push(add_data(temp_array, spaces))
    }
    
    rows.push(add_data(space_array, spaces))
    rows.push(generate_lower(7, spaces))

    print_box(rows, terminal_width)
}
