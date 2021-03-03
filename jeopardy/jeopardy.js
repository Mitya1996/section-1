// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];
const NUM_CATEGORIES = 6;
const NUM_QUESTIONS_PER_CAT = 5;

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
    let res = await axios.get('https://jservice.io/api/categories?count=100');
    let categoriesList = res.data;
    let randomSample = _.sampleSize(categoriesList, NUM_CATEGORIES);
    return randomSample.map(category => category.id);
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
    let res = await axios.get(`https://jservice.io/api/category?id=${catId}`);
    let categoryData = res.data;

    return {
        title: categoryData.title,
        clues: categoryData.clues
    };
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
    for(category of categories){
        $('#headerRow').append(`<td class="cell header-cell">${category.title.toUpperCase()}</td>`);
    }
 
    //append tr from top to bottom
        //append td from left to right 
    for(let rowIdx=0; rowIdx<NUM_QUESTIONS_PER_CAT; rowIdx++){
        $('#gameBody').append(`<tr data-row="${rowIdx}"></tr>`);

        for(let colIdx=0; colIdx<categories.length; colIdx++){            
            $(`#gameBody tr[data-row='${rowIdx}']`).append(`<td class="cell" data-col="${colIdx}" data-showing="hidden">?</td>`);
        }
    }
 
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */
 
function handleClick(evt) {
    let clickedCell = evt.target;
    let questionDifficulty = clickedCell.parentNode.dataset.row;
    // if currently null, show question & set .showing to "question" data attr? 
    if(clickedCell.dataset.showing==="hidden") {
        clickedCell.dataset.showing = "question";
        let catCol = clickedCell.dataset.col;
        clickedCell.innerHTML = categories[catCol].clues[questionDifficulty].question;
    }
    // if currently "question", show answer & set .showing to "answer"
    else if(clickedCell.dataset.showing==="question") {
        clickedCell.dataset.showing = "answer";  
        let catCol = clickedCell.dataset.col;
        clickedCell.innerHTML = categories[catCol].clues[questionDifficulty].answer;
    }
    // if currently "answer", ignore click
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
    let bootstrapSpinner = `<div id="spinner" class="spinner-border text-info" role="status">
    <span class="visually-hidden">Loading...</span></div>`;
    let spinnerEl = document.createElement("div");
    spinnerEl.innerHTML = bootstrapSpinner;
    document.querySelector('body').append(spinnerEl);
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
    let spinnerEl = document.getElementById('spinner')
    if(spinnerEl) spinnerEl.remove();
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    let categoryIds = await getCategoryIds();

    for(catIdx=0; catIdx<categoryIds.length; catIdx++){
        let curCategoryInfo = await getCategory(categoryIds[catIdx])
        categories.push(curCategoryInfo);
    }

    fillTable();
}

/** On click of start / restart button, set up game. */

// TODO
$('#gameBtn').on('click', async function(){
    $('#gameBtn').prop("disabled", true); //prevents from spamming the categories array
    $('#headerRow').empty();
    $('#gameBody').empty();
    categories = [];
    showLoadingView();
    await setupAndStart();
    hideLoadingView();
    $('#gameBtn').prop("disabled", false);
})

/** On page load, add event handler for clicking clues */

// TODO
$('#gameBody').on('click', 'td', handleClick);