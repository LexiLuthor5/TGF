// Disney Trivia App JavaScript with Disney API and Trivia API integration

$(document).ready(function () {
    const DISNEY_API_URL = 'https://api.disneyapi.dev/characters?page=1&pageSize=50';
    const TRIVIA_API_URL = 'https://opentdb.com/api.php?amount=10&category=11&type=multiple';

    let timeRemaining = 90;
    let intervalId;
    let quizQuestions = [];

    // Fetch Disney character to feature
    fetch(DISNEY_API_URL)
      .then(res => res.json())
      .then(data => {
        const character = data.data[Math.floor(Math.random() * data.data.length)];
        $('#start-text').append(`<p><strong>Featured Character:</strong> ${character.name}</p>`);
      });

    // Start button event
    $('#startButton').on('click', function () {
      startTimer();
      fetchQuestions();
    });

    function startTimer() {
      timeRemaining = 90;
      intervalId = setInterval(count, 1000);
      $('#startButton').hide();
      $('#start-text').hide();
    }

    function count() {
      timeRemaining--;
      $('#display').text(`DISNEY MAGIC REMAINING: ${timeConverter(timeRemaining)}`);
      if (timeRemaining === 0) {
        stopTimer();
        $('#display').empty();
      }
    }

    function stopTimer() {
      clearInterval(intervalId);
      checkAnswer();
    }

    function timeConverter(t) {
      const minutes = Math.floor(t / 60);
      const seconds = t % 60;
      return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    function fetchQuestions() {
      $.getJSON(TRIVIA_API_URL, function (data) {
        quizQuestions = data.results.map((item, index) => {
          const allAnswers = [...item.incorrect_answers, item.correct_answer];
          return {
            question: decodeHTML(item.question),
            answers: shuffleArray(allAnswers.map(decodeHTML)),
            correctAnswer: decodeHTML(item.correct_answer)
          };
        });

        // Optionally add a custom Disney question
        quizQuestions.push({
          question: "What is Simba's mother's name?",
          answers: ["Sarabi", "Nala", "Nairobi", "Sarafina"],
          correctAnswer: "Sarabi"
        });

        displayQuestion();
      });
    }

    function displayQuestion() {
      const questionContainer = $('#questions');
      questionContainer.empty();
      questionContainer.append('<h2>Answer the following questions:</h2>');

      for (let i = 0; i < quizQuestions.length; i++) {
        questionContainer.append(`<p><b>${quizQuestions[i].question}</b></p>`);
        quizQuestions[i].answers.forEach((answer, j) => {
          const inputId = `radio-${i}-${j}`;
          questionContainer.append(`
            <div class="form-check">
              <input class="form-check-input" type="radio" name="radio-group${i}" id="${inputId}" value="${answer}">
              <label class="form-check-label" for="${inputId}">${answer}</label>
            </div>`);
        });
      }

      questionContainer.append('<button class="btn btn-light mt-3 doneButton">DONE</button>');

      $('.doneButton').on('click', stopTimer);
    }

    function checkAnswer() {
      let numCorrect = 0;
      let numIncorrect = 0;

      for (let i = 0; i < quizQuestions.length; i++) {
        const selected = $(`input[name='radio-group${i}']:checked`).val();
        if (selected === quizQuestions[i].correctAnswer) {
          numCorrect++;
        } else {
          numIncorrect++;
        }
      }

      showResults(numCorrect, numIncorrect);
    }

    function showResults(correct, incorrect) {
      $('#results-page').removeClass('d-none');
      $('#title').text("How did you Bibbidi-Bobbidi-do?");
      $('#questions').empty().hide();
      $('#display').empty().hide();
      $('#correctAnswers').text("Genie Wishes Received: " + correct);
      $('#incorrectAnswers').text("Dishonor to your family: " + incorrect);

      const resetBtn = $('<button class="btn btn-light resetButton mt-3">START OVER</button>');
      $('#results-page').append(resetBtn);

      $('.resetButton').on('click', function () {
        $('#questions').show();
        $('#display').show();
        $('#results-page').addClass('d-none').empty();
        fetchQuestions();
        startTimer();
      });
    }

    function shuffleArray(array) {
      return array.sort(() => 0.5 - Math.random());
    }

    function decodeHTML(html) {
      const txt = document.createElement('textarea');
      txt.innerHTML = html;
      return txt.value;
    }
  });