class Question {
  constructor(quiz, container, onQuizEnd) {
    this.quiz = quiz;
    this.container = container;
    this.onQuizEnd = onQuizEnd;

    this.questionData = quiz.getCurrentQuestion();
    this.index = quiz.currentQuestionIndex;

    this.question = this.decodeHtml(this.questionData.question);
    this.correctAnswer = this.decodeHtml(this.questionData.correct_answer);
    this.category = this.decodeHtml(this.questionData.category);
    this.wrongAnswers = this.questionData.incorrect_answers.map((ans) =>
      this.decodeHtml(ans)
    );

    this.answers = this.shuffleAnswers();

    this.answered = false;
    this.timerInterval = null;
    this.timeRemaining = 15;

    this.keyboardHandler = null;

    
    this.correctSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
    this.wrongSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3');
    this.tickSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');

    this.correctSound.volume = 0.6;
    this.wrongSound.volume = 0.6;
    this.tickSound.volume = 0.3;
  }

  decodeHtml(html) {
    const parser = new DOMParser();
    const decoded = parser.parseFromString(html, 'text/html');
    return decoded.documentElement.textContent;
  }

  shuffleAnswers() {
    const allAnswers = [...this.wrongAnswers, this.correctAnswer];

    for (let i = allAnswers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allAnswers[i], allAnswers[j]] = [allAnswers[j], allAnswers[i]];
    }

