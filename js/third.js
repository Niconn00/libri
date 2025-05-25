// JavaScript for third.html: Event listeners for action buttons

document.addEventListener('DOMContentLoaded', () => {
  // Action Buttons: "Add Notes", "Rate Book", "Change Status"
  // These buttons can be identified by their text content.
  // The HTML structure appears to be <button><span>TEXT</span></button>

  const actionButtonTexts = ["Add Notes", "Rate Book", "Change Status"];
  const buttons = document.querySelectorAll('button');

  buttons.forEach(button => {
    const span = button.querySelector('span');
    if (span && actionButtonTexts.includes(span.textContent.trim())) {
      const buttonText = span.textContent.trim();
      button.addEventListener('click', () => {
        console.log(`${buttonText} button clicked`);
      });
    }
  });
});
