let selectedNumber1 = null;
let selectedNumber2 = null;
let selectedOperation = null;
let score = 0;
let currentSet = null; // Variable to store the current set of numbers
let allSets = []; // Variable to store all possible sets of numbers
let timerInterval = null; // Variable to store the timer interval
let timeLeft = 60; // Initial time for the game in seconds
let remainingButtons = 0; // Counter for remaining buttons

const numbersContainer = document.getElementById('numbers-container');
const resetButton = document.getElementById('reset');
const scoreDisplay = document.getElementById('score');
const startGameButton = document.getElementById('start-game-button');
const startPage = document.getElementById('start-page');
const gamePage = document.getElementById('game');
const timerDisplay = document.getElementById('time');
const usernameInput = document.getElementById('username');
const viewLeaderboardButton = document.getElementById('view-leaderboard-button');
const leaderboardContainer = document.getElementById('leaderboard');
const leaderboardList = document.getElementById('leaderboard-list');

// Function to get a random set from the loaded sets
function getRandomSet(sets) {
    const randomIndex = Math.floor(Math.random() * sets.length);
    return sets[randomIndex];
}

// Function to initialize the game with a given set of numbers
function initializeGame(set) {
    numbersContainer.innerHTML = ''; // Clear existing numbers
    remainingButtons = set.length; // Initialize remaining buttons counter

    set.forEach((number, index) => {
        const numberButton = document.createElement('button');
        numberButton.classList.add('number');
        numberButton.id = `num${index + 1}`;
        numberButton.innerText = number;

        numberButton.addEventListener('click', () => {
            if (!selectedNumber1 && !selectedOperation) {
                selectedNumber1 = numberButton;
                numberButton.disabled = true;
            } else if (selectedNumber1 && selectedOperation && !selectedNumber2) {
                selectedNumber2 = numberButton;
                numberButton.disabled = true;
                performOperation();
            }
        });

        numbersContainer.appendChild(numberButton);
    });

    // Reset and enable all operation buttons
    document.querySelectorAll('.operation').forEach(button => {
        button.disabled = false;
        button.addEventListener('click', () => {
            if (selectedNumber1 && !selectedOperation) {
                selectedOperation = button.id;
                button.disabled = true;
            }
        });
    });

    resetSelections();
}

// Function to perform the operation
function performOperation() {
    let result;
    const num1 = parseFloat(selectedNumber1.innerText);
    const num2 = parseFloat(selectedNumber2.innerText);

    switch (selectedOperation) {
        case 'add':
            result = num1 + num2;
            break;
        case 'subtract':
            result = num1 - num2;
            break;
        case 'multiply':
            result = num1 * num2;
            break;
        case 'divide':
            result = num1 / num2;
            break;
    }

    // Remove the used number buttons
    selectedNumber1.remove();
    selectedNumber2.remove();
    remainingButtons--; // Decrement the remaining buttons counter

    // Create a new button for the result
    const resultButton = document.createElement('button');
    resultButton.classList.add('number');
    resultButton.innerText = result;

    // Add event listener to the new result button
    resultButton.addEventListener('click', () => {
        if (!selectedNumber1 && !selectedOperation) {
            selectedNumber1 = resultButton;
            resultButton.disabled = true;
        } else if (selectedNumber1 && selectedOperation && !selectedNumber2) {
            selectedNumber2 = resultButton;
            resultButton.disabled = true;
            performOperation();
        }
    });

    // Append the result button to the numbers container
    numbersContainer.appendChild(resultButton);

    // Check if the game is solved: result is 24 and only one number left
    if (result === 24 && remainingButtons === 1) {
        alert("Congratulations! You've solved the puzzle!");
        score += 1;
        updateScore();
        currentSet = getRandomSet(allSets); // Select a new random set
        initializeGame(currentSet); // Initialize the game with the new set
    } else {
        // Reset selections if the game is not solved
        resetSelections();
    }
}

// Function to reset selections
function resetSelections() {
    selectedNumber1 = null;
    selectedNumber2 = null;
    selectedOperation = null;

    // Enable all number buttons except the newly created result button
    document.querySelectorAll('.number').forEach(button => {
        button.disabled = false;
    });

    // Enable all operation buttons
    document.querySelectorAll('.operation').forEach(button => {
        button.disabled = false;
    });
}

// Function to update the score display
function updateScore() {
    scoreDisplay.innerText = score;
}

// Function to start the timer
function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft -= 1;
        timerDisplay.innerText = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endGame();
        }
    }, 1000);
}

// Function to end the game and display the score
function endGame() {
    alert(`Time's up! Your final score is ${score}.`);
    submitScore(usernameInput.value, score);
    startPage.style.display = 'block';
    gamePage.style.display = 'none';
    resetGame();
}

// Function to reset the game state
function resetGame() {
    score = 0;
    updateScore();
    timeLeft = 60;
    timerDisplay.innerText = timeLeft;
    if (currentSet) {
        initializeGame(currentSet);
    }
}

// Function to submit the score to the server
function submitScore(username, score) {
    fetch('http://localhost:3000/submit-score', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, score })
    }).then(response => response.json())
      .then(data => console.log('Score submitted:', data))
      .catch(error => console.error('Error submitting score:', error));
}

// Function to fetch and display the leaderboard
function fetchLeaderboard() {
    fetch('http://localhost:3000/leaderboard')
        .then(response => response.json())
        .then(data => {
            leaderboardList.innerHTML = '';
            data.forEach(entry => {
                const listItem = document.createElement('li');
                listItem.innerText = `${entry.username}: ${entry.score} (${new Date(entry.timestamp).toLocaleString()})`;
                leaderboardList.appendChild(listItem);
            });
        })
        .catch(error => console.error('Error fetching leaderboard:', error));
}

// Event listener for the reset button
resetButton.addEventListener('click', () => {
    if (currentSet) {
        initializeGame(currentSet);
    }
});

// Event listener for the start game button
startGameButton.addEventListener('click', () => {
    startPage.style.display = 'none';
    gamePage.style.display = 'block';
    fetch('numberSets.json')
        .then(response => response.json())
        .then(sets => {
            allSets = sets; // Store all sets
            currentSet = getRandomSet(allSets); // Select a random set and store it in currentSet
            initializeGame(currentSet); // Initialize the game with the selected set
            startTimer(); // Start the timer
        });
});

// Event listener for the view leaderboard button
viewLeaderboardButton.addEventListener('click', () => {
    leaderboardContainer.style.display = 'block';
    fetchLeaderboard();
});

// Initially show the start page
startPage.style.display = 'block';
gamePage.style.display = 'none';
