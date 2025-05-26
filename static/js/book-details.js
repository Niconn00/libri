document.addEventListener('DOMContentLoaded', () => {
    const defaultCoverImage = 'https://via.placeholder.com/128x192.png?text=No+Cover';

    // Element selectors
    const breadcrumbBookTitle = document.getElementById('breadcrumb-book-title');
    const bookCoverImage = document.getElementById('book-cover-image');
    const bookTitle = document.getElementById('book-title');
    const bookAuthor = document.getElementById('book-author');
    const bookCategoryYear = document.getElementById('book-category-year');
    
    const progressPercentageText = document.getElementById('progress-percentage');
    const progressBar = document.getElementById('progress-bar');
    const progressPagesText = document.getElementById('progress-pages');
    
    const currentPageInput = document.getElementById('currentPageInput');
    const updateProgressBtn = document.getElementById('updateProgressBtn');
    const statusDropdown = document.getElementById('statusDropdown');
    const updateStatusBtn = document.getElementById('updateStatusBtn');

    const bookDescription = document.getElementById('book-description');
    
    const editionFormat = document.getElementById('edition-format');
    const editionPages = document.getElementById('edition-pages');
    // const editionLanguage = document.getElementById('edition-language'); // Assuming 'English' is static for now or not always available
    const editionPublisher = document.getElementById('edition-publisher');
    const editionPublishedYear = document.getElementById('edition-published-year');

    let currentBookData = null; // To store fetched book data

    // --- Get Book ID from URL ---
    function getBookIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const bookId = params.get('book_id');
        if (!bookId) {
            console.error('Book ID not found in URL.');
            document.body.innerHTML = '<p class="text-red-500 text-center p-8">Error: Book ID is missing in the URL.</p>';
            return null;
        }
        return parseInt(bookId, 10);
    }

    // --- Update Progress Display ---
    function updateProgressDisplay(book) {
        if (!book || !book.reading_status) {
            progressPercentageText.textContent = 'N/A';
            progressBar.style.width = '0%';
            progressPagesText.textContent = 'No progress tracked.';
            currentPageInput.value = '';
            statusDropdown.value = 'want_to_read'; // Default
            return;
        }

        const rs = book.reading_status;
        const totalPages = book.page_count || 0;
        const currentPage = rs.current_page || 0;
        
        statusDropdown.value = rs.status || 'want_to_read';
        currentPageInput.value = currentPage;

        if (totalPages > 0) {
            const percentage = Math.round((currentPage / totalPages) * 100);
            progressPercentageText.textContent = `${percentage}%`;
            progressBar.style.width = `${percentage}%`;
            progressPagesText.textContent = `${currentPage} / ${totalPages} pages read`;
        } else {
            progressPercentageText.textContent = '0%';
            progressBar.style.width = '0%';
            progressPagesText.textContent = `${currentPage} pages read (total pages unknown)`;
        }
    }

    // --- Fetch and Display Book Details ---
    async function loadBookDetails(bookId) {
        try {
            const response = await fetch(`/api/books/${bookId}`);
            if (!response.ok) {
                if (response.status === 404) {
                    document.body.innerHTML = '<p class="text-red-500 text-center p-8">Error: Book not found.</p>';
                } else {
                    document.body.innerHTML = `<p class="text-red-500 text-center p-8">Error loading book details: ${response.statusText}</p>`;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            currentBookData = await response.json();
            
            // Populate breadcrumbs
            breadcrumbBookTitle.textContent = currentBookData.title;

            // Populate header section
            bookCoverImage.style.backgroundImage = `url('${currentBookData.cover_image_url || defaultCoverImage}')`;
            bookTitle.textContent = currentBookData.title;
            bookAuthor.textContent = currentBookData.author;
            bookCategoryYear.textContent = `${currentBookData.genre || 'N/A'} · ${currentBookData.publication_year || 'N/A'}`;

            // Populate reading progress
            updateProgressDisplay(currentBookData);

            // Populate About the Book
            bookDescription.textContent = currentBookData.description || 'No description available.';

            // Populate My Edition details
            editionFormat.textContent = currentBookData.reading_status?.format || 'N/A'; // Assuming format might be per user's copy
            editionPages.textContent = currentBookData.page_count || 'N/A';
            // editionLanguage.textContent = currentBookData.language || 'English'; // If available
            editionPublisher.textContent = currentBookData.publisher || 'N/A'; // Assuming publisher is part of book, not reading_status
            editionPublishedYear.textContent = currentBookData.publication_year || 'N/A';

        } catch (error) {
            console.error('Error fetching book details:', error);
        }
    }

    // --- Update Reading Progress (Current Page) ---
    async function handleUpdateProgress(bookId) {
        if (!currentBookData) return;

        const newCurrentPage = parseInt(currentPageInput.value, 10);
        if (isNaN(newCurrentPage) || newCurrentPage < 0) {
            alert('Please enter a valid page number.');
            return;
        }
        
        const totalPages = currentBookData.page_count || 0;
        if (totalPages > 0 && newCurrentPage > totalPages) {
            if(!confirm(`Current page (${newCurrentPage}) is greater than total pages (${totalPages}). Do you want to proceed?`)){
                return;
            }
        }

        const payload = {
            current_page: newCurrentPage,
            status: currentBookData.reading_status?.status || 'currently_reading' // Keep current status or default to currently_reading
        };

        // If updating page makes it 100% and status is currently_reading, suggest changing to 'read'
        if (totalPages > 0 && newCurrentPage >= totalPages && payload.status === 'currently_reading') {
            if (confirm('You have finished the book! Would you like to mark it as "Read"?')) {
                payload.status = 'read';
                // Optionally set finish_date here if desired, e.g., payload.finish_date = new Date().toISOString().split('T')[0];
            }
        }


        try {
            const response = await fetch(`/api/books/${bookId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const updatedBook = await response.json();
            currentBookData = updatedBook; // Update local data
            updateProgressDisplay(currentBookData);
            alert('Progress updated successfully!');
        } catch (error) {
            console.error('Error updating progress:', error);
            alert(`Failed to update progress: ${error.message}`);
        }
    }
    
    // --- Update Reading Status ---
    async function handleUpdateStatus(bookId) {
        if (!currentBookData) return;

        const newStatus = statusDropdown.value;
        const payload = {
            status: newStatus,
            current_page: currentBookData.reading_status?.current_page || 0 // Keep current page or set to 0
        };

        // If status is 'read', and current page isn't max, set to max
        if (newStatus === 'read' && currentBookData.page_count && payload.current_page < currentBookData.page_count) {
            payload.current_page = currentBookData.page_count;
        }
        // If status is 'want_to_read', reset current page to 0
        if (newStatus === 'want_to_read') {
            payload.current_page = 0;
        }


        try {
            const response = await fetch(`/api/books/${bookId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const updatedBook = await response.json();
            currentBookData = updatedBook; // Update local data
            updateProgressDisplay(currentBookData); // Refresh progress display
            alert('Status updated successfully!');
        } catch (error) {
            console.error('Error updating status:', error);
            alert(`Failed to update status: ${error.message}`);
        }
    }


    // --- Implement Navigation ---
    function setupNavigation() {
        const brandLink = document.querySelector('header .flex.items-center.gap-4.text-white');
        if (brandLink) {
            brandLink.style.cursor = 'pointer';
            brandLink.addEventListener('click', () => window.location.href = 'first.html');
        }
        
        const navLinks = document.querySelectorAll('header .flex.items-center.gap-9 a');
        navLinks.forEach(link => {
            const text = link.textContent.trim();
            if (text === 'Home') {
                link.href = 'first.html';
            } else if (text === 'My Books') {
                link.href = 'six.html'; 
            } else if (text === 'Explore') {
                link.href = 'second.html';
            }
            // Community link is not in third.html based on provided HTML, so no need to handle here.
        });

        // Breadcrumb "My Books"
        const myBooksBreadcrumb = document.querySelector('.flex.flex-wrap.gap-2.p-4 a');
        if (myBooksBreadcrumb && myBooksBreadcrumb.textContent.trim() === 'My Books') {
            myBooksBreadcrumb.href = 'six.html';
        }
    }

    // --- Initial Load ---
    const bookId = getBookIdFromUrl();
    if (bookId) {
        loadBookDetails(bookId);
        setupNavigation();

        if (updateProgressBtn) {
            updateProgressBtn.addEventListener('click', () => handleUpdateProgress(bookId));
        }
        if (updateStatusBtn) {
            updateStatusBtn.addEventListener('click', () => handleUpdateStatus(bookId));
        }
    }
});
