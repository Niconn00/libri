// JavaScript for second.html: Tab switching, genre filtering, and Add Book navigation

document.addEventListener('DOMContentLoaded', () => {
  // Tab Switching Logic
  const tabs = document.querySelectorAll('.tab-item'); // Assuming tabs have a common class e.g., 'tab-item'
  const tabContainer = document.querySelector('.tabs-container'); // Assuming a container for tabs

  if (tabContainer) {
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remove active styles from all tabs
        tabs.forEach(t => {
          t.classList.remove('border-b-white', 'text-white');
          t.classList.add('border-b-transparent', 'text-[#9eb7a8]');
        });
        // Add active styles to the clicked tab
        tab.classList.remove('border-b-transparent', 'text-[#9eb7a8]');
        tab.classList.add('border-b-white', 'text-white');
      });
    });
  } else {
    console.error('Tabs container not found.');
  }

  // Genre Filtering Logic
  const filterButtons = document.querySelectorAll('.filter-button'); // Assuming filter buttons have a common class

  if (filterButtons.length > 0) {
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Remove active style from all filter buttons
        filterButtons.forEach(btn => {
          btn.classList.remove('bg-[#3d5245]'); // Active state
          btn.classList.add('bg-[#29382f]');    // Default state
        });
        // Add active style to the clicked filter button
        button.classList.remove('bg-[#29382f]');
        button.classList.add('bg-[#3d5245]');
      });
    });
  } else {
    console.error('Filter buttons not found.');
  }

  // "Add Book" Button Navigation
  // Need to identify the "Add Book" button. Based on first.html, it might be inside a div with class "flex items-center gap-4 text-white"
  // and have specific text or an icon.
  // Let's assume it's a button with the text "Add Book" or similar unique identifier.
  // For second.html, the structure is: <div class="flex items-center gap-2"> <button> <svg> </svg> <span>Add Book</span> </button> </div>
  const addBookButton = Array.from(document.querySelectorAll('button')).find(btn => {
    const span = btn.querySelector('span');
    return span && span.textContent.trim() === 'Add Book';
  });

  if (addBookButton) {
    addBookButton.addEventListener('click', () => {
      window.location.href = 'four.html';
    });
  } else {
    console.error('"Add Book" button not found.');
  }

  // Book Item Click Navigation
  // Book items are divs with class "flex flex-col gap-3 pb-3"
  // inside the grid: div.grid.grid-cols-[repeat(auto-fit,minmax(158px,1fr))].gap-3.p-4
  const bookGrid = document.querySelector('.grid.grid-cols-\\[repeat\\(auto-fit\\,minmax\\(158px\\,1fr\\)\\\)\\]');
  if (bookGrid) {
    const bookItems = bookGrid.querySelectorAll('.flex.flex-col.gap-3.pb-3');
    bookItems.forEach(item => {
      item.addEventListener('click', (event) => {
        // Prevent any default action if the item itself is a link or contains one (though not in this structure)
        event.preventDefault(); 
        window.location.href = 'third.html';
      });
      // Add cursor pointer to indicate items are clickable
      item.style.cursor = 'pointer';
    });
  } else {
    console.error('Book grid container not found.');
  }
});