    return allAnswers;
  }

  getProgress() {
    return Math.round(((this.index + 1) / this.quiz.numberOfQuestions) * 100);
  }

  displayQuestion() {
    const progress = this.getProgress();
    const total = this.quiz.numberOfQuestions;

    const answersHTML = this.answers
      .map(
        (ans, i) => `
      <button class="answer-btn" data-answer="${ans}">
        <span class="answer-key">${i + 1}</span>
        <span class="answer-text">${ans}</span>
      </button>
    `
      )
      .join('');

    const html = `
      <div class="game-card question-card">
        <div class="xp-bar-container">
          <div class="xp-bar-header">
            <span class="xp-label"><i class="fa-solid fa-bolt"></i> Progress</span>
            <span class="xp-value">Question ${this.index + 1}/${total}</span>
          </div>
          <div class="xp-bar">
            <div class="xp-bar-fill" style="width: ${progress}%"></div>
          </div>
        </div>

        <div class="stats-row">
          <div class="stat-badge category">
            <i class="fa-solid fa-bookmark"></i>
            <span>${this.category}</span>
          </div>
          <div class="stat-badge difficulty">
            ${this.quiz.difficulty==='Easy Mode'?`<i class="fa-solid fa-face-smile"></i>
            <span>Easy</span>`:this.quiz.difficulty==='Medium Mode'?`<i class="fa-solid fa-face-meh"></i>
            <span>Medium</span>`:`<i class="fa-solid fa-skull"></i>
            <span>Hard</span>`}
          </div>
          <div class="stat-badge timer">
            <i class="fa-solid fa-stopwatch"></i>
            <span class="timer-value">${this.timeRemaining}</span>s
          </div>
          <div class="stat-badge counter">
            <i class="fa-solid fa-gamepad"></i>
            <span>${this.index + 1}/${total}</span>
          </div>
        </div>

        <h2 class="question-text">${this.question}</h2>

        <div class="answers-grid">
          ${answersHTML}
        </div>

        <p class="keyboard-hint">
          <i class="fa-regular fa-keyboard"></i> Press 1-${this.answers.length} to select
        </p>

        <div class="score-panel">
          <div class="score-item">
            <div class="score-item-label">Score</div>
            <div class="score-item-value">${this.quiz.score}</div>
          </div>
        </div>
      </div>
    `;

    this.container.innerHTML = html;

    this.addEventListeners();
    this.startTimer();
  }

  addEventListeners() {
    const buttons = document.querySelectorAll('.answer-btn');

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => this.checkAnswer(btn));
    });

    this.keyboardHandler = (e) => {
      const validKeys = ['1', '2', '3', '4'];
      if (validKeys.includes(e.key)) {
        const btnIndex = Number(e.key) - 1;
        const targetBtn = buttons[btnIndex];
        if (targetBtn) {
          this.checkAnswer(targetBtn);
        }
      }
    };

    document.addEventListener('keydown', this.keyboardHandler);
  }

  removeEventListeners() {
    if (this.keyboardHandler) {
      document.removeEventListener('keydown', this.keyboardHandler);
      this.keyboardHandler = null;
    }
  }

  startTimer() {
    const timerDisplay = document.querySelector('.timer-value');
    const timerBadge = document.querySelector('.stat-badge.timer');

    this.timerInterval = setInterval(() => {
      this.timeRemaining--;

      if (timerDisplay) {
        timerDisplay.textContent = this.timeRemaining;
      }

      if (this.timeRemaining <= 10 && timerBadge) {
        timerBadge.classList.add('warning');

        this.tickSound.currentTime = 0;
        this.tickSound.play().catch(() => {});
      }

      if (this.timeRemaining <= 0) {
        this.stopTimer();
        this.handleTimeUp();
      }
    }, 1000);
  }

  stopTimer() {
    clearInterval(this.timerInterval);
    this.tickSound.pause();
    this.tickSound.currentTime = 0;
  }

  handleTimeUp() {
    this.answered = true;
    this.removeEventListeners();

    this.highlightCorrectAnswer();

    this.wrongSound.currentTime = 0;
    this.wrongSound.play().catch(() => {});

    const questionCard = document.querySelector('.question-card');
    if (questionCard) {
      const timeUpMsg = document.createElement('div');
      timeUpMsg.className = 'time-up-message';
      timeUpMsg.innerHTML = `<i class="fa-solid fa-clock"></i> TIME'S UP!`;
      questionCard.appendChild(timeUpMsg);
    }

    const buttons = document.querySelectorAll('.answer-btn');
    buttons.forEach((btn) => btn.classList.add('disabled'));

    this.animateQuestion();
  }

  
  checkAnswer(choiceElement) {
    if (this.answered) return;

    this.answered = true;
    this.stopTimer();
    this.removeEventListeners();

    const selectedAnswer = choiceElement.dataset.answer;
    const isCorrect =
      selectedAnswer.toLowerCase() === this.correctAnswer.toLowerCase();

    if (isCorrect) {
      choiceElement.classList.add('correct');
      this.quiz.incrementScore();

      this.correctSound.currentTime = 0;
      this.correctSound.play().catch(() => {});
    } else {
      choiceElement.classList.add('wrong');
      this.highlightCorrectAnswer();

      this.wrongSound.currentTime = 0;
      this.wrongSound.play().catch(() => {});
    }

    const buttons = document.querySelectorAll('.answer-btn');
    buttons.forEach((btn) => {
      if (btn !== choiceElement) {
        btn.classList.add('disabled');
      }
    });

    this.animateQuestion();
  }

  highlightCorrectAnswer() {
    const buttons = document.querySelectorAll('.answer-btn');
    buttons.forEach((btn) => {
      if (
        btn.dataset.answer.toLowerCase() === this.correctAnswer.toLowerCase()
      ) {
        btn.classList.add('correct-reveal');
      }
    });
  }

  getNextQuestion() {
    const hasNext = this.quiz.nextQuestion();

    if (hasNext) {
      const nextQuestion = new Question(this.quiz, this.container, this.onQuizEnd);
      nextQuestion.displayQuestion();
    } else {
      this.container.innerHTML = this.quiz.endQuiz();

      const restartBtn = document.querySelector('.btn-restart');
      if (restartBtn) {
        restartBtn.addEventListener('click', () => {
          if (this.onQuizEnd) {
            this.onQuizEnd();
          }
        });
      }
    }
  }

  animateQuestion(duration = 400) {
    setTimeout(() => {
      const questionCard = document.querySelector('.question-card');
      if (questionCard) {
        questionCard.classList.add('exit');
      }

      setTimeout(() => {
        this.getNextQuestion();
      }, duration);
    }, 1500);
  }
}

export default Question;
