let quizData = [];
let allQuestions = [];
let currentIndex = 0;
let score = 0;
let userAnswers = [];

function startQuizWithRandomQuestions() {
  currentIndex = 0;
  score = 0;
  userAnswers = [];
  
  // Shuffle and select 10 random questions
  const shuffled = [...allQuestions];
  shuffleArray(shuffled);
  quizData = shuffled.slice(0, Math.min(10, shuffled.length));
}

function updateProgressTracker() {
  const progressText = document.getElementById("progress-text");
  const progressBar = document.getElementById("progress-bar");
  const percentage = ((currentIndex + 1) / quizData.length) * 100;
  
  progressText.innerText = `Question ${currentIndex + 1}/${quizData.length}`;
  progressBar.style.width = percentage + "%";
  progressBar.setAttribute('aria-valuenow', percentage);
}

function showQuestion() {
  const q = quizData[currentIndex];
  updateProgressTracker();
  document.getElementById("question").innerText = q.question;

  const answers = [q.correct, ...q.wrong];
  shuffleArray(answers);

  document.getElementById("answers").innerHTML = "";
  answers.forEach(ans => {
    const btn = document.createElement("button");
    btn.innerText = ans;
    btn.className = "btn btn-outline-primary";
    btn.onclick = () => {
      // Store user's answer
      userAnswers.push({
        question: q.question,
        userAnswer: ans,
        correctAnswer: q.correct,
        isCorrect: ans === q.correct
      });
      
      if (ans === q.correct) {
        score++;
      }
      
      nextQuestion();
    };
    document.getElementById("answers").appendChild(btn);
  });
}

function nextQuestion() {
  currentIndex++;
  if (currentIndex < quizData.length) {
    showQuestion();
  } else {
    showReview();
  }
}

function showReview() {
  document.getElementById("quiz-container").style.display = "none";
  document.getElementById("progress-tracker").style.display = "none";
  document.getElementById("result").style.display = "block";
  document.getElementById("nextBtn").style.display = "none";
  
  let reviewHTML = `<h4 class="mb-3">Quiz Complete!</h4>`;
  reviewHTML += `<p class="alert alert-info">Your score: ${score}/${quizData.length}</p>`;
  reviewHTML += `<div class="review-container">`;
  
  userAnswers.forEach((answer, index) => {
    const statusClass = answer.isCorrect ? 'correct' : 'incorrect';
    const statusIcon = answer.isCorrect ? '&check;' : '&cross;';
    const statusColor = answer.isCorrect ? '#d4edda' : '#f8d7da';
    const borderColor = answer.isCorrect ? '#c3e6cb' : '#f5c6cb';
    
    reviewHTML += `
      <div class="review-item" style="background: ${statusColor}; border: 1px solid ${borderColor}; padding: 15px; margin-bottom: 15px; border-radius: 8px;">
        <div class="fw-bold mb-2">
          <span class="badge ${answer.isCorrect ? 'bg-success' : 'bg-danger'}">${statusIcon}</span>
          Question ${index + 1}
        </div>
        <p class="mb-2"><strong>Q:</strong> ${answer.question}</p>
        <p class="mb-1"><strong>Your Answer:</strong> <span class="${answer.isCorrect ? 'text-success' : 'text-danger'}">${answer.userAnswer}</span></p>
        ${!answer.isCorrect ? `<p class="mb-0"><strong>Correct Answer:</strong> <span class="text-success">${answer.correctAnswer}</span></p>` : ''}
      </div>
    `;
  });
  
  reviewHTML += `</div>`;
  reviewHTML += `<button onclick="restartQuiz()" class="btn btn-primary w-100 mt-3">Take Another Quiz</button>`;
  
  document.getElementById("result").innerHTML = reviewHTML;
}

function restartQuiz() {
  location.reload();
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

window.addEventListener('DOMContentLoaded', () => {
  fetch('CSV/list.php')
    .then(response => response.json())
    .then(csvFiles => {
      const csvDropdownMenu = document.getElementById("csvDropdownMenu");
      csvDropdownMenu.innerHTML = '';
      csvFiles.forEach(filename => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.className = "dropdown-item";
        a.href = "#";
        a.innerText = filename;
        a.onclick = (e) => {
          e.preventDefault();
          loadQuizFromServer(filename);
        };
        li.appendChild(a);
        csvDropdownMenu.appendChild(li);
      });
    });
});

function loadQuizFromServer(filename) {
  fetch(`CSV/${filename}`)
    .then(response => response.text())
    .then(csvText => {
      Papa.parse(csvText, {
        header: false,
        skipEmptyLines: true,
        complete: function(results) {
          const header = results.data[0].map(h => (h || '').trim());
          const rows = results.data.slice(1);
          const correctIdx = header.findIndex(h => h.toLowerCase().includes('correct answer'));
          const falseIdxs = header
            .map((h, i) => h.toLowerCase().startsWith('false option') ? i : -1)
            .filter(i => i !== -1);
          const questionIdx = header.findIndex(h => h.toLowerCase() === 'question');
          allQuestions = rows
            .filter(row => row.length > Math.max(...falseIdxs, correctIdx, questionIdx))
            .map(row => {
              return {
                question: (row[questionIdx] || '').trim(),
                correct: (row[correctIdx] || '').trim(),
                wrong: falseIdxs.map(i => (row[i] || '').trim()).filter(Boolean)
              };
            });
          startQuizWithRandomQuestions();
          document.getElementById("quiz-container").style.display = "block";
          document.getElementById("progress-tracker").style.display = "block";
          document.getElementById("instructions").style.display = "none";
          document.getElementById("result").style.display = "none";
          document.getElementById("nextBtn").style.display = "none";
          showQuestion();
        }
      });
    });
}
