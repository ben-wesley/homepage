// Handle redirects from 404.html
const urlParams = new URLSearchParams(window.location.search);
const redirectPath = urlParams.get("redirect");
if (redirectPath) {
    history.replaceState({}, "", redirectPath);
}
document.addEventListener("DOMContentLoaded", () => {
    const menu = document.getElementById("menu");
    const content = document.getElementById("content");
    const repoOwner = "ben-wesley";
    const repoName = "homepage";
    const branch = "main"; // Adjust if using a different branch
    const folderPath = "pages";

    // Fetch the list of .md files from the `pages` folder in the repository
    async function fetchMarkdownFiles() {
        const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${folderPath}?ref=${branch}`;
        try {
            const response = await fetch(apiUrl);
            const files = await response.json();

            // Filter for `.md` files and generate the menu
            const markdownFiles = files.filter(file => file.name.endsWith(".md"));
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

            // Handle initial page load based on the current URL
            const currentPage = location.pathname.replace("/homepage/", "") || "home";
            loadPage(currentPage, markdownFiles);
        } catch (error) {
            console.error("Error fetching markdown files:", error);
            content.innerHTML = "<p>Error loading menu. Please try again later.</p>";
        }
    }

    // Load a page's content
    async function loadPage(pageName, markdownFiles) {
        const file = markdownFiles.find(file => file.name.replace(".md", "") === pageName);
        if (file) {
            try {
                const response = await fetch(file.download_url);
                const markdown = await response.text();
                content.innerHTML += marked.parse(markdown); // Use the Markdown parser
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
        fetchMarkdownFiles().then(() => {
            const currentPage = pageName;
            loadPage(currentPage, []);
        });
    }

    // Handle browser back/forward navigation
    window.addEventListener("popstate", () => {
        const currentPage = location.pathname.replace("/homepage/", "") || "home";
        fetchMarkdownFiles().then(() => loadPage(currentPage, []));
    });

    // Initialize the menu and content
    fetchMarkdownFiles();
});
