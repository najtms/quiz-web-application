let quizData = [];
let currentIndex = 0;
let score = 0;

function loadQuiz() {
  const file = document.getElementById("csvFile").files[0];
  if (!file) return alert("Please upload a CSV file first.");

  Papa.parse(file, {
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
      quizData = rows
        .filter(row => row.length > Math.max(...falseIdxs, correctIdx, questionIdx))
        .map(row => {
          return {
            question: (row[questionIdx] || '').trim(),
            correct: (row[correctIdx] || '').trim(),
            wrong: falseIdxs.map(i => (row[i] || '').trim()).filter(Boolean)
          };
        });
      document.getElementById("quiz-container").style.display = "block";
      showQuestion();
    }
  });
}

function showQuestion() {
  const q = quizData[currentIndex];
  document.getElementById("question").innerText = q.question;

  const answers = [q.correct, ...q.wrong];
  shuffleArray(answers);

  document.getElementById("answers").innerHTML = "";
  answers.forEach(ans => {
    const btn = document.createElement("button");
    btn.innerText = ans;
    btn.onclick = () => {
      if (ans === q.correct) {
        score++;
        const msg = document.getElementById("false-question");
        msg.innerText = "Correct!";
        msg.style.display = "block";
        msg.style.color = "#155724";
        msg.style.background = "#d4edda";
        msg.style.border = "1px solid #c3e6cb";
        msg.style.padding = "8px 12px";
        msg.style.borderRadius = "6px";
        setTimeout(() => {
          msg.style.display = "none";
          msg.style.background = "";
          msg.style.border = "";
          msg.style.padding = "";
          msg.style.borderRadius = "";
          nextQuestion();
        }, 1500);
      } else {
        const msg = document.getElementById("false-question");
        msg.innerText = `Incorrect! The correct answer was: ${q.correct}`;
        msg.style.display = "block";
        msg.style.color = "#721c24";
        msg.style.background = "#f8d7da";
        msg.style.border = "1px solid #f5c6cb";
        msg.style.padding = "8px 12px";
        msg.style.borderRadius = "6px";
        setTimeout(() => {
          msg.style.display = "none";
          msg.style.background = "";
          msg.style.border = "";
          msg.style.padding = "";
          msg.style.borderRadius = "";
          nextQuestion();
        }, 3000);
      }
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
          quizData = rows
            .filter(row => row.length > Math.max(...falseIdxs, correctIdx, questionIdx))
            .map(row => {
              return {
                question: (row[questionIdx] || '').trim(),
                correct: (row[correctIdx] || '').trim(),
                wrong: falseIdxs.map(i => (row[i] || '').trim()).filter(Boolean)
              };
            });
          currentIndex = 0;
          score = 0;
          document.getElementById("quiz-container").style.display = "block";
          document.getElementById("result").style.display = "none";
          showQuestion();
        }
      });
    });
}
