document.addEventListener('DOMContentLoaded', () => {
    const defaultCoverImage = 'https://via.placeholder.com/150x225.png?text=No+Cover';
    const featuredBooksContainer = document.getElementById('featured-books-container');
    const searchInput = document.getElementById('search-explore-input');
    let allFeaturedBooks = []; // To store initially fetched books for client-side search

    // --- Helper function to create book elements for "Featured Books" ---
    function createFeaturedBookElement(book) {
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

    // --- Render books to the container ---
    function renderBooks(booksToRender) {
        if (!featuredBooksContainer) {
            console.error('Featured books container not found.');
            return;
        }
        featuredBooksContainer.innerHTML = ''; // Clear existing content

        if (booksToRender.length === 0) {
            featuredBooksContainer.innerHTML = '<p class="text-white/50 col-span-full text-center">No books found.</p>';
        } else {
            booksToRender.forEach(book => {
                featuredBooksContainer.appendChild(createFeaturedBookElement(book));
            });
        }
    }

    // --- Fetch and Display "Featured Books" ---
    async function fetchFeaturedBooks() {
        if (!featuredBooksContainer) {
            console.error('Featured books container not found for initial fetch.');
            return;
        }
        try {
            const response = await fetch('/api/books'); // Fetches all books
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const books = await response.json();
            // For "Featured", let's take the first 6-10. Let's aim for 6.
            // The API returns books with reading_status. We need to ensure we handle that.
            // The /api/books endpoint returns book data *with* reading status for the default user.
            // For explore page, we just need the book data.
            allFeaturedBooks = books.map(book => ({
                id: book.id,
                title: book.title,
                author: book.author,
                cover_image_url: book.cover_image_url,
                // add other book-specific fields if needed by createFeaturedBookElement
            })).slice(0, 6); // Take first 6 as featured

            renderBooks(allFeaturedBooks);
        } catch (error) {
            console.error('Error fetching featured books:', error);
            if (featuredBooksContainer) {
                featuredBooksContainer.innerHTML = '<p class="text-red-500 col-span-full text-center">Error loading featured books.</p>';
            }
        }
    }

    // --- Search Functionality ---
    function setupSearch() {
        if (!searchInput) {
            console.error('Search input not found.');
            return;
        }
        searchInput.addEventListener('input', (event) => {
            const searchTerm = event.target.value.toLowerCase().trim();
            if (!searchTerm) {
                renderBooks(allFeaturedBooks); // Show all featured if search is empty
                return;
            }

            const filteredBooks = allFeaturedBooks.filter(book => {
                const titleMatch = book.title.toLowerCase().includes(searchTerm);
                const authorMatch = book.author ? book.author.toLowerCase().includes(searchTerm) : false;
                return titleMatch || authorMatch;
            });
            renderBooks(filteredBooks);
        });
    }

    // --- Implement Navigation ---
    function setupNavigation() {
        // Logo/Brand "BookTracker"
        const brandLink = document.querySelector('header .flex.items-center.gap-4.text-white');
        if (brandLink) {
            // Making the div containing the SVG and "BookTracker" text clickable
            brandLink.style.cursor = 'pointer';
            brandLink.addEventListener('click', () => window.location.href = 'first.html');
        }
        
        const navLinks = document.querySelectorAll('header .flex.items-center.gap-9 a');
        navLinks.forEach(link => {
            const text = link.textContent.trim();
            // Note: 'Home' link is not present in second.html's header based on provided HTML
            if (text === 'My Books') {
                link.href = 'six.html'; 
            } else if (text === 'Explore') {
                link.href = 'second.html';
            } else if (text === 'Community') {
                link.href = 'five.html'; 
            }
        });
    }

    // --- Initial Load ---
    fetchFeaturedBooks();
    setupSearch();
    setupNavigation();
});
