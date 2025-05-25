// JavaScript for four.html: Search input logging, clear button, and "Add manually" button logging

document.addEventListener('DOMContentLoaded', () => {
  // Search Input Logic
  // The input field can be identified by its placeholder text.
  const searchInput = Array.from(document.querySelectorAll('input[type="text"]')).find(
    input => input.placeholder === "Search by title, author, or ISBN"
  );

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      console.log(`Search input value: ${searchInput.value}`);
    });

    // "X" (Clear) Button Logic
    // The clear button is likely a <button> or <a> tag near the search input.
    // Based on the HTML structure of other pages, it might be a button with an X icon.
    // In four.html, it's a button with a specific SVG icon, sibling to the input.
    // <button class="text-[#9eb7a8] flex border-none bg-transparent items-center justify-center p-0 focus:outline-none"> <svg> X icon </svg> </button>
    const clearButton = searchInput.nextElementSibling; // Assuming it's the immediate next sibling

    if (clearButton && clearButton.tagName === 'BUTTON') {
      clearButton.addEventListener('click', () => {
        searchInput.value = ''; // Clear the input field
        console.log('Search input cleared');
      });
    } else {
      // Fallback if the structure is different - look for a button with an 'X' or similar icon/text if needed.
      // This might require a more specific selector if the direct sibling assumption is wrong.
      // For now, logging an error if not found via sibling.
      console.error('Clear button for search input not found or not structured as expected.');
    }
  } else {
    console.error('Search input field not found.');
  }

  // "Add manually" Button Logic
  // This button can be identified by its text content.
  // Structure: <button><span>Add manually</span></button>
  const addManuallyButton = Array.from(document.querySelectorAll('button')).find(button => {
    const span = button.querySelector('span');
    return span && span.textContent.trim() === 'Add manually';
  });

  if (addManuallyButton) {
    addManuallyButton.addEventListener('click', () => {
      console.log('Add manually button clicked');
    });
  } else {
    console.error('"Add manually" button not found.');
  }
});
