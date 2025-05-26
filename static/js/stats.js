document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selectors ---
    const statsBooksReadEl = document.getElementById('stats-books-read');
    const statsTotalPagesReadEl = document.getElementById('stats-total-pages-read');
    const statsAverageRatingEl = document.getElementById('stats-average-rating');

    const booksPerMonthChartContainer = document.getElementById('books-per-month-chart');
    const pagesPerMonthChartContainer = document.getElementById('pages-per-month-chart'); // New ID for the grid

    // --- Helper to create bar chart items ---
    function createBarChartItem(label, value, maxValue, colorClass = 'bg-[#2b3540]') {
        const itemWrapper = document.createDocumentFragment(); // Use fragment to append bar and label together

        const barDiv = document.createElement('div');
        barDiv.className = `border-[#9dacbe] ${colorClass} border-t-2 w-full`;
        const percentageHeight = maxValue > 0 ? (value / maxValue) * 100 : 0;
        barDiv.style.height = `${Math.max(5, percentageHeight)}%`; // Ensure a minimum height for visibility

        const labelP = document.createElement('p');
        labelP.className = 'text-[#9dacbe] text-[13px] font-bold leading-normal tracking-[0.015em] text-center';
        labelP.textContent = label;
        
        // The grid structure expects direct children to be bars and labels alternately,
        // or for each 'column' to be a div containing a bar and a label.
        // For simplicity with the current grid-flow-col, we'll append them directly.
        // However, it might be better to wrap them.
        // Let's try direct append first as per original structure.
        // The original structure implies bar then label for each column.
        // The grid is `grid-rows-[1fr_auto]`, so this means bars are in row 1, labels in row 2.
        // This function should just return the bar and label, and the caller appends them.
        // For this function, let's return an object.
        return { bar: barDiv, label: labelP };
    }
    
    function renderBarChart(container, data, valueKey, labelKey, unit = '') {
        if (!container) {
            console.error('Chart container not found:', container);
            return;
        }
        container.innerHTML = ''; // Clear existing content

        if (!data || data.length === 0) {
            container.innerHTML = '<p class="text-white/50 col-span-full text-center">No data available for this chart.</p>';
            return;
        }

        const values = data.map(item => item[valueKey]);
        const maxValue = Math.max(...values, 1); // Avoid division by zero, ensure at least 1 for max

        // Create all bar elements first
        data.forEach(item => {
            const chartItem = createBarChartItem(item[labelKey], item[valueKey], maxValue);
            container.appendChild(chartItem.bar);
        });
        // Then create all label elements
        data.forEach(item => {
             const chartItem = createBarChartItem(item[labelKey], item[valueKey], maxValue); // Call again to get label
            container.appendChild(chartItem.label); // This will append all labels after all bars
        });
    }


    // --- Fetch and Display Summary Statistics ---
    async function fetchSummaryStatistics() {
        try {
            const response = await fetch('/api/stats/summary');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const summary = await response.json();

            if (statsBooksReadEl) statsBooksReadEl.textContent = summary.total_books_read || '0';
            if (statsTotalPagesReadEl) statsTotalPagesReadEl.textContent = summary.total_pages_read || '0';
            if (statsAverageRatingEl) statsAverageRatingEl.textContent = summary.average_rating?.toFixed(1) || 'N/A';

        } catch (error) {
            console.error('Error fetching summary statistics:', error);
            if (statsBooksReadEl) statsBooksReadEl.textContent = 'Error';
            if (statsTotalPagesReadEl) statsTotalPagesReadEl.textContent = 'Error';
            if (statsAverageRatingEl) statsAverageRatingEl.textContent = 'Error';
        }
    }

    // --- Fetch and Render "Books Read Per Month" Chart ---
    async function fetchBooksPerMonth() {
        try {
            const response = await fetch('/api/stats/books_per_month');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const booksData = await response.json(); // Expects { month_year: "Jan 2023", count: X }

            // Transform month_year to just month for label e.g. "Jan"
            const chartData = booksData.map(d => ({
                label: d.month_year.split(' ')[0], // Get 'Jan' from 'Jan 2023'
                value: d.count
            }));
            renderBarChart(booksPerMonthChartContainer, chartData, 'value', 'label');

        } catch (error) {
            console.error('Error fetching books per month:', error);
            if (booksPerMonthChartContainer) booksPerMonthChartContainer.innerHTML = '<p class="text-red-500 col-span-full text-center">Error loading chart.</p>';
        }
    }

    // --- Fetch and Render "Pages Read Per Month" Chart ---
    async function fetchPagesPerMonth() {
         try {
            const response = await fetch('/api/stats/pages_read_per_month');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const pagesData = await response.json(); // Expects { month_year: "Jan 2023", total_pages: Y }

            const chartData = pagesData.map(d => ({
                label: d.month_year.split(' ')[0],
                value: d.total_pages
            }));
            renderBarChart(pagesPerMonthChartContainer, chartData, 'value', 'label');

        } catch (error) {
            console.error('Error fetching pages per month:', error);
            if (pagesPerMonthChartContainer) pagesPerMonthChartContainer.innerHTML = '<p class="text-red-500 col-span-full text-center">Error loading chart.</p>';
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
            if (text === 'Home') link.href = 'first.html';
            else if (text === 'My Books') link.href = 'six.html';
            else if (text === 'Explore') link.href = 'second.html';
            else if (text === 'Community') link.href = 'five.html';
        });
    }

    // --- Initial Load ---
    fetchSummaryStatistics();
    fetchBooksPerMonth();
    fetchPagesPerMonth();
    setupNavigation();
});
