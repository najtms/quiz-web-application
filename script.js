let quizData = [];
let currentIndex = 0;
let score = 0;

function loadQuiz() {
  const file = document.getElementById("csvFile").files[0];
  if (!file) return alert("Please upload a CSV file first.");

  Papa.parse(file, {
    header: false, 
    skipEmptyLines: true, // Skip empty lines
    complete: function(results) {
      const rows = results.data.slice(1);
      quizData = rows
        .filter(row => row.length >= 4 && row[0] && row[1] && row[2] && row[3])
        .map(row => ({
          question: (row[0] || '').trim(),
          correct: (row[1] || '').trim(),
          false1: (row[2] || '').trim(),
          false2: (row[3] || '').trim()
        }));
      document.getElementById("quiz-container").style.display = "block";
      showQuestion();
    }
  });
}

function showQuestion() {
  const q = quizData[currentIndex];
  document.getElementById("question").innerText = q.question;

  const answers = [q.correct, q.false1, q.false2];
  shuffleArray(answers);

  document.getElementById("answers").innerHTML = "";
  answers.forEach(ans => {
    const btn = document.createElement("button");
    btn.innerText = ans;
    btn.onclick = () => {
      if (ans === q.correct) score++;
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
    document.getElementById("quiz-container").style.display = "none";
    document.getElementById("result").style.display = "block";
    document.getElementById("result").innerText = `Quiz complete! Your score: ${score}/${quizData.length}`;
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
