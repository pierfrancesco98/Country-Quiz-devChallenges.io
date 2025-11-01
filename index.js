const questionElem = document.querySelector('.question');
const showOptions = document.querySelector('.options');
const scoreElem = document.getElementById('score');
const progressSpans = document.querySelectorAll('.numbers .progress');

let countriesData = [];
let questions = [];
let currentQuestionIndex = 0;
const maxQuestions = 10;

scoreElem.innerText = 0;

fetch('https://restcountries.com/v3.1/all?fields=name,capital,region')
  .then(res => res.json())
  .then(countries => {
    countriesData = countries.filter(c => c.capital && c.capital.length > 0);
    const usedCountries = new Set();
    while (questions.length < maxQuestions) {
      const randomCountry = countriesData[Math.floor(Math.random() * countriesData.length)];
      if (usedCountries.has(randomCountry.name.common)) continue;
      usedCountries.add(randomCountry.name.common);
      const options = [randomCountry.capital[0]];
      while (options.length < 4) {
        const randomOption = countriesData[Math.floor(Math.random() * countriesData.length)].capital[0];
        if (!options.includes(randomOption)) options.push(randomOption);
      };
      questions.push({
        country: randomCountry.name.common,
        correct: randomCountry.capital[0],
        options: options.sort(() => Math.random() - 0.5),
        answered: false,
        selected: null
      });
    };
    showQuestion(currentQuestionIndex);
  })
  .catch(err => console.error(err));

function showQuestion(index) {
  const q = questions[index];
  questionElem.innerText = `What is the capital of ${q.country}?`;
  showOptions.innerHTML = '';
  progressSpans.forEach((span, i) => {
    if (questions[i].answered || i === index) {
      span.classList.add('active');
    } else {
      span.classList.remove('active');
    };
  });
  q.options.forEach(option => {
    const button = document.createElement('button');
    button.classList.add('option');
    button.id = option;
    button.innerText = option;
    showOptions.appendChild(button);
    if (q.answered) {
      button.disabled = true;
      if (option === q.selected) {
        button.classList.add('active');
      };
      if (option === q.correct) {
        addIcon(button, '../resources/Check_round_fill.svg');
      };
      if (option === q.selected && option !== q.correct) {
        addIcon(button, '../resources/Close_round_fill.svg');
      };
    };
    button.addEventListener('click', () => {
      if (q.answered) return;
      q.answered = true;
      q.selected = option;
      const allButtons = document.querySelectorAll('.option');
      allButtons.forEach(btn => btn.disabled = true);
      button.classList.add('active');
      addIcon(document.getElementById(q.correct), '../resources/Check_round_fill.svg');
      if (option !== q.correct) {
        addIcon(button, '../resources/Close_round_fill.svg');
      };
      if (option === q.correct) {
        scoreElem.innerText = Number(scoreElem.innerText) + 1;
      };
      progressSpans[index].classList.add('active');
      if (checkQuizFinished()) {
        showResult();
      };
    });
  });
};

function addIcon(button, src) {
  if (!button.querySelector('img')) {
    const img = document.createElement('img');
    img.src = src;
    img.alt = src.includes('Check') ? 'Correct' : 'Wrong';
    button.appendChild(img);
  };
};

progressSpans.forEach((span, i) => {
  span.addEventListener('click', () => {
    currentQuestionIndex = i;
    showQuestion(currentQuestionIndex);
  });
});

function checkQuizFinished() {
  return questions.every(q => q.answered);
};

function showResult() {
  const resultDiv = document.querySelector('.result');
  const finalScore = document.querySelector('.final-score');
  finalScore.innerText = scoreElem.innerText;
  resultDiv.style.display = 'block';
  document.querySelector('.container').classList.add('finished');
};

function playAgain() {
  const resultDiv = document.querySelector('.result');
  resultDiv.style.display = 'none';
  scoreElem.innerText = 0;
  questions.forEach(q => {
    q.answered = false;
    q.selected = null;
  });
  progressSpans.forEach(span => {
    span.classList.remove('active');
  });
  currentQuestionIndex = 0;
  showQuestion(currentQuestionIndex);
  document.querySelector('.container').classList.remove('finished');
};

const restartBtn = document.querySelector('.result .restart');
restartBtn.addEventListener('click', playAgain);

