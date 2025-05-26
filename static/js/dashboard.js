document.addEventListener('DOMContentLoaded', () => {
    const defaultCoverImage = 'https://via.placeholder.com/150x225.png?text=No+Cover'; // A default placeholder

    // --- Helper function to create book elements for "Currently Reading" ---
    function createCurrentlyReadingBookElement(book) {
        const bookElement = document.createElement('div');
        bookElement.className = 'flex h-full flex-1 flex-col gap-4 rounded-lg min-w-40';

        const coverImageUrl = book.cover_image_url || defaultCoverImage;
        const coverDiv = document.createElement('div');
        coverDiv.className = 'w-full bg-center bg-no-repeat aspect-[3/4] bg-cover rounded-xl flex flex-col';
        coverDiv.style.backgroundImage = `url('${coverImageUrl}')`;

        const textDiv = document.createElement('div');
        const titleP = document.createElement('p');
        titleP.className = 'text-white text-base font-medium leading-normal';
        titleP.textContent = book.title;
        const authorP = document.createElement('p');
        authorP.className = 'text-[#9dacbe] text-sm font-normal leading-normal';
        authorP.textContent = book.author;

        textDiv.appendChild(titleP);
        textDiv.appendChild(authorP);
        bookElement.appendChild(coverDiv);
        bookElement.appendChild(textDiv);
        return bookElement;
    }

    // --- Helper function to create book elements for "Recently Read" ---
    function createRecentlyReadBookElement(book) {
        const bookElement = document.createElement('div');
        bookElement.className = 'flex flex-col gap-3 pb-3';
        
        const coverImageUrl = book.cover_image_url || defaultCoverImage;
        const coverDiv = document.createElement('div');
        coverDiv.className = 'w-full bg-center bg-no-repeat aspect-[3/4] bg-cover rounded-xl';
        coverDiv.style.backgroundImage = `url('${coverImageUrl}')`;

        const titleP = document.createElement('p');
        titleP.className = 'text-white text-base font-medium leading-normal';
        titleP.textContent = book.title;

        bookElement.appendChild(coverDiv);
        bookElement.appendChild(titleP);
        return bookElement;
    }

    // --- Fetch and Display "Currently Reading" Books ---
    async function fetchCurrentlyReading() {
        const container = document.getElementById('currently-reading-container');
        if (!container) {
            console.error('Currently Reading container not found.');
            return;
        }
        container.innerHTML = ''; // Clear existing content

        try {
            const response = await fetch('/api/books?status=currently_reading');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const books = await response.json();
            if (books.length === 0) {
                container.innerHTML = '<p class="text-white/50">No books currently being read.</p>';
            } else {
                books.forEach(book => {
                    container.appendChild(createCurrentlyReadingBookElement(book));
                });
            }
        } catch (error) {
            console.error('Error fetching currently reading books:', error);
            container.innerHTML = '<p class="text-red-500">Error loading books.</p>';
        }
    }

    // --- Fetch and Display "Recently Read" Books ---
    async function fetchRecentlyRead() {
        const container = document.getElementById('recently-read-container');
        if (!container) {
            console.error('Recently Read container not found.');
            return;
        }
        container.innerHTML = ''; // Clear existing content

        try {
            // Assuming backend sorts by finish_date or added_date for "read" status
            const response = await fetch('/api/books?status=read'); 
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            let books = await response.json();
            
            // Sort by finish_date descending, then added_date descending if finish_date is null or equal
            // Books with no finish_date will be at the end.
            books.sort((a, b) => {
                const dateA = a.reading_status?.finish_date ? new Date(a.reading_status.finish_date) : new Date(a.reading_status?.added_date || 0);
                const dateB = b.reading_status?.finish_date ? new Date(b.reading_status.finish_date) : new Date(b.reading_status?.added_date || 0);
                return dateB - dateA;
            });

            // Limit to the latest 4-5 (let's say 4 for a 4-column grid, or more if design adapts)
            const limitedBooks = books.slice(0, 4); 

            if (limitedBooks.length === 0) {
                container.innerHTML = '<p class="text-white/50">No books recently read.</p>';
            } else {
                limitedBooks.forEach(book => {
                    container.appendChild(createRecentlyReadBookElement(book));
                });
            }
        } catch (error) {
            console.error('Error fetching recently read books:', error);
            container.innerHTML = '<p class="text-red-500">Error loading books.</p>';
        }
    }

    // --- Implement Navigation ---
    function setupNavigation() {
        // Logo
        const logoLink = document.querySelector('header .flex.items-center.gap-4.text-white a'); // More specific selector if needed
        if (logoLink) { // Assuming the BookTracker logo itself is not an A tag, but its parent might be, or the text "BookTracker" is.
                        // The provided HTML has BookTracker text not in an A tag.
                        // Let's assume the div containing the SVG and "BookTracker" should be clickable.
            const logoContainer = document.querySelector('header div.flex.items-center.gap-4.text-white'); 
            if(logoContainer && logoContainer.parentElement.tagName === 'A'){ // If the parent of "BookTracker" text div is 'A'
                 logoContainer.parentElement.href = 'first.html';
            } else if (logoContainer) { // Make the div itself clickable
                logoContainer.style.cursor = 'pointer';
                logoContainer.addEventListener('click', () => window.location.href = 'first.html');
            }
        }
        
        const navLinks = document.querySelectorAll('header .flex.items-center.gap-9 a');
        navLinks.forEach(link => {
            const text = link.textContent.trim();
            if (text === 'Home') {
                link.href = 'first.html';
            } else if (text === 'My Books') {
                link.href = 'six.html'; // Want to Read page
            } else if (text === 'Explore') {
                link.href = 'second.html';
            } else if (text === 'Community') {
                link.href = 'five.html'; // Or # as per instruction
            }
        });

        // For the actual "BookTracker" text:
        const brandTextElement = Array.from(document.querySelectorAll('h2.text-white'))
                                   .find(h2 => h2.textContent.trim() === 'BookTracker');
        if (brandTextElement) {
            let parentAnchor = brandTextElement.closest('a');
            if (!parentAnchor) { // If not already wrapped in an anchor, wrap it or make parent div clickable
                const parentDiv = brandTextElement.parentElement; // The div with icon
                parentDiv.style.cursor = 'pointer';
                parentDiv.addEventListener('click', () => { window.location.href = 'first.html'; });
            } else {
                 parentAnchor.href = 'first.html';
            }
        }
    }

    // --- Initial Load ---
    fetchCurrentlyReading();
    fetchRecentlyRead();
    setupNavigation();
});
