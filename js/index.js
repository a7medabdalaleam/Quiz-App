import Quiz from './quiz.js';
import Question from './question.js';
let playerName=document.getElementById('playerName')
let categorySelect=document.getElementById('categorySelect')
let difficultySelect=document.getElementById('difficultySelect')
let questionsNumber=document.getElementById('questionsNumber')
let btnstartQuiz=document.getElementById('startQuiz')
let questionsContainer=document.getElementById('questionsContainer')
let quizOptions=document.getElementById('quizOptions')
let loadingScreen=document.getElementById('loadingScreen')
let errorCard=document.getElementById('errorCard')
let formError=document.getElementById('formError')
let currentQuiz;
let objectValid={}
function showLoading(){
    loadingScreen.classList.remove('d-none')
}
function hideLoading(){
    loadingScreen.classList.add('d-none')
}
function showError(){
    errorCard.classList.remove('d-none')
}
function validateForm(){
    if(!questionsNumber.value){
     objectValid={
    isvalid:false,
    error:'Please enter the number of questions.'
}
    return objectValid

    }
    else if(questionsNumber.value< 1){
          objectValid={
    isvalid:false,
    error:'Minimum 1 question required.'
}
    return objectValid
    }
    else if(questionsNumber.value> 50){
     objectValid={
    isvalid:false,
    error:'Maximum 50 questions allowed.'
}
    return objectValid
    }
    else{
     objectValid={
    isvalid:true,
    error:null
    }
    return objectValid
}

}
function showFromDivError(){
    document.getElementById('formErrordiv').classList.remove('d-none')
    setTimeout(function(){
        document.getElementById('formErrordiv').classList.add('d-none')
    },8000)
}

async function formErrorMsg(){
    let {isvalid,error:msg}=validateForm()
    if(isvalid){
        quizOptions.classList.add('d-none');
      await  startQuiz()
       
    }
    else{
        showFromDivError()
        formError.innerHTML=msg
    }
}
function resetToStart(){
    playerName.value=null;
    categorySelect.value=null;
    difficultySelect.value=null;
    questionsNumber.value=null;
    
    hideLoading()
    questionsContainer.classList.remove('d-none');
    
}
btnstartQuiz.addEventListener('click',function(){
    console.log('hallo');
    
    validateForm();
    formErrorMsg()
})
questionsNumber.addEventListener('keydown',function(e){
    if(e.key==='Enter'){
        validateForm();
        formErrorMsg()

    }
    
})
function resetToStart1() {
  questionsContainer.innerHTML = '';
  questionsContainer.classList.add('d-none');

  playerName.value = '';
  questionsNumber.value = '10';

  quizOptions.classList.remove('d-none');

  hideLoading();
  hideError();

  currentQuiz = null;
}
async function startQuiz() {
  

  const playerName1 = playerName.value.trim() || 'Player';
  const category = categorySelect.value;
  const difficulty = difficultySelect.value;
  const numberOfQuestions = Number(questionsNumber.value);

  currentQuiz = new Quiz(category, difficulty, numberOfQuestions, playerName1);

  quizOptions.classList.add('d-none');
  questionsContainer.classList.remove('d-none');
  showLoading();

  try {
    await currentQuiz.getQuestions();
    hideLoading();

    if (!currentQuiz.questions || currentQuiz.questions.length === 0) {
      showError('No questions found. Try different settings.');
      return;
    }

    const firstQuestion = new Question(currentQuiz, questionsContainer, resetToStart1);
    firstQuestion.displayQuestion();
  } catch (err) {
    console.error(err);
    hideLoading();
    showError();
  }
}

