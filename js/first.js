document.addEventListener('DOMContentLoaded', () => {
  // Find the "Add New Book" button
  // It's a button with the text "Add New Book"
  // Let's be specific to avoid selecting other buttons if the text is generic
  const buttons = document.querySelectorAll('button');
  let addNewBookButton = null;
  buttons.forEach(button => {
    // Check for the button that has a span with the text "Add New Book"
    // or if the button itself has the text.
    // The HTML structure shows a span inside the button for the text.
    const span = button.querySelector('span');
    if (span && span.textContent.trim() === 'Add New Book') {
      addNewBookButton = button;
    } else if (button.textContent.trim() === 'Add New Book') {
      // Fallback if the structure is different or text is directly in button
      addNewBookButton = button;
    }
  });

  if (addNewBookButton) {
    addNewBookButton.addEventListener('click', () => {
      window.location.href = 'four.html';
    });
  } else {
    console.error('Button with text "Add New Book" not found.');
  }
});
