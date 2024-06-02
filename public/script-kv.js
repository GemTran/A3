

let savedConfessions =[]

async function submitConfession() {
  const confessionText = document.getElementById('confession-input').value;
  if (!confessionText) return;

  try {
      await fetch('/saveConfession', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ text: confessionText })
      });
      document.getElementById('confession-input').value = '';
  } catch (error) {
      console.error('Error submitting confession:', error);
  }
}

async function displayOnCanvas() {
  try {
      const response = await fetch('/getConfessions');
      const confessions = await response.json();

      const canvas = document.getElementById('confessionCanvas');
      const ctx = canvas.getContext('2d');
      canvas.width = innerWidth;
      canvas.height = innerHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const confession of savedConfessions) {
          ctx.font = "16px Arial";
          ctx.fillStyle = `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;
          ctx.fillText(confession.text, Math.random() * canvas.width, Math.random() * canvas.height);
      }
  } catch (error) {
      console.error('Error displaying confessions:', error);
  }
}

// Call displayOnCanvas initially to load confessions
displayOnCanvas();


