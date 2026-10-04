

export default class Quiz {
  
  constructor(category, difficulty, numberOfQuestions, playerName){
    this.category=category;
    this.difficulty=difficulty;
    this.numberOfQuestions=numberOfQuestions
    this.playerName=playerName;
    this.score=0
    this.questions=[];
    this.currentQuestionIndex=0
  }
  buildApiUrl(){
    let URL=`https://opentdb.com/api.php?amount=${this.numberOfQuestions}`
    if(this.category){
      URL+=`&category=${this.category}`
    }
    if(this.difficulty){
      URL+=`&difficulty=${this.difficulty}`
    }
    return URL
  }
  
  async getQuestions(){
    let URL=this.buildApiUrl();
    let response=await fetch(URL);
    try{
      let data=await response.json()
      this.questions =data.results
      return this.questions
    }
    catch(error){

    }
  }
  incrementScore(){
    this.score++
  }
  getCurrentQuestion(){
   return this.currentQuestionIndex <this.questions.length? this.questions[this.currentQuestionIndex]:null
  }
  nextQuestion(){
    this.currentQuestionIndex++
    return this.currentQuestionIndex <this.questions.length?true:false
  }
  isComplete(){
    return  this.currentQuestionIndex >= this.questions.length ? true :false
  }
  getScorePercentage(){
   return Math.round((this.score / this.numberOfQuestions) * 100)
  }

  getHighScores(){
   return JSON.parse(localStorage.getItem('quizHighScores'))?[...JSON.parse(localStorage.getItem('quizHighScores'))]:[]
  }
  saveHighScore(){
    let hightScoreArray=this.getHighScores()
    let newScore={
      name:this.playerName,
      score:this.score,
      percentage:this.getScorePercentage(),
      difficulty:this.difficulty
    }
    hightScoreArray.push(newScore);
    hightScoreArray.sort((a,b)=>a.percentage-b.percentage);
    let topScore=hightScoreArray.splice(0,10);
    localStorage.setItem('quizHighScores', JSON.stringify(topScore));
  }
  isHighScore(){
    let hightScore=this.getHighScores();
  if (hightScore.length < 10) return true;

    const lowestScore = hightScore[hightScore.length - 1];
    return this.getScorePercentage() > lowestScore.percentage;
  }
  endQuiz() {
    const percentage = this.getScorePercentage();
    const isNewRecord = this.isHighScore();

    if (isNewRecord) {
      this.saveHighScore();
    }

    const highScores = this.getHighScores();

    const leaderboardHTML = highScores
      .slice(0, 3)
      .map((entry, index) => {
        const medalClass = ['gold', 'silver', 'bronze'][index] || '';
        return `
          <li class="leaderboard-item ${medalClass}">
            <span class="leaderboard-rank">#${index + 1}</span>
            <span class="leaderboard-name">${entry.name}</span>
            <span class="leaderboard-score">${entry.percentage}%</span>
          </li>
        `;
      })
      .join('');

    return `
      <div class="game-card results-card">
        <h2 class="results-title">Quiz Complete!</h2>
        <p class="results-score-display">${this.score}/${this.numberOfQuestions}</p>
        <p class="results-percentage">${percentage}% Accuracy</p>

        ${isNewRecord ? `
          <div class="new-record-badge">
            <i class="fa-solid fa-star"></i> New High Score!
          </div>
        ` : ''}

        <div class="leaderboard">
          <h4 class="leaderboard-title">
            <i class="fa-solid fa-trophy"></i> Leaderboard
          </h4>
          <ul class="leaderboard-list">
            ${leaderboardHTML}
          </ul>
        </div>

        <div class="action-buttons">
          <button class="btn-restart">
            <i class="fa-solid fa-rotate-right"></i> Play Again
          </button>
        </div>
      </div>
    `;
  }

 }
