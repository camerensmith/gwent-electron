(function (window, document) {
	function getElements() {
		return {
			layout: document.getElementById("layout"),
			menu: document.getElementById("menu"),
			menuLink: document.getElementById("menuLink")
		};
	}

	function toggleClass(element, className) {
		var classes = element.className.split(/\s+/);
		var length = classes.length;
		var i = 0;
		for (; i < length; i++) {
			if (classes[i] === className) {
				classes.splice(i, 1);
				break;
			}
		}
		if (length === classes.length) classes.push(className);
		element.className = classes.join(" ");
	}

	function toggleAll() {
		var active = "active";
		var elements = getElements();
		toggleClass(elements.layout, active);
		toggleClass(elements.menu, active);
		toggleClass(elements.menuLink, active);
	}
	
	function handleEvent(e) {
		var elements = getElements();
		if (e.target.id === elements.menuLink.id) {
			toggleAll();
			e.preventDefault();
		} else if (elements.menu.className.indexOf("active") !== -1) toggleAll();
	}
	
	document.addEventListener("click", handleEvent);
	
	// Search functionality for rules page
	function initRulesSearch() {
		const searchInput = document.getElementById("rules-search");
		const clearButton = document.getElementById("rules-search-clear");
		if (!searchInput) return;
		
		function updateClearButton() {
			if (clearButton) {
				if (searchInput.value.trim().length > 0) {
					clearButton.style.display = "block";
				} else {
					clearButton.style.display = "none";
				}
			}
		}
		
		if (clearButton) {
			clearButton.addEventListener("click", function() {
				searchInput.value = "";
				searchInput.dispatchEvent(new Event("input"));
				searchInput.focus();
			});
		}
		
		searchInput.addEventListener("input", function() {
			updateClearButton();
			const query = this.value.trim().toLowerCase();
			const content = document.querySelector(".content");
			if (!content) return;
			
			// Remove previous highlights
			const highlightedElements = content.querySelectorAll(".search-highlight");
			highlightedElements.forEach(el => {
				el.classList.remove("search-highlight");
			});
			
			if (query === "") {
				// Show all content
				const hiddenElements = content.querySelectorAll(".search-hidden");
				hiddenElements.forEach(el => {
					el.classList.remove("search-hidden");
				});
				return;
			}
			
			// Search through all text content
			const allElements = content.querySelectorAll("h2, h3, p, li, dt, dd");
			let foundMatch = false;
			let firstMatch = null;
			
			allElements.forEach(element => {
				const text = element.textContent.toLowerCase();
				if (text.includes(query)) {
					foundMatch = true;
					element.classList.remove("search-hidden");
					// Highlight the matching text
					highlightText(element, query);
					// Track the first visible match for scrolling
					if (!firstMatch && element.offsetParent !== null) {
						firstMatch = element;
					}
				} else {
					// Check if element contains matching child elements
					const hasMatchingChild = element.querySelector(".search-highlight, :not(.search-hidden)");
					if (!hasMatchingChild && element.tagName !== "H2" && element.tagName !== "H3") {
						element.classList.add("search-hidden");
					} else {
						element.classList.remove("search-hidden");
					}
				}
			});
			
			// Show/hide sections based on matches
			const sections = content.querySelectorAll("h2.content-subhead");
			sections.forEach(section => {
				let sectionHasMatch = false;
				let nextElement = section.nextElementSibling;
				
				// Check if section or its content matches
				if (section.textContent.toLowerCase().includes(query)) {
					sectionHasMatch = true;
					// Track first match if it's a section header
					if (!firstMatch && section.offsetParent !== null) {
						firstMatch = section;
					}
				} else {
					// Check following elements until next h2
					while (nextElement && nextElement.tagName !== "H2") {
						if (!nextElement.classList.contains("search-hidden")) {
							sectionHasMatch = true;
							break;
						}
						nextElement = nextElement.nextElementSibling;
					}
				}
				
				if (!sectionHasMatch) {
					section.classList.add("search-hidden");
				} else {
					section.classList.remove("search-hidden");
					// Track first match if it's a section header
					if (!firstMatch && section.offsetParent !== null) {
						firstMatch = section;
					}
				}
			});
			
			// Scroll to first match if found
			if (firstMatch) {
				setTimeout(() => {
					const header = document.querySelector(".header");
					const headerHeight = header ? header.offsetHeight : 0;
					
					// Try to find the highlighted mark element within the first match
					const highlightMark = firstMatch.querySelector("mark.search-highlight");
					const targetElement = highlightMark || firstMatch;
					
					const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
					const offsetPosition = elementPosition - headerHeight - 20; // 20px padding
					
					window.scrollTo({
						top: offsetPosition,
						behavior: "smooth"
					});
				}, 100); // Small delay to ensure DOM updates are complete
			}
		});
	}
	
	function highlightText(element, query) {
		const text = element.textContent;
		const regex = new RegExp(`(${query})`, "gi");
		const highlighted = text.replace(regex, '<mark class="search-highlight">$1</mark>');
		
		// Only replace if we actually found matches
		if (highlighted !== text) {
			const tempDiv = document.createElement("div");
			tempDiv.innerHTML = highlighted;
			element.innerHTML = tempDiv.innerHTML;
		}
	}
	
	// Initialize search when DOM is ready
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", initRulesSearch);
	} else {
		initRulesSearch();
	}
}(this, this.document));