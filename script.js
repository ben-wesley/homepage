document.addEventListener("DOMContentLoaded", () => {
    const menu = document.getElementById("menu");
    const content = document.getElementById("content");
    const repoOwner = "ben-wesley";
    const repoName = "homepage";
    const branch = "main"; // Adjust if using a different branch
    const folderPath = "pages";

    // Handle redirects from 404.html
    const urlParams = new URLSearchParams(window.location.search);
    const redirectPath = urlParams.get("redirect");

    if (redirectPath) {
        // Remove the query parameter from the URL after processing
        history.replaceState({}, "", redirectPath);

        // Extract the page name from the redirected path
        const pageName = redirectPath.replace("/homepage/", "") || "index";

        // Fetch markdown files and load the redirected page
        fetchMarkdownFiles().then(markdownFiles => loadPage(pageName, markdownFiles));
    } else {
        // Default behavior: fetch markdown files and load the index
        fetchMarkdownFiles().then(markdownFiles => loadPage("index", markdownFiles));
    }

    // Fetch the list of .md files from the `pages` folder in the repository
    async function fetchMarkdownFiles() {
        const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${folderPath}?ref=${branch}`;
        try {
            const response = await fetch(apiUrl);
            const files = await response.json();

            // Filter for `.md` files
            const markdownFiles = files.filter(file => file.name.endsWith(".md"));
            generateMenu(markdownFiles);

            // Return the list of markdown files for further use
            return markdownFiles;
        } catch (error) {
            console.error("Error fetching markdown files:", error);
            content.innerHTML = "<p>Error loading menu. Please try again later.</p>";
            return [];
        }
    }

    // Generate the menu
    function generateMenu(markdownFiles) {
        menu.innerHTML = ""; // Clear the menu to prevent duplication

        markdownFiles.forEach(file => {
            const pageName = file.name.replace(".md", "");

            const link = document.createElement("a");
            link.textContent = pageName.charAt(0).toUpperCase() + pageName.slice(1);
            link.href = `/${pageName}`; // URL path for the page
            link.addEventListener("click", (e) => {
                e.preventDefault();
                navigateTo(pageName);
            });
            menu.appendChild(link);
        });
    }

    // Load a page's content
    async function loadPage(pageName, markdownFiles) {
        if (pageName === "index") {
            // Special case for the index page
            content.innerHTML = `<h1>Welcome</h1><p>This is the homepage. Use the menu to navigate.</p>`;
            return;
        }

        const file = markdownFiles.find(file => file.name.replace(".md", "") === pageName);
        if (file) {
            try {
                const response = await fetch(file.download_url);
                const markdown = await response.text();
                // content.innerHTML = `<h1>${pageName.toUpperCase()}</h1>`;
                content.innerHTML += marked.parse(markdown);
            } catch (error) {
                console.error("Error loading page:", error);
                content.innerHTML = "<p>Error loading page. Please try again later.</p>";
            }
        } else {
            content.innerHTML = "<p>Page not found.</p>";
        }
    }

    // Handle navigation
    function navigateTo(pageName) {
        history.pushState({}, "", `/homepage/${pageName}`);
        fetchMarkdownFiles().then(markdownFiles => loadPage(pageName, markdownFiles));
    }

    // Handle browser back/forward navigation
    window.addEventListener("popstate", () => {
        const currentPage = location.pathname.replace("/homepage/", "") || "index";
        fetchMarkdownFiles().then(markdownFiles => loadPage(currentPage, markdownFiles));
    });
});
