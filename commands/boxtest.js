import chalk from 'chalk';

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

function print_box(pieces) {
    for (let i of pieces) {
        console.log(
            chalk.red(i)
        )
    }
}

function draw_square(side_length) {
    let pieces = []
    pieces.push(boxChars['corner_UL'] + boxChars['line_h'].repeat(2*side_length - 2) + boxChars['corner_UR']);
    for (let i = 0; i <= side_length - 2; i++) {
        pieces.push(boxChars['line_v'] + " ".repeat(2*side_length - 2) + boxChars['line_v']);
    }
    pieces.push(boxChars['corner_LL'] + boxChars['line_h'].repeat(2*side_length - 2) + boxChars['corner_LR'])
    print_box(pieces)
}

function draw_grid(width, height, dim_x, dim_y) {
    let pieces = []
    pieces.push(boxChars['corner_UL'] + (boxChars['line_h'].repeat(width) + boxChars['intersection_D']).repeat(dim_x - 1) + boxChars['line_h'].repeat(width) + boxChars['corner_UR']);
    for (let i = 0; i < dim_y; i++) {
        for (let j = 0; j < height; j++) {
            pieces.push((boxChars['line_v'] + " ".repeat(width)).repeat(dim_x) + boxChars['line_v'])
        }
        pieces.push(boxChars['intersection_R'] + (boxChars['line_h'].repeat(width) + boxChars['intersection_all']).repeat(dim_x - 1) + boxChars['line_h'].repeat(width) + boxChars['intersection_L'])
    }
    pieces.pop()
    pieces.push(boxChars['corner_LL'] + (boxChars['line_h'].repeat(width) + boxChars['intersection_U']).repeat(dim_x - 1) + boxChars['line_h'].repeat(width) + boxChars['corner_LR'])

    print_box(pieces)
}
draw_grid(10, 5, 5, 5)