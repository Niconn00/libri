document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selectors ---
    const sidebarProfileName = document.getElementById('sidebar-profile-name');
    const profileHeaderName = document.getElementById('profile-header-name');
    const profileHeaderLocation = document.getElementById('profile-header-location');
    const infoName = document.getElementById('info-name');
    const infoCity = document.getElementById('info-city');
    const infoCountry = document.getElementById('info-country');

    // Settings items
    const settingsTheme = document.getElementById('settings-theme');
    // Other settings items can be selected if specific actions are needed later
    // const settingsNotifications = document.getElementById('settings-notifications');
    // const settingsReadingPrefs = document.getElementById('settings-reading-prefs');
    // const settingsPrivacy = document.getElementById('settings-privacy');
    // const settingsAccount = document.getElementById('settings-account');
    // const logoutButton = document.getElementById('logout-button');


    // --- Fetch and Display User Profile Information ---
    async function fetchUserProfile() {
        try {
            const response = await fetch('/api/profile'); // Fetches default user's profile
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const profile = await response.json();

            if (sidebarProfileName) sidebarProfileName.textContent = profile.username || 'User';
            if (profileHeaderName) profileHeaderName.textContent = profile.username || 'User';
            
            // Handle location display
            const locationString = profile.location || 'N/A';
            if (profileHeaderLocation) profileHeaderLocation.textContent = locationString;
            
            // For "Informazioni" table:
            if (infoName) infoName.textContent = profile.username || 'N/A';
            
            // Attempt to split location into city and country if possible, otherwise use full string
            if (locationString.includes(',')) {
                const parts = locationString.split(',');
                if (infoCity) infoCity.textContent = parts[0].trim();
                if (infoCountry) infoCountry.textContent = parts.length > 1 ? parts[1].trim() : 'N/A';
            } else { // If no comma, assume it's a city or a general location
                if (infoCity) infoCity.textContent = locationString;
                if (infoCountry) infoCountry.textContent = 'N/A'; // Or leave blank if preferred
            }
            
            // Update avatar if URL is provided and element exists
            const sidebarAvatar = document.querySelector('.layout-content-container.flex.flex-col.w-80 .bg-center.bg-no-repeat.aspect-square.bg-cover.rounded-full.size-10');
            const mainAvatar = document.querySelector('.layout-content-container.flex.flex-col.max-w-\\[960px\\].flex-1 .bg-center.bg-no-repeat.aspect-square.bg-cover.rounded-full.min-h-32.w-32');

            if (profile.profile_picture_url) {
                if(sidebarAvatar) sidebarAvatar.style.backgroundImage = `url('${profile.profile_picture_url}')`;
                if(mainAvatar) mainAvatar.style.backgroundImage = `url('${profile.profile_picture_url}')`;
            } else {
                // Default static images are already in HTML, so no need to change if no URL
            }


        } catch (error) {
            console.error('Error fetching user profile:', error);
            // Display error messages or fallback text
            if (sidebarProfileName) sidebarProfileName.textContent = 'Error';
            if (profileHeaderName) profileHeaderName.textContent = 'Error';
            if (profileHeaderLocation) profileHeaderLocation.textContent = 'Could not load location';
            if (infoName) infoName.textContent = 'Error';
            if (infoCity) infoCity.textContent = 'Error';
            if (infoCountry) infoCountry.textContent = 'Error';
        }
    }

    // --- Settings Options ---
    function setupSettingsInteractions() {
        // Theme Toggle (Optional Enhancement)
        if (settingsTheme) {
            settingsTheme.addEventListener('click', () => {
                document.documentElement.classList.toggle('light-mode'); // Toggle on <html>
                // You might want to save this preference in localStorage
                if (document.documentElement.classList.contains('light-mode')) {
                    localStorage.setItem('theme', 'light-mode');
                } else {
                    localStorage.removeItem('theme');
                }
            });
            // Check for saved theme preference on load
            if (localStorage.getItem('theme') === 'light-mode') {
                document.documentElement.classList.add('light-mode');
            }
        }

        // Other settings items can link to '#' or have placeholder console logs
        const otherSettings = [
            document.getElementById('settings-notifications'),
            document.getElementById('settings-reading-prefs'),
            document.getElementById('settings-privacy'),
            document.getElementById('settings-account')
        ];
        otherSettings.forEach(item => {
            if (item) {
                item.addEventListener('click', (e) => {
                    e.preventDefault(); // Prevent navigation if it's an anchor
                    console.log(`${item.querySelector('p.text-white').textContent} clicked - no action implemented.`);
                    // alert(`${item.querySelector('p.text-white').textContent} settings are not implemented yet.`);
                });
            }
        });
        
        const logoutButton = document.getElementById('logout-button');
        if(logoutButton){
            logoutButton.addEventListener('click', () => {
                console.log('Logout clicked - no action implemented.');
                // alert('Logout functionality is not implemented yet.');
            });
        }
    }
    
    // --- Implement Navigation ---
    function setupNavigation() {
        // No main header navigation in five.html, only sidebar

        // Sidebar Navigation
        const sidebarMyLibraryLink = document.getElementById('sidebar-my-library-link');
        const sidebarExploreLink = document.getElementById('sidebar-explore-link');
        const sidebarReviewsLink = document.getElementById('sidebar-reviews-link');
        const sidebarCommunityLink = document.getElementById('sidebar-community-link');
        const sidebarMyProfileLink = document.getElementById('sidebar-my-profile-link');

        if (sidebarMyLibraryLink) sidebarMyLibraryLink.href = 'six.html';
        if (sidebarExploreLink) sidebarExploreLink.href = 'second.html';
        if (sidebarReviewsLink) sidebarReviewsLink.href = '#'; // Not implemented
        if (sidebarCommunityLink) sidebarCommunityLink.href = 'five.html'; // Links to itself or a future community page
        if (sidebarMyProfileLink) sidebarMyProfileLink.href = 'five.html'; // Current page
    }

    // --- Initial Load ---
    fetchUserProfile();
    setupNavigation();
    setupSettingsInteractions();

    // Basic CSS for light-mode (can be in a separate CSS file)
    const style = document.createElement('style');
    style.textContent = `
        html.light-mode body, html.light-mode .bg-\\[\\#14191f\\], html.light-mode .bg-\\[\\#2b3540\\] {
            background-color: #f0f0f0; /* Light grey background */
        }
        html.light-mode .text-white, html.light-mode p.text-white {
            color: #1f2937; /* Dark grey text */
        }
        html.light-mode .text-\\[\\#9dacbe\\], html.light-mode p.text-\\[\\#9dacbe\\] {
            color: #4b5563; /* Medium grey text */
        }
        html.light-mode .border-b-\\[\\#2b3540\\], html.light-mode .border-t-\\[\\#3d4b5c\\] {
            border-color: #d1d5db; /* Lighter border */
        }
        /* Ensure sidebar active item retains contrast in light mode if its bg was dark */
        html.light-mode .flex.items-center.gap-3.px-3.py-2.rounded-xl.bg-\\[\\#2b3540\\] {
            background-color: #e5e7eb; /* Slightly darker light grey for active sidebar */
        }
        html.light-mode .flex.items-center.gap-3.px-3.py-2.rounded-xl.bg-\\[\\#2b3540\\] p {
             color: #1f2937; /* Dark text for active sidebar item */
        }
    `;
    document.head.appendChild(style);
});
