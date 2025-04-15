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
                const link = document.createElement("a");
                const pageName = file.name.replace(".md", "");
                link.textContent = pageName.charAt(0).toUpperCase() + pageName.slice(1);
                link.href = `#${pageName}`;
                link.addEventListener("click", (e) => {
                    e.preventDefault();
                    loadPage(file.download_url);
                });
                menu.appendChild(link);
            });

            // Load the default page if there's a hash
            if (location.hash) {
                const defaultPage = location.hash.replace("#", "");
                const defaultFile = markdownFiles.find(file => file.name.replace(".md", "") === defaultPage);
                if (defaultFile) {
                    loadPage(defaultFile.download_url);
                }
            }
        } catch (error) {
            console.error("Error fetching markdown files:", error);
            content.innerHTML = "<p>Error loading menu. Please try again later.</p>";
        }
    }

    // Load a page's content
    async function loadPage(fileUrl) {
        try {
            const response = await fetch(fileUrl);
            const markdown = await response.text();
            // content.innerHTML = `<h1>${fileUrl.split("/").pop().replace(".md", "").toUpperCase()}</h1>`;
            content.innerHTML += marked.parse(markdown); // Use the Markdown parser
        } catch (error) {
            console.error("Error loading page:", error);
            content.innerHTML = "<p>Error loading page. Please try again later.</p>";
        }
    }

    // Initialize the menu and content
    fetchMarkdownFiles();
});
